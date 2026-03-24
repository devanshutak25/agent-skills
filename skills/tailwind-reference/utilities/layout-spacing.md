# Layout & Spacing

## Display & Visibility

| Class | CSS |
|-------|-----|
| `block` | `display: block` |
| `inline-block` | `display: inline-block` |
| `inline` | `display: inline` |
| `flex` | `display: flex` |
| `inline-flex` | `display: inline-flex` |
| `grid` | `display: grid` |
| `inline-grid` | `display: inline-grid` |
| `contents` | `display: contents` |
| `hidden` | `display: none` |
| `table` / `table-row` / `table-cell` | Table display modes |
| `visible` | `visibility: visible` |
| `invisible` | `visibility: hidden` |
| `collapse` | `visibility: collapse` |

## Flexbox

### Container

| Class | CSS |
|-------|-----|
| `flex` | `display: flex` |
| `flex-row` | `flex-direction: row` |
| `flex-row-reverse` | `flex-direction: row-reverse` |
| `flex-col` | `flex-direction: column` |
| `flex-col-reverse` | `flex-direction: column-reverse` |
| `flex-wrap` | `flex-wrap: wrap` |
| `flex-nowrap` | `flex-wrap: nowrap` |
| `flex-wrap-reverse` | `flex-wrap: wrap-reverse` |
| `justify-start` | `justify-content: flex-start` |
| `justify-center` | `justify-content: center` |
| `justify-end` | `justify-content: flex-end` |
| `justify-between` | `justify-content: space-between` |
| `justify-around` | `justify-content: space-around` |
| `justify-evenly` | `justify-content: space-evenly` |
| `items-start` | `align-items: flex-start` |
| `items-center` | `align-items: center` |
| `items-end` | `align-items: flex-end` |
| `items-baseline` | `align-items: baseline` |
| `items-stretch` | `align-items: stretch` |

### Children

| Class | CSS |
|-------|-----|
| `grow` | `flex-grow: 1` |
| `grow-0` | `flex-grow: 0` |
| `shrink` | `flex-shrink: 1` |
| `shrink-0` | `flex-shrink: 0` |
| `basis-{size}` | `flex-basis: {size}` |
| `flex-1` | `flex: 1 1 0%` |
| `flex-auto` | `flex: 1 1 auto` |
| `flex-initial` | `flex: 0 1 auto` |
| `flex-none` | `flex: none` |
| `self-auto` | `align-self: auto` |
| `self-start` | `align-self: flex-start` |
| `self-center` | `align-self: center` |
| `self-end` | `align-self: flex-end` |
| `self-stretch` | `align-self: stretch` |
| `order-{n}` | `order: {n}` |
| `order-first` | `order: -9999` |
| `order-last` | `order: 9999` |
| `order-none` | `order: 0` |

## Grid

### Container

| Class | CSS |
|-------|-----|
| `grid` | `display: grid` |
| `grid-cols-{n}` | `grid-template-columns: repeat(n, minmax(0, 1fr))` |
| `grid-cols-none` | `grid-template-columns: none` |
| `grid-cols-subgrid` | `grid-template-columns: subgrid` |
| `grid-rows-{n}` | `grid-template-rows: repeat(n, minmax(0, 1fr))` |
| `grid-rows-none` | `grid-template-rows: none` |
| `grid-rows-subgrid` | `grid-template-rows: subgrid` |
| `grid-flow-row` | `grid-auto-flow: row` |
| `grid-flow-col` | `grid-auto-flow: column` |
| `grid-flow-dense` | `grid-auto-flow: dense` |
| `auto-cols-auto` | `grid-auto-columns: auto` |
| `auto-cols-min` | `grid-auto-columns: min-content` |
| `auto-cols-max` | `grid-auto-columns: max-content` |
| `auto-cols-fr` | `grid-auto-columns: minmax(0, 1fr)` |

### Children

| Class | CSS |
|-------|-----|
| `col-span-{n}` | `grid-column: span n / span n` |
| `col-span-full` | `grid-column: 1 / -1` |
| `col-start-{n}` | `grid-column-start: n` |
| `col-end-{n}` | `grid-column-end: n` |
| `row-span-{n}` | `grid-row: span n / span n` |
| `row-span-full` | `grid-row: 1 / -1` |
| `row-start-{n}` | `grid-row-start: n` |
| `row-end-{n}` | `grid-row-end: n` |

### Gap

| Class | CSS |
|-------|-----|
| `gap-{n}` | `gap: {spacing}` |
| `gap-x-{n}` | `column-gap: {spacing}` |
| `gap-y-{n}` | `row-gap: {spacing}` |

### Alignment (Grid & Flex)

| Class | CSS |
|-------|-----|
| `place-content-center` | `place-content: center` |
| `place-items-center` | `place-items: center` |
| `place-self-center` | `place-self: center` |
| `content-start` | `align-content: flex-start` |
| `content-center` | `align-content: center` |
| `content-end` | `align-content: flex-end` |
| `content-between` | `align-content: space-between` |

## Spacing Scale

