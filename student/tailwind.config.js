/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          900: "#7B61FF"
        },
        secondary: {
          900: "#F0F4FF"
        },
        tertiary: {
          "text": "#6A6A6A"
        },
        accent: {
          900: "#FF6B6B"
        },
        background: {
          900: "#121212",
          700: "#2A2A2A"
        },
        texts: {
          900: "#fff",
          800: "#F0F4FF",
          500: "#B3B3B3",
          400: "#6A6A6A"
        }
      },
      padding: {
        base: "1.5rem"
      }
     

    },
  },
  plugins: [],
}