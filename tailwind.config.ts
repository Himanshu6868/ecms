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
        panel: "var(--panel-bg)",
        "panel-elevated": "var(--panel-bg-elevated)",
        "message-sender": "var(--message-sender-bg)",
        "message-receiver": "var(--message-receiver-bg)",
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-placeholder": "var(--text-placeholder)",
        "border-subtle": "var(--border-subtle)",
        "border-default": "var(--border-default)",
        "panel-border": "var(--panel-border)",
        "state-error": "var(--state-error)",
      },
      borderColor: {
        DEFAULT: "var(--border-default)",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "4px",
        md: "4px",
        lg: "4px",
        xl: "4px",
        "2xl": "4px",
        full: "4px",
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
