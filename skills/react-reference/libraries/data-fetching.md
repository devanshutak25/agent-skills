# Data Fetching Libraries

## Decision Matrix

| Library | Bundle | Best For |
|---------|--------|----------|
| **TanStack Query v5** | ~16 kB | Most apps — caching, devtools, mutations |
| **SWR** | ~5.3 kB | Lightweight apps, Vercel ecosystem |
| **tRPC** | ~5 kB (client) | End-to-end type safety with TS backend |
| **RTK Query** | Included in RTK | Apps already on Redux Toolkit |
| **Apollo Client** | ~35 kB | GraphQL APIs |

---

## TanStack Query v5 (Recommended Default)

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### Setup
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,      // Data fresh for 60s
      gcTime: 5 * 60_000,     // Garbage collect after 5min
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Queries
```tsx
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

function PostList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: () => fetch('/api/posts').then(r => r.json()),
  });

  if (isLoading) return <Skeleton />;
  if (error) return <Error error={error} />;
  return data.map(p => <PostCard key={p.id} post={p} />);
}

// Suspense mode — cleaner, no loading/error states
function PostList() {
  const { data } = useSuspenseQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  });
  return data.map(p => <PostCard key={p.id} post={p} />);
}
```

### Mutations
```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function CreatePostForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreatePostInput) =>
      fetch('/api/posts', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      mutation.mutate({ title, content });
    }}>
      <button disabled={mutation.isPending}>
        {mutation.isPending ? 'Saving...' : 'Create'}
      </button>
    </form>
  );
}
```

### Optimistic Updates
```tsx
const mutation = useMutation({
  mutationFn: updatePost,
  onMutate: async (newPost) => {
    await queryClient.cancelQueries({ queryKey: ['posts'] });
    const previous = queryClient.getQueryData<Post[]>(['posts']);
    queryClient.setQueryData<Post[]>(['posts'], (old) =>
      old?.map(p => p.id === newPost.id ? { ...p, ...newPost } : p)
    );
    return { previous };
  },
  onError: (err, vars, context) => {
    queryClient.setQueryData(['posts'], context?.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  },
});
```

### Infinite Queries
```tsx
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam }) => fetchPosts({ cursor: pageParam }),
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
});

const allPosts = data?.pages.flatMap(page => page.items) ?? [];
```

---

## SWR

```bash
npm install swr
```

```tsx
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function Profile() {
  const { data, error, isLoading, mutate } = useSWR<User>('/api/user', fetcher);

  if (isLoading) return <Skeleton />;
  if (error) return <p>Error loading profile</p>;
  return <div>{data?.name}</div>;
}

// Revalidation
mutate(); // refetch
mutate(updatedData, false); // optimistic update without refetch
```

**Pick SWR when:** Bundle size is critical, needs are simple (fetch + cache), using Vercel/Next.js ecosystem.

---

## tRPC

```bash
npm install @trpc/client @trpc/server @trpc/react-query
```

```tsx
// Server — define typed API
const appRouter = router({
  posts: {
    list: publicProcedure.query(async () => {
      return db.post.findMany();
    }),
    create: protectedProcedure
      .input(z.object({ title: z.string(), content: z.string() }))
      .mutation(async ({ input, ctx }) => {
        return db.post.create({ data: { ...input, authorId: ctx.user.id } });
      }),
  },
});
export type AppRouter = typeof appRouter;

// Client — fully typed, zero codegen
import { api } from '@/utils/trpc';

function PostList() {
  const { data } = api.posts.list.useQuery();     // typed as Post[]
  const mutation = api.posts.create.useMutation(); // input typed to z.object
  return data?.map(p => <div key={p.id}>{p.title}</div>);
}
```

**Pick tRPC when:** TypeScript on both client and server, want end-to-end type safety without codegen.

---

## RTK Query

```tsx
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Post'],
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      query: () => '/posts',
      providesTags: ['Post'],
    }),
    createPost: builder.mutation<Post, CreatePostInput>({
      query: (body) => ({ url: '/posts', method: 'POST', body }),
      invalidatesTags: ['Post'],
    }),
  }),
});

export const { useGetPostsQuery, useCreatePostMutation } = api;
```

**Pick RTK Query when:** Already using Redux Toolkit — it's built-in.

---

## Server State vs Client State

```
Server State (TanStack Query / SWR):
  ✓ API responses, database data
  ✓ Cached, stale-while-revalidate
  ✓ Shared across components
  ✓ Background refetching

Client State (Zustand / useState):
  ✓ UI state (modals, sidebars, tabs)
  ✓ Form editing state
  ✓ User preferences
  ✓ No server sync needed
```

**Rule:** Never copy server data into client state. Use TanStack Query as the cache.
