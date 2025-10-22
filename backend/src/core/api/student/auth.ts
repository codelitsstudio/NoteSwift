import { TStudent, TStudentWithNoSensitive } from "../../models/students/Student";
import { ApiResponse } from "../common";

export namespace SignupStudent {
    export interface Req {
        full_name: string;
        grade: number;
        email: string;
        password: string;
        address: {
            province?: string;
            district?: string;
            institution?: string
        }
    }
    export interface Res {
        user: TStudentWithNoSensitive
        token: string
    }
    export type ApiRes = ApiResponse<Res>;
}

export namespace LoginStudent {
    export interface Req {
        email: string;
        password: string;
    }

    export interface Res {
        user: TStudentWithNoSensitive
        token: string
    }

    export type ApiRes = ApiResponse<Res>;
}
