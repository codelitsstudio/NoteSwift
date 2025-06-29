/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: { 900: "#7B61FF"},
        secondary: { 900: "#F0F4FF" },
        accent: { 900: "#FF6B6B" },
        background: { 900: "#121212", 700: "#2A2A2A" },
        texts: {
          900: "#FFFFFF",
          800: "#F0F4FF",
          500: "#B3B3B3",
          
          400: "#6A6A6A",
           200: "#475569" 
        },
          customBlue: "#3592F2",
          buttonBlue: "#007AFF"
      },
      padding: {
        base: "1.5rem"
      }
    }
  },
  plugins: []
};
