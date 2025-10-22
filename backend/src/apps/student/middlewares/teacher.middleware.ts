import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import JsonResponse from "@core/lib/Response";
import Teacher from "../models/Teacher.model";

export interface SessionPayload {
    user_id: string;
    role: "admin"|"student"|"teacher";
    iat?: number;
    exp?: number;
}

export const authenticateTeacher = async (req: Request, res: Response, next: NextFunction) => {
    console.log('🎯 TEACHER AUTHENTICATION MIDDLEWARE CALLED for:', req.method, req.path);
    const jsonResponse = new JsonResponse(res);

    try {
        // Get token from Authorization header first (prioritize over cookies)
        let token: string | undefined;

        // First try Authorization header
        if (req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
                console.log('🔑 Using token from Authorization header');
            }
        }

        // Fallback to cookie if no Authorization header
        if (!token && req.cookies?.session) {
            token = req.cookies.session;
            console.log('🔑 Using token from cookie');
        }

        if (!token) return jsonResponse.notAuthorized("No session token found");

        const secret = process.env.SESSION_SECRET;
        if (!secret) throw new Error("SESSION_SECRET not defined");

        const decoded = jwt.verify(token, secret) as SessionPayload;

        if (decoded.role !== "teacher") {
            return jsonResponse.notAuthorized("Access denied");
        }

        const teacher = await Teacher.findById(decoded.user_id).select("-password");
        if (!teacher) {
            return jsonResponse.notAuthorized("Teacher not found");
        }

        // Set user in req.user for compatibility
        req.user = {
            id: (teacher._id as any).toString(),
            role: "teacher"
        };

        res.locals.teacher = teacher;
        next();
    } catch (err) {
        console.error('🚨 Teacher authentication error:', err);
        return jsonResponse.notAuthorized("Invalid or expired token");
    }
};