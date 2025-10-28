import JsonResponse from "../../../lib/Response";
import { Controller } from "../../../types/controller";
import { LoginStudent, SignupStudent } from "@core/api/student/auth"
import { Student } from "../../../models/students/Student.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { SessionPayload } from "../../../middlewares/student.middleware";
import { TStudentWithNoSensitive } from "@core/models/students/Student";
import otpService from "services/otpService";
import emailOTPService from "services/emailOTPService";
import CloudinaryService from "services/cloudinaryService";
import reportEmailService from "../../../services/reportEmailService";
import auditLogger from "@core/lib/audit-logger";

const expiresIn = 60 * 60 * 24 * 14 * 1000;
const options = { maxAge: expiresIn, httpOnly: false };

const getRandomAvatarEmoji = (): string => {
  const seed = Math.random().toString(36).substring(7);
  return `https://api.dicebear.com/9.x/open-peeps/png?seed=${seed}`;
};

export const signUpStudent: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);
    try {
        const body: SignupStudent.Req = req.body;
        const secret = process.env.SESSION_SECRET;
        const salt = await bcrypt.genSalt(10);
        const existingStudent = await Student.findOne({ email: body.email.toLowerCase() });
        if (existingStudent) {
            jsonResponse.clientError("Email address already registered");
            return;
        }
        if (!secret) throw new Error("No session secret provided");

        if (!body.phone_number || body.phone_number.trim().length === 0) {
            jsonResponse.clientError("Phone number is required");
            return;
        }

        // Validate phone number format
        if (!/^[9][78]\d{8}$/.test(body.phone_number.trim())) {
            jsonResponse.clientError("Invalid phone number format. Must be 10 digits starting with 97 or 98");
            return;
        }

        // ✅ Manual validations
        if (!body.full_name || body.full_name.trim().length < 3) {
            jsonResponse.clientError("Full name is required and must be at least 3 characters");
            return;
        }

        if (!body.grade || typeof body.grade !== "number" || body.grade < 1 || body.grade > 12) {
            jsonResponse.clientError("Grade must be a number between 1 and 12");
            return;
        }

        if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
            jsonResponse.clientError("Invalid email address format");
            return;
        }

        if (!body.password || body.password.length < 6) {
            jsonResponse.clientError("Password must be at least 6 characters long");
            return;
        }

        if (
            !body.address ||
            !body.address.province ||
            !body.address.district ||
            !body.address.institution
        ) {
            jsonResponse.clientError("Complete address (province, district, institution) is required");
            return;
        }

        const encrypted_password = await bcrypt.hash(body.password, salt);

        // Generate a permanent avatar emoji for this user
        const avatarEmoji = getRandomAvatarEmoji();

        const studentData = {
            address: body.address,
            full_name: body.full_name,
            grade: body.grade,
            password: encrypted_password,
            email: body.email.toLowerCase(),
            phone_number: body.phone_number,
            avatarEmoji: avatarEmoji,
        };

        const student = new Student({
            address: body.address,
            full_name: body.full_name,
            grade: body.grade,
            password: encrypted_password,
            email: body.email.toLowerCase(),
            phone_number: body.phone_number,
            avatarEmoji: avatarEmoji,
        });

        await student.save();
        const session: SessionPayload = {
            user_id: student._id.toString(),
            role: "student"
        }
        const token = jwt.sign(session, secret, {
            expiresIn: "10d"
        });
        
        res.cookie("session", token, options);
        const studentObj = student.toJSON() as any; 
        const response: SignupStudent.Res = {
            user: studentObj,
            token
        }

        // Log successful student account creation
        await auditLogger.logUserCreated(
            'system', // Self-registration
            'system',
            'System',
            student._id.toString(),
            'student',
            student.full_name,
            student.email,
            undefined,
            {
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                registrationMethod: 'email'
            }
        );

        jsonResponse.success(response);
    } catch (error) {
        console.error(error);
        jsonResponse.serverError();
    }
}

