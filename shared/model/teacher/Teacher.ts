export interface TTeacher<T = string> {
  _id: T;
  email: string;
  phone_number: string;
  full_name: string;
  designation: string;
  grades_taught: number[];
  password: string;
  years_of_experience: number;
  profile_pic: string;
}

export interface TStudentWithNoSensitive extends Omit<TTeacher, "password"> {}
