import { Request, Response } from 'express';
import Teacher from '../models/Teacher.model';
import connectDB from '../lib/mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const getResend = () => new Resend(process.env.RESEND_API_KEY);

// Helper function to generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Teacher Registration
export const register = async (req: Request, res: Response) => {
  try {
    await connectDB();
    
    const { firstName, lastName, email, password, phone, qualification, experience, subjects, bio } = req.body;

    // For registration without names (email/password only)
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Check if teacher already exists
    const existingTeacher = await Teacher.findOne({ email: email.toLowerCase() });
    if (existingTeacher) {
      return res.status(400).json({ success: false, message: 'Teacher with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create teacher (firstName/lastName will be added during onboarding)
    const teacher = await Teacher.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      registrationStatus: 'pending',
      isEmailVerified: false,
      emailVerificationCode: otp,
      emailVerificationExpiry: otpExpiry
    });

    // Send OTP email
    try {
      const resend = getResend();
      await resend.emails.send({
        from: 'NoteSwift <noteswift@codelitsstudio.com>',
        to: [email],
        subject: 'Verify your email - NoteSwift Teacher',
        html: `
          <h2>Welcome to NoteSwift!</h2>
          <p>Your verification code is: <strong style="font-size: 24px; color: #2563eb;">${otp}</strong></p>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });
      
      console.log('✅ OTP sent to:', email);
    } catch (emailError: any) {
      console.error('❌ Email send error:', emailError);
      // Continue even if email fails
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for the verification code.',
      result: {
        teacher: {
          _id: teacher._id,
          email: teacher.email
        },
        emailSent: true
      }
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Teacher Login
export const login = async (req: Request, res: Response) => {
  try {
    await connectDB();
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find teacher
    const teacher = await Teacher.findOne({ email: email.toLowerCase() });
    
    if (!teacher) {
      console.log('❌ Teacher not found:', email);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    console.log('✅ Teacher found:', {
      email: teacher.email,
      registrationStatus: teacher.registrationStatus,
      hasPassword: !!teacher.password,
      passwordLength: teacher.password?.length
    });

    // Check registration status
    if (teacher.registrationStatus !== 'approved') {
      console.log('❌ Teacher not approved. Status:', teacher.registrationStatus);
      return res.status(403).json({ 
        success: false, 
        message: teacher.registrationStatus === 'pending' 
          ? 'Your application is being reviewed. Please wait for admin approval.'
          : 'Your application has been rejected'
      });
    }

    // Verify password
    console.log('🔐 Comparing password...');
    const isValidPassword = await bcrypt.compare(password, teacher.password);
    console.log('🔐 Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: teacher._id,
        email: teacher.email,
        role: 'teacher',
        onboardingComplete: teacher.onboardingStep === 'completed'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      result: {
        token,
        teacher: {
          _id: teacher._id,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          email: teacher.email,
          phoneNumber: teacher.phoneNumber,
          subjects: teacher.subjects,
          onboardingStep: teacher.onboardingStep
        }
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Email
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    await connectDB();
    
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }

    const teacher = await Teacher.findOne({ email: email.toLowerCase() });
    
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    if (teacher.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    // Check if OTP exists
    if (!teacher.emailVerificationCode) {
      return res.status(400).json({ success: false, message: 'No verification code found. Please request a new one.' });
    }

    // Check if OTP is expired
    if (teacher.emailVerificationExpiry && new Date() > teacher.emailVerificationExpiry) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    // Verify the code
    if (code !== teacher.emailVerificationCode) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    // Mark email as verified and clear OTP
    teacher.isEmailVerified = true;
    teacher.emailVerificationCode = undefined;
    teacher.emailVerificationExpiry = undefined;
    await teacher.save();

    // Generate JWT token for onboarding
    const token = jwt.sign(
      { 
        teacherId: teacher._id, 
        email: teacher.email,
        isEmailVerified: true
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        token,
        teacher: {
          _id: teacher._id,
          email: teacher.email,
          isEmailVerified: true
        }
      }
    });
  } catch (error: any) {
    console.error('Verify email error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Resend OTP
export const resendOTP = async (req: Request, res: Response) => {
  try {
    await connectDB();
    
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const teacher = await Teacher.findOne({ email: email.toLowerCase() });
    
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    if (teacher.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update teacher with new OTP
    teacher.emailVerificationCode = otp;
    teacher.emailVerificationExpiry = otpExpiry;
    await teacher.save();

    // Send OTP email
    try {
      const resend = getResend();
      await resend.emails.send({
        from: 'NoteSwift <noteswift@codelitsstudio.com>',
        to: [email],
        subject: 'Your New Verification Code - NoteSwift Teacher',
        html: `
          <h2>New Verification Code</h2>
          <p>Your new verification code is: <strong style="font-size: 24px; color: #2563eb;">${otp}</strong></p>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });
      
      console.log('✅ New OTP sent to:', email);
    } catch (emailError: any) {
      console.error('❌ Email send error:', emailError);
      // Continue even if email fails
    }

    return res.status(200).json({
      success: true,
      message: 'A new verification code has been sent to your email'
    });
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    await connectDB();
    
    // Get teacher ID from token (implement auth middleware later)
    const teacherId = (req as any).teacherId;

    if (!teacherId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const teacher = await Teacher.findById(teacherId).select('-password');
    
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    return res.status(200).json({
      success: true,
      result: { teacher }
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    await connectDB();
    
    const teacherId = (req as any).teacherId;

    if (!teacherId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const teacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      result: { teacher }
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Handle onboarding step completion
 * POST /api/teacher/auth/onboarding
 */
export const onboarding = async (req: Request, res: Response) => {
  console.log('🚀 Onboarding endpoint hit!');
  try {
    await connectDB();
    
    const { step, data } = req.body;
    console.log('📥 Request body:', { step, hasData: !!data });
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    console.log('🔑 Token exists:', !!token);

    if (!token) {
      console.error('❌ No token provided');
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    // Decode JWT to get teacher ID
    let teacherId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      teacherId = decoded.teacherId || decoded.id; // Support both token formats
      console.log('✅ Token decoded, teacherId:', teacherId);
    } catch (err: any) {
      console.error('❌ Token decode error:', err.message);
      console.error('Token preview:', token.substring(0, 50) + '...');
      console.error('Using JWT_SECRET:', JWT_SECRET.substring(0, 20) + '...');
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const teacher = await Teacher.findById(teacherId);
    
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    console.log('📝 Onboarding step:', step, 'for teacher:', teacher.email);
    console.log('📦 Data received:', JSON.stringify(data, null, 2));

    // Update teacher based on step - save EVERYTHING the frontend sends
    switch (step) {
      case 'personal_info':
        // Save all personal info - only save non-empty values
        if (data.firstName) teacher.firstName = data.firstName;
        if (data.lastName) teacher.lastName = data.lastName;
        if (data.phoneNumber) teacher.phoneNumber = data.phoneNumber;
        if (data.dateOfBirth) teacher.dateOfBirth = data.dateOfBirth;
        if (data.gender) teacher.gender = data.gender;
        if (data.address) teacher.address = data.address;
        teacher.onboardingStep = 'professional_info';
        break;

      case 'professional_info':
        // Save all professional info - ensure we're saving the actual data, not empty values
        if (data.institution && data.institution.name) {
          teacher.institution = data.institution;
        }
        if (Array.isArray(data.subjects) && data.subjects.length > 0) {
          teacher.subjects = data.subjects;
        }
        if (data.experience) {
          teacher.experience = data.experience;
        }
        if (data.bio) {
          teacher.bio = data.bio;
        }
        teacher.onboardingStep = 'qualifications';
        break;

      case 'qualifications':
        // Save qualifications array - only if it has data
        if (Array.isArray(data.qualifications) && data.qualifications.length > 0) {
          teacher.qualifications = data.qualifications;
        }
        teacher.onboardingStep = 'verification';
        break;

      case 'verification':
        // Save profile photo and agreement
        console.log('🖼️  Profile photo data received:', {
          hasPhoto: !!data.profilePhoto,
          photoUrl: data.profilePhoto?.url,
          photoName: data.profilePhoto?.name,
          photoSize: data.profilePhoto?.size
        });
        
        if (data.profilePhoto) {
          // Store profile photo in verificationDocuments for admin panel compatibility
          if (!teacher.verificationDocuments) {
            teacher.verificationDocuments = {};
          }
          teacher.verificationDocuments.profile = [data.profilePhoto];
          teacher.profilePhoto = data.profilePhoto.url; // Also save direct URL
          
          console.log('✅ Profile photo saved to:', {
            verificationDocuments: !!teacher.verificationDocuments.profile,
            profilePhotoUrl: teacher.profilePhoto
          });
        } else {
          console.warn('⚠️  No profile photo in verification data!');
        }
        
        teacher.agreementAccepted = data.agreementAccepted || false;
        teacher.onboardingStep = 'completed';
        teacher.onboardingComplete = true;
        teacher.registrationStatus = 'pending'; // Set to pending for admin approval
        teacher.approvalStatus = 'pending'; // Also set approvalStatus for admin panel
        teacher.status = 'pending'; // For admin panel status checks
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid step' });
    }

    await teacher.save();

    console.log('✅ Onboarding step completed:', step);
    console.log('📊 Teacher data after save:', {
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      institution: teacher.institution?.name,
      subjectsCount: teacher.subjects?.length || 0,
      qualificationsCount: teacher.qualifications?.length || 0,
      hasProfilePhoto: !!teacher.profilePhoto
    });

    return res.status(200).json({
      success: true,
      message: 'Step completed successfully',
      result: {
        currentStep: teacher.onboardingStep,
        onboardingComplete: teacher.onboardingStep === 'completed'
      }
    });
  } catch (error: any) {
    console.error('Onboarding error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};