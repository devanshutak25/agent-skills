# Starter Templates

## create-vite (Official)

```bash
# Interactive
npm create vite@latest

# Direct (with template)
npm create vite@latest my-app -- --template react-ts

# Other package managers
yarn create vite my-app --template react-ts
pnpm create vite my-app --template react-ts
bun create vite my-app --template react-ts
```

### Official Templates

| Template | Command | Stack |
|----------|---------|-------|
| `vanilla` | `--template vanilla` | Plain JS |
| `vanilla-ts` | `--template vanilla-ts` | Plain TS |
| `vue` | `--template vue` | Vue 3 + JS |
| `vue-ts` | `--template vue-ts` | Vue 3 + TS |
| `react` | `--template react` | React + JS |
| `react-ts` | `--template react-ts` | React + TS |
| `react-swc` | `--template react-swc` | React + SWC + JS |
| `react-swc-ts` | `--template react-swc-ts` | React + SWC + TS |
| `preact` | `--template preact` | Preact + JS |
| `preact-ts` | `--template preact-ts` | Preact + TS |
| `lit` | `--template lit` | Lit + JS |
| `lit-ts` | `--template lit-ts` | Lit + TS |
| `svelte` | `--template svelte` | Svelte + JS |
| `svelte-ts` | `--template svelte-ts` | Svelte + TS |
| `solid` | `--template solid` | SolidJS + JS |
| `solid-ts` | `--template solid-ts` | SolidJS + TS |
| `qwik` | `--template qwik` | Qwik + JS |
| `qwik-ts` | `--template qwik-ts` | Qwik + TS |

## Community Templates

### React

| Template | Description |
|----------|-------------|
| **Vite + React + TS** | Official `react-ts` template — minimal, no opinions |
| **T3 Stack** (`create-t3-app`) | Next.js + tRPC + Prisma + Tailwind + NextAuth |
| **Epic Stack** (`epicweb-dev/epic-stack`) | Remix + Prisma + Tailwind + testing + deployment |
| **Vite React Boilerplate** | React + TS + Tailwind + React Router + testing |
| **create-react-router** | React Router 7 framework mode (Vite-powered) |

### Vue

| Template | Description |
|----------|-------------|
| **Nuxt** (`npx nuxi init`) | Full-stack Vue framework (Vite-powered) |
| **Vitesse** (`antfu/vitesse`) | Vue 3 + UnoCSS + file routing + auto-import |
| **create-vue** | Official Vue scaffolder (Vite, Pinia, Router, Vitest) |

### Svelte

| Template | Description |
|----------|-------------|
| **SvelteKit** (`npx svelte@latest`) | Full-stack Svelte (Vite-powered) |
| **Svelte + Vite** | Official `svelte-ts` template |

### Solid

| Template | Description |
|----------|-------------|
| **SolidStart** | Full-stack Solid (Vite-powered) |
| **Solid + Vite** | Official `solid-ts` template |

### Multi-Framework

| Template | Description |
|----------|-------------|
| **Astro** (`npm create astro`) | Content-focused, island architecture, any UI framework |
| **Analog** | Angular meta-framework (Vite-powered) |

## Template Decision Table

| Need | Recommendation |
|------|---------------|
| Minimal React SPA | `create vite --template react-swc-ts` |
| React with routing/data | `create-react-router` (React Router 7) |
| Full-stack React | Next.js or Remix |
| Vue SPA | `create-vue` (official scaffolder) |
| Full-stack Vue | Nuxt |
| Svelte | SvelteKit |
| Content site | Astro |
| Maximum speed React | `react-swc-ts` template |
| Library package | `vanilla-ts` template + library mode config |
| Quick prototype | `vanilla` template |
