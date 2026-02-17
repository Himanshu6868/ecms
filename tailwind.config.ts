import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        "bg-page": "var(--bg-page)",
        "bg-surface": "var(--bg-surface)",
        "bg-field": "var(--bg-field)",
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-placeholder": "var(--text-placeholder)",
        "border-subtle": "var(--border-subtle)",
        "border-default": "var(--border-default)",
        "state-error": "var(--state-error)",
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
