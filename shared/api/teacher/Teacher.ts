import { ApiResponse } from "../common";

export namespace Teacher {
  export interface Req {
    email: string;
    phone_number: string;
    full_name: string;
    designation: string;
    grades_taught: number[];
    password: string;
    years_of_experience: number;
    profile_pic?: string;
  }

  export interface Res {
    _id: string;
    email: string;
    phone_number: string;
    full_name: string;
    designation: string;
    grades_taught: number[];
    password: string;
    years_of_experience: number;
    profile_pic?: string;
  }

  export type TeacherResp = ApiResponse<Res>;

}
