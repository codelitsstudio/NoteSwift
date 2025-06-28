import JsonResponse from "lib/Response";
import { Controller } from "types/controller";
import { LoginStudent, SignupStudent } from "@shared/api/student/auth"
import { Student } from "models/students/Student.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const expiresIn = 60 * 60 * 24 * 14 * 1000;
const options = { maxAge: expiresIn, httpOnly: false };

export const signUpStudent: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    try {
        const body: SignupStudent.Req = req.body;
        const secret = process.env.SESSION_SECRET;
        const salt = await bcrypt.genSalt(10);
        const existingStudent = await Student.findOne({ phone_number: body.phone_number });
        if (existingStudent) {
            return jsonResponse.clientError("Phone number already registered");
        }
        if (!secret) throw new Error("No session secret provided");

        // ✅ Manual validations
        if (!body.full_name || body.full_name.trim().length < 3) {
            return jsonResponse.clientError("Full name is required and must be at least 3 characters");
        }

        if (!body.grade || typeof body.grade !== "number" || body.grade < 1 || body.grade > 12) {
            return jsonResponse.clientError("Grade must be a number between 1 and 12");
        }

        if (!body.phone_number || !/^[9][78]\d{8}$/.test(body.phone_number)) {
            return jsonResponse.clientError("Invalid phone number format");
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
            phone_number: body.phone_number,
        });

        await student.save();

        const token = jwt.sign({ user_id: student._id.toString() }, secret, {
            expiresIn: "10d"
        });

        res.cookie("session", token, options);
        const studentObj = student.toJSON();
        jsonResponse.success(studentObj);
    } catch (error) {
        console.error(error);
        jsonResponse.serverError();
    }
};


export const loginStudent: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);

    try {
        const body: LoginStudent.Req = req.body;
        const secret = process.env.SESSION_SECRET;

        if (!secret) throw new Error("No session secret provided");

        // Validate input
        if (!body.phone_number || !body.password) {
            return jsonResponse.clientError("Phone number or password missing");
        }

        // Find student
        const student = await Student.findOne({ phone_number: body.phone_number });
        if (!student) {
            return jsonResponse.clientError("Student not found");
        }

        // Compare password
        const match = await bcrypt.compare(body.password, student.password);
        if (!match) {
            return jsonResponse.clientError("Invalid password");
        }

        // Generate token
        const token = jwt.sign({ user_id: student._id.toString() }, secret, {
            expiresIn: "10d"
        });

        res.cookie("session", token, options);

        const studentObj = student.toJSON(); // Assuming you handle password hiding in schema
        jsonResponse.success(studentObj);

    } catch (error) {
        console.log(error);
        jsonResponse.serverError();
    }
};

