/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Colores fríos tema claro (Azul)
        light: {
          bg: "#F8FAFC",
          card: "#FFFFFF",
          cardSecondary: "#F1F5F9",
          border: "#E2E8F0",
          text: "#0F172A",
          textMuted: "#64748B",
          primary: "#2563EB",
          primaryHover: "#1D4ED8",
          primaryLight: "#EFF6FF",
          accent: "#0284C7",
        },
        // Colores fríos tema oscuro (Morado)
        dark: {
          bg: "#0B081A",
          card: "#14102C",
          cardSecondary: "#1E1842",
          border: "#2C235A",
          text: "#F8FAFC",
          textMuted: "#94A3B8",
          primary: "#8B5CF6",
          primaryHover: "#7C3AED",
          primaryLight: "#2E1A63",
          accent: "#A855F7",
        },
        // Estados de seguridad
        security: {
          veryWeak: "#EF4444",
          weak: "#F97316",
          fair: "#FBBF24",
          strong: "#10B981",
          veryStrong: "#065F46"
        }
      }
    },
  },
  plugins: [],
};
