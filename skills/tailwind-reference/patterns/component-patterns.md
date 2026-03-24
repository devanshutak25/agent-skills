# Component Patterns

## `cn()` Utility — Required Setup

Combines `clsx` (conditional classes) with `tailwind-merge` (conflict resolution):

```bash
npm install clsx tailwind-merge
```

```ts
// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Usage:

```tsx
import { cn } from "@/lib/utils";

function Button({ className, variant, ...props }) {
  return (
    <button
      className={cn(
        "rounded-lg px-4 py-2 font-semibold transition-colors",
        variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700",
        variant === "secondary" && "bg-gray-100 text-gray-900 hover:bg-gray-200",
        className // allows consumer override
      )}
      {...props}
    />
  );
}
```

## `cva` — Class Variance Authority

Type-safe variant-based component styling:

```bash
npm install class-variance-authority
```

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
        ghost: "hover:bg-gray-100 hover:text-gray-900",
        link: "text-blue-600 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
```

## Component Recipes

### Card

```html
<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
  <h3 class="text-lg font-semibold text-gray-900">Title</h3>
  <p class="mt-2 text-sm text-gray-600">Description text</p>
  <div class="mt-4 flex gap-2">
    <button class="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
      Action
    </button>
  </div>
</div>
```

### Badge

```html
<span class="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-600/20 ring-inset">
  Badge
</span>

<!-- Variants -->
<span class="... bg-green-50 text-green-700 ring-green-600/20">Success</span>
<span class="... bg-red-50 text-red-700 ring-red-600/20">Error</span>
<span class="... bg-yellow-50 text-yellow-700 ring-yellow-600/20">Warning</span>
```

### Input

```html
<input
  type="text"
  placeholder="Enter text..."
  class="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
/>

<!-- With label and error -->
<div>
  <label class="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
  <input class="... border-red-500 focus:border-red-500 focus:ring-red-500/20" />
  <p class="mt-1 text-sm text-red-600">Invalid email address</p>
</div>
```

### Alert

```html
<div class="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4" role="alert">
  <svg class="size-5 shrink-0 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
    <!-- info icon -->
  </svg>
  <div>
    <h4 class="text-sm font-medium text-blue-800">Information</h4>
    <p class="mt-1 text-sm text-blue-700">This is an informational alert message.</p>
  </div>
</div>
```

### Avatar

```html
<!-- Image avatar -->
<img class="size-10 rounded-full object-cover" src="..." alt="User" />

<!-- Initials avatar -->
<div class="flex size-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
  JD
</div>

<!-- Avatar group -->
<div class="flex -space-x-2">
  <img class="size-8 rounded-full ring-2 ring-white" src="..." alt="" />
  <img class="size-8 rounded-full ring-2 ring-white" src="..." alt="" />
  <img class="size-8 rounded-full ring-2 ring-white" src="..." alt="" />
  <div class="flex size-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600 ring-2 ring-white">
    +3
  </div>
</div>
```

## State Variant Stacking

Order of state variants (innermost to outermost):

```html
<button class="
  bg-blue-500
  hover:bg-blue-600
  focus:ring-2
  active:bg-blue-700
  disabled:opacity-50 disabled:pointer-events-none
  dark:bg-blue-400 dark:hover:bg-blue-500
  sm:px-6 sm:py-3
">
  Button
</button>
```

Recommended stacking order:
1. Base styles
2. `hover:` / `focus:` / `active:` / `disabled:`
3. `dark:` and `dark:hover:` etc.
4. Responsive (`sm:`, `md:`, `lg:`)
5. Container queries (`@sm:`, `@md:`)

## Group & Peer Patterns

### Group — Parent State Affects Children

```html
<a class="group flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50" href="#">
  <div class="rounded-lg bg-gray-100 p-2 group-hover:bg-blue-100">
    <svg class="size-5 text-gray-600 group-hover:text-blue-600" />
  </div>
  <div>
    <p class="font-medium text-gray-900 group-hover:text-blue-600">Link text</p>
    <p class="text-sm text-gray-500">Description</p>
  </div>
</a>
```

### Named Groups

```html
<div class="group/card">
  <div class="group/button">
    <span class="group-hover/card:text-blue-500 group-hover/button:text-red-500">
      Responds to different group ancestors
    </span>
  </div>
</div>
```

### Peer — Sibling State Affects Later Siblings

```html
<div>
  <input type="checkbox" class="peer sr-only" id="toggle" />
  <label for="toggle" class="cursor-pointer peer-checked:text-blue-600">
    Toggle label
  </label>
  <div class="hidden peer-checked:block mt-2">
    Content shown when checked
  </div>
</div>
```

### Form Validation with Peer

```html
<div>
  <input type="email" required class="peer border rounded-lg px-3 py-2 invalid:border-red-500" />
  <p class="hidden text-sm text-red-600 peer-invalid:block mt-1">
    Please enter a valid email
  </p>
</div>
```

## `has-*` and `not-*` Variants

### `has-*` — Style Parent Based on Child State

```html
<!-- Highlight container when child checkbox is checked -->
<label class="flex items-center gap-3 rounded-lg border p-4 has-checked:border-blue-500 has-checked:bg-blue-50">
  <input type="checkbox" class="accent-blue-600" />
  <span>Option label</span>
</label>
```

### `not-*` — Style When Condition is False

```html
<div class="not-has-checked:opacity-50">
  Only full opacity when a child is checked
</div>

<button class="not-disabled:hover:bg-blue-600">
  Only hover effect when not disabled
</button>
```

### `has-*` with Selectors

```html
<!-- Style based on child element type -->
<div class="has-[img]:grid has-[img]:grid-cols-2">
  Content layout changes when an img is present
</div>

<!-- Based on child state -->
<fieldset class="has-[input:focus]:ring-2 has-[input:focus]:ring-blue-500 rounded-lg border p-4">
  <input type="text" class="border-none focus:outline-none" />
</fieldset>
```

## Container Query Component Pattern

Build components that adapt to their container, not the viewport:

```tsx
function ProductCard() {
  return (
    <div className="@container">
      <article className="flex flex-col gap-3 @sm:flex-row @sm:gap-4">
        <img
          className="w-full rounded-lg object-cover aspect-video @sm:w-32 @sm:aspect-square @md:w-48"
          src="..."
          alt=""
        />
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-sm @sm:text-base @md:text-lg">
            Product Name
          </h3>
          <p className="text-gray-600 text-xs @sm:text-sm line-clamp-2 @md:line-clamp-3">
            Description
          </p>
          <p className="font-bold text-blue-600 @md:text-lg">$99.99</p>
        </div>
      </article>
    </div>
  );
}
```
