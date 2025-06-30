import { TStudent, TStudentWithNoSensitive } from "../../model/students/Student";
import { ApiResponse } from "../common";

export namespace SignupStudent {
    export interface Req {
        full_name: string;
        grade: number;
        phone_number: string;
        password: string;
        address: {
            province?: string;
            district?: string;
            institution?: string
        }
    }
    interface Res extends TStudentWithNoSensitive{
      avatarEmoji: boolean;
}
    export type ApiRes = ApiResponse<Res>;
}

export namespace LoginStudent {
  export interface Req {
    phone_number: string;
    password: string;
  }

  interface Res extends TStudentWithNoSensitive{
    avatarEmoji: any;
}

  export type ApiRes = ApiResponse<Res>;
}
