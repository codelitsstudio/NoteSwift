import { ApiResponse } from "../common";

export namespace AssignedCourse {
    export interface Req {
        teacher_id: string;
        courses: string[];
        assigned_date: Date;
    }

    export interface Res {
        _id: string;
        teacher_id: string;
        courses: string[];
        assigned_date: string;
        createdAt: string;
        updatedAt: string;
    }

    export type AssignedCourseRes = ApiResponse<Res>;
}