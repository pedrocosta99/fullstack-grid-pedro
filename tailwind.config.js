/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#f0f9f0",
          100: "#dcf2dc",
          200: "#bce5bc",
          300: "#8dd18d",
          400: "#5bb85b",
          500: "#3d8b3d",
          600: "#2d6b2d", // Main musk green
          700: "#245a24",
          800: "#1f4a1f",
          900: "#1a3d1a",
          950: "#0d1f0d",
        },
        accent: {
          50: "#fff4e6",
          100: "#ffe6cc",
          200: "#ffd199",
          300: "#ffb366",
          400: "#ff8c33",
          500: "#e67300",
          600: "#cc6600", // Main dark orange
          700: "#b35900",
          800: "#994d00",
          900: "#804000",
          950: "#4d2600",
        },
        neutral: {
          0: "#ffffff",
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        },
        tech: {
          blue: "#3b82f6",
          cyan: "#06b6d4",
          emerald: "#10b981",
          indigo: "#6366f1",
        },
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        liquid:
          "0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 10px -2px rgba(0, 0, 0, 0.04)",
        "liquid-lg":
          "0 10px 40px -4px rgba(0, 0, 0, 0.08), 0 4px 20px -4px rgba(0, 0, 0, 0.06)",
        "liquid-green":
          "0 4px 20px -2px rgba(45, 107, 45, 0.15), 0 2px 10px -2px rgba(45, 107, 45, 0.1)",
        "liquid-orange":
          "0 4px 20px -2px rgba(204, 102, 0, 0.15), 0 2px 10px -2px rgba(204, 102, 0, 0.1)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-soft": "pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};
