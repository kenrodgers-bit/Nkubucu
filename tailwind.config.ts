import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tealhub: {
          50: "#ecfdf6",
          100: "#d1fae8",
          500: "#1D9E75",
          600: "#167f61",
          700: "#12684f",
        },
        ink: "#17211f",
      },
      boxShadow: {
        soft: "0 18px 45px rgba(20, 34, 30, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
