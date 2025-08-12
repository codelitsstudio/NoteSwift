import { axiosInstance } from "@/lib/axiosIntance";
import { AssignedCourse } from "@shared/api/admin/assignedCourse"

export const assignCourse = async (data: AssignedCourse.Req): Promise<AssignedCourse.AssignedCourseRes> => {
    try {
       const res = await axiosInstance.post("/admin/course/assign", data);

       return res.data;
    } catch (error) {
        if(error instanceof Error) {
            console.log(error?.message || "Error happned.");
        }
        throw error;
    }
}

export const deleteAssignCourse = async (id: string): Promise<void> => {
    try {
       const res = await axiosInstance.post(`/admin/course/remove/${id}`);
    } catch (error) {
        if(error instanceof Error) {
            console.log(error?.message || "Error happned.");
        }
        throw error;
    }
}