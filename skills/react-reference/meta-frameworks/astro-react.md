# Astro + React

## Concept: Island Architecture

Astro renders everything to static HTML. JavaScript is zero unless you opt in with `client:*` directives. Each interactive component is an "island" of hydration.

## Setup

```bash
npm create astro@latest
npx astro add react
```

## client:* Directives

| Directive | Hydration Trigger | Use Case |
|-----------|-------------------|----------|
| `client:load` | Page load (immediately) | Critical interactive UI (nav, auth) |
| `client:idle` | `requestIdleCallback` | Non-critical widgets |
| `client:visible` | IntersectionObserver | Below-the-fold content |
| `client:media="(max-width: 768px)"` | CSS media query match | Responsive-only components |
| `client:only="react"` | Client render only (no SSR) | Components needing `window` at render |

### Usage
```astro
---
import Counter from '../components/Counter.tsx';
import Chart from '../components/Chart.tsx';
import MobileMenu from '../components/MobileMenu.tsx';
---

<Counter client:load />           <!-- Immediate hydration -->
<Chart client:idle />             <!-- When browser is idle -->
<MobileMenu client:media="(max-width: 768px)" />
```

**No directive = zero JS.** The component renders to static HTML only.

## Content Collections

```ts
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content', // Markdown/MDX
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

```astro
---
// src/pages/blog/[slug].astro
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---
<article>
  <h1>{post.data.title}</h1>
  <Content />
</article>
```

## Hybrid Rendering

```ts
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';

export default defineConfig({
  output: 'hybrid',  // Static by default, opt into SSR per-page
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
});
```

```astro
---
// Force SSR for this page
export const prerender = false;
const user = await getUser(Astro.locals.userId);
---
<Profile user={user} />
```

## When Astro vs Next.js

| Choose Astro | Choose Next.js |
|-------------|----------------|
| Content-heavy (blogs, docs, marketing) | Interactive apps |
| Minimal JS, performance critical | Frequent data mutations |
| Mix React + Svelte + Vue | React-only |
| Static-first with islands | Full RSC + streaming |
| SEO-focused marketing sites | Complex auth, dashboards |
