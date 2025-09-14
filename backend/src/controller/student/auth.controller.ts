import JsonResponse from "lib/Response";
import { Controller } from "types/controller";
import { LoginStudent, SignupStudent } from "@shared/api/student/auth"
import { Student } from "models/students/Student.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { SessionPayload } from "middlewares/student.middleware";
import { TStudentWithNoSensitive } from "@shared/model/students/Student";
import otpService from "../../services/otpService";
import emailOTPService from "../../services/emailOTPService";
import CloudinaryService from "../../services/cloudinaryService";

const expiresIn = 60 * 60 * 24 * 14 * 1000;
const options = { maxAge: expiresIn, httpOnly: false };

const getRandomAvatarEmoji = (): string => {
  const seed = Math.random().toString(36).substring(7);
  return `https://api.dicebear.com/9.x/open-peeps/png?seed=${seed}`;
};

export const signUpStudent: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    try {
        const body: SignupStudent.Req = req.body;
        const secret = process.env.SESSION_SECRET;
        const salt = await bcrypt.genSalt(10);
        const existingStudent = await Student.findOne({ email: body.email });
        if (existingStudent) {
            return jsonResponse.clientError("Email address already registered");
        }
        if (!secret) throw new Error("No session secret provided");

        // ✅ Manual validations
        if (!body.full_name || body.full_name.trim().length < 3) {
            return jsonResponse.clientError("Full name is required and must be at least 3 characters");
        }

        if (!body.grade || typeof body.grade !== "number" || body.grade < 1 || body.grade > 12) {
            return jsonResponse.clientError("Grade must be a number between 1 and 12");
        }

        if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
            return jsonResponse.clientError("Invalid email address format");
        }

        if (!body.password || body.password.length < 6) {
            return jsonResponse.clientError("Password must be at least 6 characters long");
        }

        if (
            !body.address ||
            !body.address.province ||
            !body.address.district ||
            !body.address.institution
        ) {
            return jsonResponse.clientError("Complete address (province, district, institution) is required");
        }

        const encrypted_password = await bcrypt.hash(body.password, salt);

        // Generate a permanent avatar emoji for this user
        const avatarEmoji = getRandomAvatarEmoji();

        const student = new Student({
            address: body.address,
            full_name: body.full_name,
            grade: body.grade,
            password: encrypted_password,
            email: body.email,
            avatarEmoji: avatarEmoji, // Permanent emoji assigned at registration
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
        jsonResponse.success(response);
    } catch (error) {
        console.error(error);
        jsonResponse.serverError();
    }
}

