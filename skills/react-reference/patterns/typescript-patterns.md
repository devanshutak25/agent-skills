# TypeScript Patterns for React

## Generic Components

```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string | number;
  emptyState?: ReactNode;
}

function List<T>({ items, renderItem, keyExtractor, emptyState }: ListProps<T>) {
  if (items.length === 0) return <>{emptyState ?? <p>No items</p>}</>;
  return <ul>{items.map((item, i) => <li key={keyExtractor(item)}>{renderItem(item, i)}</li>)}</ul>;
}

// T inferred from items
<List items={users} keyExtractor={u => u.id} renderItem={u => <span>{u.name}</span>} />
```

---

## Discriminated Union Props

```tsx
type ButtonProps =
  | { variant: 'link'; href: string; onClick?: never }
  | { variant: 'button'; onClick: () => void; href?: never };

function Button({ variant, children, ...rest }: ButtonProps & { children: ReactNode }) {
  if (variant === 'link') return <a href={(rest as { href: string }).href}>{children}</a>;
  return <button onClick={(rest as { onClick: () => void }).onClick}>{children}</button>;
}

// TypeScript catches invalid combos
<Button variant="link" href="/about">About</Button>     // OK
<Button variant="button" onClick={() => {}}>Click</Button> // OK
<Button variant="link" onClick={() => {}}>Error</Button>   // TS Error
```

---

## Strict Event Handlers

```tsx
type InputChangeHandler = React.ChangeEventHandler<HTMLInputElement>;
type SelectChangeHandler = React.ChangeEventHandler<HTMLSelectElement>;
type FormSubmitHandler = React.FormEventHandler<HTMLFormElement>;

// Extract event type from handler
type EventOf<T extends (...args: any[]) => any> = Parameters<T>[0];
```

---

## ComponentProps / PropsWithChildren

```tsx
import type { ComponentProps, PropsWithChildren } from 'react';

// Reuse component's prop types
type ButtonProps = ComponentProps<typeof Button>;
type InputProps = ComponentProps<'input'>; // native HTML element

// Extend with custom props
type CustomButtonProps = ComponentProps<typeof Button> & { loading?: boolean };

// PropsWithChildren shorthand
type CardProps = PropsWithChildren<{ title: string }>;
// Equivalent to: { title: string; children?: ReactNode }
```

---

## Polymorphic Component Types

```tsx
type AsProp<C extends ElementType> = { as?: C };

type PolymorphicProps<C extends ElementType, Props = {}> =
  PropsWithChildren<Props & AsProp<C>> &
  Omit<ComponentPropsWithoutRef<C>, keyof (Props & AsProp<C>)>;

function Box<C extends ElementType = 'div'>({
  as, children, ...rest
}: PolymorphicProps<C>) {
  const Component = as ?? 'div';
  return <Component {...rest}>{children}</Component>;
}

<Box as="section" id="main">Content</Box>
<Box as="a" href="/about">Link</Box>  // gets <a> props
```

---

## `satisfies` Operator

```tsx
// Validates type WITHOUT widening
const routes = {
  home: '/',
  about: '/about',
  blog: '/blog',
} satisfies Record<string, string>;

routes.home; // type: '/' (literal preserved)

// Without satisfies:
const r: Record<string, string> = { home: '/' };
r.home; // type: string (widened)

// Config validation
const theme = {
  colors: { primary: '#3b82f6', danger: '#ef4444' },
  spacing: { sm: 8, md: 16, lg: 24 },
} satisfies {
  colors: Record<string, `#${string}`>;
  spacing: Record<string, number>;
};
```

---

## forwardRef with Generics

```tsx
// Generic select component with forwardRef
interface SelectProps<T> {
  options: T[];
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
  onChange: (item: T) => void;
}

const Select = forwardRef(function Select<T>(
  { options, getLabel, getValue, onChange }: SelectProps<T>,
  ref: ForwardedRef<HTMLSelectElement>
) {
  return (
    <select ref={ref} onChange={(e) => {
      const item = options.find(o => getValue(o) === e.target.value);
      if (item) onChange(item);
    }}>
      {options.map(o => (
        <option key={getValue(o)} value={getValue(o)}>{getLabel(o)}</option>
      ))}
    </select>
  );
}) as <T>(props: SelectProps<T> & { ref?: ForwardedRef<HTMLSelectElement> }) => ReactElement;
```

---

## Template Literal Types

```tsx
type Size = 'sm' | 'md' | 'lg';
type Color = 'primary' | 'secondary' | 'danger';
type VariantClass = `btn-${Color}-${Size}`;
// 'btn-primary-sm' | 'btn-primary-md' | ... (9 combinations)

type EventName = `on${Capitalize<string>}`;
// 'onClick', 'onChange', etc.

type CSSVariable = `--${string}`;
```

---

## Strict Utility Types

```tsx
// Require at least one of a set of props
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> &
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];

type FilterProps = RequireAtLeastOne<{
  search?: string;
  category?: string;
  tag?: string;
}, 'search' | 'category' | 'tag'>;
// Must provide at least one of search, category, or tag

// Exact props (no extra keys)
type Exact<T, Shape> = T & Record<Exclude<keyof T, keyof Shape>, never>;
```

---

## Common Patterns

```tsx
// Extract ref type from component
type InputRef = React.ElementRef<typeof Input>;

// Infer return type of async function
type User = Awaited<ReturnType<typeof getUser>>;

// Record with known keys
const STATUS_MAP = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
} as const satisfies Record<string, string>;

type Status = keyof typeof STATUS_MAP; // 'active' | 'inactive' | 'pending'
```
