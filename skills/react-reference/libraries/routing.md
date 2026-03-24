# Routing Libraries

## Decision Matrix

| Library | Type Safety | Mode | Best For |
|---------|------------|------|----------|
| **React Router v7** | Framework mode: good, Library: basic | SPA / SSR / Framework | Most React apps |
| **TanStack Router** | Excellent (first-class TS) | SPA + TanStack Start | Type safety priority |
| **Next.js App Router** | Good (generated types) | SSR Framework | Next.js apps |
| **Wouter** | Basic | SPA only | Tiny apps (~1.5 kB) |

---

## React Router v7

### Library Mode (SPA)
```bash
npm install react-router
```

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: 'posts', element: <Posts />, loader: postsLoader },
      { path: 'posts/:id', element: <Post />, loader: postLoader },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}
```

### Framework Mode (SSR — replaces Remix)
```bash
npx create-react-router@latest my-app
```

```tsx
// app/routes.ts
import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('posts', 'routes/posts.tsx', [
    index('routes/posts/index.tsx'),
    route(':id', 'routes/posts/post.tsx'),
  ]),
] satisfies RouteConfig;

// routes/posts/post.tsx
import type { Route } from './+types/post';

export async function loader({ params }: Route.LoaderArgs) {
  return { post: await getPost(params.id) };
}

export default function PostPage({ loaderData }: Route.ComponentProps) {
  return <h1>{loaderData.post.title}</h1>;
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  await updatePost(params.id, Object.fromEntries(formData));
  return redirect(`/posts/${params.id}`);
}
```

### Key Hooks
```tsx
import {
  useParams,        // { id: string }
  useSearchParams,  // [searchParams, setSearchParams]
  useNavigate,      // navigate('/path')
  useLocation,      // { pathname, search, hash }
  useNavigation,    // { state: 'idle' | 'loading' | 'submitting' }
  useLoaderData,    // typed loader data
  useActionData,    // typed action data
  useRouteError,    // error in errorElement
  useMatches,       // all matched routes
} from 'react-router';
```

---

## TanStack Router

```bash
npm install @tanstack/react-router @tanstack/router-devtools
npm install -D @tanstack/router-plugin  # Vite plugin for codegen
```

### Setup
```tsx
// vite.config.ts
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

export default defineConfig({
  plugins: [TanStackRouterVite(), react()],
});
```

### Route Definition (file-based)
```
src/routes/
  __root.tsx          # Root layout
  index.tsx           # /
  posts.tsx           # /posts (layout)
  posts/
    index.tsx         # /posts/
    $postId.tsx       # /posts/:postId
  _auth.tsx           # Pathless layout (auth group)
  _auth/
    dashboard.tsx     # /dashboard (wrapped in _auth layout)
```

### Type-Safe Search Params
```tsx
// routes/posts.tsx
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const postsSearchSchema = z.object({
  page: z.number().default(1),
  sort: z.enum(['date', 'title']).default('date'),
  q: z.string().optional(),
});

export const Route = createFileRoute('/posts')({
  validateSearch: postsSearchSchema,
  loaderDeps: ({ search }) => ({ page: search.page, sort: search.sort }),
  loader: ({ deps }) => fetchPosts(deps),
  component: PostsPage,
});

function PostsPage() {
  const { page, sort, q } = Route.useSearch(); // Fully typed
  const posts = Route.useLoaderData();          // Fully typed
  const navigate = Route.useNavigate();

  return (
    <button onClick={() => navigate({ search: { page: page + 1 } })}>
      Next Page
    </button>
  );
}
```

### Type-Safe Links
```tsx
import { Link } from '@tanstack/react-router';

// TypeScript errors if route doesn't exist or params are wrong
<Link to="/posts/$postId" params={{ postId: '123' }}>View Post</Link>
<Link to="/posts" search={{ page: 2, sort: 'title' }}>Page 2</Link>
```

**Pick TanStack Router when:** Type safety is a priority, complex search params, SPA or TanStack Start.

---

## Wouter

```bash
npm install wouter
```

```tsx
import { Route, Switch, Link } from 'wouter';

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/posts/:id">{(params) => <Post id={params.id} />}</Route>
      <Route>404 Not Found</Route>
    </Switch>
  );
}
```

~1.5 kB — use for tiny SPAs where bundle size is critical and you don't need loaders/SSR.

---

## URL State Pattern

Use search params as state for shareable, bookmarkable UI:

```tsx
import { useSearchParams } from 'react-router';

function FilteredList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get('filter') ?? 'all';
  const page = Number(searchParams.get('page') ?? '1');

  return (
    <div>
      <select
        value={filter}
        onChange={(e) => setSearchParams({ filter: e.target.value, page: '1' })}
      >
        <option value="all">All</option>
        <option value="active">Active</option>
      </select>
      <Pagination
        page={page}
        onChange={(p) => setSearchParams((prev) => {
          prev.set('page', String(p));
          return prev;
        })}
      />
    </div>
  );
}
```
