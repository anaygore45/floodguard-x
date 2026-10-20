/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F5F5F2",
        surface: "#FFFFFF",
        sidebar: "#F0F0EC",
        "primary-text": "#242722",
        "secondary-text": "#686B65",
        border: "#DCDDD6",
        "primary-action": "#40584B",
        "secondary-accent": "#74877B",
        info: "#657887",
        warning: "#A77936",
        "high-risk": "#A64E45",
        "low-risk": "#6E8975",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
