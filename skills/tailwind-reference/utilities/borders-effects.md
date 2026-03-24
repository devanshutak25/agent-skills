# Borders & Effects

## Border Radius

| Class | Value |
|-------|-------|
| `rounded-none` | `0` |
| `rounded-xs` | `0.0625rem` (1px) |
| `rounded-sm` | `0.125rem` (2px) |
| `rounded` | `0.25rem` (4px) |
| `rounded-md` | `0.375rem` (6px) |
| `rounded-lg` | `0.5rem` (8px) |
| `rounded-xl` | `0.75rem` (12px) |
| `rounded-2xl` | `1rem` (16px) |
| `rounded-3xl` | `1.5rem` (24px) |
| `rounded-full` | `9999px` |

### Per-Side Radius

| Prefix | Corners |
|--------|---------|
| `rounded-t-` | Top-left + top-right |
| `rounded-r-` | Top-right + bottom-right |
| `rounded-b-` | Bottom-left + bottom-right |
| `rounded-l-` | Top-left + bottom-left |
| `rounded-tl-` | Top-left only |
| `rounded-tr-` | Top-right only |
| `rounded-br-` | Bottom-right only |
| `rounded-bl-` | Bottom-left only |
| `rounded-s-` | Start (logical) |
| `rounded-e-` | End (logical) |
| `rounded-ss-` | Start-start (logical) |
| `rounded-se-` | Start-end (logical) |
| `rounded-es-` | End-start (logical) |
| `rounded-ee-` | End-end (logical) |

## Border Width

| Class | Value |
|-------|-------|
| `border` | `1px` |
| `border-0` | `0px` |
| `border-2` | `2px` |
| `border-4` | `4px` |
| `border-8` | `8px` |
| `border-t` / `border-r` / `border-b` / `border-l` | `1px` per side |
| `border-t-{n}` | Top border width |
| `border-x-{n}` | Left + right |
| `border-y-{n}` | Top + bottom |
| `border-s-{n}` / `border-e-{n}` | Logical sides |

### Border Style

| Class | CSS |
|-------|-----|
| `border-solid` | `border-style: solid` |
| `border-dashed` | `border-style: dashed` |
| `border-dotted` | `border-style: dotted` |
| `border-double` | `border-style: double` |
| `border-hidden` | `border-style: hidden` |
| `border-none` | `border-style: none` |

### Border Color

```html
<div class="border border-gray-300">Default border</div>
<div class="border-2 border-blue-500">Blue border</div>
<div class="border-b-2 border-b-red-500">Red bottom border</div>
```

## Divide (Between Children)

```html
<div class="divide-y divide-gray-200">
  <div class="py-4">Item 1</div>
  <div class="py-4">Item 2</div>
  <div class="py-4">Item 3</div>
</div>

<div class="flex divide-x divide-gray-200">
  <div class="px-4">Left</div>
  <div class="px-4">Right</div>
</div>
```

| Class | CSS |
|-------|-----|
| `divide-x` | Vertical dividers between children |
| `divide-y` | Horizontal dividers between children |
| `divide-x-{n}` / `divide-y-{n}` | Custom width (0, 2, 4, 8) |
| `divide-{color}` | Divider color |
| `divide-solid` / `divide-dashed` / `divide-dotted` | Divider style |

## Outline

| Class | CSS |
|-------|-----|
| `outline` | `outline-style: solid` (default 1px) |
| `outline-none` | `outline: 2px solid transparent; outline-offset: 2px` |
| `outline-dashed` | `outline-style: dashed` |
| `outline-dotted` | `outline-style: dotted` |
| `outline-double` | `outline-style: double` |
| `outline-{n}` | `outline-width: {n}px` (0, 1, 2, 4, 8) |
| `outline-{color}` | `outline-color: {color}` |
| `outline-offset-{n}` | `outline-offset: {n}px` (0, 1, 2, 4, 8) |

## Ring (Focus Ring)

```html
<button class="ring-2 ring-blue-500">Ringed button</button>
<input class="focus:ring-2 focus:ring-blue-500 focus:outline-none" />
```

| Class | CSS |
|-------|-----|
| `ring` | `3px` box-shadow ring |
| `ring-0` / `ring-1` / `ring-2` / `ring-4` / `ring-8` | Ring width |
| `ring-inset` | Inset ring |
| `ring-{color}` | Ring color |
| `ring-offset-{n}` | Gap between ring and element (0, 1, 2, 4, 8) |
| `ring-offset-{color}` | Ring offset background color |

### Common Focus Ring Pattern

```html
<button class="
  focus:outline-none
  focus-visible:ring-2
  focus-visible:ring-blue-500
  focus-visible:ring-offset-2
">
  Accessible focus ring
</button>
```

