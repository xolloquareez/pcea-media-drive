import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0F3875",
        "navy-deep": "#0A2751",
        maroon: "#8C2331",
        brass: "#A87C2B",
        "brass-light": "#C89A4A",
        ivory: "#F7F2E7",
        ink: "#1F2A3D",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 20px 45px -15px rgba(15, 39, 81, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
