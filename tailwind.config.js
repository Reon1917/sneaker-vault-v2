/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
        },
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          "base-100": "#000000", // Jet black background
          "base-200": "#111111", // Slightly lighter black for cards
          "base-300": "#1A1A1A", // Even lighter for hover states
          "base-content": "#FFFFFF", // White text
          primary: "#3B82F6", // Bright blue
          "primary-content": "#FFFFFF",
          secondary: "#6B7280",
          accent: "#10B981",
          neutral: "#1F2937",
          "neutral-content": "#FFFFFF",
          info: "#3B82F6",
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
          "--rounded-box": "0.5rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "0.5rem",
          "--animation-btn": "0.25s",
          "--animation-input": "0.2s",
          "--btn-focus-scale": "0.95",
          "--border-btn": "1px",
          "--tab-border": "1px",
          "--tab-radius": "0.5rem",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
}
