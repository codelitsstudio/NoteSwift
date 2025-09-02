import { create } from "zustand";

// Updated navOrder to match your exact flow
export const navOrder = [
  "Login",              // 0 - Login page
  "Register",           // 1 - Register page  
  "RegisterAddress",    // 2 - Address page (after register)
  "RegisterNumber",     // 3 - Number page (after address)
  "Home",               // 4 - Main app starts (after registration)
  "Learn",              // 5
  "Test",               // 6
  "Ask",                // 7
  "More",               // 8
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