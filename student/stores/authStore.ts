import { createStudent, signInStudent, sendRegistrationOTP, verifyRegistrationOTP, sendEmailRegistrationOTP, verifyEmailRegistrationOTP } from '@/api/student/auth';
import { LoginStudent, SignupStudent } from '@core/api/student/auth';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ApiState } from './common';
import { TStudentWithNoSensitive } from "@core/models/students/Student";
import { avatarStore } from './avatarStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateDeviceFingerprint } from '../lib/deviceFingerprint';
import { useCourseStore } from './courseStore';
import api from '@/api/axios';

type User = TStudentWithNoSensitive;

interface SignupStudentData extends Omit<SignupStudent.Req, 'email'> {
    otpCode?: string;
    email?: string;
    phone_number: string;
}

interface AuthState extends ApiState{
    user: User | null;
    isLoggedIn: boolean;
    token: string | null;
    signup_data: SignupStudentData;
    login_data: LoginStudent.Req;
    login: (phone: string, password: string) => Promise<boolean>;
    signUp: (data: SignupStudentData) => Promise<boolean>;
    sendRegistrationOTP: (phone_number: string) => Promise<boolean>;
    sendEmailRegistrationOTP: (email: string) => Promise<boolean>;
    verifyOtp: (otpCode: string) => Promise<boolean>;
    verifyEmailOtp: (otpCode: string) => Promise<boolean>;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
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
    otpCode: "",
    email: ""
}