// DEPRECATED: Phone-based registration - now using email
// Send OTP for registration
/*
export const sendRegistrationOTP: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);
    try {
        const { phone_number } = req.body;

        if (!phone_number) {
            jsonResponse.clientError("Phone number is required");
            return;
        }

        // Validate phone number format
        if (!/^[9][78]\d{8}$/.test(phone_number)) {
            jsonResponse.clientError("Invalid phone number format");
            return;
        }

        // Check if phone number already exists
        const existingStudent = await Student.findOne({ phone_number });
        if (existingStudent) {
            jsonResponse.clientError("Phone number already registered");
            return;
        }

        // Send OTP
        const result = await otpService.sendOTP(phone_number);
        
        if (result.success) {
            jsonResponse.success({ message: "OTP sent successfully" });
        } else {
            jsonResponse.serverError(result.message);
        }

    } catch (error) {
        console.error("Error sending registration OTP:", error);
        jsonResponse.serverError();
    }
};

// Verify OTP for registration
export const verifyRegistrationOTP: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);
    try {
        const { phone_number, otp_code } = req.body;

        if (!phone_number || !otp_code) {
            jsonResponse.clientError("Phone number and OTP code are required");
            return;
        }

        // Verify OTP
        const otpResult = await otpService.verifyOTP(phone_number, otp_code);
        
        if (otpResult.success) {
            jsonResponse.success({ message: "OTP verified successfully" });
        } else {
            jsonResponse.clientError(otpResult.message);
        }

    } catch (error) {
        console.error("Error verifying registration OTP:", error);
        jsonResponse.serverError();
    }
};
*/;


export const loginStudent: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);
    try {
        const body: LoginStudent.Req = req.body;
        const secret = process.env.SESSION_SECRET;

        if (!secret) throw new Error("No session secret provided");

        // Validate input
        if (!body.email || !body.password) {
            jsonResponse.clientError("Email or password missing");
            return;
        }

        // Find student - explicitly select password field
        const student = await Student.findOne({ email: body.email.toLowerCase() }).select('+password');
        
        if (!student) {
            // Log failed login attempt
            await auditLogger.logLogin(
                'unknown',
                'student',
                'Unknown Student',
                body.email,
                false,
                {
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('User-Agent'),
                    reason: 'Student not found'
                }
            );
            jsonResponse.clientError("Student not found");
            return;
        }

        // Check if student has a password field
        if (!student.password) {
            jsonResponse.clientError("Account setup incomplete. Please use 'Forgot Password' to set up your password.");
            return;
        }

        // Compare password
        const match = await bcrypt.compare(body.password, student.password);

        if (!match) {
            // Log failed login attempt
            await auditLogger.logLogin(
                student._id.toString(),
                'student',
                student.full_name || student.email,
                student.email,
                false,
                {
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('User-Agent'),
                    reason: 'Invalid password'
                }
            );
            jsonResponse.clientError("Invalid password");
            return;
        }

        // DEVICE BINDING SECURITY CHECK
        const currentDeviceFingerprint = body.deviceFingerprint;

        if (!currentDeviceFingerprint) {
            jsonResponse.clientError("Device verification required. Please update your app.");
            return;
        }

        // Check if student already has a device fingerprint (first login)
        if (!student.deviceFingerprint) {
            // This is the first login, bind this device
            student.deviceFingerprint = currentDeviceFingerprint;
        } else if (student.deviceFingerprint !== currentDeviceFingerprint) {
            // Log security breach attempt
            await auditLogger.logSystemEvent(
                'device_binding_violation',
                `Security breach attempt: ${student.full_name} (${student.email}) tried to login from different device`,
                'failure',
                {
                    userId: student._id.toString(),
                    userType: 'student',
                    userName: student.full_name || student.email,
                    userEmail: student.email,
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('User-Agent'),
                    storedFingerprint: student.deviceFingerprint.substring(0, 8) + '...',
                    attemptedFingerprint: currentDeviceFingerprint.substring(0, 8) + '...',
                    reason: 'Attempted login from different device'
                }
            );

            jsonResponse.clientError("Security policy violation: This account is already bound to another device. Please logout from your other device first or contact support.");
            return;
        }

        // Update last login time
        student.lastLoginAt = new Date();
        await student.save();

        // Generate token
        const token = jwt.sign({ user_id: student._id.toString(), role: "student" }, secret, {
            expiresIn: "10d"
        });

        res.cookie("session", token, options);

        const studentObj = student.toJSON(); // Assuming you handle password hiding in schema
        const response: LoginStudent.Res = {
            user: studentObj,
            token
        };

        // Log successful login
        await auditLogger.logLogin(
            student._id.toString(),
            'student',
            student.full_name || student.email,
            student.email,
            true,
            {
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                deviceFingerprint: currentDeviceFingerprint.substring(0, 8) + '...'
            }
        );

        jsonResponse.success(response);

    } catch (error) {
        console.error('🚨 Login error:', error);
        jsonResponse.serverError();
    }
};

