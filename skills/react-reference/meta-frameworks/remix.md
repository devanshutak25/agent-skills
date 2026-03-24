# React Router 7 / Remix

React Router v7 absorbed Remix. Remix v2 → React Router v7 is a direct migration.

## Framework Mode vs Library Mode

| Mode | Features | Use Case |
|------|----------|----------|
| **Framework** | SSR, file routing, loaders, actions, streaming | Full-stack apps (replaces Remix) |
| **Library** | Client-side routing, optional loaders | SPAs, existing React apps |
| **Declarative** | `<Route>` components | Legacy, not recommended |

---

## Framework Mode Setup

```bash
npx create-react-router@latest my-app
```

### Route Config
```tsx
// app/routes.ts
import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('about', 'routes/about.tsx'),
  route('posts', 'routes/posts.tsx', [
    index('routes/posts/index.tsx'),
    route(':id', 'routes/posts/post.tsx'),
  ]),
] satisfies RouteConfig;
```

---

## Loaders (Data Loading)

```tsx
// routes/posts/post.tsx
import type { Route } from './+types/post';

export async function loader({ params }: Route.LoaderArgs) {
  const post = await db.post.findUnique({ where: { id: params.id } });
  if (!post) throw new Response('Not Found', { status: 404 });
  return { post };
}

export default function PostPage({ loaderData }: Route.ComponentProps) {
  const { post } = loaderData; // Fully typed via codegen
  return <article><h1>{post.title}</h1></article>;
}
```

### Parallel Loading
Loaders in nested routes run **in parallel** automatically. Parent loader does NOT block child loader.

---

## Actions (Mutations)

```tsx
import { redirect, data } from 'react-router';
import { Form } from 'react-router';

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const title = formData.get('title') as string;

  if (!title || title.length < 3) {
    return data({ error: 'Title must be at least 3 characters' }, { status: 422 });
  }

  const post = await db.post.create({ data: { title } });
  return redirect(`/posts/${post.id}`);
}

export default function NewPost() {
  const actionData = useActionData<typeof action>();

  return (
    <Form method="post">
      <input name="title" />
      {actionData?.error && <p className="text-red-500">{actionData.error}</p>}
      <button type="submit">Create</button>
    </Form>
  );
}
```

---

## Progressive Enhancement

```tsx
import { Form, useNavigation } from 'react-router';

// Works with AND without JavaScript
function PostForm() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <Form method="post">
      <input name="title" />
      <button disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </Form>
  );
}
```

---

## Nested Routing

```tsx
// routes/dashboard.tsx — layout route
import { Outlet, NavLink } from 'react-router';

export async function loader() {
  return { user: await getCurrentUser() };
}

export default function DashboardLayout({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <nav>
        <NavLink to="/dashboard/overview">Overview</NavLink>
        <NavLink to="/dashboard/settings">Settings</NavLink>
      </nav>
      <main>
        <Outlet /> {/* Child route renders here */}
      </main>
    </div>
  );
}
```

---

## Streaming / Deferred Data

```tsx
import { defer, Await } from 'react-router';
import { Suspense } from 'react';

export async function loader() {
  return defer({
    criticalData: await getCriticalData(),    // awaited — blocks render
    slowData: getSlowData(),                  // deferred — streams in
  });
}

export default function Page({ loaderData }) {
  return (
    <div>
      <h1>{loaderData.criticalData.title}</h1>
      <Suspense fallback={<Spinner />}>
        <Await resolve={loaderData.slowData}>
          {(data) => <SlowSection data={data} />}
        </Await>
      </Suspense>
    </div>
  );
}
```

---

## Error Handling

```tsx
// routes/dashboard.tsx
export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return <div>{error.status}: {error.statusText}</div>;
  }

  return <div>Unexpected error</div>;
}
```

---

## Key Hooks

```tsx
import {
  useLoaderData,     // typed loader data
  useActionData,     // typed action data
  useNavigation,     // { state: 'idle' | 'loading' | 'submitting' }
  useNavigate,       // programmatic navigation
  useParams,         // route params
  useSearchParams,   // URL search params
  useRouteError,     // error in ErrorBoundary
  useFetcher,        // non-navigation data loading/mutations
  useMatches,        // all matched routes
} from 'react-router';
```

---

## Deployment Adapters

```ts
// react-router.config.ts
export default { ssr: true } satisfies Config;
```

- `@react-router/node` — Express/Node.js
- `@react-router/cloudflare` — Cloudflare Workers/Pages
- `@react-router/serve` — standalone production server
- Custom adapter for Bun, Deno, etc.
