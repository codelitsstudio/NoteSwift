export interface TStudent<T=string>{
    _id: T;
    full_name: string;
    grade: number;
    phone_number: string;
    password: string;
    address: {
        province: string;
        district: string;
        institution: string
    }
}

export interface TStudentWithNoSensitive extends Omit<TStudent, "password"> {}