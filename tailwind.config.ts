import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        oreno: {
          ink: "#091c19",
          teal: "#25baa4",
          pink: "#bb266e",
          mint: "#e0f2f0",
          blush: "#f7dce9",
        },
      },
      fontFamily: {
        display: ["var(--font-raleway)", "sans-serif"],
        body: ["var(--font-poppins)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
