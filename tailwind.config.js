/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#D02F2F", // Main brand color (adjust based on your logo)
          50: "#FCE9E9",
          100: "#F7D2D2",
          200: "#EEA6A6",
          300: "#E57979",
          400: "#DC4D4D",
          500: "#D02F2F",
          600: "#A82525",
          700: "#801C1C",
          800: "#581414",
          900: "#300B0B",
        },
        secondary: {
          DEFAULT: "#2C3E50",
          50: "#8DAABE",
          100: "#7D9DB3",
          200: "#5D83A1",
          300: "#466780",
          400: "#344C5F",
          500: "#2C3E50", // Dark blue
          600: "#1A2530",
          700: "#0E141A",
          800: "#020304",
          900: "#000000",
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        heading: ["Montserrat", "ui-sans-serif", "system-ui"],
      }
    },
  },
  plugins: [],
}