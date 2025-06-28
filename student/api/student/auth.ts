import { SignupStudent } from "@shared/api/student/auth";
import api from "../axios";

export const createStduent = async(data: SignupStudent.Req) => {
    const res = await api.post("/student/auth/signup", data);
    return res.data as SignupStudent.ApiRes;
}