# Starter Templates

## Official Starters

### Vite + React + TypeScript
```bash
npm create vite@latest my-app -- --template react-ts
```
**Includes:** React 19, TypeScript, Vite, ESLint. Minimal — add everything yourself.
**Use when:** SPAs, dashboards, admin panels, no SSR needed.

### Next.js
```bash
npx create-next-app@latest my-app \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```
**Includes:** React 19, TypeScript, Tailwind, ESLint, App Router, Turbopack dev.
**Use when:** Full-stack apps, SSR, SEO-needed sites.

### React Router 7 (Framework)
```bash
npx create-react-router@latest my-app
```
**Includes:** React 19, TypeScript, Vite, SSR, file-based routing.
**Use when:** Full-stack with progressive enhancement, Remix-style apps.

### Astro
```bash
npm create astro@latest
npx astro add react
```
**Includes:** Astro, content collections, TypeScript. React added as integration.
**Use when:** Content sites, blogs, docs, marketing pages.

---

## Community Starters

### T3 Stack
```bash
npm create t3-app@latest
```
**Includes:** Next.js + tRPC + Prisma + Auth.js + Tailwind CSS
**Use when:** Full-stack TypeScript with end-to-end type safety, relational DB.

```
src/
  app/               # Next.js App Router
  server/
    api/routers/     # tRPC routers
    auth.ts          # Auth.js config
    db.ts            # Prisma client
  trpc/
    react.tsx        # Client hooks
    server.ts        # Server caller
prisma/schema.prisma
```

### Bulletproof React
**Repo:** `alan2207/bulletproof-react`

Not a scaffold tool — architecture reference to study and adapt.

**Includes:** Feature-based structure, React Query + Axios, Zustand, React Hook Form + Zod, MSW mocking, Vitest + Playwright.

### Epic Stack (Kent C. Dodds)
```bash
npx create-epic-app@latest
```
**Includes:** React Router 7 + SQLite/Turso + Prisma + Radix UI + Playwright + Vitest + Docker + Fly.io
**Use when:** Production-grade full-stack with strong opinions on testing, auth, deployment.

### create-t3-turbo (Monorepo)
```bash
npx create-t3-turbo@latest
```
**Includes:** Turborepo + Next.js + Expo + tRPC + Prisma + Auth.js

```
apps/
  nextjs/          # Web app
  expo/            # Mobile app
packages/
  api/             # Shared tRPC router
  auth/            # Shared auth config
  db/              # Shared Prisma schema
  ui/              # Shared components
  validators/      # Shared Zod schemas
```

---

## Enterprise / Monorepo

### Turborepo
```bash
npx create-turbo@latest
```

```json
// turbo.json
{
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "lint": { "outputs": [] },
    "test": { "outputs": ["coverage/**"] }
  }
}
```

### Nx
```bash
npx create-nx-workspace@latest --preset=react-monorepo
nx g @nx/react:application my-app
nx g @nx/react:library shared-ui --publishable
```

---

## Quick Reference

| Template | Stack | Scaffold Command |
|----------|-------|-----------------|
| Vite + React | SPA | `npm create vite@latest -- --template react-ts` |
| Next.js | Full-stack SSR | `npx create-next-app@latest` |
| React Router 7 | Full-stack SSR | `npx create-react-router@latest` |
| T3 Stack | Next + tRPC + Prisma | `npm create t3-app@latest` |
| Epic Stack | RR7 + SQLite + Prisma | `npx create-epic-app@latest` |
| Turborepo | Monorepo | `npx create-turbo@latest` |
| Astro | Content sites | `npm create astro@latest` |
