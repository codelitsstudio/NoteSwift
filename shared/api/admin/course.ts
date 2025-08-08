
import { ApiResponse } from "../common";

export namespace Course {
    export interface Req {
    name: string;
    description: string;
    content: string;
    grade: number;
    has_published: boolean;
    // assigned_teacher_id: strign;
    subject: string;
    }

    export interface Res {
    _id: string;
    name: string;
    description: string;
    content: string;
    subject: string;
    grade: number;
    // assigned_teacher_id: strign;
    has_published: boolean;
    createdAt: string;
    updatedAt: string;
    }

    export type CourseRes = ApiResponse<Res>;
}