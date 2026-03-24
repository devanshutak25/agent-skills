# Styling Solutions

## Decision Matrix

| Library | Type | Runtime | Bundle | Best For |
|---------|------|---------|--------|----------|
| **Tailwind CSS v4** | Utility-first | Zero | ~10 kB (used classes) | Most projects |
| **CSS Modules** | Scoped CSS | Zero | 0 (native) | Simple, framework-agnostic |
| **Panda CSS** | Utility + type-safe | Zero | ~varies | Type-safe design tokens |
| **StyleX** | Atomic CSS-in-JS | Zero | ~varies | Meta-scale apps |
| **Vanilla Extract** | Type-safe CSS | Zero | 0 (build-time) | Enterprise design systems |
| **styled-components** | CSS-in-JS | Runtime | ~12 kB | Dynamic styles, legacy projects |

---

## Tailwind CSS v4 (Recommended Default)

```bash
npm install tailwindcss @tailwindcss/vite
```

### Vite Setup (v4)
```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

```css
/* app.css — v4 uses CSS-first config */
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --color-secondary: #6b7280;
  --font-sans: 'Inter', sans-serif;
  --breakpoint-sm: 640px;
}
```

### Key v4 Changes
- **CSS-first config**: No `tailwind.config.js` — use `@theme` in CSS
- **CSS variables**: All theme values are CSS custom properties
- **Container queries**: `@container` support built-in
- **Lightning CSS**: Faster builds via Rust-based engine

### Component Example
```tsx
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      {children}
    </div>
  );
}
```

### Class Merging with cn()
```tsx
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage — safely merge conditional + override classes
<div className={cn(
  'rounded-lg p-4',
  isActive && 'bg-primary text-white',
  className // parent can override
)} />
```

### class-variance-authority (cva) for Variants
```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const button = cva('inline-flex items-center rounded-md font-medium transition-colors', {
  variants: {
    variant: {
      default: 'bg-primary text-white hover:bg-primary/90',
      outline: 'border border-input bg-background hover:bg-accent',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
    },
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4',
      lg: 'h-12 px-6 text-lg',
    },
  },
  defaultVariants: { variant: 'default', size: 'md' },
});

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>;

function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={cn(button({ variant, size }), className)} {...props} />;
}
```

---

## CSS Modules

Zero config with Vite/Next.js. Scoped by default.

```css
/* Button.module.css */
.button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  background: var(--color-primary);
  color: white;
}

.button:hover {
  opacity: 0.9;
}

.large {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}
```

```tsx
import styles from './Button.module.css';

function Button({ size = 'md', children }: ButtonProps) {
  return (
    <button className={`${styles.button} ${size === 'lg' ? styles.large : ''}`}>
      {children}
    </button>
  );
}
```

**Pick CSS Modules when:** Simple projects, no design system needs, prefer vanilla CSS.

---

## Panda CSS

```bash
npm install -D @pandacss/dev
npx panda init
```

```tsx
import { css } from '../styled-system/css';

function Card() {
  return (
    <div className={css({
      bg: 'white',
      rounded: 'lg',
      p: '6',
      shadow: 'md',
      _hover: { shadow: 'lg' },
    })}>
      Content
    </div>
  );
}
```

**Type-safe design tokens** — autocomplete for all values:
```tsx
// panda.config.ts
export default defineConfig({
  theme: {
    tokens: {
      colors: {
        primary: { value: '#3b82f6' },
      },
      spacing: {
        sm: { value: '8px' },
      },
    },
  },
});
```

**Pick Panda CSS when:** Want Tailwind-like DX with full TypeScript type safety for tokens.

---

## StyleX (Meta)

```bash
npm install @stylexjs/stylex
npm install -D @stylexjs/babel-plugin
```

```tsx
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  button: {
    backgroundColor: 'blue',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '4px',
    ':hover': { backgroundColor: 'darkblue' },
  },
  large: {
    padding: '12px 24px',
    fontSize: '18px',
  },
});

function Button({ large }: { large?: boolean }) {
  return (
    <button {...stylex.props(styles.button, large && styles.large)}>
      Click
    </button>
  );
}
```

- Zero-runtime: extracts to atomic CSS at build time
- Used at Meta (Facebook, Instagram, WhatsApp, Threads)
- Deterministic style merging — last style wins

**Pick StyleX when:** Large-scale apps needing atomic CSS, deterministic merging, Meta ecosystem.

---

## Vanilla Extract

```bash
npm install @vanilla-extract/css @vanilla-extract/vite-plugin
```

```ts
// styles.css.ts (compiled at build time)
import { style, createTheme } from '@vanilla-extract/css';

export const [themeClass, vars] = createTheme({
  color: { primary: '#3b82f6' },
  space: { small: '8px', medium: '16px' },
});

export const button = style({
  backgroundColor: vars.color.primary,
  padding: vars.space.medium,
  borderRadius: '4px',
  ':hover': { opacity: 0.9 },
});
```

```tsx
import { button, themeClass } from './styles.css';

function Button() {
  return <button className={button}>Click</button>;
}
```

**Pick Vanilla Extract when:** Building a design system, need full type safety, enterprise-scale.

---

## Quick Comparison

```
Need                          → Pick
Fast prototyping              → Tailwind CSS
Type-safe tokens              → Panda CSS or Vanilla Extract
Atomic CSS at scale           → StyleX
Just scoped CSS               → CSS Modules
Dynamic/runtime themes        → styled-components (legacy)
Component library (shadcn)    → Tailwind + cva
```
