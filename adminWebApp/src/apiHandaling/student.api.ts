
import { axiosInstance } from "@/lib/axiosIntance";
import { Student } from "@shared/api/admin/student";

export const getAll = async (): Promise<Student.StudentsRes> => {
    try {
        const res = await axiosInstance.get<Student.StudentsRes>(`/admin/student/all`);
        return res.data;
    } catch (error) {
        if(error instanceof Error) {
            console.log(error?.message || "Error happned.");
        }
        throw error;
    }
}

export const getById = async (id: string): Promise<Student.StudentRes> => {
    try {
        const res = await axiosInstance.get<Student.StudentRes>(`/admin/student/${id}`);
        return res.data;
    } catch (error) {
        if(error instanceof Error) {
            console.log(error?.message || "Error happned.");
        }
        throw error;
    }
}