// Send OTP to email for registration
export const sendEmailRegistrationOTP: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);
    try {
        const { email } = req.body;

        if (!email) {
            jsonResponse.clientError("Email address is required");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            jsonResponse.clientError("Invalid email format");
            return;
        }

        // Check if email already exists
        const existingStudent = await Student.findOne({ email: email.toLowerCase() });
        if (existingStudent) {
            jsonResponse.clientError("Email address already registered");
            return;
        }

        // Send OTP
        const result = await emailOTPService.sendEmailOTP(email);
        
        if (result.success) {
            jsonResponse.success({ message: "Verification email sent successfully" });
        } else {
            jsonResponse.serverError(result.message);
        }

    } catch (error) {
        console.error("Error sending email registration OTP:", error);
        jsonResponse.serverError();
    }
};

// Verify email OTP for registration
export const verifyEmailRegistrationOTP: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);
    try {
        const { email, otp_code } = req.body;

        if (!email || !otp_code) {
            jsonResponse.clientError("Email and OTP code are required");
            return;
        }

        // Verify OTP
        const otpResult = await emailOTPService.verifyEmailOTP(email, otp_code);
        
        if (otpResult.success) {
            jsonResponse.success({ message: "Email verified successfully" });
        } else {
            jsonResponse.clientError(otpResult.message);
        }

    } catch (error) {
        console.error("Error verifying email registration OTP:", error);
        jsonResponse.serverError();
    }
};

export const getCurrentStudent: Controller = (req, res, next) => {
    const jsonResponse = new JsonResponse(res);
    try {
        const student = res.locals.student;
        if(!student) {
            jsonResponse.notAuthorized("No data found");
            return;
        }
        jsonResponse.success(student);
    } catch (error) {
        jsonResponse.serverError();
    }
}

export const updateStudent: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);
    try {
        const student = res.locals.student;
        if (!student) {
            jsonResponse.notAuthorized("No data found");
            return;
        }

        const { full_name, grade, email, address } = req.body;

        // Prepare update object
        const updateData: any = {};

        // Validate and update full_name if provided
        if (full_name !== undefined) {
            if (!full_name || full_name.trim().length < 2) {
                jsonResponse.clientError("Full name must be at least 2 characters long");
                return;
            }
            if (full_name.trim().length > 50) {
                jsonResponse.clientError("Name is too long (maximum 50 characters)");
                return;
            }
            if (!/^[a-zA-Z\s]+$/.test(full_name.trim())) {
                jsonResponse.clientError("Name can only contain letters and spaces");
                return;
            }
            updateData.full_name = full_name.trim();
        }

        // Validate and update grade if provided
        if (grade !== undefined) {
            if (typeof grade !== "number" || grade < 1 || grade > 12) {
                jsonResponse.clientError("Grade must be a number between 1 and 12");
                return;
            }
            updateData.grade = grade;
        }

        // Validate and update email if provided
        if (email !== undefined) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                jsonResponse.clientError("Invalid email address format");
                return;
            }
            // Check if email is already taken by another user
            const existingStudent = await Student.findOne({ 
                email: email.toLowerCase(), 
                _id: { $ne: student._id } 
            });
            if (existingStudent) {
                jsonResponse.clientError("Email address already in use");
                return;
            }
            updateData.email = email.toLowerCase();
        }

        // Validate and update address if provided
        if (address !== undefined) {
            if (address.province !== undefined) {
                if (!address.province || address.province.trim().length === 0) {
                    jsonResponse.clientError("Province is required");
                    return;
                }
                updateData['address.province'] = address.province.trim();
            }
            
            if (address.district !== undefined) {
                if (!address.district || address.district.trim().length === 0) {
                    jsonResponse.clientError("District is required");
                    return;
                }
                updateData['address.district'] = address.district.trim();
            }
            
            if (address.institution !== undefined) {
                if (!address.institution || address.institution.trim().length < 2) {
                    jsonResponse.clientError("Institution name must be at least 2 characters long");
                    return;
                }
                if (address.institution.trim().length > 100) {
                    jsonResponse.clientError("Institution name is too long (maximum 100 characters)");
                    return;
                }
                updateData['address.institution'] = address.institution.trim();
            }
        }

        // If no valid updates provided
        if (Object.keys(updateData).length === 0) {
            jsonResponse.clientError("No valid update fields provided");
            return;
        }

        // Update the student
        const updatedStudent = await Student.findByIdAndUpdate(
            student._id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedStudent) {
            jsonResponse.serverError("Failed to update student profile");
            return;
        }

        // Remove sensitive data before sending response
        const { password, ...studentData } = updatedStudent.toObject();

        jsonResponse.success({ 
            message: "Profile updated successfully", 
            student: studentData 
        });

    } catch (error) {
        console.error("Error updating student profile:", error);
        jsonResponse.serverError();
    }
}

