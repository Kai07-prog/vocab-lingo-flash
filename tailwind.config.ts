import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        sakura: {
          50: "#fdf2f4",
          100: "#fce7eb",
          200: "#f9d0d9",
          300: "#f5a8b9",
          400: "#ef7594",
          500: "#e34a73",
          600: "#cf2b5b",
          700: "#ad1e47",
          800: "#911b3f",
          900: "#7d1a3a",
        },
        zen: {
          50: "#f8f7f4",
          100: "#efede6",
          200: "#dbd6c8",
          300: "#c2b9a3",
          400: "#a49679",
          500: "#8f7f5f",
          600: "#776754",
          700: "#625446",
          800: "#54473d",
          900: "#4a3f37",
        },
      },
      fontFamily: {
        japanese: ["Noto Sans JP", "sans-serif"],
      },
      keyframes: {
        "card-flip": {
          "0%, 100%": { transform: "rotateY(0deg)" },
          "50%": { transform: "rotateY(180deg)" },
        },
      },
      animation: {
        "card-flip": "card-flip 0.6s ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;