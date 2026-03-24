# Typography & Colors

## Font Size Scale

| Class | Size | Line Height |
|-------|------|-------------|
| `text-xs` | 0.75rem (12px) | 1rem (16px) |
| `text-sm` | 0.875rem (14px) | 1.25rem (20px) |
| `text-base` | 1rem (16px) | 1.5rem (24px) |
| `text-lg` | 1.125rem (18px) | 1.75rem (28px) |
| `text-xl` | 1.25rem (20px) | 1.75rem (28px) |
| `text-2xl` | 1.5rem (24px) | 2rem (32px) |
| `text-3xl` | 1.875rem (30px) | 2.25rem (36px) |
| `text-4xl` | 2.25rem (36px) | 2.5rem (40px) |
| `text-5xl` | 3rem (48px) | 1 |
| `text-6xl` | 3.75rem (60px) | 1 |
| `text-7xl` | 4.5rem (72px) | 1 |
| `text-8xl` | 6rem (96px) | 1 |
| `text-9xl` | 8rem (128px) | 1 |

### Override Line Height

```html
<p class="text-xl/8">text-xl with 2rem line-height</p>
<p class="text-xl/[1.6]">text-xl with 1.6 line-height</p>
```

## Font Weight

| Class | Weight |
|-------|--------|
| `font-thin` | 100 |
| `font-extralight` | 200 |
| `font-light` | 300 |
| `font-normal` | 400 |
| `font-medium` | 500 |
| `font-semibold` | 600 |
| `font-bold` | 700 |
| `font-extrabold` | 800 |
| `font-black` | 900 |

## Font Family

| Class | Value |
|-------|-------|
| `font-sans` | `ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", ...` |
| `font-serif` | `ui-serif, Georgia, Cambria, "Times New Roman", ...` |
| `font-mono` | `ui-monospace, SFMono-Regular, Menlo, Monaco, ...` |

Custom families via `@theme`:
```css
@theme {
  --font-display: "Cal Sans", sans-serif;
  --font-body: "Inter", sans-serif;
}
```
Usage: `font-display`, `font-body`

## Font Style & Variant

| Class | CSS |
|-------|-----|
| `italic` | `font-style: italic` |
| `not-italic` | `font-style: normal` |
| `antialiased` | `-webkit-font-smoothing: antialiased` |
| `subpixel-antialiased` | `-webkit-font-smoothing: auto` |
| `tabular-nums` | `font-variant-numeric: tabular-nums` |
| `oldstyle-nums` | `font-variant-numeric: oldstyle-nums` |
| `lining-nums` | `font-variant-numeric: lining-nums` |

## Text Utilities

### Alignment
| Class | CSS |
|-------|-----|
| `text-left` | `text-align: left` |
| `text-center` | `text-align: center` |
| `text-right` | `text-align: right` |
| `text-justify` | `text-align: justify` |
| `text-start` | `text-align: start` |
| `text-end` | `text-align: end` |

### Transform
| Class | CSS |
|-------|-----|
| `uppercase` | `text-transform: uppercase` |
| `lowercase` | `text-transform: lowercase` |
| `capitalize` | `text-transform: capitalize` |
| `normal-case` | `text-transform: none` |

### Decoration
| Class | CSS |
|-------|-----|
| `underline` | `text-decoration-line: underline` |
| `overline` | `text-decoration-line: overline` |
| `line-through` | `text-decoration-line: line-through` |
| `no-underline` | `text-decoration-line: none` |
| `decoration-solid` | `text-decoration-style: solid` |
| `decoration-dashed` | `text-decoration-style: dashed` |
| `decoration-dotted` | `text-decoration-style: dotted` |
| `decoration-wavy` | `text-decoration-style: wavy` |
| `decoration-{color}` | `text-decoration-color: {color}` |
| `decoration-{n}` | `text-decoration-thickness: {n}px` |
| `underline-offset-{n}` | `text-underline-offset: {n}px` |

### Spacing
| Class | CSS |
|-------|-----|
| `tracking-tighter` | `letter-spacing: -0.05em` |
| `tracking-tight` | `letter-spacing: -0.025em` |
| `tracking-normal` | `letter-spacing: 0em` |
| `tracking-wide` | `letter-spacing: 0.025em` |
| `tracking-wider` | `letter-spacing: 0.05em` |
| `tracking-widest` | `letter-spacing: 0.1em` |
| `leading-none` | `line-height: 1` |
| `leading-tight` | `line-height: 1.25` |
| `leading-snug` | `line-height: 1.375` |
| `leading-normal` | `line-height: 1.5` |
| `leading-relaxed` | `line-height: 1.625` |
| `leading-loose` | `line-height: 2` |
| `leading-{n}` | `line-height: {spacing}` |

