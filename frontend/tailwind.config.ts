import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        kingdom: {
          navy: "#0B2545",
          gold: "#D4AF37",
          slate: "#334155",
        },
      },
    },
  },
  plugins: [],
};
export default config;
