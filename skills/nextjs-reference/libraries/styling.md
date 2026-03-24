# Styling

## Decision Matrix

| Approach | RSC compatible | Bundle cost | Config complexity | Best for |
|---|---|---|---|---|
| Tailwind v4 | Yes | Zero runtime | None (CSS-only) | Most projects |
| CSS Modules | Yes | Zero runtime | Minimal | Scoped component styles |
| CSS-in-JS (styled-components, Emotion) | No — needs `'use client'` | Runtime overhead | Medium | Legacy codebases only |
| Vanilla Extract | Yes (zero-runtime) | Zero runtime | Medium | Complex design tokens |
| Inline styles | Yes | None | None | Dynamic values only |

## Tailwind v4

v4 replaces `tailwind.config.js` with a CSS-first config. No PostCSS plugin needed in Next.js 16.

```css
/* app/globals.css */
@import "tailwindcss";

/* Define custom tokens directly in CSS */
@theme {
  --color-brand: oklch(55% 0.2 250);
  --font-sans: "Inter", sans-serif;
  --radius-card: 0.75rem;
}
```

```tsx
// No config file — utilities are generated from @theme variables
export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-card bg-white p-6 shadow-sm dark:bg-zinc-900">
      {children}
    </div>
  );
}
```

When NOT to use Tailwind: highly dynamic styles where the class name must be constructed at runtime (use inline styles for the dynamic part, Tailwind for the static part).

## CSS Modules

Works in both Server and Client Components. Co-locate with the component file.

```css
/* components/Button/Button.module.css */
.root {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-button, 0.375rem);
}
.root[data-variant="primary"] { background: var(--color-brand); color: white; }
.root[data-variant="ghost"]   { background: transparent; }
```

```tsx
// components/Button/Button.tsx  — works as Server Component
import styles from "./Button.module.css";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      data-variant={variant}
      className={`${styles.root} ${className ?? ""}`}
      {...props}
    />
  );
}
```

## CSS-in-JS Limitations

Most CSS-in-JS libraries inject styles at runtime via JavaScript — they require `'use client'` and cannot run in Server Components.

```tsx
// WRONG — styled-components does not support RSC
export default function Page() {
  const Title = styled.h1`font-size: 2rem;`; // breaks in Server Components
  return <Title>Hello</Title>;
}
```

If you need CSS-in-JS for a legacy reason, isolate it behind a `'use client'` boundary and keep Server Components unstyled or use CSS Modules for them.

## next/font

Load fonts at build time — zero layout shift, no external network request at runtime.

```tsx
// app/layout.tsx
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",   // expose as CSS variable
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

Local font:

```tsx
import localFont from "next/font/local";
const brand = localFont({ src: "./BrandFont.woff2", variable: "--font-brand" });
```

## Dark Mode with next-themes

```tsx
// app/providers.tsx
"use client";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
```

```css
/* globals.css — Tailwind v4 dark variant reads the `.dark` class */
@variant dark (&:where(.dark, .dark *));
```

```tsx
"use client";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle
    </button>
  );
}
```

## Global Styles

```tsx
// app/layout.tsx
import "./globals.css"; // imported once at the root layout
```

Import order matters: Tailwind first, then component overrides, then utility classes.

## Cross-References

- [UI Components](./ui-components.md) — shadcn/ui theming with Tailwind
- [react-reference Styling](../../react-reference/libraries/styling.md) — CSS Modules and Tailwind fundamentals
