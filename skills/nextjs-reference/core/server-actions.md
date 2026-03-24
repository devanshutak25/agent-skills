# Server Actions

## Definition

Server Actions are async functions marked with `'use server'` that execute on the server. They are called from Client Components (or forms) and are POST endpoints under the hood.

```ts
// Inline in a Server Component
async function create(formData: FormData) {
  'use server'
  // runs on server
}

// Or in a dedicated file (all exports become server actions)
// lib/actions.ts
'use server'

export async function createPost(data: FormData) { ... }
export async function deletePost(id: string) { ... }
```

## Forms with Progressive Enhancement

```tsx
// app/posts/new/page.tsx — Server Component
import { createPost } from '@/lib/actions'

export default function NewPostPage() {
  return (
    // action= accepts a Server Action — works without JS (progressive enhancement)
    <form action={createPost}>
      <input name="title" required />
      <textarea name="body" required />
      <button type="submit">Create</button>
    </form>
  )
}
```

## `useActionState` — Form State + Pending

```tsx
'use client'
import { useActionState } from 'react'
import { createPost } from '@/lib/actions'

// Action signature must be: (prevState: State, formData: FormData) => Promise<State>
const initialState = { error: null, success: false }

export function NewPostForm() {
  const [state, action, isPending] = useActionState(createPost, initialState)

  return (
    <form action={action}>
      <input name="title" />
      {state.error && <p>{state.error}</p>}
      <button disabled={isPending}>
        {isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  )
}
```

```ts
// lib/actions.ts
'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

type State = { error: string | null; success: boolean }

export async function createPost(prevState: State, formData: FormData): Promise<State> {
  const title = formData.get('title') as string
  if (!title || title.length < 3) {
    return { error: 'Title must be at least 3 characters', success: false }
  }
  await db.insert({ title })
  revalidatePath('/posts')
  redirect('/posts') // throws — do not catch
}
```

## `useFormStatus` — Pending in Nested Components

```tsx
'use client'
import { useFormStatus } from 'react-dom'

// Must be a child of the <form> — reads parent form status
export function SubmitButton() {
  const { pending } = useFormStatus()
  return <button disabled={pending}>{pending ? 'Saving...' : 'Save'}</button>
}
```

`useFormStatus` only works inside a component that is a child of `<form>`. It cannot be in the same component that renders the form.

## Revalidation

```ts
'use server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function updatePost(id: string, data: FormData) {
  await db.update(id, Object.fromEntries(data))
  revalidatePath('/posts')              // revalidate a specific path
  revalidatePath('/posts/[id]', 'page') // revalidate dynamic path
  revalidateTag('posts')                // revalidate all fetches tagged 'posts'
}
```

See [Cache & use cache](./cache-components.md) for `cacheTag()` and how tags relate.

## Binding Arguments

```tsx
// Pass extra arguments to a server action (beyond formData)
import { deletePost } from '@/lib/actions'

export function PostActions({ id }: { id: string }) {
  const deleteWithId = deletePost.bind(null, id)
  return (
    <form action={deleteWithId}>
      <button type="submit">Delete</button>
    </form>
  )
}
```

```ts
// lib/actions.ts
'use server'
export async function deletePost(id: string, formData: FormData) {
  await db.delete(id)
  revalidatePath('/posts')
  redirect('/posts')
}
```

## Optimistic Updates

```tsx
'use client'
import { useOptimistic, useTransition } from 'react'
import { toggleLike } from '@/lib/actions'

export function LikeButton({ postId, liked, count }: Props) {
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(liked)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      setOptimisticLiked(!optimisticLiked) // instant UI update
      await toggleLike(postId)             // actual server mutation
    })
  }

  return <button onClick={handleClick}>{optimisticLiked ? 'Unlike' : 'Like'}</button>
}
```

## Error Handling

```ts
'use server'
import { redirect } from 'next/navigation'

export async function createPost(prevState: State, formData: FormData): Promise<State> {
  try {
    await db.insert(...)
  } catch (e) {
    if (e instanceof DatabaseError) {
      return { error: 'Database error. Try again.' }
    }
    throw e // rethrow unexpected errors — caught by error.tsx boundary
  }
  redirect('/posts') // outside try/catch — redirect throws internally
}
```

Never catch `redirect()` or `notFound()` — they throw special signals that Next.js handles.

## Security Checklist

| Risk | Mitigation |
|------|-----------|
| Unauthenticated access | Check auth at the top of every action before any logic |
| CSRF | Built-in — actions use `SameSite` cookies + Origin check |
| Unvalidated input | Use Zod or similar before touching DB |
| Over-exposure | Actions are public POST endpoints — treat like API routes |
| ID enumeration | Verify the user owns the resource, not just that it exists |

```ts
'use server'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({ title: z.string().min(3).max(200) })

export async function createPost(prevState: State, formData: FormData): Promise<State> {
  const session = await auth() // always check auth first
  if (!session) return { error: 'Unauthorized' }

  const parsed = schema.safeParse({ title: formData.get('title') })
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors.title?.[0] ?? 'Invalid' }

  await db.insert({ title: parsed.data.title, userId: session.user.id })
  revalidatePath('/posts')
  redirect('/posts')
}
```

## Cross-References

- [Forms & Validation](../libraries/forms-validation.md) — Zod, react-hook-form integration
- [Cache & use cache](./cache-components.md) — `revalidateTag`, cache invalidation
- [Server Components](./server-components.md) — `'use server'` vs `'use client'`
