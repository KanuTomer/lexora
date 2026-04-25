/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#202124",
        muted: "#5f6368",
        line: "#dadce0",
        surface: "#f8fafd",
      },
    },
  },
  plugins: [],
};
