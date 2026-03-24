# Customization

## Decision Guide: When to Use What

| Need | Solution |
|------|----------|
| One-off value not in scale | Arbitrary value: `p-[13px]` |
| Reusable design token | `@theme` token: `--spacing-18: 4.5rem` |
| Custom utility class | `@utility` directive |
| Reusable component style | Component abstraction (React/Vue) or `@layer components` |
| Third-party class detection | `@source` for scanning |

## Arbitrary Values

Square bracket syntax for one-off values:

```html
<!-- Spacing -->
<div class="p-[13px] m-[2.5rem] gap-[1.125rem]">

<!-- Colors -->
<div class="bg-[#1a1a2e] text-[oklch(0.8_0.2_120)]">

<!-- Sizing -->
<div class="w-[calc(100%-2rem)] h-[clamp(200px,50vh,600px)]">

<!-- Grid -->
<div class="grid-cols-[200px_1fr_200px] grid-rows-[auto_1fr_auto]">

<!-- Background -->
<div class="bg-[url('/hero.jpg')] bg-[length:200px_100px]">

<!-- CSS variables -->
<div class="bg-[var(--brand-color)] text-[length:var(--font-size)]">

<!-- Arbitrary properties (escape hatch) -->
<div class="[mask-image:linear-gradient(to_bottom,black,transparent)]">
<div class="[text-wrap:balance]">
```

### Arbitrary Variants

```html
<!-- Custom selector -->
<div class="[&>*:nth-child(odd)]:bg-gray-50">

<!-- Data attributes -->
<div class="[&[data-state=open]]:rotate-180">

<!-- Media queries -->
<div class="[@media(hover:hover)]:hover:bg-blue-500">

<!-- Container queries -->
<div class="[@container(min-width:400px)]:grid-cols-2">
```

## `@layer` Usage

### Components Layer

For reusable component styles (lower priority than utilities):

```css
@layer components {
  .card {
    @apply rounded-xl border border-gray-200 bg-white p-6 shadow-sm;
  }

  .btn {
    @apply inline-flex items-center justify-center rounded-lg px-4 py-2 font-semibold transition-colors;
  }

  .btn-primary {
    @apply btn bg-blue-600 text-white hover:bg-blue-700;
  }
}
```

### Utilities Layer

For custom utilities (highest priority):

```css
@layer utilities {
  .content-auto {
    content-visibility: auto;
  }

  .scrollbar-hidden {
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
}
```

> Prefer `@utility` directive over `@layer utilities` for new utilities — it integrates with variants automatically.

## Full Design System Setup

```css
@import "tailwindcss";

/* ─── Fonts ─── */
@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Cal Sans", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}

/* ─── Brand Colors ─── */
@theme {
  --color-*: initial; /* Remove defaults — opt-in only */
  --color-white: #ffffff;
  --color-black: #000000;

  /* Neutral */
  --color-gray-50: oklch(0.98 0 0);
  --color-gray-100: oklch(0.96 0 0);
  --color-gray-200: oklch(0.92 0 0);
  --color-gray-300: oklch(0.87 0 0);
  --color-gray-400: oklch(0.71 0 0);
  --color-gray-500: oklch(0.55 0 0);
  --color-gray-600: oklch(0.45 0 0);
  --color-gray-700: oklch(0.37 0 0);
  --color-gray-800: oklch(0.27 0 0);
  --color-gray-900: oklch(0.20 0 0);
  --color-gray-950: oklch(0.13 0 0);

  /* Primary brand */
  --color-primary-50: oklch(0.97 0.02 255);
  --color-primary-100: oklch(0.94 0.05 255);
  --color-primary-200: oklch(0.88 0.10 255);
  --color-primary-300: oklch(0.80 0.16 255);
  --color-primary-400: oklch(0.72 0.21 255);
  --color-primary-500: oklch(0.63 0.26 255);
  --color-primary-600: oklch(0.53 0.24 255);
  --color-primary-700: oklch(0.43 0.20 255);
  --color-primary-800: oklch(0.35 0.16 255);
  --color-primary-900: oklch(0.27 0.12 255);
  --color-primary-950: oklch(0.18 0.08 255);

  /* Semantic */
  --color-success: oklch(0.60 0.20 145);
  --color-warning: oklch(0.75 0.18 85);
  --color-error: oklch(0.58 0.24 27);
  --color-info: oklch(0.65 0.19 240);
}

/* ─── Semantic Surface Tokens ─── */
@theme {
  --color-bg: var(--color-white);
  --color-fg: var(--color-gray-950);
  --color-muted: var(--color-gray-500);
  --color-border: var(--color-gray-200);
  --color-ring: var(--color-primary-500);
}

/* ─── Dark Mode Overrides ─── */
@custom-variant dark (&:where([data-theme=dark] *));

:root[data-theme="dark"] {
  --color-bg: var(--color-gray-950);
  --color-fg: var(--color-gray-50);
  --color-muted: var(--color-gray-400);
  --color-border: var(--color-gray-800);
  --color-ring: var(--color-primary-400);
}

/* ─── Spacing Extensions ─── */
@theme {
  --spacing-18: 4.5rem;
  --spacing-88: 22rem;
  --spacing-112: 28rem;
  --spacing-128: 32rem;
}

/* ─── Shadows ─── */
@theme {
  --shadow-soft: 0 1px 3px 0 oklch(0 0 0 / 0.04), 0 1px 2px -1px oklch(0 0 0 / 0.04);
  --shadow-glow: 0 0 12px -2px oklch(0.63 0.26 255 / 0.3);
}

/* ─── Animations ─── */
@theme {
  --animate-fade-in: fade-in 0.2s ease-out;
  --animate-slide-in: slide-in 0.3s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; }
}

@keyframes slide-in {
  from { opacity: 0; transform: translateY(4px); }
}
```

## `@source` for Third-Party Libraries

When using component libraries that ship pre-built classes:

```css
/* Scan component library source for class detection */
@source "../node_modules/@acme/ui/dist";

/* Scan specific file patterns */
@source "../node_modules/@my-lib/components/**/*.{js,jsx}";
```

### Safelisting Dynamic Classes

```css
/* Classes generated at runtime that scanner can't detect */
@source inline("bg-red-500 bg-green-500 bg-blue-500 bg-yellow-500");

/* Pattern-based safelist */
@source inline("grid-cols-{1,2,3,4,5,6} gap-{2,4,6,8}");
```

## `@plugin` for v3 Plugin Compatibility

Load v3-era JavaScript plugins:

```css
@plugin "@tailwindcss/typography";
@plugin "@tailwindcss/forms";
@plugin "@tailwindcss/container-queries";
```

### Plugin with Options

```css
@plugin "@tailwindcss/typography" {
  className: "prose";
}
```

### Custom Plugin

```js
// my-plugin.js
export default function ({ addUtilities, matchUtilities, theme }) {
  addUtilities({
    ".content-auto": {
      "content-visibility": "auto",
    },
  });
}
```

```css
@plugin "./my-plugin.js";
```

> For new projects, prefer `@utility` and `@custom-variant` over JS plugins.
