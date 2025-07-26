import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import JsonResponse from "lib/Response";
import { Admin } from "models/admins/Admin.model";

interface AuthPayload {
    user_id: string;
    role: "admin";
    iat: number;
    exp: number;
}

export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const jsonResponse = new JsonResponse(res);

    try {
        const token = req.cookies?.session;
        if (!token) return jsonResponse.notAuthorized("No session token found");

        const secret = process.env.SESSION_SECRET;
        if (!secret) throw new Error("SESSION_SECRET not defined");

        const decoded = jwt.verify(token, secret) as AuthPayload;

        if (decoded.role !== "admin") {
            return jsonResponse.notAuthorized("Access denied");
        }

        const admin = await Admin.findById(decoded.user_id).select("-password");
        if (!admin) return jsonResponse.notAuthorized("Admin not found");

        res.locals.admin = admin; // ✅ attach admin to res.locals
        next();
    } catch (err) {
        console.error(err);
        return jsonResponse.notAuthorized("Invalid or expired token");
    }
};
