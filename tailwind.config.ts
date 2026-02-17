import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        theme: {
          page: "var(--bg-page)",
          sidebar: "var(--bg-sidebar)",
          surface: "var(--bg-surface)",
          elevated: "var(--bg-elevated)",
          primary: "var(--color-primary)",
          "primary-hover": "var(--color-primary-hover)",
          "primary-soft": "var(--color-primary-soft)",
          "text-primary": "var(--text-primary)",
          "text-secondary": "var(--text-secondary)",
          muted: "var(--text-muted)",
          border: "var(--border-default)",
          "border-subtle": "var(--border-subtle)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
      },
    },
  },
};

export default config;