## Shadows

| Class | Use Case |
|-------|----------|
| `shadow-xs` | Subtle depth — form inputs, cards |
| `shadow-sm` | Light elevation — buttons, tags |
| `shadow` | Default — cards, dropdowns |
| `shadow-md` | Medium — popovers, tooltips |
| `shadow-lg` | High — modals, floating elements |
| `shadow-xl` | Higher — large modals, dialogs |
| `shadow-2xl` | Highest — overlays |
| `shadow-none` | Remove shadow |
| `shadow-inner` | Inset shadow |

### Colored Shadows

```html
<button class="shadow-lg shadow-blue-500/50">
  Blue glow shadow
</button>
```

## Opacity

| Class | Value |
|-------|-------|
| `opacity-0` | `0` |
| `opacity-5` | `0.05` |
| `opacity-10` | `0.1` |
| `opacity-15` | `0.15` |
| `opacity-20` | `0.2` |
| `opacity-25` | `0.25` |
| `opacity-30` | `0.3` |
| `opacity-35` | `0.35` |
| `opacity-40` | `0.4` |
| `opacity-45` | `0.45` |
| `opacity-50` | `0.5` |
| `opacity-55` | `0.55` |
| `opacity-60` | `0.6` |
| `opacity-65` | `0.65` |
| `opacity-70` | `0.7` |
| `opacity-75` | `0.75` |
| `opacity-80` | `0.8` |
| `opacity-85` | `0.85` |
| `opacity-90` | `0.9` |
| `opacity-95` | `0.95` |
| `opacity-100` | `1` |

> Prefer color opacity modifier (`bg-blue-500/50`) over `opacity-*` for single-property control.

## Filters

### Element Filters

| Class | CSS |
|-------|-----|
| `blur-none` | `filter: blur(0)` |
| `blur-sm` | `filter: blur(4px)` |
| `blur` | `filter: blur(8px)` |
| `blur-md` | `filter: blur(12px)` |
| `blur-lg` | `filter: blur(16px)` |
| `blur-xl` | `filter: blur(24px)` |
| `blur-2xl` | `filter: blur(40px)` |
| `blur-3xl` | `filter: blur(64px)` |
| `brightness-{n}` | `filter: brightness({n}%)` (0, 50, 75, 90, 95, 100, 105, 110, 125, 150, 200) |
| `contrast-{n}` | `filter: contrast({n}%)` |
| `grayscale` | `filter: grayscale(100%)` |
| `grayscale-0` | `filter: grayscale(0)` |
| `saturate-{n}` | `filter: saturate({n}%)` (0, 50, 100, 150, 200) |
| `sepia` | `filter: sepia(100%)` |
| `invert` | `filter: invert(100%)` |
| `hue-rotate-{n}` | `filter: hue-rotate({n}deg)` (0, 15, 30, 60, 90, 180) |
| `drop-shadow-sm/md/lg/xl/2xl/none` | `filter: drop-shadow(...)` |

### Backdrop Filters

Same as above but prefixed with `backdrop-`:

```html
<div class="backdrop-blur-md backdrop-saturate-150 bg-white/30">
  Frosted glass effect
</div>
```

| Class | CSS |
|-------|-----|
| `backdrop-blur-{size}` | `backdrop-filter: blur(...)` |
| `backdrop-brightness-{n}` | `backdrop-filter: brightness(...)` |
| `backdrop-contrast-{n}` | `backdrop-filter: contrast(...)` |
| `backdrop-grayscale` | `backdrop-filter: grayscale(100%)` |
| `backdrop-saturate-{n}` | `backdrop-filter: saturate(...)` |
| `backdrop-sepia` | `backdrop-filter: sepia(100%)` |
| `backdrop-invert` | `backdrop-filter: invert(100%)` |
| `backdrop-opacity-{n}` | `backdrop-filter: opacity(...)` |

## Mix Blend Mode

| Class | CSS |
|-------|-----|
| `mix-blend-normal` | `mix-blend-mode: normal` |
| `mix-blend-multiply` | `mix-blend-mode: multiply` |
| `mix-blend-screen` | `mix-blend-mode: screen` |
| `mix-blend-overlay` | `mix-blend-mode: overlay` |
| `mix-blend-darken` | `mix-blend-mode: darken` |
| `mix-blend-lighten` | `mix-blend-mode: lighten` |
| `mix-blend-color-dodge` | `mix-blend-mode: color-dodge` |
| `mix-blend-color-burn` | `mix-blend-mode: color-burn` |
| `mix-blend-difference` | `mix-blend-mode: difference` |
| `mix-blend-exclusion` | `mix-blend-mode: exclusion` |

Background blend mode uses `bg-blend-*` prefix with same values.
