/** @type {import("tailwindcss").Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#07080d",
        card: "rgba(18, 20, 29, 0.75)",
        cardBorder: "rgba(255, 255, 255, 0.08)",
        primary: {
          DEFAULT: "#6366f1", // Indigo
          hover: "#4f46e5",
          glow: "rgba(99, 102, 241, 0.4)"
        },
        accent: {
          purple: "#a855f7",
          cyan: "#06b6d4",
          pink: "#ec4899",
          emerald: "#10b981"
        }
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 20s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        glow: {
          "from": { filter: "drop-shadow(0 0 10px rgba(99, 102, 241, 0.4))" },
          "to": { filter: "drop-shadow(0 0 20px rgba(168, 85, 247, 0.6))" }
        }
      }
    },
  },
  plugins: [],
}
