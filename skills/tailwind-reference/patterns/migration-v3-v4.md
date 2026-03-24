# Migration: v3 to v4

## Automated Migration

```bash
npx @tailwindcss/upgrade@next
```

This handles most changes automatically:
- Converts `tailwind.config.js` to CSS `@theme` directives
- Updates PostCSS config
- Renames deprecated utilities
- Updates `@tailwind` directives to `@import "tailwindcss"`

> Run on a clean git branch. Review all changes before committing.

## Config Migration Table

| v3 (`tailwind.config.js`) | v4 (CSS) |
|---------------------------|----------|
| `content: ['./src/**/*.tsx']` | Auto-detected + `@source` |
| `theme.extend.colors.brand: '#f00'` | `@theme { --color-brand: #f00; }` |
| `theme.extend.fontFamily.display: [...]` | `@theme { --font-display: "Cal Sans", sans-serif; }` |
| `theme.extend.spacing.18: '4.5rem'` | `@theme { --spacing-18: 4.5rem; }` |
| `theme.extend.borderRadius.xl: '1rem'` | `@theme { --radius-xl: 1rem; }` |
| `theme.extend.boxShadow.soft: '...'` | `@theme { --shadow-soft: ...; }` |
| `theme.extend.screens.xs: '480px'` | `@theme { --breakpoint-xs: 30rem; }` |
| `theme.extend.animation.fadeIn: '...'` | `@theme { --animate-fade-in: ...; }` |
| `theme.colors = { ... }` (override) | `@theme { --color-*: initial; --color-...: ...; }` |
| `darkMode: 'class'` | `@custom-variant dark (&:where(.dark *));` |
| `darkMode: ['selector', '[data-theme=dark]']` | `@custom-variant dark (&:where([data-theme=dark] *));` |
| `plugins: [require('@tailwindcss/typography')]` | `@plugin "@tailwindcss/typography";` |
| `plugins: [myPlugin]` | `@plugin "./my-plugin.js";` |

### v3 Config

```js
// tailwind.config.js (v3)
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          500: '#6366f1',
          600: '#4f46e5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        18: '4.5rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};
```

### v4 Equivalent

```css
/* app.css (v4) */
@import "tailwindcss";

@plugin "@tailwindcss/typography";
@plugin "@tailwindcss/forms";

@custom-variant dark (&:where(.dark *));

@theme {
  --color-brand-500: #6366f1;
  --color-brand-600: #4f46e5;
  --font-sans: "Inter", sans-serif;
  --spacing-18: 4.5rem;
}
```

## PostCSS Config Update

### v3

```js
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### v4

```js
// postcss.config.mjs
export default {
  plugins: {
    "@tailwindcss/postcss": {},
    // autoprefixer no longer needed — handled internally
  },
};
```

## Renamed & Removed Utilities

| v3 | v4 | Notes |
|----|-----|-------|
| `shadow-sm` | `shadow-xs` | Entire shadow scale shifted down |
| `shadow` | `shadow-sm` | |
| `shadow-md` | `shadow-md` | (unchanged) |
| `shadow-lg` | `shadow-lg` | (unchanged) |
| `drop-shadow-sm` | `drop-shadow-xs` | Same shift |
| `drop-shadow` | `drop-shadow-sm` | |
| `rounded-sm` | `rounded-xs` | Radius scale shifted down |
| `rounded` | `rounded-sm` | |
| `blur-sm` | `blur-xs` | Blur scale shifted down |
| `blur` | `blur-sm` | |
| `decoration-clone` | `box-decoration-clone` | Renamed |
| `decoration-slice` | `box-decoration-slice` | Renamed |
| `flex-grow` | `grow` | Simplified (already available in v3) |
| `flex-shrink` | `shrink` | Simplified |
| `overflow-ellipsis` | `text-ellipsis` | Renamed |
| `bg-opacity-*` | `bg-{color}/{opacity}` | Use opacity modifier |
| `text-opacity-*` | `text-{color}/{opacity}` | Use opacity modifier |
| `border-opacity-*` | `border-{color}/{opacity}` | Use opacity modifier |
| `ring-opacity-*` | `ring-{color}/{opacity}` | Use opacity modifier |
| `placeholder-opacity-*` | `placeholder-{color}/{opacity}` | Use opacity modifier |
| `divide-opacity-*` | `divide-{color}/{opacity}` | Use opacity modifier |

### Removed (No Longer Needed)

| v3 Utility | Reason |
|-----------|--------|
| `transform` | Transforms work automatically — no enabler needed |
| `filter` | Filters work automatically — no enabler needed |
| `backdrop-filter` | Backdrop filters work automatically |
| `decoration-{color}` (was text-decoration) | Use `decoration-{color}` (same name, but no longer ambiguous) |

## New Features Available Post-Migration

| Feature | v4 Syntax | Notes |
|---------|-----------|-------|
| Container queries | `@container`, `@sm:`, `@md:` etc. | No plugin needed |
| 3D transforms | `rotate-x-*`, `rotate-y-*`, `perspective-*` | New in v4 |
| `@variant` directive | `@variant dark { ... }` | Apply variants in CSS |
| `@custom-variant` | `@custom-variant name (selector)` | Custom variants without JS |
| `@utility` directive | `@utility name { ... }` | Custom utilities without JS |
| `not-*` variant | `not-disabled:hover:bg-blue-500` | Negate any variant |
| `has-*` variant | `has-checked:bg-blue-50` | Parent/child state styling |
| `inert` variant | `inert:opacity-50` | Style inert elements |
| Breakpoint ranges | `md:max-lg:grid-cols-2` | Between two breakpoints |
| Container query ranges | `@sm:max-@lg:flex-row` | Between container sizes |
| `text-wrap: balance/pretty` | `text-balance`, `text-pretty` | Text wrapping control |
| `@starting-style` | `starting:opacity-0` | Entry animations |
| oklch colors | Default color space | Better perceptual uniformity |

## Compatibility Shims

### `@config` — Load Legacy Config

```css
@config "../../tailwind.config.js";
```

Loads theme, content, and plugins from a v3 config file. Use during gradual migration.

### `@plugin` — Load Legacy Plugins

```css
@plugin "@tailwindcss/typography";
```

Wraps v3 plugins for v4 compatibility. Most official plugins are v4-native now.

### Migration Strategy

1. Run `npx @tailwindcss/upgrade@next` on a clean branch
2. Review automated changes
3. Fix any remaining issues (custom plugins, complex configs)
4. Test thoroughly
5. Remove `@config` references once fully migrated
6. Replace `@plugin` with native `@utility`/`@custom-variant` where possible
