---
name: shadcn-reference
description: Comprehensive shadcn/ui reference — components, CLI, theming, patterns (forms, tables, charts, navigation), registry system, ecosystem libraries, blocks, templates. Auto-triggers when working with shadcn/ui.
trigger: When the user is working with shadcn/ui, adding shadcn components, configuring components.json, or building UI with Radix-based components
---

# shadcn/ui Reference Skill

Comprehensive, up-to-date shadcn/ui development reference. Split into focused files for targeted loading.

## File Index

### Core (`core/`)
| File | Contents |
|------|----------|
| [installation.md](core/installation.md) | Framework setup (Next.js, Vite, Remix, Astro, Laravel, TanStack…), CLI init, components.json schema |
| [theming.md](core/theming.md) | CSS variables, OKLCH colors, dark mode, base color presets, chart colors |
| [components.md](core/components.md) | All 74 components by category, variant/size tables, prop patterns |
| [cli.md](core/cli.md) | CLI commands (init, add, build, migrate), options, migration paths |

### Patterns (`patterns/`)
| File | Contents |
|------|----------|
| [forms.md](patterns/forms.md) | React Hook Form + Zod integration, FormField composition, validation |
| [data-tables.md](patterns/data-tables.md) | TanStack Table integration, column defs, sorting, filtering, pagination |
| [navigation.md](patterns/navigation.md) | Sidebar component tree, Combobox, Command palette, breadcrumbs |
| [charts.md](patterns/charts.md) | Recharts integration, ChartConfig, ChartContainer, chart types |
| [feedback.md](patterns/feedback.md) | Sonner toast API, Dialog, Sheet, Alert patterns |
| [composition.md](patterns/composition.md) | CVA variants, asChild prop, accessibility, component layering |

### Ecosystem (`ecosystem/`)
| File | Contents |
|------|----------|
| [libraries.md](ecosystem/libraries.md) | TanCN, FormCN, Kibo UI, Emblor, Motion Primitives, Aceternity UI |
| [blocks-templates.md](ecosystem/blocks-templates.md) | Official blocks, ShadcnBlocks, Shadcn Studio, starter kits |
| [tools-platforms.md](ecosystem/tools-platforms.md) | Figma plugins, Lucide icons, awesome-shadcn-ui, platforms |

### Config (`config/`)
| File | Contents |
|------|----------|
| [registry.md](config/registry.md) | Registry system, registry.json schema, custom registries, build flow |
| [monorepo.md](config/monorepo.md) | Turborepo setup, workspace config, Base UI vs Radix comparison |

## Usage

When assisting with shadcn/ui development:
1. Load relevant file(s) based on the task domain
2. Follow copy-paste component model — components are owned by the project, not installed as dependencies
3. Use `npx shadcn@latest add <component>` for adding components
4. Reference CSS variable theming from `core/theming.md` for customization
5. Use pattern files for complex integrations (forms, tables, charts)
6. Check `config/registry.md` for custom component distribution

## Key Concepts

- **Not a component library** — shadcn/ui is a collection of reusable components you copy into your project
- **Built on Radix UI** — accessible primitives with shadcn styling layer
- **Styled with Tailwind CSS** — uses CSS variables + Tailwind utility classes
- **CLI-driven** — `npx shadcn@latest` manages component scaffolding
- **Registry system** — distribute custom components via registries

## Version Info

- shadcn/ui: Latest (Feb 2026)
- Built on: Radix UI primitives
- Styling: Tailwind CSS v4 compatible
- CLI: `shadcn@latest`
