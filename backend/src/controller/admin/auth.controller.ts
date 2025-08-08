import { Controller } from "types/controller";
import JsonResponse from "lib/Response";
import { LoginAdmin } from "@shared/api/admin/auth";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Admin } from "models/admins/Admin.model";

const options = { maxAge: 60 * 60 * 24 * 14 * 1000, httpOnly: false }; // 14 days

export const loginAdmin: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    try {
        const body: LoginAdmin.Req = req.body;

        // Basic validation
        if (!body.email || !body.password) {
            return jsonResponse.clientError("Email and password are required");
        }

        const admin = await Admin.findOne({ email: body.email });
        if (!admin) {
            return jsonResponse.clientError("Admin not found");
        }

        const match = body.password === admin.password
        if (!match) {
            return jsonResponse.clientError("Invalid password");
        }

        const secret = process.env.SESSION_SECRET;
        if (!secret) throw new Error("No session secret provided");

        const token = jwt.sign({ user_id: admin._id.toString(), role: "admin" }, secret, {
            expiresIn: "10d",
        });

        res.cookie("session", token, options);

        jsonResponse.success({
            _id: admin._id.toString(),
            full_name: admin.full_name,
            email: admin.email,
        });
    } catch (err) {
        console.error(err);
        jsonResponse.serverError();
    }
};

export const signupAdmin: Controller = async(req, res) => {
    const jsonREsponse = new JsonResponse(res);

    try {
        const { full_name, email, password } = req.body;

        if(!email || !password) {
            return jsonREsponse.clientError("Email and password required");
        }

        const exist = await Admin.findOne({email: email});

        if(exist) {
            return jsonREsponse.clientError("Email already exist.");
        }

        const hPassword = await bcrypt.hash(password, 10);
        const adminCreate = await Admin.create({
            email,
            full_name,
            password:hPassword
        });

        const createdAdmin = await Admin.findById(adminCreate._id).select("-password");
        return jsonREsponse.success(createdAdmin, "Admin created successfully.");
    } catch (error) {
        console.log(error);
        jsonREsponse.serverError("Error");
    }
}