export const uploadProfileImage: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);
    
    try {
        const student = res.locals.student; // From authentication middleware
        const { imageData } = req.body;

        // Validate image data
        if (!imageData) {
            jsonResponse.clientError("Image data is required");
            return;
        }

        // Validate base64 format
        if (!imageData.startsWith('data:image/')) {
            jsonResponse.clientError("Invalid image format. Must be base64 encoded image");
            return;
        }

        // Check image size (estimate from base64)
        const base64Data = imageData.split(',')[1];
        const sizeInBytes = (base64Data.length * 3) / 4;
        const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

        if (sizeInBytes > maxSizeInBytes) {
            jsonResponse.clientError(
                `Image file too large (${(sizeInBytes / (1024 * 1024)).toFixed(1)}MB). Maximum size allowed is 5MB. Please compress your image or use a smaller file.`
            );
            return;
        }

        // Extract the old profile image public_id if exists
        let oldPublicId: string | null = null;
        if (student.profileImage) {
            // Extract public_id from Cloudinary URL
            const urlParts = student.profileImage.split('/');
            const filename = urlParts[urlParts.length - 1];
            const publicIdWithExtension = filename.split('.')[0];
            oldPublicId = `noteswift/profile-images/${publicIdWithExtension}`;
        }

        // Upload new image to Cloudinary
        const uploadResult = await CloudinaryService.uploadProfileImage(imageData, student._id.toString());

        // Update student profile with new image URL
        const updatedStudent = await Student.findByIdAndUpdate(
            student._id,
            { profileImage: uploadResult.secure_url },
            { new: true, runValidators: true }
        );

        if (!updatedStudent) {
            jsonResponse.serverError("Failed to update profile with new image");
            return;
        }

        // Delete old image from Cloudinary (if exists)
        if (oldPublicId) {
            CloudinaryService.deleteProfileImage(oldPublicId).catch(err => {
                // Don't fail the request if old image deletion fails
            });
        }

        // Remove sensitive data before sending response
        const { password, ...studentData } = updatedStudent.toObject();

        jsonResponse.success({
            message: "Profile image updated successfully",
            student: studentData,
            imageUrl: uploadResult.secure_url
        });

    } catch (error: any) {
        console.error("Error uploading profile image:", error);
        
        // Handle specific error types
        if (error.message) {
            const message = error.message.toLowerCase();
            
            if (message.includes('payload') || message.includes('too large')) {
                jsonResponse.clientError("Image file is too large. Please use an image smaller than 5MB.");
            } else if (message.includes('cloudinary')) {
                jsonResponse.serverError("Image upload service is temporarily unavailable. Please try again later.");
            } else if (message.includes('network') || message.includes('timeout')) {
                jsonResponse.serverError("Network error occurred. Please check your connection and try again.");
            } else if (message.includes('format') || message.includes('invalid')) {
                jsonResponse.clientError("Invalid image format. Please use JPEG or PNG format.");
            }
        }
        
        // Generic error response
        jsonResponse.serverError("Failed to upload image. Please try again with a smaller image file.");
    }
};

// Email Change Flow Controllers

// Step 1: Send verification code to current email
export const sendCurrentEmailVerification: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);
    
    try {
        const student = res.locals.student;
        if (!student) {
            jsonResponse.notAuthorized("Authentication required");
            return;
        }

        // Send OTP to current email
        const result = await emailOTPService.sendEmailOTP(student.email);
        
        if (result.success) {
            jsonResponse.success({ 
                message: "Verification code sent to your current email address",
                email: student.email 
            });
        } else {
            jsonResponse.serverError(result.message);
        }

    } catch (error) {
        console.error("Error sending current email verification:", error);
        jsonResponse.serverError("Failed to send verification code. Please try again.");
    }
};

// Step 2: Verify current email ownership
export const verifyCurrentEmail: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);
    
    try {
        const student = res.locals.student;
        if (!student) {
            jsonResponse.notAuthorized("Authentication required");
            return;
        }

        const { otp_code } = req.body;

        if (!otp_code) {
            jsonResponse.clientError("Verification code is required");
            return;
        }

        // Verify OTP for current email
        const otpResult = await emailOTPService.verifyEmailOTP(student.email, otp_code);
        
        if (otpResult.success) {
            jsonResponse.success({ 
                message: "Current email verified successfully. You can now enter a new email address.",
                verified: true 
            });
        } else {
            jsonResponse.clientError(otpResult.message);
        }

    } catch (error) {
        console.error("Error verifying current email:", error);
        jsonResponse.serverError("Failed to verify code. Please try again.");
    }
};

