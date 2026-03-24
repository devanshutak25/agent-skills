# Configuration

## `next.config.ts`

Next.js 16 uses TypeScript by default for the config file. No `next.config.js` needed.

```ts
// next.config.ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  // options
}

export default config
```

## Images

```ts
const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.example.com',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com', // wildcard subdomain
      },
    ],
    formats: ['image/avif', 'image/webp'], // default; avif first
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60, // seconds
  },
}
```

`next/image` requires `remotePatterns` for any external image domain. Use the most specific pattern possible.

## Output Modes

| Mode | Use case | Notes |
|------|---------|-------|
| `'standalone'` | Docker / self-hosted | Copies minimal runtime, use with `output/` dir |
| `'export'` | Pure static — CDN, GitHub Pages | No Server Components with dynamic data, no ISR |
| _(default)_ | Vercel, Node.js server | Full Next.js feature set |

```ts
const config: NextConfig = {
  output: 'standalone', // for Docker deployments
}
```

With `standalone`, build output is at `.next/standalone`. Run with `node .next/standalone/server.js`.

## Environment Variables

```ts
// next.config.ts — embed at build time (avoid for secrets)
const config: NextConfig = {
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY ?? '',
  },
}
```

Rules:
- `NEXT_PUBLIC_*` prefix → bundled into client JS, visible in browser
- All other `process.env.*` → server-only, not in client bundle
- Never put secrets in `NEXT_PUBLIC_*`
- Use `.env.local` for local dev, `.env.production` for prod overrides

```bash
# .env.local
DATABASE_URL=postgresql://...        # server only
NEXT_PUBLIC_API_URL=https://api...   # client + server
```

## Redirects and Rewrites

```ts
const config: NextConfig = {
  async redirects() {
    return [
      {
        source: '/old-blog/:slug',
        destination: '/blog/:slug',
        permanent: true, // 308; false = 307
      },
    ]
  },

  async rewrites() {
    return [
      // Proxy /api/external/* to a different origin
      {
        source: '/api/external/:path*',
        destination: 'https://api.thirdparty.com/:path*',
      },
      // Before pages check — checked first
      // After pages check — only if no page matched
    ]
  },
}
```

`rewrites()` can return `{ beforeFiles, afterFiles, fallback }` arrays for ordering control.

## Response Headers

```ts
const config: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval'",
          },
        ],
      },
    ]
  },
}
```

## Fonts

```tsx
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google'
import localFont from 'next/font/local'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const mono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

const myFont = localFont({
  src: './fonts/MyFont.woff2',
  variable: '--font-custom',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} ${myFont.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

`next/font` automatically self-hosts Google Fonts, eliminates external font requests, and inlines the `size-adjust` CSS to prevent layout shift.

## Server External Packages

```ts
const config: NextConfig = {
  // Packages that should NOT be bundled by Turbopack/webpack — kept as require()
  serverExternalPackages: ['sharp', 'prisma', '@prisma/client'],
}
```

Use for packages that use native binaries, have their own bundling, or rely on `__dirname`/`__filename`.

## TypeScript and Path Aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    },
    "plugins": [{ "name": "next" }]
  }
}
```

Next.js auto-configures path aliases from `tsconfig.json`. The `next` plugin provides IDE support for App Router types.

## Turbopack Config

See [Turbopack](./turbopack.md) for the `turbopack` config key. Quick reference:

```ts
const config: NextConfig = {
  turbopack: {
    rules: {
      '*.svg': { loaders: ['@svgr/webpack'], as: '*.js' },
    },
    resolveAlias: {
      'old-package': 'new-package',
    },
  },
}
```

## Useful Flags

```ts
const config: NextConfig = {
  reactStrictMode: true,          // double-invokes effects in dev — always on
  poweredByHeader: false,         // remove X-Powered-By header
  compress: true,                 // gzip compression (default true)
  generateEtags: true,            // ETags for caching (default true)
  trailingSlash: false,           // /about vs /about/
  experimental: {
    ppr: 'incremental',           // Partial Prerendering opt-in per route
    reactCompiler: true,          // React Compiler (see react-compiler.md)
  },
}
```

## Cross-References

- [Turbopack](./turbopack.md) — `turbopack` config key, loaders, aliases
- [React Compiler](./react-compiler.md) — `experimental.reactCompiler`
- [App Router](./app-router.md) — `revalidate`, `dynamic` segment config (per-route)
