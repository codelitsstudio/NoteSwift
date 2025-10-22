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
    console.log('🎯 AUTHENTICATION MIDDLEWARE CALLED for:', req.method, req.path);
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
        
        console.log('🔍 Authentication Debug:');
        console.log('- Cookie token:', req.cookies?.session ? 'Present' : 'Missing');
        console.log('- Auth header:', req.headers.authorization ? 'Present' : 'Missing');
        console.log('- Final token:', token ? 'Present' : 'Missing');
        console.log('- Raw cookie token:', req.cookies?.session || 'None');
        console.log('- Raw auth header:', req.headers.authorization || 'None');
        console.log('- Token preview:', token ? `${token.substring(0, 50)}...${token.substring(token.length - 20)}` : 'None');
        console.log('- Token format check:', token ? (token.split('.').length === 3 ? 'Valid JWT format' : `Invalid JWT format (${token.split('.').length} parts)`) : 'No token');
        
        if (!token) return jsonResponse.notAuthorized("No session token found");

        const secret = process.env.SESSION_SECRET;
        if (!secret) throw new Error("SESSION_SECRET not defined");

        console.log('- Secret available:', secret ? 'Yes' : 'No');
        console.log('- Token length:', token.length);

        const decoded = jwt.verify(token, secret) as SessionPayload;
        console.log('- Token decoded successfully:', decoded);

        if (decoded.role !== "student") {
            console.log('- Role mismatch:', decoded.role);
            return jsonResponse.notAuthorized("Access denied");
        }

        const student = await Student.findById(decoded.user_id).select("-password");
        if (!student) {
            console.log('- Student not found for ID:', decoded.user_id);
            return jsonResponse.notAuthorized("Student not found");
        }

        console.log('- Student found:', student._id);

        // Set user in req.user for compatibility with courseController
        req.user = {
            id: student._id.toString(),
            role: "student"
        };
        
        res.locals.student = student; 
        next();
    } catch (err) {
        console.error('🚨 Authentication error:', err);
        return jsonResponse.notAuthorized("Invalid or expired token");
    }
};
