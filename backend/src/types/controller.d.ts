import { NextFunction, Request, Response } from "express";

declare type Controller = (req: Request, res: Response, next?: NextFunction) => void;

// Extend Express Request globally to include user property for authentication
declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string;
				role?: string;
			};
		}
	}
}