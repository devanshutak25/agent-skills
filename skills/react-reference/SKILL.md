---
name: react-reference
description: Comprehensive React 19 reference — core APIs, hooks, ecosystem libraries, meta-frameworks, patterns, templates. Auto-triggers when working on React code.
trigger: When the user is working with React, Next.js, Remix, or any React-based framework
---

# React Reference Skill

Comprehensive, up-to-date React development reference. Split into focused files for targeted loading.

## File Index

### Core (`core/`)
| File | Contents |
|------|----------|
| [react-19-api.md](core/react-19-api.md) | React 19 new APIs: `use`, `cache`, Actions, metadata, asset preloading, ref-as-prop |
| [hooks-builtin.md](core/hooks-builtin.md) | All built-in hooks with signatures, types, and usage patterns |
| [server-components.md](core/server-components.md) | RSC model, `'use client'`/`'use server'`, streaming, async components |
| [react-compiler.md](core/react-compiler.md) | React Compiler setup, auto-memoization, what it replaces |
| [suspense-transitions.md](core/suspense-transitions.md) | Suspense, useTransition, useDeferredValue, streaming SSR |
| [error-boundaries.md](core/error-boundaries.md) | Error boundaries, onCaughtError/onUncaughtError, error handling patterns |
| [refs-dom.md](core/refs-dom.md) | Refs, ref cleanup, useImperativeHandle, portals, flushSync |
| [context-patterns.md](core/context-patterns.md) | Context API, `<Context>` as provider (R19), performance patterns |

### Libraries (`libraries/`)
| File | Contents |
|------|----------|
| [state-management.md](libraries/state-management.md) | Zustand, Jotai, Redux Toolkit, Valtio, MobX |
| [data-fetching.md](libraries/data-fetching.md) | TanStack Query v5, SWR, Apollo, tRPC, RTK Query |
| [routing.md](libraries/routing.md) | React Router v7, TanStack Router, Wouter |
| [forms-validation.md](libraries/forms-validation.md) | React Hook Form, Zod, Valibot, Conform |
| [ui-components.md](libraries/ui-components.md) | shadcn/ui, Radix, MUI, Mantine, Headless UI, Ark UI |
| [animation.md](libraries/animation.md) | Motion (Framer Motion), React Spring, GSAP, auto-animate |
| [testing.md](libraries/testing.md) | Vitest, React Testing Library, Playwright, MSW, Cypress |
| [styling.md](libraries/styling.md) | Tailwind v4, CSS Modules, Panda CSS, StyleX, Vanilla Extract |
| [auth.md](libraries/auth.md) | Auth.js v5, Clerk, Supabase Auth, Firebase Auth |
| [tables-lists.md](libraries/tables-lists.md) | TanStack Table, AG Grid, TanStack Virtual, react-virtuoso |
| [drag-drop.md](libraries/drag-drop.md) | dnd-kit, pragmatic-drag-and-drop, Swapy |
| [dates-i18n.md](libraries/dates-i18n.md) | date-fns, dayjs, react-intl, i18next, next-intl |
| [charts-viz.md](libraries/charts-viz.md) | Recharts, Nivo, D3, Tremor, visx |

### Meta-Frameworks (`meta-frameworks/`)
| File | Contents |
|------|----------|
| [nextjs.md](meta-frameworks/nextjs.md) | Next.js 15 App Router, server actions, caching, Turbopack |
| [remix.md](meta-frameworks/remix.md) | React Router 7 framework mode, loaders/actions |
| [vite-react.md](meta-frameworks/vite-react.md) | Vite + React setup, plugins, SSR, optimization |
| [astro-react.md](meta-frameworks/astro-react.md) | Astro islands, `client:*` directives, hybrid rendering |

### Templates (`templates/`)
| File | Contents |
|------|----------|
| [starter-templates.md](templates/starter-templates.md) | Official + community starters, T3 Stack, Epic Stack |
| [project-structures.md](templates/project-structures.md) | Feature-based, layer-based, route-based, monorepo layouts |

### Patterns (`patterns/`)
| File | Contents |
|------|----------|
| [component-patterns.md](patterns/component-patterns.md) | Compound, polymorphic, headless, slots, composition |
| [performance-patterns.md](patterns/performance-patterns.md) | Code splitting, lazy loading, virtualization, Web Vitals |
| [typescript-patterns.md](patterns/typescript-patterns.md) | Generic components, discriminated unions, strict props |
| [data-patterns.md](patterns/data-patterns.md) | Optimistic updates, infinite scroll, cache invalidation |
| [architecture-patterns.md](patterns/architecture-patterns.md) | Feature slices, clean architecture, micro-frontends |

## Usage

When assisting with React development:
1. Load relevant file(s) based on the task domain
2. Follow patterns and conventions documented here
3. Recommend libraries from the ecosystem files when applicable
4. Reference specific API signatures from core files

## Version Info
- React: 19.x (stable)
- Last updated: 2026-03
