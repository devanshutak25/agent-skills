# Directives & Functions

## Directives Quick Reference

| Directive | Purpose |
|-----------|---------|
| `@import "tailwindcss"` | Import Tailwind (replaces `@tailwind base/components/utilities`) |
| `@theme` | Define/override design tokens as CSS variables |
| `@utility` | Create custom utility classes |
| `@variant` | Apply existing variant inline |
| `@custom-variant` | Define new variant selectors |
| `@apply` | Inline utility classes into custom CSS |
| `@reference` | Import styles as reference-only (no output) |
| `@source` | Configure content source paths |
| `@config` | Load legacy JS config file |
| `@plugin` | Load v3-compatible plugin |

## `@theme` — Design Tokens

See [theme-system.md](theme-system.md) for full details.

```css
@theme {
  --color-brand: oklch(0.72 0.21 330);
  --font-display: "Cal Sans", sans-serif;
  --spacing-18: 4.5rem;
}
```

## `@utility` — Custom Utilities

### Simple Utility

```css
@utility content-auto {
  content-visibility: auto;
}
```

Usage: `class="content-auto"`

### Functional Utility (with values)

```css
@utility tab-size-* {
  tab-size: --value(--tab-size-*, integer);
}
```

Usage: `class="tab-size-4"` or `class="tab-size-8"`

### Functional Utility with Theme Values

```css
@utility gutter-* {
  padding-inline: --value(--spacing-*);
}
```

Usage: `class="gutter-4"` (resolves `--spacing-4`)

### Functional Utility with Arbitrary Values

```css
@utility scroll-offset-* {
  scroll-margin-top: --value(integer, length);
}
```

Usage: `class="scroll-offset-20"` or `class="scroll-offset-[80px]"`

### `--value()` Type Reference

| Type | Matches |
|------|---------|
| `integer` | Bare numbers: `tab-size-4` |
| `number` | Numbers with decimals: `opacity-50` |
| `percentage` | Percentage values: `w-1/2` |
| `length` | Length units: `p-[20px]` |
| `color` | Color values: `bg-[#f00]` |
| `url` | URL values: `bg-[url(...)]` |
| `raw` | Pass-through: no validation |

## `@variant` — Apply Existing Variant

Wrap rules in an existing variant selector:

```css
@variant dark {
  .my-element {
    background: black;
    color: white;
  }
}
```

## `@custom-variant` — Define New Variants

```css
/* Simple selector */
@custom-variant pointer-coarse (@media (pointer: coarse));

/* Complex selector with & placeholder */
@custom-variant theme-midnight (&:where([data-theme="midnight"] *));
```

Usage: `class="pointer-coarse:text-lg theme-midnight:bg-slate-900"`

### Group/Peer Custom Variants

```css
@custom-variant checked (&:checked);
/* Automatically generates group-checked and peer-checked */
```

## `@apply` — Inline Utilities

```css
.btn {
  @apply px-4 py-2 rounded-lg font-semibold;
}

.btn-primary {
  @apply btn bg-blue-600 text-white hover:bg-blue-700;
}
```

### When to Use `@apply`

- **Use:** Third-party component styling, global base styles, email templates
- **Avoid:** Component-based frameworks (React/Vue/Svelte) — use utility classes directly in markup
- **Avoid:** Complex responsive/state variants — keeps logic in CSS instead of collocated with markup

## `@reference` — Reference-Only Import

Import another stylesheet to resolve `@apply` and `@theme` without emitting its CSS:

```css
@reference "tailwindcss";
@reference "../theme.css";

.my-component {
  @apply text-brand-primary font-display;
}
```

Useful in component CSS files that need access to theme tokens without duplicating Tailwind's output.

## `@layer` — Layer Ordering

```css
@layer components {
  .card {
    @apply rounded-xl bg-white p-6 shadow-md;
  }
}

@layer utilities {
  .content-auto {
    content-visibility: auto;
  }
}
```

- `components` layer: lower specificity, overridden by utilities
- `utilities` layer: higher specificity, wins over components

## Functions

### `--alpha()` — Adjust Opacity

```css
.element {
  background: --alpha(var(--color-blue-500), 50%);
  /* oklch(0.62 0.21 255 / 50%) */
}
```

### `--spacing()` — Resolve Spacing Token

```css
.element {
  margin-top: --spacing(4);  /* 1rem */
  gap: --spacing(2);         /* 0.5rem */
  padding: calc(--spacing(4) + 1px);
}
```

### `theme()` — Legacy Theme Function

```css
/* Still works but prefer CSS variables directly */
.element {
  color: theme(colors.blue.500);
}

/* Preferred v4 approach */
.element {
  color: var(--color-blue-500);
}
```
