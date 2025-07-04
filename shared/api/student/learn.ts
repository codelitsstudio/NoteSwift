import { TCourse } from "../../model/common/Course";
import { ApiResponse } from "../common";

export namespace GetStudentLearnFeed {
    export interface Req {};
    export interface Res {
        active_courses: TCourse[]
    }
    export type ApiRes = ApiResponse<Res>;
}