| Class | Value | Pixels |
|-------|-------|--------|
| `{p/m}-0` | `0` | 0px |
| `{p/m}-px` | `1px` | 1px |
| `{p/m}-0.5` | `0.125rem` | 2px |
| `{p/m}-1` | `0.25rem` | 4px |
| `{p/m}-1.5` | `0.375rem` | 6px |
| `{p/m}-2` | `0.5rem` | 8px |
| `{p/m}-2.5` | `0.625rem` | 10px |
| `{p/m}-3` | `0.75rem` | 12px |
| `{p/m}-3.5` | `0.875rem` | 14px |
| `{p/m}-4` | `1rem` | 16px |
| `{p/m}-5` | `1.25rem` | 20px |
| `{p/m}-6` | `1.5rem` | 24px |
| `{p/m}-7` | `1.75rem` | 28px |
| `{p/m}-8` | `2rem` | 32px |
| `{p/m}-9` | `2.25rem` | 36px |
| `{p/m}-10` | `2.5rem` | 40px |
| `{p/m}-11` | `2.75rem` | 44px |
| `{p/m}-12` | `3rem` | 48px |
| `{p/m}-14` | `3.5rem` | 56px |
| `{p/m}-16` | `4rem` | 64px |
| `{p/m}-20` | `5rem` | 80px |
| `{p/m}-24` | `6rem` | 96px |
| `{p/m}-28` | `7rem` | 112px |
| `{p/m}-32` | `8rem` | 128px |
| `{p/m}-36` | `9rem` | 144px |
| `{p/m}-40` | `10rem` | 160px |
| `{p/m}-44` | `11rem` | 176px |
| `{p/m}-48` | `12rem` | 192px |
| `{p/m}-52` | `13rem` | 208px |
| `{p/m}-56` | `14rem` | 224px |
| `{p/m}-60` | `15rem` | 240px |
| `{p/m}-64` | `16rem` | 256px |
| `{p/m}-72` | `18rem` | 288px |
| `{p/m}-80` | `20rem` | 320px |
| `{p/m}-96` | `24rem` | 384px |

### Spacing Shorthands

| Prefix | Sides |
|--------|-------|
| `p-` / `m-` | All sides |
| `px-` / `mx-` | Left + right (inline) |
| `py-` / `my-` | Top + bottom (block) |
| `pt-` / `mt-` | Top |
| `pr-` / `mr-` | Right |
| `pb-` / `mb-` | Bottom |
| `pl-` / `ml-` | Left |
| `ps-` / `ms-` | Inline-start (logical) |
| `pe-` / `me-` | Inline-end (logical) |

### Negative Margins

```html
<div class="-mt-4 -mx-6">Negative margins</div>
```

### Space Between

```html
<div class="flex flex-col space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

> Prefer `gap-*` over `space-*` when using flex/grid.

## Sizing

| Class | CSS |
|-------|-----|
| `w-{n}` | `width: {spacing}` |
| `w-auto` | `width: auto` |
| `w-full` | `width: 100%` |
| `w-screen` | `width: 100vw` |
| `w-svw` | `width: 100svw` |
| `w-dvw` | `width: 100dvw` |
| `w-min` | `width: min-content` |
| `w-max` | `width: max-content` |
| `w-fit` | `width: fit-content` |
| `w-1/2` | `width: 50%` |
| `w-1/3` / `w-2/3` | `width: 33.33%` / `66.67%` |
| `w-1/4` / `w-3/4` | `width: 25%` / `75%` |
| `h-{n}` | `height: {spacing}` |
| `h-auto` / `h-full` / `h-screen` | Same pattern as width |
| `h-svh` / `h-dvh` | `100svh` / `100dvh` |
| `size-{n}` | `width: {spacing}; height: {spacing}` |
| `size-full` | `width: 100%; height: 100%` |
| `min-w-{n}` / `max-w-{n}` | Min/max width |
| `min-h-{n}` / `max-h-{n}` | Min/max height |

### Max-Width Scale

| Class | Value |
|-------|-------|
| `max-w-xs` | `20rem` (320px) |
| `max-w-sm` | `24rem` (384px) |
| `max-w-md` | `28rem` (448px) |
| `max-w-lg` | `32rem` (512px) |
| `max-w-xl` | `36rem` (576px) |
| `max-w-2xl` | `42rem` (672px) |
| `max-w-3xl` | `48rem` (768px) |
| `max-w-4xl` | `56rem` (896px) |
| `max-w-5xl` | `64rem` (1024px) |
| `max-w-6xl` | `72rem` (1152px) |
| `max-w-7xl` | `80rem` (1280px) |
| `max-w-prose` | `65ch` |
| `max-w-screen-sm/md/lg/xl/2xl` | Breakpoint values |

## Positioning

| Class | CSS |
|-------|-----|
| `static` | `position: static` |
| `relative` | `position: relative` |
| `absolute` | `position: absolute` |
| `fixed` | `position: fixed` |
| `sticky` | `position: sticky` |
| `inset-{n}` | `inset: {spacing}` (all sides) |
| `inset-x-{n}` | `left: {spacing}; right: {spacing}` |
| `inset-y-{n}` | `top: {spacing}; bottom: {spacing}` |
| `top-{n}` / `right-{n}` / `bottom-{n}` / `left-{n}` | Individual sides |
| `start-{n}` / `end-{n}` | Logical (inline-start/end) |
| `z-{n}` | `z-index: {n}` (0, 10, 20, 30, 40, 50) |
| `z-auto` | `z-index: auto` |

## Overflow

| Class | CSS |
|-------|-----|
| `overflow-auto` | `overflow: auto` |
| `overflow-hidden` | `overflow: hidden` |
| `overflow-visible` | `overflow: visible` |
| `overflow-scroll` | `overflow: scroll` |
| `overflow-clip` | `overflow: clip` |
| `overflow-x-auto` / `overflow-y-auto` | Per-axis |
| `overscroll-auto` / `overscroll-contain` / `overscroll-none` | Overscroll behavior |

## Aspect Ratio

| Class | CSS |
|-------|-----|
| `aspect-auto` | `aspect-ratio: auto` |
| `aspect-square` | `aspect-ratio: 1 / 1` |
| `aspect-video` | `aspect-ratio: 16 / 9` |
| `aspect-[4/3]` | `aspect-ratio: 4 / 3` |
