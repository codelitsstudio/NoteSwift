import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import JsonResponse from "@core/lib/Response";
import { Admin } from "../models/admins/Admin.model";
import { Student } from "../models/students/Student.model";

export interface SessionPayload {
    user_id: string;
    role: "admin"|"student"|"teacher";
    iat?: number;
    exp?: number;
}


export const authenticateStudent = async (req: Request, res: Response, next: NextFunction) => {
    const jsonResponse = new JsonResponse(res);

    try {
        // Get token from Authorization header first (prioritize over cookies)
        let token: string | undefined;
        
        // First try Authorization header
        if (req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        
        // Fallback to cookie if no Authorization header
        if (!token && req.cookies?.session) {
            token = req.cookies.session;
        }
        
        if (!token) return jsonResponse.notAuthorized("No session token found");

        const secret = process.env.SESSION_SECRET;
        if (!secret) throw new Error("SESSION_SECRET not defined");

        const decoded = jwt.verify(token, secret) as SessionPayload;

        if (decoded.role !== "student") {
            return jsonResponse.notAuthorized("Access denied");
        }

        const student = await Student.findById(decoded.user_id).select("-password");
        if (!student) {
            return jsonResponse.notAuthorized("Student not found");
        }

        // Set user in req.user for compatibility with courseController
        req.user = {
            id: student._id.toString(),
            role: "student"
        };
        
        res.locals.student = student; 
        next();
    } catch (err) {
        console.error('Authentication error:', err);
        return jsonResponse.notAuthorized("Invalid or expired token");
    }
};
