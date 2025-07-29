
import {ApiResponse } from "../common";

export namespace Announcement {
    export interface Req {
        subject: string;
        message: string;
    }

    export interface Res {
        _id: string;
        subject: string;
        message: string;
        createdBy?: string;
        createdAt: Date;
        updatedAt: Date;
    }

    export type ApiRes = ApiResponse<Res>;
}