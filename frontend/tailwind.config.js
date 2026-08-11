/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        maroon: {
          50:  "#fff0f0",
          100: "#ffe0e0",
          500: "#800000",
          600: "#700000",
          700: "#570000",
        },
        navy: {
          50:  "#e8eef5",
          100: "#c5d2e0",
          500: "#002147",
          600: "#001a38",
          700: "#001229",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        "card": "0px 4px 6px -1px rgba(0,0,0,0.08)",
        "card-hover": "0px 8px 16px -4px rgba(0,0,0,0.12)",
        "overlay": "0px 10px 15px -3px rgba(0,0,0,0.1)",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
      },
    },
  },
  plugins: [],
};
