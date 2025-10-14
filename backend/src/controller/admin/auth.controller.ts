import { Controller } from "types/controller";
import JsonResponse from "lib/Response";
import { LoginAdmin } from "@shared/api/admin/auth";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Admin } from "models/admins/Admin.model";
import auditLogger from "lib/audit-logger";

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
            // Log failed login attempt
            await auditLogger.logLogin(
                'unknown',
                'admin',
                'Unknown Admin',
                body.email,
                false,
                {
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('User-Agent'),
                    reason: 'Admin not found'
                }
            );
            return jsonResponse.clientError("Admin not found");
        }

        const match = await bcrypt.compare(body.password, admin.password);
        if (!match) {
            // Log failed login attempt
            await auditLogger.logLogin(
                admin._id.toString(),
                'admin',
                admin.full_name,
                admin.email,
                false,
                {
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('User-Agent'),
                    reason: 'Invalid password'
                }
            );
            return jsonResponse.clientError("Invalid password");
        }

        const secret = process.env.SESSION_SECRET;
        if (!secret) throw new Error("No session secret provided");

        const token = jwt.sign({ user_id: admin._id.toString(), role: "admin" }, secret, {
            expiresIn: "10d",
        });

        res.cookie("session", token, options);

        // Log successful login
        await auditLogger.logLogin(
            admin._id.toString(),
            'admin',
            admin.full_name,
            admin.email,
            true,
            {
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent')
            }
        );

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
