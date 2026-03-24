# Component Libraries

## Decision Matrix

| Library | Type | Styling | Framework | Best For |
|---------|------|---------|-----------|----------|
| **shadcn/ui** | Copy-paste components | Tailwind + Radix | React | Full control, custom design systems |
| **DaisyUI** | Plugin + class-based | Tailwind plugin | Any | Rapid prototyping, pre-built themes |
| **Headless UI** | Unstyled (accessible) | BYO (Tailwind) | React, Vue | Custom design + accessibility |
| **Flowbite** | Pre-styled + Tailwind | Tailwind classes | Any (vanilla, React, Vue) | Quick dashboards, admin panels |
| **Preline** | Pre-styled + Tailwind | Tailwind classes | Any | Marketing sites, landing pages |
| **HyperUI** | Copy-paste snippets | Tailwind classes | Any | Quick Tailwind components |
| **@tailwindcss/typography** | Plugin | Tailwind plugin | Any | Prose/article content styling |

## shadcn/ui

Not a component library — a collection of reusable components you copy into your project.

### Setup

```bash
npx shadcn@latest init
```

Configuration prompts:
- Style: Default / New York
- Base color: Slate / Gray / Zinc / Neutral / Stone
- CSS variables for colors: Yes

### Adding Components

```bash
npx shadcn@latest add button
npx shadcn@latest add card dialog input
npx shadcn@latest add --all  # Add everything
```

Components are copied to `src/components/ui/` (configurable).

### Theming

shadcn/ui uses CSS variables defined in your global CSS:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark values */
  }
}
```

### Usage

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default">Click me</Button>
        <Button variant="outline">Cancel</Button>
      </CardContent>
    </Card>
  );
}
```

## DaisyUI

Tailwind CSS plugin with semantic class names and built-in themes.

### Install

```bash
npm install daisyui
```

```css
@plugin "daisyui";
```

Or with v3-style config:

```js
// tailwind.config.js
module.exports = {
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark", "cupcake", "business"],
    darkTheme: "dark",
  },
};
```

### Theme Configuration

```html
<html data-theme="cupcake">
```

### Component Examples

```html
<!-- Button -->
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary btn-outline">Outline</button>
<button class="btn btn-sm">Small</button>

<!-- Card -->
<div class="card bg-base-100 shadow-xl">
  <figure><img src="..." alt="" /></figure>
  <div class="card-body">
    <h2 class="card-title">Title</h2>
    <p>Description</p>
    <div class="card-actions justify-end">
      <button class="btn btn-primary">Action</button>
    </div>
  </div>
</div>

<!-- Modal -->
<dialog id="my_modal" class="modal">
  <div class="modal-box">
    <h3 class="text-lg font-bold">Title</h3>
    <p class="py-4">Content</p>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<!-- Navbar -->
<div class="navbar bg-base-100">
  <div class="navbar-start">
    <a class="btn btn-ghost text-xl">Brand</a>
  </div>
  <div class="navbar-end">
    <button class="btn btn-primary">Login</button>
  </div>
</div>
```

## Headless UI

Fully accessible, unstyled components for React and Vue.

### Install

```bash
npm install @headlessui/react
```

### Dialog Example

```tsx
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";

function MyDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-white">
        Open
      </button>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <DialogTitle className="text-lg font-semibold">Title</DialogTitle>
            <p className="mt-2 text-sm text-gray-600">Content goes here.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setIsOpen(false)} className="rounded-lg px-3 py-1.5 text-sm hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={() => setIsOpen(false)} className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700">
                Confirm
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
```

### Listbox (Select) Example

```tsx
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";

const people = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
];

function MyListbox() {
  const [selected, setSelected] = useState(people[0]);

  return (
    <Listbox value={selected} onChange={setSelected}>
      <ListboxButton className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm">
        {selected.name}
      </ListboxButton>
      <ListboxOptions className="mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5">
        {people.map((person) => (
          <ListboxOption
            key={person.id}
            value={person}
            className="cursor-pointer select-none px-3 py-2 text-sm data-[focus]:bg-blue-50 data-[selected]:font-semibold"
          >
            {person.name}
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}
```

## @tailwindcss/typography

Adds `prose` classes for beautiful typographic defaults on user-generated content.

### Install

```css
@plugin "@tailwindcss/typography";
```

### Usage

```html
<article class="prose lg:prose-xl dark:prose-invert max-w-none">
  <h1>Article Title</h1>
  <p>This content gets beautiful default styling...</p>
  <ul>
    <li>Lists are styled</li>
    <li>Links are colored</li>
  </ul>
  <pre><code>Code blocks too</code></pre>
</article>
```

### Prose Modifiers

| Class | Effect |
|-------|--------|
| `prose-sm` | Smaller body text |
| `prose-base` | Default size |
| `prose-lg` | Larger body text |
| `prose-xl` | Extra large body text |
| `prose-2xl` | Largest body text |
| `prose-invert` | Light text on dark backgrounds |
| `prose-gray` / `prose-slate` / `prose-zinc` | Color scheme |
| `max-w-none` | Remove default max-width |

### Overriding Prose Elements

```html
<article class="prose prose-headings:text-blue-900 prose-a:text-blue-600 prose-a:no-underline prose-img:rounded-xl">
  Content with customized element styles
</article>
```

Available element modifiers: `prose-headings`, `prose-h1` through `prose-h4`, `prose-p`, `prose-a`, `prose-blockquote`, `prose-figure`, `prose-figcaption`, `prose-strong`, `prose-em`, `prose-code`, `prose-pre`, `prose-ol`, `prose-ul`, `prose-li`, `prose-table`, `prose-thead`, `prose-tr`, `prose-th`, `prose-td`, `prose-img`, `prose-video`, `prose-hr`, `prose-lead`.