// DEPRECATED: Phone-based registration - now using email
// Send OTP for registration
/*
export const sendRegistrationOTP: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    try {
        const { phone_number } = req.body;

        if (!phone_number) {
            return jsonResponse.clientError("Phone number is required");
        }

        // Validate phone number format
        if (!/^[9][78]\d{8}$/.test(phone_number)) {
            return jsonResponse.clientError("Invalid phone number format");
        }

        // Check if phone number already exists
        const existingStudent = await Student.findOne({ phone_number });
        if (existingStudent) {
            return jsonResponse.clientError("Phone number already registered");
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
export const verifyRegistrationOTP: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    try {
        const { phone_number, otp_code } = req.body;

        if (!phone_number || !otp_code) {
            return jsonResponse.clientError("Phone number and OTP code are required");
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


export const loginStudent: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    console.log('🔑 LOGIN ATTEMPT:', req.body.email);

    try {
        const body: LoginStudent.Req = req.body;
        const secret = process.env.SESSION_SECRET;

        console.log('🔍 Login Debug:');
        console.log('- Email provided:', !!body.email);
        console.log('- Password provided:', !!body.password);
        console.log('- Secret available:', !!secret);

        if (!secret) throw new Error("No session secret provided");

        // Validate input
        if (!body.email || !body.password) {
            console.log('❌ Missing email or password');
            return jsonResponse.clientError("Email or password missing");
        }

        // Find student
        console.log('🔍 Searching for student with email:', body.email);
        const student = await Student.findOne({ email: body.email });
        if (!student) {
            console.log('❌ Student not found for email:', body.email);
            return jsonResponse.clientError("Student not found");
        }

        console.log('✅ Student found:', student._id);

        // Compare password
        console.log('🔐 Comparing password...');
        const match = await bcrypt.compare(body.password, student.password);
        if (!match) {
            console.log('❌ Password mismatch');
            return jsonResponse.clientError("Invalid password");
        }

        console.log('✅ Password match successful');

        // Generate token
        console.log('🎫 Generating JWT token...');
        const token = jwt.sign({ user_id: student._id.toString(), role: "student" }, secret, {
            expiresIn: "10d"
        });

        console.log('✅ Token generated, length:', token.length);

        res.cookie("session", token, options);

        const studentObj = student.toJSON(); // Assuming you handle password hiding in schema
        const response: LoginStudent.Res = {
            user: studentObj,
            token
        };
        
        console.log('✅ Login successful, sending response');
        jsonResponse.success(response);

    } catch (error) {
        console.log('🚨 Login error:', error);
        jsonResponse.serverError();
    }
};

// Send OTP to email for registration
export const sendEmailRegistrationOTP: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    try {
        const { email } = req.body;
        console.log("🔍 Checking email registration for:", email);

        if (!email) {
            return jsonResponse.clientError("Email address is required");
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return jsonResponse.clientError("Invalid email format");
        }

        // Check if email already exists
        const existingStudent = await Student.findOne({ email });
        console.log("📊 Existing student found:", !!existingStudent);
        if (existingStudent) {
            console.log("❌ Email already registered, returning error");
            return jsonResponse.clientError("Email address already registered");
        }

        console.log("✅ Email available, sending OTP");
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
export const verifyEmailRegistrationOTP: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    try {
        const { email, otp_code } = req.body;

        if (!email || !otp_code) {
            return jsonResponse.clientError("Email and OTP code are required");
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

export const getCurrentStudent: Controller = (req, res) => {
    const jsonResponse = new JsonResponse(res);
    try {
        const student = res.locals.student;
        if(!student) return jsonResponse.notAuthorized("No data found");
        return jsonResponse.success(student);
    } catch (error) {
        console.log(error);
        jsonResponse.serverError();
    }
}

export const updateStudent: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    try {
        const student = res.locals.student;
        if (!student) return jsonResponse.notAuthorized("No data found");

        const { full_name, grade, email, address } = req.body;

        // Prepare update object
        const updateData: any = {};

        // Validate and update full_name if provided
        if (full_name !== undefined) {
            if (!full_name || full_name.trim().length < 2) {
                return jsonResponse.clientError("Full name must be at least 2 characters long");
            }
            if (full_name.trim().length > 50) {
                return jsonResponse.clientError("Name is too long (maximum 50 characters)");
            }
            if (!/^[a-zA-Z\s]+$/.test(full_name.trim())) {
                return jsonResponse.clientError("Name can only contain letters and spaces");
            }
            updateData.full_name = full_name.trim();
        }

        // Validate and update grade if provided
        if (grade !== undefined) {
            if (typeof grade !== "number" || grade < 1 || grade > 12) {
                return jsonResponse.clientError("Grade must be a number between 1 and 12");
            }
            updateData.grade = grade;
        }

        // Validate and update email if provided
        if (email !== undefined) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return jsonResponse.clientError("Invalid email address format");
            }
            // Check if email is already taken by another user
            const existingStudent = await Student.findOne({ 
                email: email, 
                _id: { $ne: student._id } 
            });
            if (existingStudent) {
                return jsonResponse.clientError("Email address already in use");
            }
            updateData.email = email;
        }

        // Validate and update address if provided
        if (address !== undefined) {
            if (address.province !== undefined) {
                if (!address.province || address.province.trim().length === 0) {
                    return jsonResponse.clientError("Province is required");
                }
                updateData['address.province'] = address.province.trim();
            }
            
            if (address.district !== undefined) {
                if (!address.district || address.district.trim().length === 0) {
                    return jsonResponse.clientError("District is required");
                }
                updateData['address.district'] = address.district.trim();
            }
            
            if (address.institution !== undefined) {
                if (!address.institution || address.institution.trim().length < 2) {
                    return jsonResponse.clientError("Institution name must be at least 2 characters long");
                }
                if (address.institution.trim().length > 100) {
                    return jsonResponse.clientError("Institution name is too long (maximum 100 characters)");
                }
                updateData['address.institution'] = address.institution.trim();
            }
        }

        // If no valid updates provided
        if (Object.keys(updateData).length === 0) {
            return jsonResponse.clientError("No valid update fields provided");
        }

        // Update the student
        const updatedStudent = await Student.findByIdAndUpdate(
            student._id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedStudent) {
            return jsonResponse.serverError("Failed to update student profile");
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

export const uploadProfileImage: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    
    try {
        const student = res.locals.student; // From authentication middleware
        const { imageData } = req.body;

        console.log('📸 Profile image upload request for user:', student._id);

        // Validate image data
        if (!imageData) {
            return jsonResponse.clientError("Image data is required");
        }

        // Validate base64 format
        if (!imageData.startsWith('data:image/')) {
            return jsonResponse.clientError("Invalid image format. Must be base64 encoded image");
        }

        // Check image size (estimate from base64)
        const base64Data = imageData.split(',')[1];
        const sizeInBytes = (base64Data.length * 3) / 4;
        const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

        if (sizeInBytes > maxSizeInBytes) {
            return jsonResponse.clientError(
                `Image file too large (${(sizeInBytes / (1024 * 1024)).toFixed(1)}MB). Maximum size allowed is 5MB. Please compress your image or use a smaller file.`
            );
        }

        console.log(`📏 Image size: ${(sizeInBytes / (1024 * 1024)).toFixed(1)}MB`);

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
        console.log('☁️ Uploading to Cloudinary...');
        const uploadResult = await CloudinaryService.uploadProfileImage(imageData, student._id.toString());

        // Update student profile with new image URL
        const updatedStudent = await Student.findByIdAndUpdate(
            student._id,
            { profileImage: uploadResult.secure_url },
            { new: true, runValidators: true }
        );

        if (!updatedStudent) {
            return jsonResponse.serverError("Failed to update profile with new image");
        }

        // Delete old image from Cloudinary (if exists)
        if (oldPublicId) {
            CloudinaryService.deleteProfileImage(oldPublicId).catch(err => {
                console.error('Failed to delete old profile image:', err);
                // Don't fail the request if old image deletion fails
            });
        }

        // Remove sensitive data before sending response
        const { password, ...studentData } = updatedStudent.toObject();

        console.log('✅ Profile image updated successfully for user:', student._id);

        jsonResponse.success({
            message: "Profile image updated successfully",
            student: studentData,
            imageUrl: uploadResult.secure_url
        });

    } catch (error: any) {
        console.error("❌ Error uploading profile image:", error);
        
        // Handle specific error types
        if (error.message) {
            const message = error.message.toLowerCase();
            
            if (message.includes('payload') || message.includes('too large')) {
                return jsonResponse.clientError("Image file is too large. Please use an image smaller than 5MB.");
            } else if (message.includes('cloudinary')) {
                return jsonResponse.serverError("Image upload service is temporarily unavailable. Please try again later.");
            } else if (message.includes('network') || message.includes('timeout')) {
                return jsonResponse.serverError("Network error occurred. Please check your connection and try again.");
            } else if (message.includes('format') || message.includes('invalid')) {
                return jsonResponse.clientError("Invalid image format. Please use JPEG or PNG format.");
            }
        }
        
        // Generic error response
        jsonResponse.serverError("Failed to upload image. Please try again with a smaller image file.");
    }
};

// Email Change Flow Controllers

// Step 1: Send verification code to current email
export const sendCurrentEmailVerification: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    
    try {
        const student = res.locals.student;
        if (!student) return jsonResponse.notAuthorized("Authentication required");

        console.log('📧 Sending verification code to current email:', student.email);

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
export const verifyCurrentEmail: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    
    try {
        const student = res.locals.student;
        if (!student) return jsonResponse.notAuthorized("Authentication required");

        const { otp_code } = req.body;

        if (!otp_code) {
            return jsonResponse.clientError("Verification code is required");
        }

        console.log('🔐 Verifying current email OTP for user:', student._id);

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
export const sendNewEmailVerification: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    
    try {
        const student = res.locals.student;
        if (!student) return jsonResponse.notAuthorized("Authentication required");

        const { newEmail } = req.body;

        if (!newEmail) {
            return jsonResponse.clientError("New email address is required");
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            return jsonResponse.clientError("Invalid email format");
        }

        // Check if new email is same as current
        if (newEmail.toLowerCase() === student.email.toLowerCase()) {
            return jsonResponse.clientError("New email must be different from current email");
        }

        // Check if new email is already taken
        const existingStudent = await Student.findOne({ 
            email: newEmail.toLowerCase(),
            _id: { $ne: student._id }
        });
        
        if (existingStudent) {
            return jsonResponse.clientError("This email address is already registered to another account");
        }

        console.log('📧 Sending verification code to new email:', newEmail);

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
export const verifyNewEmailAndUpdate: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    
    try {
        const student = res.locals.student;
        if (!student) return jsonResponse.notAuthorized("Authentication required");

        const { newEmail, otp_code } = req.body;

        if (!newEmail || !otp_code) {
            return jsonResponse.clientError("New email and verification code are required");
        }

        console.log('🔐 Verifying new email OTP and updating:', newEmail);

        // Verify OTP for new email
        const otpResult = await emailOTPService.verifyEmailOTP(newEmail, otp_code);
        
        if (!otpResult.success) {
            return jsonResponse.clientError(otpResult.message);
        }

        // Double-check email is still available
        const existingStudent = await Student.findOne({ 
            email: newEmail.toLowerCase(),
            _id: { $ne: student._id }
        });
        
        if (existingStudent) {
            return jsonResponse.clientError("This email address was just registered by another user");
        }

        // Update email
        const updatedStudent = await Student.findByIdAndUpdate(
            student._id,
            { email: newEmail.toLowerCase() },
            { new: true, runValidators: true }
        );

        if (!updatedStudent) {
            return jsonResponse.serverError("Failed to update email address");
        }

        // Remove sensitive data
        const { password, ...studentData } = updatedStudent.toObject();

        console.log('✅ Email updated successfully for user:', student._id);

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
export const verifyCurrentPassword: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    
    try {
        const student = res.locals.student;
        if (!student) return jsonResponse.notAuthorized("Authentication required");

        const { currentPassword } = req.body;

        if (!currentPassword) {
            return jsonResponse.clientError("Current password is required");
        }

        console.log('🔐 Verifying current password for user:', student._id);

        // Get full student data with password
        const fullStudent = await Student.findById(student._id);
        if (!fullStudent) {
            return jsonResponse.notAuthorized("User not found");
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
export const changePasswordWithCurrent: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    
    try {
        const student = res.locals.student;
        if (!student) return jsonResponse.notAuthorized("Authentication required");

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return jsonResponse.clientError("Both current and new passwords are required");
        }

        if (newPassword.length < 6) {
            return jsonResponse.clientError("New password must be at least 6 characters long");
        }

        if (newPassword.length > 50) {
            return jsonResponse.clientError("Password is too long (maximum 50 characters)");
        }

        console.log('🔒 Changing password with current verification for user:', student._id);

        // Get full student data with password
        const fullStudent = await Student.findById(student._id);
        if (!fullStudent) {
            return jsonResponse.notAuthorized("User not found");
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, fullStudent.password);
        
        if (!isPasswordValid) {
            return jsonResponse.clientError("Current password is incorrect");
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
            return jsonResponse.serverError("Failed to update password");
        }

        console.log('✅ Password changed successfully for user:', student._id);

        jsonResponse.success({
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("Error changing password:", error);
        jsonResponse.serverError("Failed to change password. Please try again.");
    }
};

// Step 3: Send forgot password OTP
export const sendForgotPasswordOTP: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    
    try {
        const student = res.locals.student;
        if (!student) return jsonResponse.notAuthorized("Authentication required");

        console.log('📧 Sending forgot password OTP to:', student.email);

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
export const verifyForgotPasswordOTP: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    
    try {
        const student = res.locals.student;
        if (!student) return jsonResponse.notAuthorized("Authentication required");

        const { otp_code } = req.body;

        if (!otp_code) {
            return jsonResponse.clientError("Verification code is required");
        }

        console.log('🔐 Verifying forgot password OTP for user:', student._id);

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
export const resetPasswordWithOTP: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    
    try {
        const student = res.locals.student;
        if (!student) return jsonResponse.notAuthorized("Authentication required");

        const { otp_code, newPassword } = req.body;

        if (!otp_code || !newPassword) {
            return jsonResponse.clientError("Verification code and new password are required");
        }

        if (newPassword.length < 6) {
            return jsonResponse.clientError("New password must be at least 6 characters long");
        }

        if (newPassword.length > 50) {
            return jsonResponse.clientError("Password is too long (maximum 50 characters)");
        }

        console.log('🔒 Resetting password with OTP for user:', student._id);

        // Verify OTP one more time before password reset
        const otpResult = await emailOTPService.verifyEmailOTP(student.email, otp_code);
        
        if (!otpResult.success) {
            return jsonResponse.clientError(otpResult.message);
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
            return jsonResponse.serverError("Failed to reset password");
        }

        console.log('✅ Password reset successfully for user:', student._id);

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
export const getNotificationPreferences: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    
    try {
        const student = res.locals.student;
        if (!student) return jsonResponse.notAuthorized("Authentication required");

        console.log('📱 Getting notification preferences for user:', student._id);

        // Get full student data with notification preferences
        const fullStudent = await Student.findById(student._id);
        if (!fullStudent) {
            return jsonResponse.notAuthorized("User not found");
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
export const updateNotificationPreferences: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    
    try {
        const student = res.locals.student;
        if (!student) return jsonResponse.notAuthorized("Authentication required");

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
                return jsonResponse.clientError(`Invalid value for ${field}. Must be true or false.`);
            }
        }

        console.log('📱 Updating notification preferences for user:', student._id, preferences);

        // Update notification preferences
        const updatedStudent = await Student.findByIdAndUpdate(
            student._id,
            { notification_preferences: preferences },
            { new: true, runValidators: true }
        );

        if (!updatedStudent) {
            return jsonResponse.serverError("Failed to update notification preferences");
        }

        console.log('✅ Notification preferences updated successfully for user:', student._id);

        jsonResponse.success({
            message: "Notification preferences updated successfully",
            preferences: updatedStudent.notification_preferences
        });

    } catch (error) {
        console.error("Error updating notification preferences:", error);
        jsonResponse.serverError("Failed to update notification preferences. Please try again.");
    }
};
