/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "mainBackgroundColor": '#DDDDDD',
        "columnBackgroundColor": '#EEEEEE',
      }
    },
  },
  plugins: [],
}

