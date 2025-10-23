/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        
        // Colores personalizados para filosofía
        philosophy: {
          ancient: "#8B4513",     // Marrón tierra para antigüedad
          medieval: "#4682B4",    // Azul acero para medieval
          renaissance: "#DAA520",  // Oro para renacimiento
          modern: "#228B22",      // Verde bosque para moderna
          nineteen: "#DC143C",    // Carmesí para s.XIX
          twenty: "#9932CC",      // Violeta para s.XX
          contemporary: "#FF1493", // Rosa intenso para contemporánea
        },
        
        categories: {
          metaphysics: "#FF6B6B",    // Rojo coral
          epistemology: "#4ECDC4",   // Turquesa
          ethics: "#45B7D1",         // Azul cielo
          logic: "#96CEB4",          // Verde menta
          political: "#FFEAA7",      // Amarillo suave
          aesthetics: "#DDA0DD",     // Lila
          mind: "#98D8C8",           // Verde agua
        },
        
        connections: {
          agreement: "#22C55E",      // Verde éxito
          disagreement: "#EF4444",   // Rojo error
          expansion: "#3B82F6",      // Azul información
          refutation: "#F97316",     // Naranja advertencia
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-from-top": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        // Animaciones específicas para timeline
        "connection-pulse": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
        "philosopher-highlight": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "connection-pulse": "connection-pulse 2s ease-in-out infinite",
        "philosopher-highlight": "philosopher-highlight 0.6s ease-in-out",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Crimson Text", "serif"], // Para citas y textos filosóficos
        mono: ["JetBrains Mono", "monospace"],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'hsl(var(--foreground))',
            '[data-theme="dark"] &': {
              color: 'hsl(var(--foreground))',
            },
          },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
}