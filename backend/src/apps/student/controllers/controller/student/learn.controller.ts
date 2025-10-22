import JsonResponse from "@core/lib/Response";
import Course from "../../../models/Course.model";
import { Request, Response, NextFunction } from "express";
import { GetStudentLearnFeed } from "@core/api/student/learn";
export const getStudentLearnFeed = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
    const jsonResponse = new JsonResponse(res);
    try {
        const courses = await Course.find();
        const response: GetStudentLearnFeed.Res = {
            active_courses: courses
        }
        jsonResponse.success(response);
    } catch (error) {
        console.log(error);
        jsonResponse.serverError();
    }
}