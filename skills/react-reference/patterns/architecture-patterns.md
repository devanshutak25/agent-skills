# Architecture Patterns

## Feature Slices Architecture

Vertical slices from UI to data access. Each feature is independent.

```
src/
  shared/          # Primitives (Button, Input, api client, utils)
  entities/        # Business objects (User, Post)
  features/        # User interactions (auth, create-post)
  widgets/         # Composed sections (Header, Sidebar)
  pages/           # Route-level composition
  app/             # Entry, providers, routing
```

**Dependency rule:** `pages → widgets → features → entities → shared`

```tsx
// features/create-post/index.ts — public API
export { CreatePostForm } from './components/CreatePostForm';
export { useCreatePost } from './hooks/useCreatePost';

// features/create-post/hooks/useCreatePost.ts
export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPostApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  });
}
```

**When:** Growing teams (5+ devs), clear feature boundaries.

---

## Clean Architecture

Separate domain logic from framework code.

```
src/
  domain/              # Pure business logic, no React
    entities/Post.ts
    use-cases/CreatePost.ts
    repositories/IPostRepository.ts   # Interface only
  infrastructure/      # External implementations
    repositories/PrismaPostRepository.ts
    services/AuthService.ts
  presentation/        # React layer
    pages/
    components/
    hooks/useCreatePost.ts
```

```ts
// domain/use-cases/CreatePost.ts — pure, testable
export class CreatePost {
  constructor(private repo: IPostRepository) {}

  async execute(input: CreatePostInput, userId: string): Promise<Post> {
    if (input.title.length < 3) throw new ValidationError('Title too short');
    return this.repo.create({ ...input, authorId: userId });
  }
}

// presentation/hooks/useCreatePost.ts — React adapter
function useCreatePost() {
  const createPost = new CreatePost(new ApiPostRepository());
  return useMutation({
    mutationFn: (input: CreatePostInput) => createPost.execute(input, userId),
  });
}
```

**When:** Large teams needing testable domain logic without React/DB coupling. Overkill for most apps.

---

## Repository Pattern

```ts
interface PostRepository {
  findById(id: string): Promise<Post | null>;
  findMany(filters: PostFilters): Promise<Post[]>;
  create(data: CreatePostInput): Promise<Post>;
  update(id: string, data: UpdatePostInput): Promise<Post>;
  delete(id: string): Promise<void>;
}

// Prisma implementation
class PrismaPostRepository implements PostRepository {
  constructor(private db: PrismaClient) {}

  async findById(id: string) {
    return this.db.post.findUnique({ where: { id } });
  }

  async create(data: CreatePostInput) {
    return this.db.post.create({ data });
  }
  // ...
}

// Server Action uses repository
export async function createPost(input: CreatePostInput) {
  'use server';
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  const repo = new PrismaPostRepository(db);
  return repo.create({ ...input, authorId: session.user.id });
}
```

**When:** Multiple data sources, need to swap implementations, high testability requirements.

---

## Module Federation (Micro-Frontends)

```ts
// Host app
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'host',
      remotes: {
        checkout: 'http://checkout.example.com/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
});

// Remote app (checkout team)
federation({
  name: 'checkout',
  filename: 'remoteEntry.js',
  exposes: {
    './CheckoutFlow': './src/components/CheckoutFlow',
  },
  shared: ['react', 'react-dom'],
});

// Host consumes remote at runtime
const CheckoutFlow = lazy(() => import('checkout/CheckoutFlow'));
```

**When:** Large orgs with truly independent teams deploying separately.
**Avoid when:** Single team — use monorepo instead.

---

## Monorepo with Shared Packages

```
apps/
  web/              # Next.js
  admin/            # Vite + React
packages/
  ui/               # @company/ui — shared components
  api-client/       # @company/api — typed API client
  types/            # @company/types — shared interfaces
  config/
    eslint/
    tsconfig/
    tailwind/
```

```json
// packages/ui/package.json
{
  "name": "@company/ui",
  "exports": { ".": "./src/index.ts" },
  "peerDependencies": { "react": "^19.0.0" }
}
```

```tsx
// apps/web
import { Button, Card } from '@company/ui';
import type { User } from '@company/types';
```

**Tools:** Turborepo (simpler) or Nx (more features).

---

## Decision Guide

| Pattern | Complexity | Team Size | Use When |
|---------|-----------|-----------|----------|
| Layer-based | Low | 1-3 | Simple apps, quick start |
| Feature-based | Medium | 2-8 | Growing apps, clear domains |
| Feature slices (FSD) | Medium-High | 5+ | Strict boundaries needed |
| Clean architecture | High | 10+ | Complex domain logic, testability |
| Module federation | Very High | Multiple teams | Independent deployments |
| Monorepo | Medium | Any | Multiple apps sharing code |
