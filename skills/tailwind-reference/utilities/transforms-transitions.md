# Transforms & Transitions

## Transitions

### Transition Properties

| Class | Properties |
|-------|-----------|
| `transition` | `color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter` |
| `transition-all` | `all` |
| `transition-colors` | `color, background-color, border-color, text-decoration-color, fill, stroke` |
| `transition-opacity` | `opacity` |
| `transition-shadow` | `box-shadow` |
| `transition-transform` | `transform` |
| `transition-none` | `none` |

### Duration

| Class | Value |
|-------|-------|
| `duration-0` | `0ms` |
| `duration-75` | `75ms` |
| `duration-100` | `100ms` |
| `duration-150` | `150ms` |
| `duration-200` | `200ms` |
| `duration-300` | `300ms` |
| `duration-500` | `500ms` |
| `duration-700` | `700ms` |
| `duration-1000` | `1000ms` |

### Timing Function

| Class | Value |
|-------|-------|
| `ease-linear` | `linear` |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` |

### Delay

| Class | Value |
|-------|-------|
| `delay-0` | `0ms` |
| `delay-75` | `75ms` |
| `delay-100` | `100ms` |
| `delay-150` | `150ms` |
| `delay-200` | `200ms` |
| `delay-300` | `300ms` |
| `delay-500` | `500ms` |
| `delay-700` | `700ms` |
| `delay-1000` | `1000ms` |

### Common Transition Pattern

```html
<button class="
  transition-colors duration-200 ease-in-out
  bg-blue-500 hover:bg-blue-600
  text-white
">
  Smooth color transition
</button>
```

## 2D Transforms

### Translate

| Class | CSS |
|-------|-----|
| `translate-x-{n}` | `translate: {spacing} 0` |
| `translate-y-{n}` | `translate: 0 {spacing}` |
| `-translate-x-{n}` | Negative translate-x |
| `-translate-y-{n}` | Negative translate-y |
| `translate-x-full` | `translate: 100% 0` |
| `translate-y-full` | `translate: 0 100%` |
| `translate-x-1/2` | `translate: 50% 0` |
| `-translate-x-1/2` | `translate: -50% 0` |

### Scale

| Class | CSS |
|-------|-----|
| `scale-{n}` | `scale: {n/100}` |
| `scale-x-{n}` | `scale: {n/100} 1` |
| `scale-y-{n}` | `scale: 1 {n/100}` |

Common values: `0`, `50`, `75`, `90`, `95`, `100`, `105`, `110`, `125`, `150`, `200`

### Rotate

| Class | CSS |
|-------|-----|
| `rotate-{n}` | `rotate: {n}deg` |
| `-rotate-{n}` | `rotate: -{n}deg` |

Common values: `0`, `1`, `2`, `3`, `6`, `12`, `45`, `90`, `180`

### Skew

| Class | CSS |
|-------|-----|
| `skew-x-{n}` | `transform: skewX({n}deg)` |
| `skew-y-{n}` | `transform: skewY({n}deg)` |
| `-skew-x-{n}` | Negative skew-x |
| `-skew-y-{n}` | Negative skew-y |

Common values: `0`, `1`, `2`, `3`, `6`, `12`

### Transform Origin

| Class | CSS |
|-------|-----|
| `origin-center` | `transform-origin: center` |
| `origin-top` | `transform-origin: top` |
| `origin-top-right` | `transform-origin: top right` |
| `origin-right` | `transform-origin: right` |
| `origin-bottom-right` | `transform-origin: bottom right` |
| `origin-bottom` | `transform-origin: bottom` |
| `origin-bottom-left` | `transform-origin: bottom left` |
| `origin-left` | `transform-origin: left` |
| `origin-top-left` | `transform-origin: top left` |

## 3D Transforms (New in v4)

### 3D Rotate

| Class | CSS |
|-------|-----|
| `rotate-x-{n}` | `transform: rotateX({n}deg)` |
| `rotate-y-{n}` | `transform: rotateY({n}deg)` |
| `rotate-z-{n}` | Same as `rotate-{n}` |

### 3D Scale

| Class | CSS |
|-------|-----|
| `scale-z-{n}` | `transform: scaleZ({n/100})` |

### 3D Translate

| Class | CSS |
|-------|-----|
| `translate-z-{n}` | `transform: translateZ({spacing})` |

### Perspective

| Class | CSS |
|-------|-----|
| `perspective-none` | `perspective: none` |
| `perspective-dramatic` | `perspective: 100px` |
| `perspective-near` | `perspective: 300px` |
| `perspective-normal` | `perspective: 500px` |
| `perspective-midrange` | `perspective: 800px` |
| `perspective-distant` | `perspective: 1200px` |
| `perspective-[{value}]` | Custom perspective |
| `perspective-origin-center` | `perspective-origin: center` |
| `perspective-origin-top` | `perspective-origin: top` |
| (etc.) | Same as transform-origin variants |

### Transform Style

| Class | CSS |
|-------|-----|
| `transform-3d` | `transform-style: preserve-3d` |
| `transform-flat` | `transform-style: flat` |

### Backface Visibility

| Class | CSS |
|-------|-----|
| `backface-visible` | `backface-visibility: visible` |
| `backface-hidden` | `backface-visibility: hidden` |

### 3D Card Flip Example

```html
<div class="group perspective-midrange">
  <div class="relative w-64 h-40 transform-3d transition-transform duration-500 group-hover:rotate-y-180">
    <!-- Front -->
    <div class="absolute inset-0 backface-hidden bg-white rounded-xl shadow-md flex items-center justify-center">
      Front
    </div>
    <!-- Back -->
    <div class="absolute inset-0 backface-hidden rotate-y-180 bg-blue-600 text-white rounded-xl shadow-md flex items-center justify-center">
      Back
    </div>
  </div>
