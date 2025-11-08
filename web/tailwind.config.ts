import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: "var(--brand-teal)",
          mint: "var(--brand-mint)",
          tan: "var(--brand-tan)",
          orange: "var(--brand-orange)",
          brick: "var(--brand-brick)",
        },
        role: {
          cta: "var(--brand-cta)",
          accent: "var(--brand-accent)",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 1px 1px rgba(0,0,0,0.02)",
      },
    },
  },
  darkMode: "class",
};

export default config;
