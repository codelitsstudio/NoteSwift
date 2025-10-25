import api from "../axios"
import { GetStudentLearnFeed } from "@core/api/student/learn";

export const getLearnFeed = async() => {
    const res = await api.get("/student/learn/feed");
    return res.data as GetStudentLearnFeed.ApiRes;
}

export const redeemUnlockCode = async (code: string, courseId: string, deviceHash: string) => {
    const res = await api.post("/student/learn/redeem-code", {
        code,
        courseId,
        deviceHash
    });
    return res.data;
}