import { createStudent, signInStudent } from '@/api/student/auth';
import { LoginStudent, SignupStudent } from '@shared/api/student/auth';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthWithApiState } from './common';
import { TStudentWithNoSensitive } from "@shared/model/students/Student";

type User = TStudentWithNoSensitive;

interface SignupStudentData extends SignupStudent.Req {
    otpCode?: string
}

interface AuthState extends AuthWithApiState{
    // Auth user state
    user: User | null;
    isLoggedIn: boolean;
    signup_data: SignupStudentData;
    login_data: LoginStudent.Req;
    // auth actions
    login: (phone: string, password: string) => Promise<boolean>;
    signUp: (data: SignupStudentData) => Promise<boolean>;
    verifyOtp: (otpCode: string) => Promise<void>;
    logout: () => void;
    otpCode: string;
    setOtpCode: (val: string) => void;
    setLoginData: (data: LoginStudent.Req) => void;
    setSignupData: (data: SignupStudentData) => void;
    clearSignupData: ()=>void;
    clearLoginData: ()=>void;
}

const defaultSignupData: SignupStudentData = {
    phone_number: "",
    address: {
        province: undefined,
        district: undefined,
        institution: undefined,
    },
    full_name: "",
    grade: 0,
    password: "",
    otpCode: ""
}

const defaultLoginData: LoginStudent.Req = {
    password: "",
    phone_number: ""
}


export const useAuthStore = create<AuthState>((set) => ({
    //api state
    is_loading: false,
    api_message: "",
    // Auth user state
    user: null,
    isLoggedIn: false,
    signup_data: defaultSignupData,
    login_data: defaultLoginData,
    
    signUp: async(data)=>{
        try {
            set({is_loading: true, api_message: ""});
            const res = await createStudent(data);
            console.log(res)
            set({is_loading: false, api_message: res.message, user: res.result})
            return !res.error; //no success
        } catch (error) {
            console.log(error)
            set({is_loading: false, api_message: "Something went wrong"})
            return false
        }
    },
    login: async (phone, password) => {
        try {
            set({is_loading: true, api_message: ""})
            const res = await signInStudent({phone_number: phone, password})
            set({is_loading: false, api_message: res.message, user: res.result})
            return !res.error; //no success
        } catch (error) {
            console.log(error)
            set({is_loading: false, api_message: "Something went wrong"})
            return false
        }
    },
    verifyOtp: async (otpCode) => {
        const res = await fetch('https://your.api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ otp: otpCode }),
        });
        if (!res.ok) throw new Error('OTP failed');
        const data = await res.json();
        
    },
    logout: () => {
        set({
            user: null
        });
    },
    setSignupData: (data: SignupStudentData) => {
        set({ signup_data: data });
    },
    setLoginData: (data: LoginStudent.Req) => {
        set({ login_data: data });
    },
    otpCode: '',
    setOtpCode: (val) => set({ otpCode: val }),
    clearSignupData: ()=> {
        set({signup_data: defaultSignupData})
    },
    clearLoginData: ()=>{
        set({login_data: defaultLoginData})
    }
}))