// Step 3: Send verification code to new email
export const sendNewEmailVerification: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);
    
    try {
        const student = res.locals.student;
        if (!student) {
            jsonResponse.notAuthorized("Authentication required");
            return;
        }

        const { newEmail } = req.body;

        if (!newEmail) {
            jsonResponse.clientError("New email address is required");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            jsonResponse.clientError("Invalid email format");
            return;
        }

        // Check if new email is same as current
        if (newEmail.toLowerCase() === student.email.toLowerCase()) {
            jsonResponse.clientError("New email must be different from current email");
            return;
        }

        // Check if new email is already taken
        const existingStudent = await Student.findOne({ 
            email: newEmail.toLowerCase(),
            _id: { $ne: student._id }
        });
        
        if (existingStudent) {
            jsonResponse.clientError("This email address is already registered to another account");
            return;
        }

        // Send OTP to new email
        const result = await emailOTPService.sendEmailOTP(newEmail);
        
        if (result.success) {
            jsonResponse.success({ 
                message: "Verification code sent to your new email address",
                newEmail: newEmail 
            });
        } else {
            jsonResponse.serverError(result.message);
        }

    } catch (error) {
        console.error("Error sending new email verification:", error);
        jsonResponse.serverError("Failed to send verification code. Please try again.");
    }
};

// Step 4: Verify new email and complete email change
export const verifyNewEmailAndUpdate: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);
    
    try {
        const student = res.locals.student;
        if (!student) {
            jsonResponse.notAuthorized("Authentication required");
            return;
        }

        const { newEmail, otp_code } = req.body;

        if (!newEmail || !otp_code) {
            jsonResponse.clientError("New email and verification code are required");
            return;
        }

        // Verify OTP for new email
        const otpResult = await emailOTPService.verifyEmailOTP(newEmail, otp_code);
        
        if (!otpResult.success) {
            jsonResponse.clientError(otpResult.message);
            return;
        }

        // Double-check email is still available
        const existingStudent = await Student.findOne({ 
            email: newEmail.toLowerCase(),
            _id: { $ne: student._id }
        });
        
        if (existingStudent) {
            jsonResponse.clientError("This email address was just registered by another user");
            return;
        }

        // Update email
        const updatedStudent = await Student.findByIdAndUpdate(
            student._id,
            { email: newEmail.toLowerCase() },
            { new: true, runValidators: true }
        );

        if (!updatedStudent) {
            jsonResponse.serverError("Failed to update email address");
            return;
        }

        // Remove sensitive data
        const { password, ...studentData } = updatedStudent.toObject();

        jsonResponse.success({
            message: "Email address updated successfully",
            student: studentData,
            oldEmail: student.email,
            newEmail: newEmail
        });

    } catch (error) {
        console.error("Error verifying new email and updating:", error);
        jsonResponse.serverError("Failed to update email address. Please try again.");
    }
};

// Password Change Flow Controllers

// Step 1: Verify current password
export const verifyCurrentPassword: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);
    
    try {
        const student = res.locals.student;
        if (!student) {
            jsonResponse.notAuthorized("Authentication required");
            return;
        }

        const { currentPassword } = req.body;

        if (!currentPassword) {
            jsonResponse.clientError("Current password is required");
            return;
        }

        // Get full student data with password
        const fullStudent = await Student.findById(student._id).select('+password');
        if (!fullStudent) {
            jsonResponse.notAuthorized("User not found");
            return;
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, fullStudent.password);
        
        if (isPasswordValid) {
            jsonResponse.success({ 
                message: "Current password verified successfully",
                verified: true 
            });
        } else {
            jsonResponse.clientError("Current password is incorrect");
        }

    } catch (error) {
        console.error("Error verifying current password:", error);
        jsonResponse.serverError("Failed to verify password. Please try again.");
    }
};

