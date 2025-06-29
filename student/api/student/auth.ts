import { LoginStudent, SignupStudent } from "@shared/api/student/auth";
import api from "../axios";

export const createStudent = async(data: SignupStudent.Req) => {
    const res = await api.post("/student/auth/signup", data);
    return res.data as SignupStudent.ApiRes;
}

export const signInStudent = async(data: LoginStudent.Req) => {
    const res = await api.post("/student/auth/login", data);
    return res.data as LoginStudent.ApiRes
}