import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type User = { phone: string; token: string }

interface AuthState {

  user: User | null
  isLoggedIn: boolean

  login: (phone: string, password: string) => Promise<void>
  verifyOtp: (otpCode: string) => Promise<void>
  logout: () => void

  phoneInput: string
  passwordInput: string
  otpCode: string

  setPhoneInput: (val: string) => void
  setPasswordInput: (val: string) => void
  setOtpCode: (val: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // auth slice
      user: null,
      isLoggedIn: false,

      login: async (phone, password) => {
        const res = await fetch('https://your.api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, password }),
        })
        if (!res.ok) throw new Error('Login failed')
        const data = await res.json()
        set({ user: { phone, token: data.token }, isLoggedIn: true })
      },

      verifyOtp: async (otpCode) => {
        const res = await fetch('https://your.api/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otp: otpCode }),
        })
        if (!res.ok) throw new Error('OTP failed')
        const data = await res.json()
        set({ user: { phone: data.phone, token: data.token }, isLoggedIn: true })
      },

      logout: () => {
        set({
          user: null,
          isLoggedIn: false,
         
          phoneInput: '',
          passwordInput: '',
          otpCode: '',
        })
      },

      // UI slice
      phoneInput: '',
      passwordInput: '',
      otpCode: '',

      setPhoneInput: (val) => set({ phoneInput: val }),
      setPasswordInput: (val) => set({ passwordInput: val }),
      setOtpCode: (val) => set({ otpCode: val }),
    }),
    {
      name: 'auth-storage',         
      partialize: (state) => ({
       
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
)
