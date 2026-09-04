/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        border: "var(--border)",
        competitor: "var(--neutral-competitor)",
        accent: "var(--accent)",
      },
    },
  },
  plugins: [],
};
