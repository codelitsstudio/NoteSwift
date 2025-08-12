import { ApiResponse } from "../common";

export namespace Course {
  export interface Req {
    name: string;
    description: string;
    content: string;
    grade: number;
    has_published: boolean;
    subject: string;
  }

  export interface Res {
    _id: string;
    name: string;
    description: string;
    content: string;
    subject: string;
    grade: number;
    has_published: boolean;
    createdAt: string;
    updatedAt: string;
  }

  interface Subject{
    _id: string;
    subject_name:string;
  }

  export interface ResWithSubject extends Omit<Res, "subject">{
    subject: Subject;
  }

  export interface PaginatedCourses {
    courses: Res[];
    pagination: {
      total: number;
      totalPages: number;
      page: number;
      limit: number;
    };
  }

  export type CourseRes = ApiResponse<Res>;
  export type CoursesRes = ApiResponse<PaginatedCourses>;
  export type CourseWithSubjectRes = ApiResponse<ResWithSubject>;
}
