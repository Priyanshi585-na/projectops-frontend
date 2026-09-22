/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14171F",
        paper: "#EEF0F2",
        surface: "#FFFFFF",
        hairline: "#D8DBE0",
        muted: "#6B7280",
        amber: {
          DEFAULT: "#D98C2B",
          bg: "#FBF0DF",
          text: "#8A5A16"
        },
        teal: {
          DEFAULT: "#1E8F7A",
          bg: "#E2F3EF",
          text: "#12594C"
        },
        indigo: {
          DEFAULT: "#3B4FA0",
          bg: "#E7EAF5",
          text: "#28356E"
        },
        rose: {
          DEFAULT: "#B84040",
          bg: "#F7E4E4",
          text: "#7A2A2A"
        }
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        sans: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"]
      },
      borderRadius: {
        DEFAULT: "6px"
      }
    }
  },
  plugins: []
};
