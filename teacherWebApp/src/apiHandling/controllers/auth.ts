// @ts-nocheck
import { NextRequest } from 'next/server';
import { BaseApiHandler } from '../utils/baseHandler';
import Teacher from '@/models/Teacher';
import connectDB from '@/lib/mongoose';
import { EmailService } from '@/lib/emailService';

// Import PendingTeacher model to ensure it's registered
import '@/models/PendingTeacher';
import mongoose from 'mongoose';
const PendingTeacher = mongoose.model('PendingTeacher');

// Teacher Authentication Controller
export class TeacherAuthController extends BaseApiHandler {
  
  // Teacher Login
  async login(req: NextRequest) {
    try {
      await connectDB();
      
      const body = await this.parseBody(req);
      this.validateRequired(body, ['email', 'password']);

      const { email, password } = body;

      // Find teacher by email
      const teacher = await Teacher.findOne({ email: email.toLowerCase() });
      
      if (!teacher) {
        return this.unauthorized('Invalid email or password');
      }

      // Check approval status
      if (teacher.approvalStatus === 'pending') {
        return this.clientError('Your application is being reviewed. Please wait for approval before logging in.', 403);
      }

      if (teacher.approvalStatus === 'rejected') {
        return this.clientError('Your application has been rejected. Please contact support for more information.', 403);
      }

      // Check if account is locked
      if (teacher.isLocked) {
        return this.unauthorized('Account is temporarily locked due to too many failed login attempts');
      }

      // Validate password
      const isValidPassword = await teacher.comparePassword(password);
      
      if (!isValidPassword) {
        await teacher.incLoginAttempts();
        return this.unauthorized('Invalid email or password');
      }

      // Reset login attempts on successful login
      if (teacher.loginAttempts > 0) {
        await teacher.resetLoginAttempts();
      }

      // Update last login
      await teacher.updateLastLogin();

      // Generate simple JWT token (for production, use proper jwt library)
      const tokenPayload = {
        id: teacher._id,
        email: teacher.email,
        role: 'teacher',
        onboardingComplete: teacher.onboardingComplete,
        iat: Date.now(),
        exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      };
      
      const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

      // Prepare teacher data (exclude sensitive fields)
      const teacherData = {
        id: teacher._id,
        email: teacher.email,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        fullName: teacher.fullName,
        profileImage: teacher.profileImage,
        onboardingComplete: teacher.onboardingComplete,
        onboardingStep: teacher.onboardingStep,
        status: teacher.status,
        approvalStatus: teacher.approvalStatus,
        stats: teacher.stats,
      };

      return this.success({
        teacher: teacherData,
        token,
        expiresIn: '24h',
      }, 'Login successful');

    } catch (error: any) {
      console.error('Login error:', error);
      return this.handleError(error);
    }
  }

