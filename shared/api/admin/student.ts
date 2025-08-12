import { ApiResponse } from "../common";

export namespace Student {
    interface Res {
        _id: string;
       full_name: string;
        grade: number;
        phone_number: string;
        address: {
            province?: string;
            district?: string;
            institution?: string
        },
        createdAt: string;
        updatedAt: string;
    }

    export type StudentRes = ApiResponse<Res>;
    export type StudentsRes = ApiResponse<Res[]>
}