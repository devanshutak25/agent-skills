# Data Patterns

## Optimistic Updates

### useOptimistic (React 19)
```tsx
const [optimisticLikes, setOptimisticLikes] = useOptimistic(likes);

function handleLike() {
  startTransition(async () => {
    setOptimisticLikes(prev => prev + 1); // instant
    await toggleLike(postId);              // server — reverts on failure
  });
}
```

### TanStack Query Optimistic Updates
```tsx
const mutation = useMutation({
  mutationFn: updatePost,
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ['posts'] });
    const previous = queryClient.getQueryData(['posts']);
    queryClient.setQueryData(['posts'], (old: Post[]) =>
      old.map(p => p.id === newData.id ? { ...p, ...newData } : p)
    );
    return { previous };
  },
  onError: (err, vars, ctx) => {
    queryClient.setQueryData(['posts'], ctx?.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  },
});
```

---

## Infinite Scroll

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam }) => fetchPosts({ cursor: pageParam }),
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
});

// Intersection observer trigger
const sentinelRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, { threshold: 0.1 });
  if (sentinelRef.current) observer.observe(sentinelRef.current);
  return () => observer.disconnect();
}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

// Render
const allPosts = data?.pages.flatMap(p => p.items) ?? [];
return (
  <>
    {allPosts.map(post => <PostCard key={post.id} post={post} />)}
    {isFetchingNextPage && <Spinner />}
    <div ref={sentinelRef} />
  </>
);
```

---

## Cursor-Based Pagination (Server)

```ts
async function getPosts(cursor?: string, limit = 10) {
  const posts = await db.post.findMany({
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: 'desc' },
  });

  const hasNextPage = posts.length > limit;
  const items = hasNextPage ? posts.slice(0, -1) : posts;
  return {
    items,
    nextCursor: hasNextPage ? items[items.length - 1].id : null,
  };
}
```

---

## Prefetching

### On Hover
```tsx
const queryClient = useQueryClient();

<Link
  href={`/posts/${post.id}`}
  onMouseEnter={() => {
    queryClient.prefetchQuery({
      queryKey: ['post', post.id],
      queryFn: () => fetchPost(post.id),
      staleTime: 60_000,
    });
  }}
>
  {post.title}
</Link>
```

### Server-Side (Next.js + TanStack Query)
```tsx
export default async function Page() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({ queryKey: ['posts'], queryFn: fetchPosts });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostList />
    </HydrationBoundary>
  );
}
```

---

## Cache Invalidation Strategies

```tsx
// Tag-based (Next.js)
revalidateTag('posts');

// Query key-based (TanStack Query)
queryClient.invalidateQueries({ queryKey: ['posts'] });          // all posts queries
queryClient.invalidateQueries({ queryKey: ['post', postId] });   // specific post
queryClient.invalidateQueries({ queryKey: ['posts'], exact: true }); // exact match only

// Stale-while-revalidate timing
useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  staleTime: 60_000,    // fresh for 60s
  gcTime: 5 * 60_000,   // garbage collect after 5min
});
```

---

## Real-Time Data (WebSocket + React Query)

```tsx
function useRealtimePosts() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const ws = new WebSocket('wss://api.example.com/ws');
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      switch (msg.type) {
        case 'POST_CREATED':
          queryClient.invalidateQueries({ queryKey: ['posts'] });
          break;
        case 'POST_UPDATED':
          queryClient.setQueryData(['post', msg.data.id], (old: Post) =>
            old ? { ...old, ...msg.data } : old
          );
          break;
        case 'POST_DELETED':
          queryClient.removeQueries({ queryKey: ['post', msg.data.id] });
          queryClient.invalidateQueries({ queryKey: ['posts'] });
          break;
      }
    };
    return () => ws.close();
  }, [queryClient]);
}
```

---

## Server State vs Client State

```tsx
// Server state → TanStack Query / SWR
const { data: user } = useQuery({ queryKey: ['user'], queryFn: fetchUser });
const { data: posts } = useQuery({ queryKey: ['posts'], queryFn: fetchPosts });

// Client state → useState / Zustand
const [sidebarOpen, setSidebarOpen] = useState(false);
const [selectedTab, setSelectedTab] = useState('overview');

// URL state → search params
const [searchParams, setSearchParams] = useSearchParams();

// Derived state — compute, don't duplicate
const filteredPosts = useMemo(
  () => posts?.filter(p => p.title.includes(query)) ?? [],
  [posts, query]
);

// Anti-pattern: copying server data to local state
const [user, setUser] = useState(null); // DON'T — use React Query
```
