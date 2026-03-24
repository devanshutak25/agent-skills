# shadcn/ui Components

## Component Categories

### Layout & Containers
| Component | Description | Radix Primitive |
|-----------|-------------|-----------------|
| `Accordion` | Collapsible content sections | `@radix-ui/react-accordion` |
| `AspectRatio` | Maintain aspect ratio | `@radix-ui/react-aspect-ratio` |
| `Card` | Container with header, content, footer | None (custom) |
| `Collapsible` | Expand/collapse content | `@radix-ui/react-collapsible` |
| `Resizable` | Resizable panels | `react-resizable-panels` |
| `ScrollArea` | Custom scrollbar area | `@radix-ui/react-scroll-area` |
| `Separator` | Visual divider | `@radix-ui/react-separator` |
| `Tabs` | Tabbed content panels | `@radix-ui/react-tabs` |

### Forms & Inputs
| Component | Description | Radix Primitive |
|-----------|-------------|-----------------|
| `Button` | Clickable button with variants | None (custom) |
| `Calendar` | Date picker calendar | `react-day-picker` |
| `Checkbox` | Check/uncheck control | `@radix-ui/react-checkbox` |
| `DatePicker` | Date selection with popover | Calendar + Popover |
| `Form` | Form with validation (RHF + Zod) | `react-hook-form` |
| `Input` | Text input field | None (custom) |
| `InputOTP` | One-time password input | `input-otp` |
| `Label` | Form label | `@radix-ui/react-label` |
| `RadioGroup` | Radio button group | `@radix-ui/react-radio-group` |
| `Select` | Dropdown select | `@radix-ui/react-select` |
| `Slider` | Range slider | `@radix-ui/react-slider` |
| `Switch` | Toggle switch | `@radix-ui/react-switch` |
| `Textarea` | Multiline text input | None (custom) |
| `Toggle` | Toggle button | `@radix-ui/react-toggle` |
| `ToggleGroup` | Group of toggle buttons | `@radix-ui/react-toggle-group` |

### Data Display
| Component | Description | Radix Primitive |
|-----------|-------------|-----------------|
| `Avatar` | User avatar with fallback | `@radix-ui/react-avatar` |
| `Badge` | Status/label badge | None (custom) |
| `Chart` | Chart components | `recharts` |
| `DataTable` | Data table with sorting/filtering | `@tanstack/react-table` |
| `Table` | Basic HTML table wrapper | None (custom) |
| `Carousel` | Scrollable carousel | `embla-carousel-react` |
| `Skeleton` | Loading placeholder | None (custom) |

### Feedback & Status
| Component | Description | Radix Primitive |
|-----------|-------------|-----------------|
| `Alert` | Alert message | None (custom) |
| `AlertDialog` | Confirmation dialog | `@radix-ui/react-alert-dialog` |
| `Progress` | Progress bar | `@radix-ui/react-progress` |
| `Sonner` | Toast notifications | `sonner` |
| `Toast` | Toast notifications (legacy) | `@radix-ui/react-toast` |

### Navigation
| Component | Description | Radix Primitive |
|-----------|-------------|-----------------|
| `Breadcrumb` | Breadcrumb navigation | None (custom) |
| `Command` | Command palette / search | `cmdk` |
| `ContextMenu` | Right-click menu | `@radix-ui/react-context-menu` |
| `DropdownMenu` | Dropdown menu | `@radix-ui/react-dropdown-menu` |
| `Menubar` | Menu bar | `@radix-ui/react-menubar` |
| `NavigationMenu` | Site navigation | `@radix-ui/react-navigation-menu` |
| `Pagination` | Page navigation | None (custom) |
| `Sidebar` | App sidebar | None (custom) |

### Overlays
| Component | Description | Radix Primitive |
|-----------|-------------|-----------------|
| `Dialog` | Modal dialog | `@radix-ui/react-dialog` |
| `Drawer` | Bottom/side drawer | `vaul` |
| `HoverCard` | Hover popover card | `@radix-ui/react-hover-card` |
| `Popover` | Floating content | `@radix-ui/react-popover` |
| `Sheet` | Side panel overlay | `@radix-ui/react-dialog` |
| `Tooltip` | Hover tooltip | `@radix-ui/react-tooltip` |

## Key Component Variants

### Button
```tsx
import { Button } from "@/components/ui/button"
```

| Variant | Class | Description |
|---------|-------|-------------|
| `default` | Primary fill | Default action |
| `destructive` | Red fill | Destructive action |
| `outline` | Border only | Secondary action |
| `secondary` | Muted fill | Alternative action |
| `ghost` | No background | Subtle action |
| `link` | Text only | Inline link style |

| Size | Class | Dimensions |
|------|-------|------------|
| `default` | `h-9 px-4 py-2` | Standard |
| `sm` | `h-8 rounded-md px-3 text-xs` | Small |
| `lg` | `h-10 rounded-md px-8` | Large |
| `icon` | `h-9 w-9` | Icon-only |

```tsx
<Button variant="outline" size="sm">Click me</Button>
<Button asChild>
  <Link href="/login">Login</Link>
</Button>
```

### Badge
| Variant | Description |
|---------|-------------|
| `default` | Primary colored |
| `secondary` | Muted |
| `destructive` | Red |
| `outline` | Border only |

```tsx
<Badge variant="secondary">Status</Badge>
```

### Alert
| Variant | Description |
|---------|-------------|
| `default` | Standard alert |
| `destructive` | Error alert |

```tsx
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong.</AlertDescription>
</Alert>
```

## Adding Components
```bash
# Add single component
npx shadcn@latest add button

# Add multiple
npx shadcn@latest add button card dialog

# Add all components
npx shadcn@latest add --all

# Add with overwrite
npx shadcn@latest add button --overwrite
```

## Component Architecture
```
Your Project
├── components/
│   └── ui/          <- shadcn components live here
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
├── lib/
│   └── utils.ts     <- cn() utility
└── components.json  <- shadcn config
```

Components are **copied into your project** — you own them and can modify freely.
