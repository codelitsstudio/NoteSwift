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
        assigned_date: Date;
        createdAt: Date;
        updatedAt: Date;
    }

    export type AssignedCourseType = ApiResponse<Res>;
}