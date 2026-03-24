# Tooling

## Required Tooling

| Tool | Purpose | Install |
|------|---------|---------|
| **prettier-plugin-tailwindcss** | Auto-sort utility classes | `npm install -D prettier-plugin-tailwindcss` |
| **tailwind-merge** | Resolve class conflicts at runtime | `npm install tailwind-merge` |
| **clsx** | Conditional class joining | `npm install clsx` |

## prettier-plugin-tailwindcss

Auto-sorts Tailwind classes in a consistent, logical order.

### Setup

```bash
npm install -D prettier prettier-plugin-tailwindcss
```

```json
// .prettierrc
{
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindStylesheet": "./src/app.css"
}
```

> **v4 note:** The `tailwindStylesheet` option is required in v4 to point to your main CSS file (where `@import "tailwindcss"` lives). Without it, the plugin can't resolve your theme.

### With Other Plugins

```json
{
  "plugins": [
    "prettier-plugin-organize-imports",
    "prettier-plugin-tailwindcss"
  ]
}
```

> `prettier-plugin-tailwindcss` must be **last** in the plugins array.

### Custom Class Attributes

```json
{
  "tailwindAttributes": ["myClassName", "containerClassName"],
  "tailwindFunctions": ["cn", "clsx", "cva", "tw"]
}
```

## tailwind-merge

Resolves Tailwind class conflicts — last class wins:

```ts
import { twMerge } from "tailwind-merge";

twMerge("px-4 py-2", "px-6");
// → "py-2 px-6" (px-6 overrides px-4)

twMerge("text-red-500", "text-blue-500");
// → "text-blue-500"

twMerge("rounded-lg shadow-md", "rounded-xl");
// → "shadow-md rounded-xl"

twMerge("hover:bg-red-500", "hover:bg-blue-500");
// → "hover:bg-blue-500"
```

### Why It's Needed

Without tailwind-merge, both conflicting classes remain in the DOM:

```tsx
// Without merge: both px-4 AND px-6 in output (unpredictable)
<div className={`px-4 ${overrideClass}`} />

// With merge: only px-6 in output (correct)
<div className={twMerge("px-4", overrideClass)} />
```

### Custom Configuration

For custom theme tokens, configure tailwind-merge to recognize them:

```ts
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["tiny", "huge"] }],
    },
  },
});
```

## clsx

Conditional class construction:

```ts
import clsx from "clsx";

clsx("foo", true && "bar", false && "baz");
// → "foo bar"

clsx({ "bg-red-500": isError, "bg-green-500": isSuccess });
// → "bg-red-500" (if isError is true)

clsx("base", ["array", "classes"], { conditional: true });
// → "base array classes conditional"
```

### Combined Pattern: `cn()`

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

See [component-patterns.md](../patterns/component-patterns.md) for usage.

## Class Variance Authority (cva)

Type-safe variant management:

```bash
npm install class-variance-authority
```

See [component-patterns.md](../patterns/component-patterns.md) for full setup and examples.

## VS Code IntelliSense

### Extension

Install: **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)

Features:
- Autocomplete for utility classes
- Hover previews (shows CSS output)
- Linting for invalid classes
- Class sorting (with prettier plugin)

### Settings

```jsonc
// .vscode/settings.json
{
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "'([^']*)'"],
    ["cva\\(([^)]*)\\)", "'([^']*)'"],
    ["clsx\\(([^)]*)\\)", "'([^']*)'"]
  ],
  "editor.quickSuggestions": {
    "strings": "on"
  }
}
```

### Monorepo Configuration

```jsonc
// .vscode/settings.json
{
  "tailwindCSS.experimental.configFile": {
    "packages/web/src/app.css": "packages/web/src/**"
  }
}
```

## Starter Templates

| Stack | Setup Command |
|-------|--------------|
| **Vite + React** | `npm create vite@latest my-app -- --template react-ts` then add Tailwind |
| **Next.js** | `npx create-next-app@latest` (select Tailwind during setup) |
| **T3 Stack** | `npm create t3-app@latest` (Next.js + tRPC + Prisma + Tailwind) |
| **Astro** | `npm create astro@latest` then `npx astro add tailwind` |
| **Remix** | `npx create-remix@latest` then add Tailwind via Vite plugin |
| **SvelteKit** | `npx sv create` (select Tailwind during setup) |

### Vite + React + Tailwind v4 Quick Start

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm install tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

```css
/* src/index.css */
@import "tailwindcss";
```

### Next.js + Tailwind v4

```bash
npx create-next-app@latest my-app
# Select: Yes to Tailwind CSS
```

Next.js 15+ auto-configures Tailwind v4 with PostCSS.

## Browser Compatibility

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 111+ |
| Edge | 111+ |
| Firefox | 128+ |
| Safari | 16.4+ |
| Opera | 97+ |
| Samsung Internet | 22+ |

Key requirements:
- CSS nesting (native)
- `@layer` support
- `oklch()` color function
- `:has()` selector
- Container queries (`@container`)

### Checking Support

```bash
npx browserslist "chrome >= 111, edge >= 111, firefox >= 128, safari >= 16.4"
```

> If targeting older browsers, consider staying on Tailwind v3 or using PostCSS plugins for fallbacks.