// Step 2: Change password with current password verification
export const changePasswordWithCurrent: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);
    
    try {
        const student = res.locals.student;
        if (!student) {
            jsonResponse.notAuthorized("Authentication required");
            return;
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            jsonResponse.clientError("Both current and new passwords are required");
            return;
        }

        if (newPassword.length < 6) {
            jsonResponse.clientError("New password must be at least 6 characters long");
            return;
        }

        if (newPassword.length > 50) {
            jsonResponse.clientError("Password is too long (maximum 50 characters)");
            return;
        }

        // Get full student data with password
        const fullStudent = await Student.findById(student._id).select('+password');
        if (!fullStudent) {
            jsonResponse.notAuthorized("User not found");
            return;
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, fullStudent.password);
        
        if (!isPasswordValid) {
            jsonResponse.clientError("Current password is incorrect");
            return;
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        const updatedStudent = await Student.findByIdAndUpdate(
            student._id,
            { password: hashedNewPassword },
            { new: true, runValidators: true }
        );

        if (!updatedStudent) {
            jsonResponse.serverError("Failed to update password");
            return;
        }

        jsonResponse.success({
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("Error changing password:", error);
        jsonResponse.serverError("Failed to change password. Please try again.");
    }
};

// Step 3: Send forgot password OTP
export const sendForgotPasswordOTP: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);
    
    try {
        const student = res.locals.student;
        if (!student) {
            jsonResponse.notAuthorized("Authentication required");
            return;
        }

        // Send OTP to current email
        const result = await emailOTPService.sendEmailOTP(student.email);
        
        if (result.success) {
            jsonResponse.success({ 
                message: "Password reset code sent to your email address",
                email: student.email 
            });
        } else {
            jsonResponse.serverError(result.message);
        }

    } catch (error) {
        console.error("Error sending forgot password OTP:", error);
        jsonResponse.serverError("Failed to send password reset code. Please try again.");
    }
};

// Step 4: Verify forgot password OTP
export const verifyForgotPasswordOTP: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);
    
    try {
        const student = res.locals.student;
        if (!student) {
            jsonResponse.notAuthorized("Authentication required");
            return;
        }

        const { otp_code } = req.body;

        if (!otp_code) {
            jsonResponse.clientError("Verification code is required");
            return;
        }

        // Verify OTP for current email
        const otpResult = await emailOTPService.verifyEmailOTP(student.email, otp_code);
        
        if (otpResult.success) {
            jsonResponse.success({ 
                message: "Code verified successfully. You can now set a new password.",
                verified: true 
            });
        } else {
            jsonResponse.clientError(otpResult.message);
        }

    } catch (error) {
        console.error("Error verifying forgot password OTP:", error);
        jsonResponse.serverError("Failed to verify code. Please try again.");
    }
};

// Step 5: Reset password with OTP
export const resetPasswordWithOTP: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);
    
    try {
        const student = res.locals.student;
        if (!student) {
            jsonResponse.notAuthorized("Authentication required");
            return;
        }

        const { otp_code, newPassword } = req.body;

        if (!otp_code || !newPassword) {
            jsonResponse.clientError("Verification code and new password are required");
            return;
        }

        if (newPassword.length < 6) {
            jsonResponse.clientError("New password must be at least 6 characters long");
            return;
        }

        if (newPassword.length > 50) {
            jsonResponse.clientError("Password is too long (maximum 50 characters)");
            return;
        }

        // Verify OTP one more time before password reset
        const otpResult = await emailOTPService.verifyEmailOTP(student.email, otp_code);
        
        if (!otpResult.success) {
            jsonResponse.clientError(otpResult.message);
            return;
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        const updatedStudent = await Student.findByIdAndUpdate(
            student._id,
            { password: hashedNewPassword },
            { new: true, runValidators: true }
        );

        if (!updatedStudent) {
            jsonResponse.serverError("Failed to reset password");
            return;
        }

        jsonResponse.success({
            message: "Password reset successfully"
        });

    } catch (error) {
        console.error("Error resetting password with OTP:", error);
        jsonResponse.serverError("Failed to reset password. Please try again.");
    }
};

// Notification Preferences Controllers

// Get current notification preferences
export const getNotificationPreferences: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);
    
    try {
        const student = res.locals.student;
        if (!student) {
            jsonResponse.notAuthorized("Authentication required");
            return;
        }

        // Get full student data with notification preferences
        const fullStudent = await Student.findById(student._id);
        if (!fullStudent) {
            jsonResponse.notAuthorized("User not found");
            return;
        }

        // Return notification preferences or defaults if not set
        const preferences = fullStudent.notification_preferences || {
            push_notifications: true,
            email_notifications: true,
            lesson_reminders: true,
            progress_updates: true,
            course_announcements: true,
            study_streak_reminders: true,
            weekly_progress_report: false,
            new_content_alerts: true,
        };

        jsonResponse.success({
            message: "Notification preferences retrieved successfully",
            preferences: preferences
        });

    } catch (error) {
        console.error("Error getting notification preferences:", error);
        jsonResponse.serverError("Failed to get notification preferences. Please try again.");
    }
};

