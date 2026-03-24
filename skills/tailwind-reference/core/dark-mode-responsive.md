# Dark Mode & Responsive Design

## Dark Mode Strategies

| Strategy | Trigger | Use When |
|----------|---------|----------|
| **`prefers-color-scheme`** (default) | OS/browser setting | Simple sites, respect user OS preference |
| **Selector `[data-theme=dark]`** | Data attribute on `<html>` | App with theme toggle, multiple themes |
| **Selector `.dark`** | Class on `<html>` | Legacy v3 pattern, simple toggle |
| **Custom variant** | Any custom condition | Complex theming (per-section, scheduled) |

### Default: `prefers-color-scheme`

Works out of the box:

```html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content adapts to OS setting
</div>
```

### Selector Strategy (Recommended for Apps)

```css
@import "tailwindcss";
@custom-variant dark (&:where([data-theme=dark] *));
```

```html
<html data-theme="dark">
  <div class="bg-white dark:bg-gray-900">Controlled by attribute</div>
</html>
```

Toggle script:

```js
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}

// Initialize from stored preference
const stored = localStorage.getItem("theme");
const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";
document.documentElement.setAttribute("data-theme", stored ?? preferred);
```

### Class Strategy (Legacy)

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark *));
```

```html
<html class="dark">
  <div class="bg-white dark:bg-gray-900">Controlled by class</div>
</html>
```

### Semantic Color Tokens for Theming

Combine with CSS variable theming for clean dark mode:

```css
@theme {
  --color-bg: oklch(0.98 0 0);
  --color-fg: oklch(0.13 0 0);
  --color-muted: oklch(0.55 0 0);
  --color-border: oklch(0.90 0 0);
  --color-accent: oklch(0.63 0.26 255);
}

:root[data-theme="dark"] {
  --color-bg: oklch(0.13 0 0);
  --color-fg: oklch(0.98 0 0);
  --color-muted: oklch(0.65 0 0);
  --color-border: oklch(0.25 0 0);
  --color-accent: oklch(0.75 0.20 255);
}
```

```html
<div class="bg-bg text-fg border-border">
  <p class="text-muted">No dark: prefix needed</p>
</div>
```

## Breakpoints

### Default Scale

| Prefix | Min-width | CSS |
|--------|-----------|-----|
| `sm` | 640px | `@media (width >= 40rem)` |
| `md` | 768px | `@media (width >= 48rem)` |
| `lg` | 1024px | `@media (width >= 64rem)` |
| `xl` | 1280px | `@media (width >= 80rem)` |
| `2xl` | 1536px | `@media (width >= 96rem)` |

### Custom Breakpoints

```css
@theme {
  --breakpoint-xs: 30rem;   /* 480px */
  --breakpoint-3xl: 120rem; /* 1920px */
}
```

### Breakpoint Ranges

```html
<!-- Only between md and lg -->
<div class="md:max-lg:grid-cols-2">
  Visible as 2-col only on md to lg screens
</div>

<!-- Below md -->
<div class="max-md:flex-col">
  Stack vertically on small screens
</div>
```

### Mobile-First Pattern

```html
<div class="
  flex flex-col        /* mobile: stack */
  sm:flex-row          /* sm+: side by side */
  lg:grid lg:grid-cols-3  /* lg+: 3-column grid */
">
```

## Container Queries

### Setup

```html
<!-- Mark container -->
<div class="@container">
  <!-- Respond to container width -->
  <div class="@sm:flex @lg:grid @lg:grid-cols-2">
    Content adapts to container, not viewport
  </div>
</div>
```

### Container Size Variants

| Variant | Min-width |
|---------|-----------|
| `@3xs` | 12rem (192px) |
| `@2xs` | 16rem (256px) |
| `@xs` | 20rem (320px) |
| `@sm` | 24rem (384px) |
| `@md` | 28rem (448px) |
| `@lg` | 32rem (512px) |
| `@xl` | 36rem (576px) |
| `@2xl` | 42rem (672px) |
| `@3xl` | 48rem (768px) |
| `@4xl` | 56rem (896px) |
| `@5xl` | 64rem (1024px) |
| `@6xl` | 72rem (1152px) |
| `@7xl` | 80rem (1280px) |

### Named Containers

```html
<div class="@container/sidebar">
  <div class="@md/sidebar:grid-cols-2">
    Responds to sidebar container width
  </div>
</div>
```

### Container Query Ranges

```html
<div class="@container">
  <div class="@sm:max-@lg:flex-row">
    Only flex-row between @sm and @lg container sizes
  </div>
</div>
```

### Container Query Component Pattern

```html
<!-- Card that adapts to its container -->
<div class="@container">
  <article class="
    flex flex-col gap-2
    @sm:flex-row @sm:gap-4
    @lg:gap-6
  ">
    <img class="
      w-full aspect-video object-cover rounded-lg
      @sm:w-40 @sm:aspect-square
      @lg:w-56
    " src="..." alt="..." />
    <div>
      <h2 class="text-base @sm:text-lg @lg:text-xl font-semibold">Title</h2>
      <p class="text-sm text-gray-600 @lg:text-base">Description</p>
    </div>
  </article>
</div>
```
