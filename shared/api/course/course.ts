
import { ApiResponse } from "../common";

export namespace Course {
    export interface Req {
    title: string;
    description: string;
    subject: string;
    tags?: string[];
    status?: string;
    }

    export interface Res {
    _id: string;
    title: string;
    description: string;
    subject: string;
    tags: string[];
    status: string;
    createdAt: string;
    updatedAt: string;
    }

    export type CourseRes = ApiResponse<Res>;
}