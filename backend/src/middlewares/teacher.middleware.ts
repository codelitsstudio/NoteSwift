import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import JsonResponse from "lib/Response";
import {Teacher} from "models/teacher/teacher.model";

interface AuthPayload {
    teacher_id: string;
    iat: number;
    exp: number;
}

export const authenticatedTeacher = async (req: Request, res: Response, next: NextFunction) => {
    const jsonResponse = new JsonResponse(res);

    try {
        const token = req.cookies?.session;
        if (!token) return jsonResponse.notAuthorized("No session token found");

        const secret = process.env.SESSION_SECRET;
        if (!secret) throw new Error("SESSION_SECRET not defined");

        const decoded = jwt.verify(token, secret) as AuthPayload;


        const teacher = await Teacher.findById(decoded.teacher_id).select("-password");
        if (!teacher) return jsonResponse.notAuthorized("Teacher not found");

        res.locals.teacher = teacher;
        next();
    } catch (err) {
        console.error(err);
        return jsonResponse.notAuthorized("Invalid or expired token");
    }
};
