import { TCourse } from "../../model/common/Course";
import { ApiResponse } from "../common";

export namespace GetStudentLearnFeed {
    export interface Req {};
    export interface Res {
        active_courses: TCourse[]
    }
    export type ApiRes = ApiResponse<Res>;
}

export namespace RedeemUnlockCode {
    export interface Req {
        code: string;
        courseId: string;
        deviceHash: string;
    }
    export interface Res {
        message: string;
        enrollment: any; // TODO: define enrollment type
    }
    export type ApiRes = ApiResponse<Res>;
}