# Deployment

## Platform Feature Support Matrix

| Feature | Vercel | Cloudflare Pages | AWS (SST) | Docker | Static Export |
|---------|--------|-----------------|-----------|--------|---------------|
| SSR | Yes | Yes (via adapter) | Yes | Yes | No |
| ISR | Yes | Partial | Yes | Yes | No |
| PPR | Yes | No | No | Yes | No |
| Edge Runtime | Yes | Yes (Workers) | Partial | No | No |
| Image Optimization | Yes | Partial | Yes | Yes (self) | No |
| `"use cache"` | Yes | No | No | Yes | No |
| Server Actions | Yes | Yes | Yes | Yes | No |
| Streaming SSR | Yes | Yes | Yes | Yes | No |
| Middleware | Yes | Yes | Yes | Yes | No |

## Vercel

Zero-config. Recommended for full Next.js feature parity.

```bash
npm i -g vercel
vercel deploy
```

Key behaviors:
- Each `app/` route becomes a serverless function or Edge function automatically
- ISR is handled by Vercel's build output API — no extra config needed
- Image optimization via Vercel's built-in CDN
- `"use cache"` fully supported with Vercel's cache infrastructure

Environment variables: set in Vercel dashboard or via `vercel env add`. Access in code as `process.env.VAR`.

## Cloudflare Workers / Pages

Use `@opennextjs/cloudflare` adapter. Limitations apply.

```bash
npm install @opennextjs/cloudflare
```

```ts
// open-next.config.ts
import type { OpenNextConfig } from '@opennextjs/cloudflare'

export default {
  default: { override: { wrapper: 'cloudflare-node' } },
} satisfies OpenNextConfig
```

```toml
# wrangler.toml
name = "my-app"
main = ".open-next/worker.js"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[site]
bucket = ".open-next/assets"
```

Limitations: no PPR, no `"use cache"` directive, no native Image Optimization (use `next/image` with `unoptimized` or a separate CDN), Workers CPU time limit (50ms on free tier).

## AWS with SST

SST v3 is the recommended self-managed approach for full feature support on AWS.

```bash
npx create-sst@latest
```

```ts
// sst.config.ts
import { SSTConfig } from 'sst'
import { NextjsSite } from 'sst/constructs'

export default {
  config() { return { name: 'my-app', region: 'us-east-1' } },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const site = new NextjsSite(stack, 'site', {
        path: '.',
        environment: { DATABASE_URL: process.env.DATABASE_URL! },
      })
      stack.addOutputs({ url: site.url })
    })
  },
} satisfies SSTConfig
```

SST uses Lambda@Edge for SSR, S3 + CloudFront for static assets, and CloudFront Functions for middleware.

## Docker: Standalone Output

```ts
// next.config.ts
const config: NextConfig = {
  output: 'standalone',
}
```

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# standalone output includes only necessary files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

`HOSTNAME="0.0.0.0"` is required — Next.js standalone defaults to `localhost` which is unreachable inside Docker.

## Static Export

```ts
// next.config.ts
const config: NextConfig = {
  output: 'export',
  // Required if deploying to a subdirectory
  basePath: '/my-app',
}
```

```bash
npm run build
# Output in ./out — deploy to any static host (S3, GitHub Pages, Netlify)
```

Limitations: no SSR, no ISR, no Image Optimization API, no Route Handlers, no Server Actions, no Middleware. Use only for fully static sites.

## Environment Variables

| Context | How to set |
|---------|-----------|
| Vercel | Dashboard → Project → Settings → Environment Variables |
| Cloudflare | `wrangler secret put VAR_NAME` or `wrangler.toml [vars]` |
| AWS SST | `environment` prop on `NextjsSite`, or AWS SSM |
| Docker | `ENV` in Dockerfile, `--env-file` at runtime, or Kubernetes secrets |
| Local | `.env.local` (never commit) |

Server-only variables: no `NEXT_PUBLIC_` prefix. Client-exposed: prefix with `NEXT_PUBLIC_`.

## CI/CD: GitHub Actions for Docker

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## Deployment Decision Guide

| Situation | Recommendation |
|-----------|---------------|
| Full Next.js features, simplest ops | Vercel |
| Edge-first, global distribution, budget-conscious | Cloudflare + OpenNext |
| Existing AWS infrastructure, full control | SST v3 |
| On-prem, private cloud, regulated environment | Docker standalone |
| Pure content site, no dynamic routes | Static export |
| Monorepo with multiple apps | Vercel (per-app) or Turborepo + SST |

## Cross-References

- [Configuration](../core/configuration.md)
- [Caching Strategies](../patterns/caching-strategies.md)
