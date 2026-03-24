# Forms & Validation Libraries

## Decision Matrix

| Library | Role | Bundle | Best For |
|---------|------|--------|----------|
| **React Hook Form** | Form state & UX | ~9 kB | Most forms — minimal re-renders |
| **Zod** | Schema validation | ~14 kB | TypeScript-first validation |
| **Valibot** | Schema validation | ~1 kB (tree-shakeable) | Bundle-sensitive apps |
| **Conform** | Server-first forms | ~6 kB | Progressive enhancement, RSC |

---

## React Hook Form + Zod (Standard Stack)

```bash
npm install react-hook-form zod @hookform/resolvers
```

### Basic Form
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
  role: z.enum(['admin', 'user']),
});

type FormData = z.infer<typeof schema>; // auto-generate types

function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'user' },
  });

  const onSubmit = async (data: FormData) => {
    await api.signup(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <select {...register('role')}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
}
```

### Dynamic Fields (useFieldArray)
```tsx
const { fields, append, remove } = useFieldArray({
  control,
  name: 'items',
});

return fields.map((field, index) => (
  <div key={field.id}>
    <input {...register(`items.${index}.name`)} />
    <button onClick={() => remove(index)}>Remove</button>
  </div>
));
```

### Watch & Conditional Fields
```tsx
const { watch, register } = useForm();
const hasAddress = watch('hasAddress');

return (
  <>
    <input type="checkbox" {...register('hasAddress')} />
    {hasAddress && (
      <input {...register('address')} placeholder="Address" />
    )}
  </>
);
```

---

## Zod Schema Patterns

### Nested Objects
```tsx
const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  zip: z.string().regex(/^\d{5}$/),
});

const userSchema = z.object({
  name: z.string().min(2),
  addresses: z.array(addressSchema).min(1, 'At least one address'),
});
```

### Conditional Validation
```tsx
const schema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('individual'),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
  }),
  z.object({
    type: z.literal('company'),
    companyName: z.string().min(1),
    taxId: z.string().min(1),
  }),
]);
```

### Refinements
```tsx
const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
```

### Transform
```tsx
const schema = z.object({
  price: z.string().transform(Number).pipe(z.number().positive()),
  tags: z.string().transform(s => s.split(',').map(t => t.trim())),
});
```

---

## Valibot (Tree-Shakeable Alternative to Zod)

```bash
npm install valibot @hookform/resolvers
```

```tsx
import * as v from 'valibot';
import { valibotResolver } from '@hookform/resolvers/valibot';

const schema = v.object({
  email: v.pipe(v.string(), v.email()),
  age: v.pipe(v.number(), v.minValue(18)),
});

type FormData = v.InferOutput<typeof schema>;

const form = useForm({
  resolver: valibotResolver(schema),
});
```

**Pick Valibot when:** Bundle size is critical (~1 kB vs Zod's ~14 kB). API is similar but function-based rather than method-chained.

---

## Conform (Server-First Forms)

```bash
npm install @conform-to/react @conform-to/zod
```

```tsx
// Works with Server Actions — progressive enhancement
import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });
  if (submission.status !== 'success') {
    return submission.reply();
  }
  await createUser(submission.value);
  return redirect('/');
}

function SignupForm() {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    shouldValidate: 'onBlur',
  });

  return (
    <form id={form.id} onSubmit={form.onSubmit} action={serverAction}>
      <input name={fields.email.name} />
      <p>{fields.email.errors}</p>
      <button type="submit">Submit</button>
    </form>
  );
}
```

**Pick Conform when:** Server Actions / Remix actions, progressive enhancement (works without JS).

---

## Integration with shadcn/ui

```tsx
// shadcn Form component wraps React Hook Form
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

function MyForm() {
  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```
