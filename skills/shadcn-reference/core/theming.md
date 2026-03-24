# shadcn/ui Theming

## CSS Variable System
shadcn/ui uses CSS variables for theming, defined in your global CSS file. Colors use OKLCH format for perceptual uniformity.

### Variable Format
```css
@layer base {
  :root {
    --background: oklch(1 0 0);
    --foreground: oklch(0.145 0 0);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.145 0 0);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.145 0 0);
    --primary: oklch(0.205 0 0);
    --primary-foreground: oklch(0.985 0 0);
    --secondary: oklch(0.965 0 0);
    --secondary-foreground: oklch(0.205 0 0);
    --muted: oklch(0.965 0 0);
    --muted-foreground: oklch(0.556 0 0);
    --accent: oklch(0.965 0 0);
    --accent-foreground: oklch(0.205 0 0);
    --destructive: oklch(0.577 0.245 27.325);
    --border: oklch(0.922 0 0);
    --input: oklch(0.922 0 0);
    --ring: oklch(0.708 0 0);
    --radius: 0.625rem;
    /* Chart colors */
    --chart-1: oklch(0.646 0.222 41.116);
    --chart-2: oklch(0.6 0.118 184.704);
    --chart-3: oklch(0.398 0.07 227.392);
    --chart-4: oklch(0.828 0.189 84.429);
    --chart-5: oklch(0.769 0.188 70.08);
    /* Sidebar colors */
    --sidebar: oklch(0.985 0 0);
    --sidebar-foreground: oklch(0.145 0 0);
    --sidebar-primary: oklch(0.205 0 0);
    --sidebar-primary-foreground: oklch(0.985 0 0);
    --sidebar-accent: oklch(0.965 0 0);
    --sidebar-accent-foreground: oklch(0.205 0 0);
    --sidebar-border: oklch(0.922 0 0);
    --sidebar-ring: oklch(0.708 0 0);
  }

  .dark {
    --background: oklch(0.145 0 0);
    --foreground: oklch(0.985 0 0);
    /* ... dark variants ... */
  }
}
```

### Variable Categories
| Category | Variables | Purpose |
|----------|-----------|---------|
| **Base** | `--background`, `--foreground` | Page background and text |
| **Card** | `--card`, `--card-foreground` | Card surfaces |
| **Popover** | `--popover`, `--popover-foreground` | Popover/dropdown surfaces |
| **Primary** | `--primary`, `--primary-foreground` | Primary buttons, links |
| **Secondary** | `--secondary`, `--secondary-foreground` | Secondary actions |
| **Muted** | `--muted`, `--muted-foreground` | Muted backgrounds, placeholder text |
| **Accent** | `--accent`, `--accent-foreground` | Highlights, hover states |
| **Destructive** | `--destructive` | Error/danger states |
| **Border** | `--border`, `--input`, `--ring` | Borders, input outlines, focus rings |
| **Radius** | `--radius` | Global border radius |
| **Chart** | `--chart-1` through `--chart-5` | Chart color palette |
| **Sidebar** | `--sidebar`, `--sidebar-*` | Sidebar-specific theming |

### Base Color Presets
| Preset | Hue | Description |
|--------|-----|-------------|
| `zinc` | Neutral gray | Default, clean neutral |
| `slate` | Cool blue-gray | Slightly blue-tinted |
| `stone` | Warm gray | Earthy, warm tone |
| `gray` | Pure gray | True neutral |
| `neutral` | Pure neutral | Minimal hue |

### OKLCH Format
```
oklch(lightness chroma hue)
- Lightness: 0 (black) to 1 (white)
- Chroma: 0 (gray) to ~0.4 (vivid)
- Hue: 0-360 degrees
```

## Dark Mode

### next-themes (Recommended for Next.js)
```bash
npm install next-themes
```

```tsx
// app/layout.tsx
import { ThemeProvider } from "next-themes"

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Toggle Component
```tsx
"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
```

### Custom Colors
To add custom theme colors:
```css
:root {
  --brand: oklch(0.637 0.237 25.331);
  --brand-foreground: oklch(0.985 0 0);
}
```
Then use in Tailwind: `bg-[var(--brand)]` or extend theme in CSS:
```css
@theme inline {
  --color-brand: var(--brand);
  --color-brand-foreground: var(--brand-foreground);
}
```
Now use: `bg-brand text-brand-foreground`
