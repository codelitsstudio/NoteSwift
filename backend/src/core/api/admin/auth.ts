import { ApiResponse } from "../common";
export namespace LoginAdmin {
  export interface Req {
    email?: string;
    password?: string;
  }

  export interface Res {
    _id: string;
    full_name: string;
    email: string;
  }

  export type ApiRes = ApiResponse<Res>;
}