  // Teacher Registration with Email Verification
  async register(req: NextRequest) {
    try {
      await connectDB();
      
      const body = await this.parseBody(req);
      this.validateRequired(body, ['email', 'password']);

      const { email, password } = body;

      // Check if teacher already exists in main database
      const existingTeacher = await Teacher.findOne({ email: email.toLowerCase() });
      if (existingTeacher) {
        return this.clientError('A teacher with this email already exists');
      }

      // Check if there's already a pending registration
      const existingPending = await PendingTeacher.findOne({ email: email.toLowerCase() });
      if (existingPending) {
        // Delete the old pending registration
        await PendingTeacher.deleteOne({ email: email.toLowerCase() });
      }

      // Validate password strength
      if (password.length < 8) {
        return this.clientError('Password must be at least 8 characters long');
      }

      // Generate verification code
      const verificationCode = EmailService.generateVerificationCode();
      const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create pending teacher (temporarily stored until email verification)
      const pendingTeacher = new PendingTeacher({
        email: email.toLowerCase(),
        password,
        firstName: '',
        lastName: '',
        verificationCode,
        verificationExpiry
      });

      await pendingTeacher.save();

      // Send verification email
      const emailResult = await EmailService.sendVerificationCode(
        email,
        verificationCode,
        'Teacher'
      );

      if (!emailResult.success) {
        // If email fails, delete the pending registration
        await PendingTeacher.deleteOne({ email: email.toLowerCase() });
        console.error('Failed to send verification email:', emailResult.error);
        return this.serverError('Failed to send verification email. Please try again.');
      }

      const responseData = {
        email: pendingTeacher.email,
        firstName: pendingTeacher.firstName,
        lastName: pendingTeacher.lastName,
        verificationRequired: true,
        emailSent: true
      };

      return this.created({
        ...responseData,
        message: 'Registration initiated! Please check your email for verification code.'
      }, 'Registration successful');

    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.code === 11000) {
        return this.clientError('A teacher with this email already exists');
      }
      return this.handleError(error);
    }
  }

  // Verify Email Code
  async verifyEmail(req: NextRequest) {
    try {
      await connectDB();
      
      const body = await this.parseBody(req);
      this.validateRequired(body, ['email', 'code']);

      const { email, code } = body;

      // Find pending teacher with verification code
      const pendingTeacher = await PendingTeacher.findOne({ 
        email: email.toLowerCase(),
        verificationCode: code 
      });

      if (!pendingTeacher) {
        return this.clientError('Invalid verification code or registration not found');
      }

      // Check if code has expired
      if (pendingTeacher.verificationExpiry < new Date()) {
        await PendingTeacher.deleteOne({ email: email.toLowerCase() });
        return this.clientError('Verification code has expired. Please register again.');
      }

      // Create the actual teacher account now that email is verified
      const teacher = new Teacher({
        email: pendingTeacher.email,
        password: pendingTeacher.password,
        firstName: 'PENDING', // Will be updated during onboarding
        lastName: 'PENDING', // Will be updated during onboarding
        phoneNumber: 'PENDING', // Required field - will be updated during onboarding
        dateOfBirth: new Date('1990-01-01'), // Required field - will be updated during onboarding
        gender: 'prefer_not_to_say', // Required field - will be updated during onboarding
        institution: {
          name: 'PENDING', // Required field - will be updated during onboarding
          type: 'school',
          address: {}
        },
        subjects: [], // Empty array is allowed
        qualifications: [], // Empty array is allowed
        experience: {
          totalYears: 0, // Required field
          previousPositions: [] // Empty array is allowed
        },
        address: {},
        onboardingStep: 'personal_info',
        emailVerified: true, // Email is now verified
        status: 'pending_approval'
      });

      await teacher.save();

      // Delete the pending registration
      await PendingTeacher.deleteOne({ email: email.toLowerCase() });

      // Note: Welcome email will be sent after onboarding completion
      // const welcomeEmailResult = await EmailService.sendWelcomeEmail(
      //   teacher.email,
      //   teacher.firstName,
      //   teacher.lastName
      // );

      // if (!welcomeEmailResult.success) {
      //   console.error('Failed to send welcome email:', welcomeEmailResult.error);
      // }

      // Generate login token
      const tokenPayload = {
        id: teacher._id,
        email: teacher.email,
        role: 'teacher',
        onboardingComplete: teacher.onboardingComplete,
        iat: Date.now(),
        exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      };
      
      const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

      const teacherData = {
        id: teacher._id,
        email: teacher.email,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        fullName: teacher.fullName,
        emailVerified: teacher.emailVerified,
        onboardingStep: teacher.onboardingStep,
        status: teacher.status,
      };

      return Response.json({
        success: true,
        data: {
          teacher: teacherData,
          token,
          expiresIn: '24h',
        },
        message: 'Email verified successfully! Account created.'
      });

    } catch (error: any) {
      console.error('Email verification error:', error);
      return this.handleError(error);
    }
  }

  // Resend Verification Code
  async resendVerificationCode(req: NextRequest) {
    try {
      await connectDB();
      
      const body = await this.parseBody(req);
      this.validateRequired(body, ['email']);

      const { email } = body;

      // Look for pending registration
      const pendingTeacher = await PendingTeacher.findOne({ 
        email: email.toLowerCase()
      });

      if (!pendingTeacher) {
        return this.clientError('No pending registration found for this email');
      }

      // Generate new verification code
      const verificationCode = EmailService.generateVerificationCode();
      const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      pendingTeacher.verificationCode = verificationCode;
      pendingTeacher.verificationExpiry = verificationExpiry;
      await pendingTeacher.save();

      // Send verification email
      const emailResult = await EmailService.sendVerificationCode(
        email,
        verificationCode,
        pendingTeacher.firstName
      );

      return this.success({
        emailSent: emailResult.success,
        message: emailResult.success 
          ? 'Verification code sent successfully'
          : 'Failed to send verification code. Please try again.'
      }, 'Verification code processed');

    } catch (error: any) {
      console.error('Resend verification error:', error);
      return this.handleError(error);
    }
  }

  // Update Onboarding Step
  async updateOnboarding(req: NextRequest) {
    try {
      await connectDB();
      
      const teacher = await this.validateTeacher(req);
      const body = await this.parseBody(req);

      const { step, data } = body;

      const teacherRecord = await Teacher.findById(teacher.id);
      if (!teacherRecord) {
        return this.notFound('Teacher not found');
      }

      // configure cloudinary from env (require dynamically to avoid build-time type issues)
      let cloudinary: any = null;
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        cloudinary = require('cloudinary').v2;
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
          api_key: process.env.CLOUDINARY_API_KEY || '',
          api_secret: process.env.CLOUDINARY_API_SECRET || '',
        });
      } catch (e) {
        console.warn('Cloudinary not configured or missing dependency. Document uploads will be skipped.');
        cloudinary = null;
      }

      // Update based on step
      switch (step) {
        case 'personal_info':
          this.validateRequired(data, ['firstName', 'lastName', 'phoneNumber', 'dateOfBirth', 'gender']);
          teacherRecord.firstName = data.firstName;
          teacherRecord.lastName = data.lastName;
          teacherRecord.phoneNumber = data.phoneNumber;
          teacherRecord.dateOfBirth = new Date(data.dateOfBirth);
          teacherRecord.gender = data.gender;
          if (data.address) {
            teacherRecord.address = data.address;
          }
          teacherRecord.onboardingStep = 'professional_info';
          break;

        case 'professional_info':
          this.validateRequired(data, ['institution', 'subjects', 'experience']);
          // Validate institution has required fields
          if (!data.institution.name || !data.institution.type) {
            return this.clientError('Institution name and type are required');
          }
          // Validate experience has required totalYears
          if (data.experience.totalYears === undefined || data.experience.totalYears === null) {
            return this.clientError('Total years of experience is required');
          }
          // Normalize and persist subjects/experience
          teacherRecord.institution = data.institution;
          teacherRecord.subjects = Array.isArray(data.subjects) ? data.subjects.map((s: any) => ({
            name: s.name,
            level: s.level,
            experience: s.experience || 0,
          })) : [];
          teacherRecord.experience = data.experience;
          if (data.bio) {
            teacherRecord.bio = data.bio;
          }
          teacherRecord.onboardingStep = 'qualifications';
          break;

        case 'qualifications':
          this.validateRequired(data, ['qualifications']);
          teacherRecord.qualifications = Array.isArray(data.qualifications) ? data.qualifications.map((q: any) => ({
            degree: q.degree,
            field: q.field,
            institution: q.institution,
            year: q.year,
            grade: q.grade || null,
          })) : [];
          teacherRecord.onboardingStep = 'verification';
          break;

        case 'verification':
          // Handle profile photo upload
          teacherRecord.verificationDocuments = teacherRecord.verificationDocuments || {};
          if (data && data.profilePhoto) {
            teacherRecord.verificationDocuments['profile'] = teacherRecord.verificationDocuments['profile'] || [];
            teacherRecord.verificationDocuments['profile'] = [{
              name: data.profilePhoto.name || 'profile.jpg',
              mimeType: data.profilePhoto.mimeType || 'image/jpeg',
              size: data.profilePhoto.size || 0,
              url: data.profilePhoto.url,
              publicId: data.profilePhoto.publicId || null,
              uploadedAt: data.profilePhoto.uploadedAt ? new Date(data.profilePhoto.uploadedAt) : new Date(),
            }];
          }

          if (data && data.agreementAccepted) {
            teacherRecord.agreementAccepted = true;
          }

          teacherRecord.onboardingStep = 'completed';
          teacherRecord.onboardingComplete = true;
          teacherRecord.status = 'pending_approval';

          // Send welcome email now that onboarding is complete
          const welcomeEmailResult = await EmailService.sendWelcomeEmail(
            teacherRecord.email,
            teacherRecord.firstName,
            teacherRecord.lastName
          );

          if (!welcomeEmailResult.success) {
            console.error('Failed to send welcome email:', welcomeEmailResult.error);
            // Don't fail the onboarding if email fails
          }
          break;

        default:
          return this.clientError('Invalid onboarding step');
      }

      await teacherRecord.save();

      return this.success({
        onboardingStep: teacherRecord.onboardingStep,
        onboardingComplete: teacherRecord.onboardingComplete,
        status: teacherRecord.status,
      }, 'Onboarding updated successfully');

    } catch (error: any) {
      console.error('Onboarding update error:', error);
      return this.handleError(error);
    }
  }

  // Get Current Teacher Profile
  async getProfile(req: NextRequest) {
    try {
      await connectDB();
      
      const teacherAuth = await this.validateTeacher(req);
      
      const teacher = await Teacher.findById(teacherAuth.id).select('-password');
      if (!teacher) {
        return this.notFound('Teacher not found');
      }

      return this.success(teacher, 'Profile retrieved successfully');

    } catch (error: any) {
      console.error('Get profile error:', error);
      return this.handleError(error);
    }
  }

  // Refresh Token
  async refreshToken(req: NextRequest) {
    try {
      const teacher = await this.validateTeacher(req);

      const tokenPayload = {
        id: teacher.id,
        email: teacher.email,
        role: 'teacher',
        onboardingComplete: teacher.onboardingComplete,
        iat: Date.now(),
        exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      };
      
      const newToken = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

      return this.success({
        token: newToken,
        expiresIn: '24h',
      }, 'Token refreshed successfully');

    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // Logout
  async logout(req: NextRequest) {
    try {
      // In a production app, you might want to blacklist the token
      // For now, we'll just return success
      return this.success({
        loggedOut: true,
      }, 'Logged out successfully');

    } catch (error: any) {
      return this.handleError(error);
    }
  }
}