</div>
```

## Animations

### Built-in Animations

| Class | Effect |
|-------|--------|
| `animate-spin` | Continuous 360° rotation (loading spinners) |
| `animate-ping` | Scale up + fade out (notification dot) |
| `animate-pulse` | Fade in/out (skeleton loading) |
| `animate-bounce` | Bounce up/down (scroll indicator) |
| `animate-none` | Remove animation |

### Custom Animations via `@theme`

```css
@theme {
  --animate-fade-in: fade-in 0.3s ease-out;
  --animate-slide-up: slide-up 0.4s ease-out;
  --animate-scale-in: scale-in 0.2s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
```

Usage: `class="animate-fade-in"`, `class="animate-slide-up"`, `class="animate-scale-in"`

### Motion Preferences

```html
<div class="animate-bounce motion-reduce:animate-none">
  Respects reduced motion preference
</div>

<div class="transition-transform motion-safe:hover:-translate-y-1">
  Only animates if user allows motion
</div>
```

## Common Interaction Patterns

### Hover Lift

```html
<div class="transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
  Lifts on hover
</div>
```

### Scale on Click

```html
<button class="transition-transform duration-100 active:scale-95">
  Press effect
</button>
```

### Hover Scale

```html
<div class="transition-transform duration-200 hover:scale-105">
  Grows on hover
</div>
```

### Combined Hover Effect

```html
<a class="
  group relative inline-block
  transition-all duration-200
  hover:-translate-y-0.5 hover:shadow-md
  active:translate-y-0 active:shadow-sm
">
  <span class="transition-colors duration-200 group-hover:text-blue-600">
    Interactive link
  </span>
</a>
```

### Loading Spinner

```html
<svg class="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
</svg>
```

### Notification Dot

```html
<span class="relative flex size-3">
  <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
  <span class="relative inline-flex size-3 rounded-full bg-sky-500"></span>
</span>
```

## Will-Change

| Class | CSS |
|-------|-----|
| `will-change-auto` | `will-change: auto` |
| `will-change-scroll` | `will-change: scroll-position` |
| `will-change-contents` | `will-change: contents` |
| `will-change-transform` | `will-change: transform` |

> Use sparingly — only when you observe jank. Remove after animation completes.
