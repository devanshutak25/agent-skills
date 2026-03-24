---
name: tailwind-reference
description: Comprehensive Tailwind CSS v4 reference — CSS-first configuration, utility classes, theme system, component patterns, ecosystem libraries, migration. Auto-triggers when working on Tailwind CSS code.
trigger: When the user is working with Tailwind CSS, styling components with utility classes, or configuring Tailwind
---

# Tailwind CSS v4 Reference Skill

Comprehensive, up-to-date Tailwind CSS v4 development reference. Split into focused files for targeted loading.

## File Index

### Core (`core/`)
| File | Contents |
|------|----------|
| [setup-config.md](core/setup-config.md) | Installation (Vite/PostCSS/CLI/CDN), source detection, @source, @config |
| [directives-functions.md](core/directives-functions.md) | @theme, @utility, @variant, @custom-variant, @apply, @reference, @plugin, functions |
| [theme-system.md](core/theme-system.md) | @theme namespaces, CSS variables, oklch colors, token overrides, runtime theming |
| [dark-mode-responsive.md](core/dark-mode-responsive.md) | Dark mode strategies, breakpoints, container queries, custom breakpoints |

### Utilities (`utilities/`)
| File | Contents |
|------|----------|
| [layout-spacing.md](utilities/layout-spacing.md) | Display, flex, grid, padding, margin, sizing, position, overflow |
| [typography-colors.md](utilities/typography-colors.md) | Font size/weight/family, text utilities, color palette, gradients, opacity |
| [borders-effects.md](utilities/borders-effects.md) | Border-radius, borders, outline, ring, shadows, filters, opacity |
| [transforms-transitions.md](utilities/transforms-transitions.md) | Transitions, 2D/3D transforms, animations, interaction patterns |

### Patterns (`patterns/`)
| File | Contents |
|------|----------|
| [component-patterns.md](patterns/component-patterns.md) | cn()/cva setup, component recipes, group/peer/has-*, container queries |
| [customization.md](patterns/customization.md) | Arbitrary values, @layer, design system setup, @source safelist, @plugin |
| [migration-v3-v4.md](patterns/migration-v3-v4.md) | Automated upgrade, config migration table, renamed utilities, compat shims |

### Ecosystem (`ecosystem/`)
| File | Contents |
|------|----------|
| [component-libraries.md](ecosystem/component-libraries.md) | shadcn/ui, DaisyUI, Headless UI, Flowbite, Preline, @tailwindcss/typography |
| [tooling.md](ecosystem/tooling.md) | prettier-plugin, tailwind-merge, clsx, cva, VS Code, starter templates |

## Usage

When assisting with Tailwind CSS development:
1. Load relevant file(s) based on the task domain
2. Follow v4 CSS-first configuration patterns — no `tailwind.config.js` by default
3. Use `@theme` for design tokens, not JavaScript config
4. Reference utility class names and modifier syntax from utility files
5. Recommend ecosystem tools from ecosystem files when applicable

## Version Info
- Tailwind CSS: 4.x (v4.2 current)
- Last updated: 2026-03
