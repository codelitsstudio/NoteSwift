import { create } from "zustand";

export const navOrder = [
  "Login",
  "OTPLogin",
  "LoginSuccess",
  "Register",
  "RegisterAddress",
  "RegisterNumber",
  "OTPRegister",
  "RegisterSuccess",
  "Home",
  "Learn",
  "Test",
  "Ask",
  "More",
];



interface NavStore {
  prevTab: string;
  currentTab: string;
  setTab: (newTab: string) => void;
}

export const useNavStore = create<NavStore>((set, get) => ({
  prevTab: "Home",
  currentTab: "Home",
  setTab: (newTab) => {
    const { currentTab } = get();
    set({ prevTab: currentTab, currentTab: newTab });
  },
}));