// Update notification preferences
export const updateNotificationPreferences: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);
    
    try {
        const student = res.locals.student;
        if (!student) {
            jsonResponse.notAuthorized("Authentication required");
            return;
        }

        const preferences = req.body;

        // Validate preferences object
        const requiredFields = [
            'push_notifications',
            'email_notifications', 
            'lesson_reminders',
            'progress_updates',
            'course_announcements',
            'study_streak_reminders',
            'weekly_progress_report',
            'new_content_alerts'
        ];

        for (const field of requiredFields) {
            if (typeof preferences[field] !== 'boolean') {
                jsonResponse.clientError(`Invalid value for ${field}. Must be true or false.`);
                return;
            }
        }

        // Update notification preferences
        const updatedStudent = await Student.findByIdAndUpdate(
            student._id,
            { notification_preferences: preferences },
            { new: true, runValidators: true }
        );

        if (!updatedStudent) {
            jsonResponse.serverError("Failed to update notification preferences");
            return;
        }

        jsonResponse.success({
            message: "Notification preferences updated successfully",
            preferences: updatedStudent.notification_preferences
        });

    } catch (error) {
        console.error("Error updating notification preferences:", error);
        jsonResponse.serverError("Failed to update notification preferences. Please try again.");
    }
};

// Reset device fingerprint (allows login from new device)
export const resetDeviceFingerprint: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);
    try {
        const student = res.locals.student;
        if (!student) {
            jsonResponse.notAuthorized("Authentication required");
            return;
        }

        // Reset device fingerprint to allow login from new device
        student.deviceFingerprint = undefined;
        await student.save();

        // Log the device reset
        await auditLogger.logSystemEvent(
            'device_fingerprint_reset',
            `Device fingerprint reset for ${student.full_name} (${student.email})`,
            'warning',
            {
                userId: student._id.toString(),
                userType: 'student',
                userName: student.full_name || student.email,
                userEmail: student.email,
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                reason: 'User requested device fingerprint reset'
            }
        );

        jsonResponse.success({
            message: "Device binding reset successfully. You can now login from a different device."
        });

    } catch (error) {
        console.error("Error resetting device fingerprint:", error);
        jsonResponse.serverError("Failed to reset device binding. Please try again.");
    }
};

// Unauthenticated Password Reset Controllers (for users who can't log in)

// Step 1: Send password reset OTP (unauthenticated)
export const sendPasswordResetOTP: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);

    try {
        const { email } = req.body;

        if (!email || email.trim().length === 0) {
            jsonResponse.clientError("Email address is required");
            return;
        }

        // Normalize email to lowercase
        const normalizedEmail = email.toLowerCase().trim();

        // Check if student exists
        const student = await Student.findOne({ email: normalizedEmail });
        if (!student) {
            // Don't reveal if email exists or not for security
            jsonResponse.success({
                message: "If an account with this email exists, a password reset code has been sent."
            });
            return;
        }

        // Send OTP to the email
        const result = await emailOTPService.sendEmailOTP(normalizedEmail);

        if (result.success) {
            jsonResponse.success({
                message: "If an account with this email exists, a password reset code has been sent."
            });
        } else {
            // Still return success for security (don't reveal email existence)
            console.error("Failed to send password reset OTP:", result.message);
            jsonResponse.success({
                message: "If an account with this email exists, a password reset code has been sent."
            });
        }

    } catch (error) {
        console.error("Error sending password reset OTP:", error);
        // Return success for security reasons
        jsonResponse.success({
            message: "If an account with this email exists, a password reset code has been sent."
        });
    }
};

// Step 2: Verify password reset OTP (unauthenticated)
export const verifyPasswordResetOTP: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);

    try {
        const { email, otp_code } = req.body;

        if (!email || email.trim().length === 0) {
            jsonResponse.clientError("Email address is required");
            return;
        }

        if (!otp_code) {
            jsonResponse.clientError("Verification code is required");
            return;
        }

        // Normalize email to lowercase
        const normalizedEmail = email.toLowerCase().trim();

        // Verify OTP
        const otpResult = await emailOTPService.verifyEmailOTP(normalizedEmail, otp_code);

        if (otpResult.success) {
            jsonResponse.success({
                message: "Code verified successfully. You can now set a new password.",
                verified: true
            });
        } else {
            jsonResponse.clientError(otpResult.message);
        }

    } catch (error) {
        console.error("Error verifying password reset OTP:", error);
        jsonResponse.serverError("Failed to verify code. Please try again.");
    }
};

