# UI Component Libraries

## Decision Matrix

| Library | Approach | Styling | Bundle | Best For |
|---------|----------|---------|--------|----------|
| **shadcn/ui** | Copy-paste, Radix-based | Tailwind | 0 (your code) | Most new projects |
| **Radix UI** | Headless primitives | BYO | ~varies per component | Building custom design systems |
| **MUI** | Pre-styled (Material) | Emotion/CSS | ~100-200 kB | Material Design apps, rapid prototyping |
| **Mantine** | Pre-styled, full toolkit | CSS Modules | ~50+ kB | Dashboards, SaaS admin panels |
| **Headless UI** | Headless primitives | BYO | ~10 kB | Tailwind CSS projects (simpler than Radix) |
| **Ark UI** | Headless, state machines | BYO | ~varies | Predictable behavior, multiple frameworks |

---

## shadcn/ui (Recommended Default)

Not a package — components are copied into your codebase. Full ownership.

```bash
npx shadcn@latest init
npx shadcn@latest add button dialog table form
```

```tsx
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open</Button>
      </DialogTrigger>
      <DialogContent>
        <Input placeholder="Search..." />
      </DialogContent>
    </Dialog>
  );
}
```

### What's Inside
- Built on **Radix UI** primitives (accessible, unstyled)
- Styled with **Tailwind CSS** + **cva** (class-variance-authority)
- Fully customizable — edit the source in `components/ui/`
- Includes: Button, Dialog, Dropdown, Select, Table, Form, Toast, Sheet, Command palette, etc.
- Dark mode support via CSS variables

### Theme Customization
```css
/* globals.css — CSS variables control the entire theme */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... */
  }
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}
```

---

## Radix UI

Headless, accessible primitives — no styling.

```bash
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
```

```tsx
import * as Dialog from '@radix-ui/react-dialog';

function MyDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded">
          <Dialog.Title>Edit Profile</Dialog.Title>
          <Dialog.Description>Make changes to your profile.</Dialog.Description>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

**Radix Themes**: Pre-styled layer on top of primitives.
```bash
npm install @radix-ui/themes
```

**Note (2026):** Radix UI primitives have reduced maintenance activity. Monitor for alternatives if building new design systems.

---

## MUI (Material UI)

```bash
npm install @mui/material @emotion/react @emotion/styled
```

```tsx
import { Button, TextField, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#3b82f6' },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Button variant="contained" color="primary">Submit</Button>
      <TextField label="Email" variant="outlined" />
    </ThemeProvider>
  );
}
```

**Pros:** 100+ components, mature, massive community, extensive docs
**Cons:** Large bundle, Material Design aesthetic requires effort to customize, Emotion runtime CSS

---

## Mantine

```bash
npm install @mantine/core @mantine/hooks @mantine/form @mantine/notifications
```

```tsx
import { MantineProvider, Button, TextInput, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';

function App() {
  const [opened, { open, close }] = useDisclosure(false);
  const form = useForm({
    initialValues: { email: '' },
    validate: { email: (v) => (/^\S+@\S+$/.test(v) ? null : 'Invalid email') },
  });

  return (
    <MantineProvider>
      <Button onClick={open}>Open Modal</Button>
      <Modal opened={opened} onClose={close} title="Sign Up">
        <form onSubmit={form.onSubmit(console.log)}>
          <TextInput label="Email" {...form.getInputProps('email')} />
          <Button type="submit">Submit</Button>
        </form>
      </Modal>
    </MantineProvider>
  );
}
```

**Pros:** 100+ components + hooks + form + notifications all-in-one, CSS Modules (no runtime CSS), great DX
**Cons:** Opinionated styling, smaller community than MUI

---

## Headless UI (Tailwind Labs)

```bash
npm install @headlessui/react
```

```tsx
import { Dialog, DialogPanel, Transition } from '@headlessui/react';

function MyDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Transition show={isOpen}>
      <Dialog onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-white rounded-lg p-6 max-w-md">
            <h2>Deactivate account?</h2>
            <button onClick={onClose}>Cancel</button>
          </DialogPanel>
        </div>
      </Dialog>
    </Transition>
  );
}
```

Fewer components than Radix but simpler API. Good for Tailwind projects needing basics (Dialog, Listbox, Combobox, Menu, Tabs, etc.).

---

## Choosing Guide

```
Building a new product with Tailwind?     → shadcn/ui
Building a custom design system?          → Radix UI primitives
Need Material Design / Google look?       → MUI
Building SaaS dashboard / admin?          → Mantine
Simple Tailwind project, few components?  → Headless UI
Need multiple framework support?          → Ark UI
```
