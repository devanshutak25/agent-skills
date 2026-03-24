# Theme System

## `@theme` Block

All design tokens are defined in `@theme` blocks as CSS custom properties. They become both utility classes and CSS variables.

```css
@theme {
  --color-brand: oklch(0.72 0.21 330);
  --font-display: "Cal Sans", sans-serif;
  --spacing-18: 4.5rem;
  --breakpoint-3xl: 120rem;
}
```

## Override vs Extend

### Extend (default) — Add to Defaults

```css
@theme {
  --color-brand: oklch(0.72 0.21 330);
  /* Adds brand color; all default colors remain */
}
```

### Override — Replace a Namespace

```css
@theme {
  --color-*: initial; /* Remove ALL default colors */
  --color-brand: oklch(0.72 0.21 330);
  --color-white: #fff;
  --color-black: #000;
}
```

### Inline Override

```css
@import "tailwindcss" theme(--color-*: initial, --font-*: initial);
```

## Namespace Reference

| Namespace | Token Pattern | Generates |
|-----------|--------------|-----------|
| **color** | `--color-{name}-{shade}` | `bg-*`, `text-*`, `border-*`, `ring-*`, etc. |
| **spacing** | `--spacing-{scale}` | `p-*`, `m-*`, `gap-*`, `w-*`, `h-*`, etc. |
| **font** | `--font-{name}` | `font-*` (family) |
| **text** | `--text-{size}` | `text-*` (font-size + line-height) |
| **font-weight** | `--font-weight-{name}` | `font-*` (weight) |
| **leading** | `--leading-{name}` | `leading-*` |
| **tracking** | `--tracking-{name}` | `tracking-*` |
| **radius** | `--radius-{size}` | `rounded-*` |
| **shadow** | `--shadow-{size}` | `shadow-*` |
| **breakpoint** | `--breakpoint-{name}` | `sm:`, `md:`, etc. |
| **animate** | `--animate-{name}` | `animate-*` |

## oklch Color System

Tailwind v4 uses oklch as the default color space for better perceptual uniformity:

```css
@theme {
  /* oklch(lightness chroma hue) */
  --color-brand-50: oklch(0.97 0.02 330);
  --color-brand-100: oklch(0.94 0.04 330);
  --color-brand-200: oklch(0.88 0.08 330);
  --color-brand-300: oklch(0.80 0.14 330);
  --color-brand-400: oklch(0.72 0.21 330);
  --color-brand-500: oklch(0.63 0.26 330);
  --color-brand-600: oklch(0.53 0.24 330);
  --color-brand-700: oklch(0.43 0.20 330);
  --color-brand-800: oklch(0.35 0.16 330);
  --color-brand-900: oklch(0.27 0.12 330);
  --color-brand-950: oklch(0.18 0.08 330);
}
```

## Full Design Token Example

```css
@theme {
  /* Colors */
  --color-*: initial;
  --color-white: #fff;
  --color-black: #000;
  --color-gray-50: oklch(0.98 0.00 0);
  --color-gray-100: oklch(0.96 0.00 0);
  --color-gray-200: oklch(0.92 0.00 0);
  --color-gray-300: oklch(0.87 0.00 0);
  --color-gray-400: oklch(0.71 0.00 0);
  --color-gray-500: oklch(0.55 0.00 0);
  --color-gray-600: oklch(0.45 0.00 0);
  --color-gray-700: oklch(0.37 0.00 0);
  --color-gray-800: oklch(0.27 0.00 0);
  --color-gray-900: oklch(0.20 0.00 0);
  --color-gray-950: oklch(0.13 0.00 0);

  --color-primary-500: oklch(0.63 0.26 255);
  --color-primary-600: oklch(0.53 0.24 255);

  /* Typography */
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* Spacing */
  --spacing-18: 4.5rem;
  --spacing-112: 28rem;
  --spacing-128: 32rem;

  /* Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;

  /* Shadows */
  --shadow-soft: 0 2px 8px -2px oklch(0 0 0 / 0.08);

  /* Breakpoints */
  --breakpoint-3xl: 120rem;

  /* Animations */
  --animate-fade-in: fade-in 0.3s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

## Removing Defaults

Remove all defaults for a namespace with `initial`:

```css
@theme {
  --color-*: initial;      /* No default colors */
  --font-*: initial;       /* No default font families */
  --shadow-*: initial;     /* No default shadows */
  --breakpoint-*: initial; /* No default breakpoints */
}
```

## Runtime Theming via CSS Variables

Theme tokens are CSS variables, so they can be swapped at runtime:

```css
/* Define tokens */
@theme {
  --color-surface: oklch(0.98 0.00 0);
  --color-on-surface: oklch(0.13 0.00 0);
  --color-primary: oklch(0.63 0.26 255);
}

/* Override in dark mode */
:root[data-theme="dark"] {
  --color-surface: oklch(0.13 0.00 0);
  --color-on-surface: oklch(0.98 0.00 0);
  --color-primary: oklch(0.75 0.20 255);
}
```

```html
<div class="bg-surface text-on-surface">
  <button class="bg-primary">Themed button</button>
</div>
```

## Referencing Tokens in Custom CSS

```css
.custom-element {
  /* Direct variable reference */
  color: var(--color-primary-500);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);

  /* Using --spacing() function */
  margin-block: --spacing(6);

  /* Calculations with tokens */
  width: calc(100% - --spacing(8));
}
```
