import api from "../axios"
import { GetStudentLearnFeed } from "@shared/api/student/learn";
export const getLearnFeed = async() => {
    const res = await api.get("/student/learn/feed");
    return res.data as GetStudentLearnFeed.ApiRes;
}