// Step 3: Reset password with OTP (unauthenticated)
export const resetPasswordWithResetOTP: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);

    try {
        const { email, otp_code, newPassword } = req.body;

        if (!email || email.trim().length === 0) {
            jsonResponse.clientError("Email address is required");
            return;
        }

        if (!otp_code) {
            jsonResponse.clientError("Verification code is required");
            return;
        }

        if (!newPassword) {
            jsonResponse.clientError("New password is required");
            return;
        }

        if (newPassword.length < 6) {
            jsonResponse.clientError("New password must be at least 6 characters long");
            return;
        }

        if (newPassword.length > 50) {
            jsonResponse.clientError("Password is too long (maximum 50 characters)");
            return;
        }

        // Normalize email to lowercase
        const normalizedEmail = email.toLowerCase().trim();

        // Verify OTP first
        const otpResult = await emailOTPService.verifyEmailOTP(normalizedEmail, otp_code);

        if (!otpResult.success) {
            jsonResponse.clientError(otpResult.message);
            return;
        }

        // Find student
        const student = await Student.findOne({ email: normalizedEmail });
        if (!student) {
            jsonResponse.clientError("Account not found");
            return;
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Update password and reset device fingerprint to logout all other devices
        await Student.updateOne(
            { _id: student._id },
            { 
                $set: { password: hashedNewPassword },
                $unset: { deviceFingerprint: 1 }
            }
        );

        // Log the password reset and device reset
        // Log the password reset and device reset
        await auditLogger.logSystemEvent(
            'password_reset_with_device_reset',
            `Password reset and device fingerprint cleared for ${student.full_name} (${student.email})`,
            'warning',
            {
                userId: student._id.toString(),
                userType: 'student',
                userName: student.full_name || student.email,
                userEmail: student.email,
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                reason: 'Password reset - device fingerprint cleared for security'
            }
        );

        jsonResponse.success({
            message: "Password reset successfully. All other devices have been logged out for security. You can now log in with your new password."
        });

    } catch (error) {
        console.error("Error resetting password with OTP:", error);
        jsonResponse.serverError("Failed to reset password. Please try again.");
    }
};

// Send report email
export const sendReportEmail: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);
    try {
        const { reportText } = req.body;
        const student = res.locals.student;

        if (!reportText || reportText.trim().length === 0) {
            jsonResponse.clientError("Report text is required");
            return;
        }

        if (reportText.trim().length > 2000) {
            jsonResponse.clientError("Report text is too long (maximum 2000 characters)");
            return;
        }

        // Send report email
        const result = await reportEmailService.sendReportEmail(
            reportText.trim(),
            student ? student.email : undefined
        );

        if (result.success) {
            jsonResponse.success({
                message: result.message
            });
        } else {
            jsonResponse.serverError(result.message);
        }

    } catch (error) {
        console.error("Error sending report email:", error);
        jsonResponse.serverError("Failed to send report. Please try again.");
    }
};

// Logout controller
export const logoutStudent: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);
    try {
        const student = res.locals.student;
        if (!student) {
            jsonResponse.notAuthorized("Authentication required");
            return;
        }

        // Clear device fingerprint to allow login from other devices
        student.deviceFingerprint = undefined;
        await student.save();

        // Log successful logout
        await auditLogger.logLogout(
            student._id.toString(),
            'student',
            student.full_name || student.email,
            student.email,
            {
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                reason: 'User initiated logout'
            }
        );

        jsonResponse.success({
            message: "Logged out successfully"
        });

    } catch (error) {
        console.error("Error during student logout:", error);
        jsonResponse.serverError("Failed to logout. Please try again.");
    }
};

// Push Token Controllers

// Register push token for notifications
export const registerPushToken: Controller = async (req, res, next) => {
    const jsonResponse = new JsonResponse(res);
    try {
        const { pushToken } = req.body;
        const student = res.locals.student;

        if (!student) {
            jsonResponse.notAuthorized("Authentication required");
            return;
        }

        if (!pushToken) {
            jsonResponse.clientError("Push token is required");
            return;
        }

        // Update push token
        student.pushToken = pushToken;
        await student.save();

        jsonResponse.success({
            message: "Push token registered successfully"
        });

    } catch (error) {
        console.error("Error registering push token:", error);
        jsonResponse.serverError("Failed to register push token. Please try again.");
    }
};
