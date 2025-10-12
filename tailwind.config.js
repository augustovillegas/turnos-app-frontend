import { defineConfig } from "tailwindcss";

export default defineConfig({  
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FFD700",
        danger: "#DC2626",
        success: "#16A34A",
        dark: "#111827",
        grayRetro: "#E5E5E5",
        blueRetro: "#1E3A8A",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
});


