# Performance & SEO

## Core Web Vitals Targets

| Metric | Target | Primary Cause of Failure |
|--------|--------|--------------------------|
| LCP (Largest Contentful Paint) | < 2.5s | Unoptimized hero images, render-blocking resources |
| INP (Interaction to Next Paint) | < 200ms | Heavy JS on main thread, hydration cost |
| CLS (Cumulative Layout Shift) | < 0.1 | Images without dimensions, late-loading fonts |
| TTFB (Time to First Byte) | < 200ms | Slow server, no caching, distant origin |

## Metadata API

### Static Metadata

```ts
// app/about/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about our team and mission.',
  openGraph: {
    title: 'About Us',
    description: 'Learn about our team.',
    images: [{ url: '/og/about.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@handle',
  },
}
```

### Dynamic Metadata

```ts
// app/posts/[slug]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params
  const post = await fetchPost(slug)
  const parentOg = (await parent).openGraph?.images ?? []

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: [{ url: post.coverImage }, ...parentOg],
    },
  }
}
```

### Title Template

```ts
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    template: '%s | Acme Corp',
    default: 'Acme Corp',
  },
}
// Child pages set `title: 'About'` → renders "About | Acme Corp"
```

## Sitemap and Robots

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetchAllPosts()
  return [
    { url: 'https://acme.com', lastModified: new Date(), priority: 1 },
    ...posts.map((p) => ({
      url: `https://acme.com/posts/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      priority: 0.8,
    })),
  ]
}
```

```ts
// app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: 'https://acme.com/sitemap.xml',
  }
}
```

## Dynamic OG Images

```tsx
// app/og/route.tsx
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get('title') ?? 'Acme Corp'

  return new ImageResponse(
    (
      <div style={{ display: 'flex', fontSize: 64, background: 'white', width: '100%', height: '100%', padding: 48 }}>
        {title}
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
```

Reference in metadata: `openGraph: { images: [{ url: `/og?title=${encodeURIComponent(post.title)}` }] }`.

## JSON-LD Structured Data

```tsx
// app/posts/[slug]/page.tsx
export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await fetchPost(slug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    author: { '@type': 'Person', name: post.author },
    datePublished: post.publishedAt,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article>{post.content}</article>
    </>
  )
}
```

## Image Optimization

```tsx
import Image from 'next/image'

// Above-the-fold hero: always use priority
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority
  sizes="100vw"
  placeholder="blur"
  blurDataURL="data:image/png;base64,..."
/>

// Below-fold, responsive
<Image
  src={product.image}
  alt={product.name}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

| Prop | When to Set |
|------|-------------|
| `priority` | LCP image (hero, above fold) |
| `sizes` | Any responsive or `fill` image |
| `placeholder="blur"` | Images with known `blurDataURL` or local imports |
| `fill` | Images inside a positioned container |

## Font Optimization

```ts
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',        // prevents FOIT
  variable: '--font-inter',
})

const mono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

`next/font` zero-layout-shift: fonts are self-hosted at build time with correct `size-adjust`.

## Bundle Analysis

```bash
# Install analyzer
npm install --save-dev @next/bundle-analyzer

# next.config.ts
import withBundleAnalyzer from '@next/bundle-analyzer'
const config = withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })({})
export default config

# Run
ANALYZE=true npm run build
```

Common findings: large date libraries (use `date-fns` tree-shaken imports), icon sets (import individual icons), unused locale data.

## Anti-Patterns

- **No `sizes` on `fill` images**: Browser downloads full-size image for all viewports. Always set `sizes`.
- **`priority` on every image**: Defeats the purpose. Set only on the single LCP image per page.
- **Inline fonts via `<link>`**: Causes FOUT. Use `next/font` exclusively.
- **JSON-LD in client component**: Executes late, missed by some crawlers. Keep in Server Components.

## Cross-References

- [Configuration](../core/configuration.md)
- [Caching Strategies](./caching-strategies.md)
- [Architecture](./architecture.md)
