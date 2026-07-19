import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pulled verbatim from github.com/lifstyl/limitless (limitlesslifstyl.com)
        white: "#f7f7f7",
        "pure-white": "#ffffff",
        navy: "#1c3664",
        "navy-deep": "#12213f",
        black: "#333333",
        gold: "#bf9423",
        "gold-light": "#d9b45a",
        "text-body": "#55565c",
        "text-muted": "#8a8b91",
        border: "#e4e3df",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "serif"],
        sans: ["var(--font-dm-sans)", "DM Sans", "sans-serif"],
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
