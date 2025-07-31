import { TSubject } from "./subject";

export interface TCourse {
    _id: string
    name: string;
    description: string;
    content: string;
    // assigned_teacher_id: strign | TTeacher;
    subject: string | TSubject;
    grade: number;
    has_published: boolean;
    createdAt: Date;
    updatedAt: Date;
}
