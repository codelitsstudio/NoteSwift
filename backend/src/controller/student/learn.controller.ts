import JsonResponse from "lib/Response";
import Course from "models/admins/Course.model";
import { Controller } from "types/controller";
import { GetStudentLearnFeed } from "@shared/api/student/learn";
export const getStudentLearnFeed: Controller = async(req, res) => {
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