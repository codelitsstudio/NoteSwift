import { ApiResponse } from "../common";

export namespace Subject {
    export interface Req {
        subject_name: string;
    };

    export interface Res {
        subject_name: string;
        createdAt: Date;
        updatedAt: Date;
    }

    export type SubjectRes = ApiResponse<Res>;
}