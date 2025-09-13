import { LoginStudent, SignupStudent } from "@shared/api/student/auth";
import api from "../axios";

export const createStudent = async(data: SignupStudent.Req) => {
    const res = await api.post("/student/auth/signup", data);
    const response = res.data as SignupStudent.ApiRes;
    
    // Check if the response contains an error
    if (response.error) {
        throw new Error(response.message || 'Failed to create student');
    }
    
    return response;
}

export const signInStudent = async(data: LoginStudent.Req) => {
    const res = await api.post("/student/auth/login", data);
    const response = res.data as LoginStudent.ApiRes;
    
    // Check if the response contains an error
    if (response.error) {
        throw new Error(response.message || 'Failed to sign in');
    }
    
    return response;
}

export const sendRegistrationOTP = async(phone_number: string) => {
    const res = await api.post("/student/auth/send-registration-otp", { phone_number });
    return res.data;
}

export const verifyRegistrationOTP = async(phone_number: string, otp_code: string) => {
    const res = await api.post("/student/auth/verify-registration-otp", { phone_number, otp_code });
    return res.data;
}

export const sendEmailRegistrationOTP = async(email: string) => {
    const res = await api.post("/student/auth/send-email-registration-otp", { email });
    const response = res.data;
    
    // Check if the response contains an error
    if (response.error) {
        throw new Error(response.message || 'Failed to send email registration OTP');
    }
    
    return response;
}

export const verifyEmailRegistrationOTP = async(email: string, otp_code: string) => {
    const res = await api.post("/student/auth/verify-email-registration-otp", { email, otp_code });
    const response = res.data;
    
    // Check if the response contains an error
    if (response.error) {
        throw new Error(response.message || 'Failed to verify email registration OTP');
    }
    
    return response;
}

