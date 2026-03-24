# Setup & Configuration

## Installation Decision Table

| Method | Best For | Build Required | HMR |
|--------|----------|---------------|-----|
| **Vite plugin** | Vite/React/Vue/Svelte apps | Yes | Yes (fastest) |
| **PostCSS plugin** | Next.js, Webpack, non-Vite bundlers | Yes | Yes |
| **CLI** | Static sites, non-JS projects | Separate process | Watch mode |
| **CDN** | Prototyping, CodePen, quick demos | No | No |

## Vite Plugin (Recommended)

```bash
npm install tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss()],
});
```

```css
/* app.css */
@import "tailwindcss";
```

## PostCSS Plugin

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

```js
// postcss.config.mjs
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

```css
/* app.css */
@import "tailwindcss";
```

## CLI

```bash
npm install tailwindcss @tailwindcss/cli
```

```bash
npx @tailwindcss/cli -i input.css -o output.css --watch
```

## CDN (Development Only)

```html
<script src="https://cdn.tailwindcss.com"></script>
```

> CDN is v3-based play mode. For v4 CDN, use the `@tailwindcss/browser` package:

```html
<script type="module">
  import { createTailwindcss } from "https://esm.sh/@tailwindcss/browser";
</script>
```

## Source Detection

Tailwind v4 **auto-detects** source files by scanning your project for known file extensions (`.html`, `.jsx`, `.tsx`, `.vue`, `.svelte`, `.astro`, etc.). It respects `.gitignore` automatically.

### `@source` — Extend Scanning

Use `@source` when classes exist outside the auto-detected paths:

```css
/* Scan additional paths */
@source "../node_modules/@my-company/ui/src";
@source "../../packages/shared/components";

/* Scan specific file types */
@source "../content/**/*.mdx";
```

### `@source inline()` — Safelist Classes

For dynamically-generated classes that can't be detected by scanning:

```css
/* Safelist specific utilities */
@source inline("bg-red-500 text-white p-4");

/* Safelist patterns */
@source inline("bg-{red,blue,green}-{100,200,300,400,500}");
```

### `@source none` — Disable Auto-Detection

```css
@import "tailwindcss" source(none);
@source "../src/**/*.tsx";
```

## Legacy Config Escape Hatch

For gradual migration from v3, reference a JavaScript config:

```css
@config "../../tailwind.config.js";
```

This loads `theme`, `content`, and `plugins` from the JS config. Prefer migrating to CSS-native `@theme` and `@plugin` directives.

## Legacy Plugin Loading

```css
@plugin "@tailwindcss/typography";
@plugin "@tailwindcss/forms";
```

Plugins loaded via `@plugin` must be v4-compatible or use the compatibility layer.