### Wrapping & Overflow
| Class | CSS |
|-------|-----|
| `truncate` | `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` |
| `text-ellipsis` | `text-overflow: ellipsis` |
| `text-clip` | `text-overflow: clip` |
| `whitespace-normal` | `white-space: normal` |
| `whitespace-nowrap` | `white-space: nowrap` |
| `whitespace-pre` | `white-space: pre` |
| `whitespace-pre-line` | `white-space: pre-line` |
| `whitespace-pre-wrap` | `white-space: pre-wrap` |
| `break-normal` | `overflow-wrap: normal; word-break: normal` |
| `break-words` | `overflow-wrap: break-word` |
| `break-all` | `word-break: break-all` |
| `break-keep` | `word-break: keep-all` |
| `hyphens-auto` | `hyphens: auto` |
| `text-balance` | `text-wrap: balance` |
| `text-pretty` | `text-wrap: pretty` |
| `text-wrap` | `text-wrap: wrap` |
| `text-nowrap` | `text-wrap: nowrap` |

### Line Clamp
```html
<p class="line-clamp-3">Long text clamped to 3 lines...</p>
<p class="line-clamp-none">Remove clamp</p>
```

### List Styles
| Class | CSS |
|-------|-----|
| `list-disc` | `list-style-type: disc` |
| `list-decimal` | `list-style-type: decimal` |
| `list-none` | `list-style-type: none` |
| `list-inside` | `list-style-position: inside` |
| `list-outside` | `list-style-position: outside` |

## Color Palette

### Default Color Families

All colors have shades from 50 to 950 (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950):

| Family | Hue Range | Notes |
|--------|-----------|-------|
| `slate` | Blue-gray | Default neutral with blue undertone |
| `gray` | Neutral gray | Pure neutral |
| `zinc` | Cool gray | Slightly warm neutral |
| `neutral` | True neutral | No undertone |
| `stone` | Warm gray | Earthy neutral |
| `red` | Red | Errors, destructive actions |
| `orange` | Orange | Warnings |
| `amber` | Yellow-orange | Caution |
| `yellow` | Yellow | Highlights |
| `lime` | Yellow-green | Accent |
| `green` | Green | Success, confirmation |
| `emerald` | Blue-green | Accent |
| `teal` | Teal | Accent |
| `cyan` | Cyan | Info |
| `sky` | Light blue | Accent |
| `blue` | Blue | Primary actions, links |
| `indigo` | Blue-purple | Accent |
| `violet` | Violet | Accent |
| `purple` | Purple | Accent |
| `fuchsia` | Pink-purple | Accent |
| `pink` | Pink | Accent |
| `rose` | Red-pink | Accent |

Plus: `black`, `white`, `transparent`, `current` (currentColor)

### Color Utility Prefixes

| Prefix | Property |
|--------|----------|
| `text-{color}` | `color` |
| `bg-{color}` | `background-color` |
| `border-{color}` | `border-color` |
| `ring-{color}` | `--tw-ring-color` |
| `outline-{color}` | `outline-color` |
| `accent-{color}` | `accent-color` |
| `caret-{color}` | `caret-color` |
| `fill-{color}` | `fill` |
| `stroke-{color}` | `stroke` |
| `shadow-{color}` | `--tw-shadow-color` |
| `divide-{color}` | `border-color` (between children) |
| `placeholder-{color}` | `::placeholder color` |
| `decoration-{color}` | `text-decoration-color` |

### Opacity Modifier

```html
<div class="bg-blue-500/50">50% opacity blue background</div>
<div class="text-white/80">80% opacity white text</div>
<div class="border-gray-300/25">25% opacity border</div>
<div class="bg-black/[0.08]">Arbitrary 8% opacity</div>
```

## Gradients

```html
<!-- Linear gradient -->
<div class="bg-gradient-to-r from-blue-500 to-purple-600">
  Left to right gradient
</div>

<!-- Three-stop gradient -->
<div class="bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500">
  Diagonal three-color gradient
</div>

<!-- Gradient stop positions -->
<div class="bg-gradient-to-r from-blue-500 from-10% via-green-500 via-50% to-teal-500 to-90%">
  Positioned stops
</div>
```

### Gradient Directions

| Class | Direction |
|-------|-----------|
| `bg-gradient-to-t` | Bottom to top |
| `bg-gradient-to-tr` | Bottom-left to top-right |
| `bg-gradient-to-r` | Left to right |
| `bg-gradient-to-br` | Top-left to bottom-right |
| `bg-gradient-to-b` | Top to bottom |
| `bg-gradient-to-bl` | Top-right to bottom-left |
| `bg-gradient-to-l` | Right to left |
| `bg-gradient-to-tl` | Bottom-right to top-left |

## Background Utilities

| Class | CSS |
|-------|-----|
| `bg-fixed` | `background-attachment: fixed` |
| `bg-local` | `background-attachment: local` |
| `bg-scroll` | `background-attachment: scroll` |
| `bg-center` | `background-position: center` |
| `bg-cover` | `background-size: cover` |
| `bg-contain` | `background-size: contain` |
| `bg-no-repeat` | `background-repeat: no-repeat` |
| `bg-repeat` | `background-repeat: repeat` |
| `bg-[url('/img/hero.jpg')]` | Arbitrary background image |