const defaultLoginData: LoginStudent.Req = {
    password: "",
    email: "",
    deviceFingerprint: ""
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
    is_loading: false,
    api_message: "",
    user: null,
    isLoggedIn: false,
    token: null,
    signup_data: defaultSignupData,
    login_data: defaultLoginData,
    
    signUp: async(data) => {
        try {
            set({is_loading: true, api_message: ""});
            // Ensure email is defined for the API call
            const studentData = {
                ...data,
                email: data.email || '', // Provide default empty string if undefined
            };
            const res = await createStudent(studentData);
            
            if (!res.error && res.result) {
                // Use the permanent avatar emoji assigned by the backend
                const user = res.result.user as any;
                avatarStore.setAvatar(user.avatarEmoji);
                
                // Ensure both id and _id are present
                const updatedUser = {
                    ...user,
                    id: user.id || user._id?.toString() || user._id,
                    _id: user._id?.toString() || user.id,
                };
                
                set({ 
                    user: updatedUser, 
                    isLoggedIn: true,
                    token: res.result.token 
                });
            }
            
            set({is_loading: false, api_message: res.message});
            return !res.error;
        } catch (error) {
            set({is_loading: false, api_message: "Something went wrong"});
            return false;
        }
    },
    
    login: async (email, password) => {
        try {
            set({is_loading: true, api_message: ""});
            
            // Generate device fingerprint for security
            console.log('🔐 Generating device fingerprint for login...');
            const deviceFingerprint = await generateDeviceFingerprint();
            console.log('🔐 Device fingerprint generated:', deviceFingerprint.substring(0, 8) + '...');
            
            const res = await signInStudent({
                email: email, 
                password,
                deviceFingerprint
            });
            
            if (!res.error && res.result) {
                // Use the permanent avatar emoji from database
                const user = res.result.user as any;
                avatarStore.setAvatar(user.avatarEmoji);
                
                // Ensure both id and _id are present
                const updatedUser = {
                    ...user,
                    id: user.id || user._id?.toString() || user._id,
                    _id: user._id?.toString() || user.id,
                };
                
                set({ 
                    user: updatedUser, 
                    isLoggedIn: true,
                    token: res.result.token 
                });
                
                // Clear previous course data and fetch user enrollments after successful login
                console.log('📚 Clearing previous course data and fetching user enrollments after login...');
                useCourseStore.getState().reset();
                try {
                    await useCourseStore.getState().fetchUserEnrollments(updatedUser.id || updatedUser._id);
                    console.log('✅ User enrollments fetched successfully');
                } catch (enrollmentError) {
                    console.error('❌ Failed to fetch user enrollments:', enrollmentError);
                    // Don't fail login if enrollment fetch fails
                }
            }
            
            set({is_loading: false, api_message: res.message});
            return !res.error;
        } catch (error: any) {
            console.error('Login error:', error);
            // Preserve the specific error message from the backend
            const errorMessage = error?.message || "Something went wrong";
            set({is_loading: false, api_message: errorMessage});
            return false;
        }
    },
    
    verifyOtp: async (otpCode) => {
        try {
            set({is_loading: true, api_message: ""});
            
            const phone_number = get().signup_data.phone_number;
            if (!phone_number) {
                set({is_loading: false, api_message: "Phone number not found"});
                return false;
            }

            // Use real Twilio OTP verification
            const response = await verifyRegistrationOTP(phone_number, otpCode);
            
            if (response.message === "OTP verified successfully") {
                set({is_loading: false, api_message: "OTP verified successfully"});
                return true;
            } else {
                set({is_loading: false, api_message: response.message || "Invalid OTP code"});
                return false;
            }
        } catch (error: any) {
            console.log('OTP verification error:', error);
            let errorMessage = 'OTP verification failed';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            set({is_loading: false, api_message: errorMessage});
            return false;
        }
    },

    sendRegistrationOTP: async (phone_number: string) => {
        set({ is_loading: true, api_message: '' });
        try {
            const response = await sendRegistrationOTP(phone_number);
            set({ 
                is_loading: false, 
                api_message: response.message || 'OTP sent successfully'
            });
            return true;
        } catch (error: any) {
            console.log('Registration OTP error:', error);
            let errorMessage = 'Failed to send OTP';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            set({ 
                is_loading: false, 
                api_message: errorMessage
            });
            return false;
        }
    },

    sendEmailRegistrationOTP: async (email: string) => {
        set({ is_loading: true, api_message: '' });
        try {
            console.log("📤 Sending email registration OTP for:", email);
            const response = await sendEmailRegistrationOTP(email);
            console.log("✅ Success response:", response);
            set({ 
                is_loading: false, 
                api_message: response.message || 'Verification email sent successfully'
            });
            return true;
        } catch (error: any) {
            console.log('❌ Email Registration OTP error:', error);
            let errorMessage = 'Failed to send verification email';
            
            // The error message is now directly from the thrown Error
            if (error.message) {
                errorMessage = error.message;
            }
            
            console.log("❌ Final error message:", errorMessage);
            set({ 
                is_loading: false, 
                api_message: errorMessage
            });
            return false;
        }
    },

    verifyEmailOtp: async (otpCode) => {
        try {
            set({is_loading: true, api_message: ""});
            
            const email = get().signup_data.email;
            if (!email) {
                set({is_loading: false, api_message: "Email address not found"});
                return false;
            }

            // Use real email OTP verification
            const response = await verifyEmailRegistrationOTP(email, otpCode);
            
            console.log('📱 Frontend - Full response:', JSON.stringify(response, null, 2));
            
            // Check for successful response (error: false means success)
            if (!response.error && response.status === 200) {
                set({is_loading: false, api_message: "Email verified successfully"});
                return true;
            } else {
                set({is_loading: false, api_message: response.message || "Invalid verification code"});
                return false;
            }
        } catch (error: any) {
            console.log('Email OTP verification error:', error);
            let errorMessage = 'Email verification failed';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            set({is_loading: false, api_message: errorMessage});
            return false;
        }
    },
    
    logout: async () => {
        try {
            // Call backend logout endpoint to clear device binding
            const token = get().token;
            if (token) {
                await api.post('/auth/logout');
            }
        } catch (error) {
            console.error('Logout API call failed:', error);
            // Continue with local logout even if API call fails
        }
        
        // Clear local state regardless of API call result
        set({
            user: null,
            isLoggedIn: false,
            token: null,
            login_data: defaultLoginData,
            signup_data: defaultSignupData
        });
        // Clear avatar data
        avatarStore.clearAvatar();
        // Clear course store data to prevent cross-user data leakage
        useCourseStore.getState().reset();
    },
    
    updateUser: (userData: Partial<User>) => {
        set((state) => ({
            user: state.user ? { ...state.user, ...userData } : null
        }));
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
}),
{
  name: 'auth-store',
  storage: createJSONStorage(() => AsyncStorage),
  // Only persist user and login state, not temporary form data
  partialize: (state) => ({
    user: state.user,
    isLoggedIn: state.isLoggedIn,
    token: state.token, // Add token to persistence
  }),
}
));