# shadcn/ui Installation & Setup

## Quick Start
```bash
npx shadcn@latest init
npx shadcn@latest add button
```

## Framework Setup

### Next.js
```bash
npx shadcn@latest init -d
```
- App Router and Pages Router supported
- Automatically detects framework
- Adds `components.json`, `lib/utils.ts`, CSS variables to `globals.css`

### Vite (React)
```bash
npm create vite@latest my-app -- --template react-ts
npx shadcn@latest init
```
- Requires path alias config in `vite.config.ts`:
```ts
import path from "path"
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") }
  }
})
```
- Also update `tsconfig.json` paths

### Remix
```bash
npx create-remix@latest
npx shadcn@latest init
```

### Astro
```bash
npm create astro@latest
npx astro add react tailwind
npx shadcn@latest init
```
- Components must be in `.tsx` files with `client:load` or `client:visible`

### Laravel (Inertia)
```bash
npx shadcn@latest init
```
- Works with Laravel + Inertia + React stack
- Set `aliases.components` to `resources/js/components` in `components.json`

### TanStack Start
```bash
npx shadcn@latest init
```

### Gatsby
```bash
npx shadcn@latest init
```

### Manual Installation
1. Install dependencies: `tailwindcss`, `tailwindcss-animate`, `class-variance-authority`, `clsx`, `tailwind-merge`
2. Create `lib/utils.ts`:
```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```
3. Add CSS variables to your global CSS
4. Configure path aliases

## `components.json` Schema
```jsonc
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",        // "default" | "new-york"
  "rsc": true,                 // React Server Components
  "tsx": true,                 // TypeScript (false for JS)
  "tailwind": {
    "config": "tailwind.config.js",  // path to tailwind config
    "css": "app/globals.css",        // path to global CSS
    "baseColor": "zinc",             // zinc | slate | stone | gray | neutral
    "cssVariables": true,            // use CSS variables for colors
    "prefix": ""                     // Tailwind prefix
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"      // "lucide" | "radix-icons"
}
```

### Key Options
| Option | Default | Description |
|--------|---------|-------------|
| `style` | `"new-york"` | Component style preset |
| `rsc` | `true` | Enable React Server Components support |
| `tsx` | `true` | Use TypeScript |
| `tailwind.baseColor` | `"zinc"` | Base neutral color |
| `tailwind.cssVariables` | `true` | CSS variable-based theming |
| `tailwind.prefix` | `""` | Tailwind class prefix |
| `aliases.ui` | `"@/components/ui"` | Where UI components are placed |
| `iconLibrary` | `"lucide"` | Icon library to use |
