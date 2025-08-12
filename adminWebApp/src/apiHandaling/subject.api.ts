import { axiosInstance } from "@/lib/axiosIntance";
import { Subject } from "@shared/api/admin/subject";

export const createSubject = async (data: Subject.Req): Promise<Subject.SubjectRes> => {
    try {
        const res = await axiosInstance.post<Subject.SubjectRes>("/admin/subject/", data);
        return res.data;
    } catch (error) {
        if(error instanceof Error) {
            console.log(error?.message || "Error happned.");
        }
        throw error;
    }
}

export const getAllSubjects = async (): Promise<Subject.SubjectsRes> => {
    try {
       const res = await axiosInstance.get<Subject.SubjectsRes>('/admin/subject/');
       return res.data;
    } catch (error) {
        if(error instanceof Error) {
            console.log(error?.message || "Error happned.");
        }
        throw error;
    }
}

export const deleteSubject = async (id:string): Promise<void> => {
    try {
       const res = await axiosInstance.delete(`/admin/subject?id=${id}`);
    } catch (error) {
        if(error instanceof Error) {
            console.log(error?.message || "Error happned.");
        }
        throw error;
    }
}


export const updateSubject = async ({id, data}: {id: string, data: Subject.Req}): Promise<Subject.SubjectRes> => {
    try {
        const res = await axiosInstance.put<Subject.SubjectRes>(`/admin/subject/${id}`, data);
        return res.data;
    } catch (error) {
        if(error instanceof Error) {
            console.log(error?.message || "Error happned.");
        }
        throw error;
    }
}
