import api from "../axios"
import { TStudentWithNoSensitive } from "@shared/model/students/Student"
export const getFetchCurrentUser = async() => {
    const res = await api.get("/student/user/me");
    return res.data as ApiResponse<TStudentWithNoSensitive>;
}