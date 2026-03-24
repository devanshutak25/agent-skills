# Forms & Validation

## Decision Matrix

| Approach | Progressive enhancement | Client validation | Server validation | Complexity |
|---|---|---|---|---|
| Native `<form action={serverAction}>` | Yes | Manual | Zod in action | Minimal |
| `useActionState` + Server Action | Yes | Manual | Zod in action | Low |
| React Hook Form + Server Action | No | Zod / RHF rules | Zod in action | Medium |
| Conform + Server Action | Yes | Zod (shared schema) | Same Zod schema | Medium |

## Native Server Action Form

Works without JavaScript (progressive enhancement). Simplest form integration.

```tsx
// app/contact/page.tsx
import { submitContact } from "./actions";

export default function ContactPage() {
  return (
    <form action={submitContact}>
      <input name="email" type="email" required />
      <textarea name="message" required />
      <button type="submit">Send</button>
    </form>
  );
}
```

```ts
// app/contact/actions.ts
"use server";
import { z } from "zod";
import { redirect } from "next/navigation";

const schema = z.object({
  email: z.string().email(),
  message: z.string().min(10),
});

export async function submitContact(formData: FormData) {
  const result = schema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { errors: result.error.flatten().fieldErrors };

  await db.contact.create({ data: result.data });
  redirect("/contact/thanks");
}
```

## useActionState — Form State Feedback

Replaces deprecated `useFormState`. Provides pending state and return value from the action.

```tsx
// app/contact/ContactForm.tsx
"use client";
import { useActionState } from "react";
import { submitContact } from "./actions";

type State = { errors?: Record<string, string[]> } | null;

export function ContactForm() {
  const [state, action, isPending] = useActionState<State, FormData>(submitContact, null);

  return (
    <form action={action}>
      <input name="email" type="email" />
      {state?.errors?.email && <p className="text-red-500">{state.errors.email[0]}</p>}
      <textarea name="message" />
      {state?.errors?.message && <p className="text-red-500">{state.errors.message[0]}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
```

The server action signature changes to accept `(prevState, formData)` when used with `useActionState`:

```ts
"use server";
export async function submitContact(prevState: State, formData: FormData): Promise<State> {
  const result = schema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { errors: result.error.flatten().fieldErrors };
  await db.contact.create({ data: result.data });
  redirect("/contact/thanks");
}
```

## React Hook Form + Zod

Best for complex client-side UX: dependent fields, conditional rendering, multi-step forms.

```tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { submitContact } from "./actions";

const schema = z.object({
  email: z.string().email("Invalid email"),
  message: z.string().min(10, "Message too short"),
});
type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.append(k, v));
    await submitContact(fd);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <p>{errors.email.message}</p>}
      <textarea {...register("message")} />
      {errors.message && <p>{errors.message.message}</p>}
      <button disabled={isSubmitting}>Send</button>
    </form>
  );
}
```

## Conform — Progressive Enhancement with Zod

Conform parses `FormData` using the same Zod schema on both client and server — no duplication.

```ts
// lib/schemas/contact.ts
import { z } from "zod";
export const contactSchema = z.object({
  email: z.string().email(),
  message: z.string().min(10),
});
```

```tsx
"use client";
import { useForm, getFormProps, getInputProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useActionState } from "react";
import { contactSchema } from "@/lib/schemas/contact";
import { submitContact } from "./actions";

export function ContactForm() {
  const [lastResult, action] = useActionState(submitContact, null);
  const [form, fields] = useForm({
    lastResult,
    onValidate: ({ formData }) => parseWithZod(formData, { schema: contactSchema }),
  });

  return (
    <form {...getFormProps(form)} action={action}>
      <input {...getInputProps(fields.email, { type: "email" })} />
      <p>{fields.email.errors}</p>
      <textarea {...getInputProps(fields.message, { type: "text" })} />
      <p>{fields.message.errors}</p>
      <button>Send</button>
    </form>
  );
}
```

## File Uploads

```ts
"use server";
export async function uploadAvatar(formData: FormData) {
  const file = formData.get("avatar");
  if (!(file instanceof File)) return { error: "No file provided" };
  if (file.size > 5 * 1024 * 1024) return { error: "File too large" };

  const bytes = await file.arrayBuffer();
  await storage.put(`avatars/${crypto.randomUUID()}`, bytes, {
    contentType: file.type,
  });
}
```

## Shared Zod Schema Pattern

Define the schema once, import it in both the client form and the server action.

```
lib/schemas/contact.ts   ← single source of truth
app/contact/actions.ts   ← imports schema for server validation
app/contact/ContactForm.tsx  ← imports schema for client validation
```

## Cross-References

- [Server Actions](../core/server-actions.md) — action security, rate limiting, `revalidatePath`
- [react-reference Forms](../../react-reference/libraries/forms-validation.md) — controlled inputs, uncontrolled forms
