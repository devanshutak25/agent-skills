# State Management Libraries

## Decision Matrix

| Library | Model | Bundle | Best For |
|---------|-------|--------|----------|
| **Zustand** | Single store, flux-inspired | ~1.5 kB | Most apps — simple API, no boilerplate |
| **Jotai** | Atomic (bottom-up) | ~3.5 kB | Complex interdependent state, granular re-renders |
| **Redux Toolkit** | Single store, flux pattern | ~12 kB | Large teams, strict patterns, middleware |
| **Valtio** | Proxy-based mutable | ~3 kB | Mutable-style APIs, prototyping |
| **MobX** | Observable, reactive | ~16 kB | Object-oriented codebases |

---

## Zustand (Recommended Default)

```bash
npm install zustand
```

```tsx
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        login: (user) => set({ user, isAuthenticated: true }),
        logout: () => set({ user: null, isAuthenticated: false }),
      }),
      { name: 'auth-storage' } // localStorage key
    )
  )
);

// Usage — only re-renders when selected slice changes
function UserName() {
  const name = useAuthStore((s) => s.user?.name);
  return <span>{name}</span>;
}

// Outside React
useAuthStore.getState().logout();
```

### Async Actions
```tsx
const usePostStore = create<PostStore>()((set, get) => ({
  posts: [],
  loading: false,
  fetchPosts: async () => {
    set({ loading: true });
    const posts = await api.getPosts();
    set({ posts, loading: false });
  },
}));
```

### Slices Pattern
```tsx
const createAuthSlice = (set: SetState) => ({
  user: null,
  login: (user: User) => set({ user }),
});

const createUISlice = (set: SetState) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
});

const useStore = create<AuthSlice & UISlice>()((...args) => ({
  ...createAuthSlice(...args),
  ...createUISlice(...args),
}));
```

---

## Jotai

```bash
npm install jotai
```

```tsx
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';

// Primitive atom
const countAtom = atom(0);

// Derived atom (read-only)
const doubledAtom = atom((get) => get(countAtom) * 2);

// Async derived atom
const userAtom = atom(async (get) => {
  const id = get(userIdAtom);
  const res = await fetch(`/api/users/${id}`);
  return res.json();
});

// Writable derived atom
const incrementAtom = atom(null, (get, set) => {
  set(countAtom, get(countAtom) + 1);
});

// Usage — components only re-render when their specific atoms change
function Counter() {
  const [count, setCount] = useAtom(countAtom);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

function Display() {
  const doubled = useAtomValue(doubledAtom); // read-only
  return <p>Doubled: {doubled}</p>;
}
```

### When to pick Jotai over Zustand
- Many independent pieces of state that compose together
- Need React Suspense integration for async atoms
- Want minimal re-renders with fine-grained subscriptions

---

## Redux Toolkit

```bash
npm install @reduxjs/toolkit react-redux
```

```tsx
import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const postsSlice = createSlice({
  name: 'posts',
  initialState: { items: [] as Post[], status: 'idle' as 'idle' | 'loading' | 'failed' },
  reducers: {
    postAdded: (state, action: PayloadAction<Post>) => {
      state.items.push(action.payload); // Immer — safe mutation
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'idle';
      });
  },
});

const fetchPosts = createAsyncThunk('posts/fetch', async () => {
  const res = await fetch('/api/posts');
  return res.json();
});

const store = configureStore({ reducer: { posts: postsSlice.reducer } });

// Typed hooks
type RootState = ReturnType<typeof store.getState>;
const useAppSelector = useSelector.withTypes<RootState>();
const useAppDispatch = useDispatch.withTypes<typeof store.dispatch>();
```

### When to pick RTK
- Large team needing enforced patterns and code reviews
- Already using Redux — migration path
- Need middleware (RTK Query, sagas, custom)

---

## Valtio

```bash
npm install valtio
```

```tsx
import { proxy, useSnapshot } from 'valtio';

const state = proxy({
  count: 0,
  user: null as User | null,
});

// Mutate directly — Valtio tracks changes via Proxy
function increment() {
  state.count++;
}

// Component — reads snapshot (immutable)
function Counter() {
  const snap = useSnapshot(state);
  return <button onClick={increment}>{snap.count}</button>;
}
```

Good for prototyping and teams coming from mutable state (Vue, MobX).

---

## When NOT to Use State Management

| Data Type | Use Instead |
|-----------|------------|
| Server data (API responses) | TanStack Query / SWR |
| Form state | React Hook Form |
| URL state (filters, pagination) | URL search params |
| Theme, locale | React Context |
| Single-component state | `useState` / `useReducer` |
