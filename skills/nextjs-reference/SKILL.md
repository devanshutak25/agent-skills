---
name: nextjs-reference
description: Comprehensive Next.js 16.1 reference — App Router, Server Components, "use cache", proxy.ts, Turbopack, React Compiler, ecosystem libraries, patterns, deployment. Auto-triggers when working on Next.js code.
trigger: When the user is working with Next.js, App Router, or Next.js-specific APIs
---

# Next.js 16.1 Reference

> Next.js-specific reference. For generic React APIs, hooks, and ecosystem libraries, see [react-reference](../react-reference/SKILL.md).

## Core

| File | Covers |
|------|--------|
| [App Router](./core/app-router.md) | File conventions, routing, layouts, async APIs, metadata |
| [Server Components](./core/server-components.md) | RSC model, `'use client'`/`'use server'`, composition, streaming |
| [Server Actions](./core/server-actions.md) | Actions, form integration, `useActionState`, revalidation |
| [Cache Components](./core/cache-components.md) | `"use cache"`, `cacheLife`, `cacheTag`, PPR, v15 migration |
| [Proxy Routing](./core/proxy-routing.md) | `proxy.ts` (replaces `middleware.ts`), matchers, patterns |
| [Configuration](./core/configuration.md) | `next.config.ts`, env vars, images, fonts, output modes |
| [Turbopack](./core/turbopack.md) | Default bundler, FS cache, config, webpack fallback |
| [React Compiler](./core/react-compiler.md) | Setup, what it replaces, opt-out, rules |

## Libraries

| File | Covers |
|------|--------|
| [Data Fetching](./libraries/data-fetching.md) | Server fetch, TanStack Query, SWR, tRPC, Route Handlers |
| [State Management](./libraries/state-management.md) | Zustand/Jotai SSR-safe patterns, URL state |
| [Styling](./libraries/styling.md) | Tailwind v4, CSS Modules, CSS-in-JS with RSC, `next/font` |
| [Forms & Validation](./libraries/forms-validation.md) | RHF + Zod + Server Actions, Conform, `useActionState` forms |
| [Auth](./libraries/auth.md) | Auth.js v5, Clerk, session patterns per layer |
| [Database](./libraries/database.md) | Prisma v6, Drizzle, connection pooling, Server Component queries |
| [UI Components](./libraries/ui-components.md) | shadcn/ui, Radix, RSC compatibility, dark mode |
| [Testing](./libraries/testing.md) | Vitest, Playwright, RTL, MSW, testing server components/actions |

## Patterns

| File | Covers |
|------|--------|
| [Caching Strategies](./patterns/caching-strategies.md) | Cache layers, static/dynamic, ISR, PPR patterns |
| [Auth Protection](./patterns/auth-protection.md) | Proxy/layout/page/action guards, RBAC |
| [Performance & SEO](./patterns/performance-seo.md) | Core Web Vitals, Metadata API, sitemap, OG images, JSON-LD |
| [Architecture](./patterns/architecture.md) | Route colocation, feature-based, server/client boundary, monorepo |
| [TypeScript Patterns](./patterns/typescript-patterns.md) | Page/layout types, server action types, route params, metadata |

## Deployment

| File | Covers |
|------|--------|
| [Deployment](./deployment/deployment.md) | Vercel, Cloudflare, AWS, Docker, static export, feature matrix |

## Templates

| File | Covers |
|------|--------|
| [Starter Templates](./templates/starter-templates.md) | `create-next-app`, T3, T3 Turbo |
| [Project Structures](./templates/project-structures.md) | Route-based, feature-based, `src/` convention, monorepo |
