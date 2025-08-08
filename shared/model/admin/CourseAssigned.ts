import { TCourse } from './Course';
import { TTeacher } from '../teacher/Teacher';

export interface TCourseAssigned {
    _id: string;
    teacher_id: string | TTeacher;
    courses: string[] | TCourse[];
    assigned_date: Date;
}