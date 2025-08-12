import { axiosInstance } from "@/lib/axiosIntance";
import {Course} from "@shared/api/admin/course"


export const createCourse = async (data:Course.Req): Promise<Course.CourseRes> => {
    try {
        const res = await axiosInstance.post("/admin/course/", data)
        return res.data;
    } catch (error) {
        if(error instanceof Error) {
            console.log(error?.message || "Error duing creating courses.");
        }
        throw error;
    }
}

export const getCourses = async (): Promise<Course.CoursesRes> => {
    try {
        const res = await axiosInstance.get<Course.CoursesRes>("/admin/course/");
        return res.data;
    } catch (error) {
        if(error instanceof Error) {
            console.log(error?.message || "Error during retrieving the courses.");
        }
        throw error;
    }
}

export const getCourseWithSubjectsById = async (id: string): Promise<Course.CourseWithSubjectRes> => {
    try {
        const res = await axiosInstance.get<Course.CourseWithSubjectRes>(`/admin/course/${id}`);
        return res.data;
    } catch (error) {
        if(error instanceof Error) {
            console.log(error?.message || "Error happned.");
        }
        throw error;
    }
}

export const publishCourse = async (id:string): Promise<Course.CourseRes> => {
    try {
        const res = await axiosInstance.patch<Course.CourseRes>(`/admin/course/${id}/publish`);
        return res.data;
    } catch (error) {
        if(error instanceof Error) {
            console.log(error?.message || "Error happned.");
        }
        throw error;
    }
}

export const unPublishCourse = async (id:string): Promise<Course.CourseRes> => {
    try {
        const res = await axiosInstance.patch<Course.CourseRes>(`/admin/course/${id}/unpublish`);
        return res.data;
    } catch (error) {
        if(error instanceof Error) {
            console.log(error?.message || "Error happned.");
        }
        throw error;
    }
}

// /admin/course/688b4dc4788840c6fa87e1ec


export const updateCourse = async ({id, data}:{id: string, data: Partial<Course.Req>}): Promise<Course.CourseRes> => {
    try {
        const res = await axiosInstance.patch(`/admin/course/${id}`, data);
        return res.data;
    } catch (error) {
        if(error instanceof Error) {
            console.log(error?.message || "Error happned.");
        }
        throw error;
    }
}

export const deleteCourse  = async (id: string): Promise<void> => {
    try {
      const res = await axiosInstance.delete(`/admin/course/${id}`);
    } catch (error) {
        if(error instanceof Error) {
            console.log(error?.message || "Error happned.");
        }
        throw error;
    }
}

export const boiler = async (): Promise<any> => {
    try {
       // const res = await axiosInstance.patch()
    } catch (error) {
        if(error instanceof Error) {
            console.log(error?.message || "Error happned.");
        }
        throw error;
    }
}