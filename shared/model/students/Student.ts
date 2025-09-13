export interface TStudent<T=string>{
    _id: T;
    id?: string;
    full_name: string;
    grade: number;
    email: string;
    password: string;
    address: {
        province: string;
        district: string;
        institution: string
    }
}

export interface TStudentWithNoSensitive extends Omit<TStudent, "password"> {
  id: string;
  _id: string;
}