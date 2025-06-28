import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = { phone: string; token: string };

interface AuthState {
  // Auth user state
  user: User | null;
  isLoggedIn: boolean;

  // auth actions
  login: (phone: string, password: string) => Promise<void>;
  verifyOtp: (otpCode: string) => Promise<void>;
  logout: () => void;

  // login UI state
  phoneInput: string;
  passwordInput: string;
  otpCode: string;

  setPhoneInput: (val: string) => void;
  setPasswordInput: (val: string) => void;
  setOtpCode: (val: string) => void;

 
  fullName: string;
  setFullName: (val: string) => void;

  selectedGrade: string | null;
  setSelectedGrade: (val: string) => void;

  selectedProvince: string | null;
  setSelectedProvince: (val: string) => void;

  selectedDistrict: string | null;
  setSelectedDistrict: (val: string) => void;

  selectedInstitution: string | null;
  setSelectedInstitution: (val: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Auth user state
      user: null,
      isLoggedIn: false,

      
      login: async (phone, password) => {
        const res = await fetch('https://your.api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, password }),
        });
        if (!res.ok) throw new Error('Login failed');
        const data = await res.json();
        set({ user: { phone, token: data.token }, isLoggedIn: true });
      },

      verifyOtp: async (otpCode) => {
        const res = await fetch('https://your.api/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otp: otpCode }),
        });
        if (!res.ok) throw new Error('OTP failed');
        const data = await res.json();
        set({ user: { phone: data.phone, token: data.token }, isLoggedIn: true });
      },

      logout: () => {
        set({
          user: null,
          isLoggedIn: false,

          phoneInput: '',
          passwordInput: '',
          otpCode: '',

          fullName: '',
          selectedGrade: null,

          selectedProvince: null,
          selectedDistrict: null,
          selectedInstitution: null,
        });
      },

      // UI state
      phoneInput: '',
      passwordInput: '',
      otpCode: '',

      setPhoneInput: (val) => set({ phoneInput: val }),
      setPasswordInput: (val) => set({ passwordInput: val }),
      setOtpCode: (val) => set({ otpCode: val }),

      // register
      fullName: '',
      setFullName: (val: string) => set({ fullName: val }),

      selectedGrade: null,
      setSelectedGrade: (val: string) => set({ selectedGrade: val }),

      // address
      selectedProvince: null,
      setSelectedProvince: (val: string) => set({ selectedProvince: val }),

      selectedDistrict: null,
      setSelectedDistrict: (val: string) => set({ selectedDistrict: val }),

      selectedInstitution: null,
      setSelectedInstitution: (val: string) => set({ selectedInstitution: val }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,

        
        fullName: state.fullName,
        selectedGrade: state.selectedGrade,
        selectedProvince: state.selectedProvince,
        selectedDistrict: state.selectedDistrict,
        selectedInstitution: state.selectedInstitution,
      }),
    }
  )
);
