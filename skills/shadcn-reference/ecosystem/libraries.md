# shadcn/ui Ecosystem Libraries

## Extension Libraries

### TanCN
- **URL**: github.com/san-gg/TanCN
- **Description**: TanStack Table integration components built on shadcn/ui
- **Features**: Pre-built data table with sorting, filtering, pagination, column visibility
- **Install**: Copy components from repo

### FormCN
- **URL**: github.com/formcn
- **Description**: Advanced form components extending shadcn Form
- **Features**: Multi-step forms, dynamic form arrays, conditional fields
- **Install**: Copy components from repo

### Kibo UI
- **URL**: kiboui.com
- **Description**: Extended component set built on shadcn/ui conventions
- **Features**: Additional components not in core shadcn (Timeline, Kanban, File Upload, etc.)
- **Install**: `npx kiboui add <component>`
- **Components**: Timeline, Kanban Board, File Upload, Code Block, Terminal, Tags Input, Tree View, Sortable List

### Emblor
- **URL**: github.com/JaleelB/emblor
- **Description**: Tag input component for shadcn/ui
- **Features**: Autocomplete, validation, custom rendering
- **Install**: `npx shadcn@latest add https://emblor.com/r/tag-input.json`

### Motion Primitives
- **URL**: motion-primitives.com
- **Description**: Animated components built with Framer Motion + shadcn/ui styling
- **Components**: Animated accordion, morphing dialog, blur fade, text effects, animated number, dock, spotlight cards
- **Install**: Copy from docs

### Aceternity UI
- **URL**: ui.aceternity.com
- **Description**: Animated/flashy components with Framer Motion
- **Components**: 3D card, spotlight, aurora background, meteors, infinite moving cards, text generate effect, wavy background
- **Install**: Copy from docs, requires framer-motion

### shadcn Expansions
- **URL**: shadcn-expansions.typeart.cc
- **Description**: Community-built components extending shadcn/ui
- **Components**: Multi-select, date range picker, file uploader, color picker, OTP input

### Origin UI
- **URL**: originui.com
- **Description**: Beautiful UI components built with Tailwind + shadcn
- **Features**: Large collection of copy-paste component variants and compositions

### Magic UI
- **URL**: magicui.design
- **Description**: Animated components for landing pages
- **Components**: Globe, confetti, animated grid, marquee, orbiting circles, animated beam, shimmer button
- **Install**: `npx shadcn@latest add https://magicui.design/r/<component>.json`

### Cult UI
- **URL**: cult-ui.com
- **Description**: Extended components with animations
- **Components**: Flyout, texture buttons, gradient text, floating panel

### Plate UI
- **URL**: platejs.org
- **Description**: Rich text editor built on shadcn/ui
- **Features**: Notion-like editor, plugins for mentions, tables, media, comments
- **Install**: `npx shadcn@latest add https://platejs.org/r/<component>.json`

## Component Libraries Comparison

| Library | Focus | Animation | Install Method | Radix-based |
|---------|-------|-----------|---------------|-------------|
| shadcn/ui | Core components | Minimal | CLI | Yes |
| Kibo UI | Extended components | Some | CLI | Yes |
| Motion Primitives | Animated components | Heavy | Copy | Partial |
| Aceternity UI | Landing page effects | Heavy | Copy | No |
| Magic UI | Animated marketing | Heavy | CLI | Partial |
| Origin UI | Component variants | Light | Copy | Yes |
| Plate UI | Rich text editor | Light | CLI | Yes |

## Utility Libraries Used by shadcn/ui

| Library | Purpose | Usage |
|---------|---------|-------|
| `class-variance-authority` (cva) | Variant management | Define component variants |
| `clsx` | Class name conditionals | Conditional class merging |
| `tailwind-merge` | Tailwind class dedup | Resolve conflicting utilities |
| `cmdk` | Command menu | Command palette primitive |
| `vaul` | Drawer | Bottom sheet primitive |
| `sonner` | Toasts | Toast notification system |
| `embla-carousel-react` | Carousel | Carousel primitive |
| `input-otp` | OTP input | OTP input primitive |
| `react-day-picker` | Calendar | Date picker primitive |
| `react-resizable-panels` | Resizable | Panel resize primitive |
| `recharts` | Charts | Charting library |
| `@tanstack/react-table` | Data table | Table headless UI |
