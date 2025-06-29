import { createStudent, signInStudent } from '@/api/student/auth';
import { LoginStudent, SignupStudent } from '@shared/api/student/auth';
import { create } from 'zustand';
import { AuthWithApiState } from './common';
import { TStudentWithNoSensitive } from "@shared/model/students/Student";
import { avatarStore } from './avatarStore';

type User = TStudentWithNoSensitive;

interface SignupStudentData extends SignupStudent.Req {
    otpCode?: string
}

interface AuthState extends AuthWithApiState{
    user: User | null;
    isLoggedIn: boolean;
    signup_data: SignupStudentData;
    login_data: LoginStudent.Req;
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
    is_loading: false,
    api_message: "",
    user: null,
    isLoggedIn: false,
    signup_data: defaultSignupData,
    login_data: defaultLoginData,
    
    signUp: async(data) => {
        try {
            set({is_loading: true, api_message: ""});
            const res = await createStudent(data);
            
            if (!res.error && res.result) {
                // Generate new emoji for registration
                const newEmoji = avatarStore.getRandomEmoji();
                avatarStore.setAvatar(newEmoji);
                
                // Update user with new emoji
                const updatedUser = {...res.result, avatarEmoji: newEmoji};
                set({ user: updatedUser, isLoggedIn: true });
            }
            
            set({is_loading: false, api_message: res.message});
            return !res.error;
        } catch (error) {
            set({is_loading: false, api_message: "Something went wrong"});
            return false;
        }
    },
    
    login: async (phone, password) => {
        try {
            set({is_loading: true, api_message: ""});
            const res = await signInStudent({phone_number: phone, password});
            
            if (!res.error && res.result) {
                // Generate new emoji for every login
                const newEmoji = avatarStore.getRandomEmoji();
                avatarStore.setAvatar(newEmoji);
                
                // Update user with new emoji
                const updatedUser = {...res.result, avatarEmoji: newEmoji};
                set({ user: updatedUser, isLoggedIn: true });
            }
            
            set({is_loading: false, api_message: res.message});
            return !res.error;
        } catch (error) {
            set({is_loading: false, api_message: "Something went wrong"});
            return false;
        }
    },
    
    verifyOtp: async (otpCode) => {
        // OTP verification logic
    },
    
    logout: () => {
        set({
            user: null,
            isLoggedIn: false,
            login_data: defaultLoginData,
            signup_data: defaultSignupData
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
    
    clearSignupData: () => {
        set({signup_data: defaultSignupData});
    },
    
    clearLoginData: () => {
        set({login_data: defaultLoginData});
    }
}));