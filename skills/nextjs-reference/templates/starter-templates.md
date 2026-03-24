# Starter Templates

## `create-next-app`

The official scaffolding tool. Always use `--typescript`.

```bash
# Interactive (recommended)
npx create-next-app@latest my-app

# Non-interactive with all recommended flags
npx create-next-app@latest my-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

| Flag | Default | Notes |
|------|---------|-------|
| `--typescript` | prompted | Always enable |
| `--tailwind` | prompted | Skip if using CSS Modules or another solution |
| `--eslint` | prompted | Always enable |
| `--app` | prompted | Always enable for Next.js 13+ |
| `--src-dir` | no | Enable when colocation with test runner or monorepo convention |
| `--turbopack` | no | Enable for faster local dev (stable in Next.js 15+) |
| `--import-alias` | `@/*` | Keep default |

## T3 Stack (`create-t3-app`)

Opinionated full-stack starter: tRPC + Prisma + NextAuth + Tailwind CSS + TypeScript.

```bash
npm create t3-app@latest my-app
```

Includes:
- **tRPC**: end-to-end type-safe API, replaces REST/GraphQL for internal calls
- **Prisma**: type-safe ORM, schema-first
- **NextAuth.js (Auth.js)**: authentication with multiple providers
- **Tailwind CSS**: utility-first styling
- Strict TypeScript, ESLint, pre-configured `env.js` with `@t3-oss/env-nextjs`

When to use T3:
- Greenfield full-stack app with a database
- Team prefers tRPC over REST
- Needs auth from day one
- Solo developer who wants opinionated defaults

When NOT to use T3:
- API must be consumed by non-Next.js clients (use REST or GraphQL instead of tRPC)
- Bringing your own ORM or database (T3 is Prisma-centric)
- Project is primarily a marketing site

## T3 Turbo (Monorepo)

Turborepo-based monorepo extending T3 stack. Adds a React Native / Expo app.

```bash
npm create t3-turbo@latest my-app
```

Structure:
```
apps/
  nextjs/     # Next.js web app
  expo/       # React Native app
packages/
  api/        # tRPC router (shared between web and native)
  auth/       # Auth.js config
  db/         # Prisma schema + client
  ui/         # Shared UI components
  validators/ # Zod schemas
```

When to use T3 Turbo:
- Need web + mobile from a single codebase
- Sharing API types between Next.js and React Native
- Team of 2+ working on different surfaces

## Template Decision Table

| Criteria | `create-next-app` | T3 Stack | T3 Turbo | Custom |
|----------|------------------|----------|----------|--------|
| Setup time | 2 min | 5 min | 10 min | 30+ min |
| Database included | No | Yes (Prisma) | Yes (Prisma) | Your choice |
| API layer | REST / Server Actions | tRPC | tRPC | Your choice |
| Auth included | No | Yes (Auth.js) | Yes (Auth.js) | Your choice |
| Mobile app | No | No | Yes (Expo) | No |
| Learning curve | Low | Medium | Medium-High | High |
| Flexibility | High | Medium | Medium | Highest |

## Post-Setup Checklist

After scaffolding any template, configure these before writing feature code:

```bash
# 1. Set Node.js version
echo "20" > .nvmrc

# 2. Configure environment variables
cp .env.example .env.local

# 3. Initialize database (T3 only)
npx prisma db push

# 4. Verify build
npm run build

# 5. Run type check
npx tsc --noEmit
```

Additional items:
- Set `metadataBase` in root `layout.tsx` metadata
- Configure `next.config.ts` with `images.remotePatterns` for any external image domains
- Add `NEXTAUTH_SECRET` / `AUTH_SECRET` environment variable
- Set up CI pipeline (see [Deployment](../deployment/deployment.md))
- Configure absolute imports if not using `@/*` alias

## Cross-References

- [Project Structures](./project-structures.md)
- [Configuration](../core/configuration.md)
- [Deployment](../deployment/deployment.md)
