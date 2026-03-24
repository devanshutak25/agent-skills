# Proxy Routing (proxy.ts)

## Breaking Change in Next.js 16

`proxy.ts` replaces `middleware.ts` as the edge routing layer. The old `middleware.ts` file is no longer supported. `proxy.ts` is **routing-only** — it cannot modify response bodies or headers. For response modification, use Route Handlers.

| Feature | `middleware.ts` (v15) | `proxy.ts` (v16) |
|---------|----------------------|-----------------|
| Modify response headers | Yes | No |
| Modify response body | Yes | No |
| Redirect | Yes | Yes |
| Rewrite (proxy) | Yes | Yes |
| Run at edge | Opt-in | Default |
| NextResponse API | Full | Routing subset only |
| Auth gating | Yes | Yes |
| Locale detection | Yes | Yes |

## File Location and Export Shape

```ts
// proxy.ts — root of project (next to next.config.ts)
import type { ProxyConfig, ProxyRequest } from 'next/proxy'

export const config: ProxyConfig = {
  matcher: [
    // Match all paths except static assets and API routes
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}

export default function proxy(request: ProxyRequest) {
  // Return a routing decision
}
```

`ProxyRequest` extends the standard `Request` with Next.js helpers. The function must return `ProxyResponse | void` — returning `void` (or `undefined`) continues to the matched route unchanged.

## Basic Auth Redirect

```ts
// proxy.ts
import type { ProxyConfig, ProxyRequest } from 'next/proxy'
import { ProxyResponse } from 'next/proxy'

export const config: ProxyConfig = {
  matcher: ['/dashboard/:path*', '/settings/:path*', '/admin/:path*'],
}

export default function proxy(request: ProxyRequest): ProxyResponse | void {
  const token = request.cookies.get('session-token')

  if (!token) {
    // Redirect to login, preserving the intended destination
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return ProxyResponse.redirect(loginUrl)
  }
}
```

Do not validate JWTs or hit databases in `proxy.ts` — it runs at edge with no Node.js runtime. Use lightweight checks (cookie presence, simple claims on a signed token).

## Locale Routing

```ts
// proxy.ts
import type { ProxyConfig, ProxyRequest } from 'next/proxy'
import { ProxyResponse } from 'next/proxy'

const LOCALES = ['en', 'fr', 'de', 'es'] as const
const DEFAULT_LOCALE = 'en'

export const config: ProxyConfig = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}

export default function proxy(request: ProxyRequest): ProxyResponse | void {
  const { pathname } = request.nextUrl
  const hasLocale = LOCALES.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (!hasLocale) {
    const acceptLanguage = request.headers.get('accept-language') ?? ''
    const preferred = acceptLanguage.split(',')[0]?.split('-')[0] ?? DEFAULT_LOCALE
    const locale = (LOCALES as readonly string[]).includes(preferred) ? preferred : DEFAULT_LOCALE

    return ProxyResponse.rewrite(new URL(`/${locale}${pathname}`, request.url))
  }
}
```

## A/B Testing

```ts
// proxy.ts
import type { ProxyConfig, ProxyRequest } from 'next/proxy'
import { ProxyResponse } from 'next/proxy'

export const config: ProxyConfig = {
  matcher: ['/landing'],
}

export default function proxy(request: ProxyRequest): ProxyResponse | void {
  const bucket = request.cookies.get('ab-bucket')?.value

  if (!bucket) {
    // Assign bucket on first visit — rewrite to variant
    const variant = Math.random() < 0.5 ? 'a' : 'b'
    const response = ProxyResponse.rewrite(new URL(`/landing-${variant}`, request.url))
    response.cookies.set('ab-bucket', variant, { maxAge: 60 * 60 * 24 * 30 })
    return response
  }

  return ProxyResponse.rewrite(new URL(`/landing-${bucket}`, request.url))
}
```

## Maintenance Mode

```ts
// proxy.ts
import type { ProxyConfig, ProxyRequest } from 'next/proxy'
import { ProxyResponse } from 'next/proxy'

export const config: ProxyConfig = {
  matcher: ['/((?!maintenance|_next|api).*)'],
}

const MAINTENANCE = process.env.MAINTENANCE_MODE === 'true'

export default function proxy(request: ProxyRequest): ProxyResponse | void {
  if (MAINTENANCE) {
    return ProxyResponse.rewrite(new URL('/maintenance', request.url))
  }
}
```

## Matcher Syntax

```ts
export const config: ProxyConfig = {
  matcher: [
    '/about/:path*',                      // matches /about and /about/team
    '/api/:path*',                        // all API routes
    '/((?!_next/static|_next/image).*)',  // everything except Next.js internals
    {
      source: '/heavy-page',
      has: [{ type: 'header', key: 'x-internal-flag', value: 'true' }],
    },
  ],
}
```

Matchers support:
- Named segments: `:path`
- Wildcards: `:path*` (zero or more), `:path+` (one or more)
- Regex: `/((?!pattern).*)`
- Conditional matching with `has` (header, cookie, query, host)

## Migration from middleware.ts

```ts
// BEFORE — middleware.ts (v15)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  if (!token) return NextResponse.redirect(new URL('/login', request.url))
  // Mutating headers — NOT supported in proxy.ts
  const response = NextResponse.next()
  response.headers.set('x-custom-header', 'value')
  return response
}

// AFTER — proxy.ts (v16)
import { ProxyResponse } from 'next/proxy'
import type { ProxyRequest, ProxyConfig } from 'next/proxy'

export const config: ProxyConfig = { matcher: ['/protected/:path*'] }

export default function proxy(request: ProxyRequest): ProxyResponse | void {
  const token = request.cookies.get('token')
  if (!token) return ProxyResponse.redirect(new URL('/login', request.url))
  // Header mutation moved to a Route Handler or next.config.ts headers()
}
```

For setting response headers globally, use `headers()` in `next.config.ts`. For per-request header mutation, use a Route Handler.

## Cross-References

- [Auth Protection](../patterns/auth-protection.md) — session validation, protected route patterns
- [Configuration](./configuration.md) — `headers()` in next.config.ts for static header rules
