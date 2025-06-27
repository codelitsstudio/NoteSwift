import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = {
  phone: string;
  token?: string;
};

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (phone: string, password: string) => Promise<void>;
  verifyOtp: (otpCode: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,

      login: async (phone: string, password: string) => {
        // replace with real api call
        const response = await fetch('https://your.api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, password }),
        });
        if (!response.ok) throw new Error('Login failed');
        const data = await response.json();
        set({ user: { phone, token: data.token }, isLoggedIn: true });
      },

      verifyOtp: async (otpCode: string) => {
        // Replace with your OTP verification API call
        const response = await fetch('https://your.api/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otp: otpCode }),
        });
        if (!response.ok) throw new Error('OTP verification failed');
        const data = await response.json();
        // Assume token and phone come here, mark user logged in
        set({ user: { phone: data.phone, token: data.token }, isLoggedIn: true });
      },

      logout: () => {
        set({ user: null, isLoggedIn: false });
      },
    }),
    { name: 'auth-storage' }
  )
);
