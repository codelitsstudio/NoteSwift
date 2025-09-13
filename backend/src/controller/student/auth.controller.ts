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

const expiresIn = 60 * 60 * 24 * 14 * 1000;
const options = { maxAge: expiresIn, httpOnly: false };

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

        const student = new Student({
            address: body.address,
            full_name: body.full_name,
            grade: body.grade,
            password: encrypted_password,
            email: body.email,
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

    try {
        const body: LoginStudent.Req = req.body;
        const secret = process.env.SESSION_SECRET;

        if (!secret) throw new Error("No session secret provided");

        // Validate input
        if (!body.email || !body.password) {
            return jsonResponse.clientError("Email or password missing");
        }

        // Find student
        const student = await Student.findOne({ email: body.email });
        if (!student) {
            return jsonResponse.clientError("Student not found");
        }

        // Compare password
        const match = await bcrypt.compare(body.password, student.password);
        if (!match) {
            return jsonResponse.clientError("Invalid password");
        }

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
        jsonResponse.success(response);

    } catch (error) {
        console.log(error);
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
