# Component Patterns

## Compound Components

Context-based components that work together as a unit.

```tsx
const AccordionContext = createContext<{ openItem: string | null; toggle: (id: string) => void } | null>(null);

function Accordion({ children }: { children: ReactNode }) {
  const [openItem, setOpenItem] = useState<string | null>(null);
  return (
    <AccordionContext value={{ openItem, toggle: (id) => setOpenItem(prev => prev === id ? null : id) }}>
      <div>{children}</div>
    </AccordionContext>
  );
}

function AccordionItem({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const { openItem, toggle } = use(AccordionContext)!;
  return (
    <div>
      <button onClick={() => toggle(id)}>{title}</button>
      {openItem === id && <div>{children}</div>}
    </div>
  );
}

// Usage
<Accordion>
  <AccordionItem id="1" title="FAQ 1">Answer 1</AccordionItem>
  <AccordionItem id="2" title="FAQ 2">Answer 2</AccordionItem>
</Accordion>
```

**Use when:** Components share implicit state (tabs, accordions, selects, menus).

---

## Polymorphic Components (`as` prop)

```tsx
type AsProp<C extends ElementType> = { as?: C };
type PolymorphicProps<C extends ElementType, Props = {}> =
  PropsWithChildren<Props & AsProp<C>> & Omit<ComponentPropsWithoutRef<C>, keyof (Props & AsProp<C>)>;

function Text<C extends ElementType = 'p'>({ as, children, ...rest }: PolymorphicProps<C, { weight?: 'normal' | 'bold' }>) {
  const Component = as ?? 'p';
  return <Component {...rest}>{children}</Component>;
}

// Type-safe — props adapt to `as` element
<Text as="h1">Heading</Text>
<Text as="a" href="/about">Link</Text>
<Text as={Link} to="/about">Router Link</Text>
```

---

## Headless Components (Hook Pattern)

Logic without UI — consumer controls rendering.

```tsx
function useCombobox({ options }: { options: string[] }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));

  return {
    query, isOpen, selected, filtered,
    getInputProps: () => ({
      value: query,
      onChange: (e: ChangeEvent<HTMLInputElement>) => { setQuery(e.target.value); setIsOpen(true); },
    }),
    getItemProps: (option: string) => ({
      onClick: () => { setSelected(option); setQuery(option); setIsOpen(false); },
    }),
  };
}

// Consumer owns all HTML/CSS
function MyCombobox() {
  const cb = useCombobox({ options: ['React', 'Vue', 'Svelte'] });
  return (
    <div>
      <input {...cb.getInputProps()} />
      {cb.isOpen && <ul>{cb.filtered.map(o => <li key={o} {...cb.getItemProps(o)}>{o}</li>)}</ul>}
    </div>
  );
}
```

---

## Slot Pattern

```tsx
interface CardProps {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

function Card({ header, footer, children }: CardProps) {
  return (
    <div className="rounded-lg border">
      {header && <div className="border-b p-4">{header}</div>}
      <div className="p-4">{children}</div>
      {footer && <div className="border-t p-4">{footer}</div>}
    </div>
  );
}

<Card
  header={<h2>Title</h2>}
  footer={<Button>Save</Button>}
>
  Main content here
</Card>
```

---

## Controlled vs Uncontrolled

```tsx
// Supports both modes
interface InputProps {
  value?: string;           // controlled
  defaultValue?: string;    // uncontrolled
  onChange?: (value: string) => void;
}

function Input({ value: controlledValue, defaultValue, onChange }: InputProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (!isControlled) setInternalValue(e.target.value);
    onChange?.(e.target.value);
  }

  return <input value={value} onChange={handleChange} />;
}
```

---

## Composition over Inheritance

```tsx
// Bad — inheritance/prop-heavy
<Button icon="save" iconPosition="left" loading loadingText="Saving..." />

// Good — composition
<Button>
  {isLoading ? <Spinner /> : <SaveIcon />}
  {isLoading ? 'Saving...' : 'Save'}
</Button>
```

---

## Render Props (Still Relevant for DOM Access)

```tsx
// Useful when hook needs to render something (e.g., virtualized lists)
<Virtualizer items={items} estimateSize={48}>
  {(virtualRow) => <Row item={items[virtualRow.index]} />}
</Virtualizer>
```

**Mostly replaced by hooks** for logic reuse. Still valid for libraries exposing render control.

---

## HOCs (Rare, Still Valid for Cross-Cutting)

```tsx
function withAuth<P extends object>(Component: ComponentType<P>) {
  return function Authenticated(props: P) {
    const { user, isLoading } = useAuth();
    if (isLoading) return <Spinner />;
    if (!user) return <Navigate to="/login" />;
    return <Component {...props} />;
  };
}
```

**Use for:** Auth guards at route level, feature flags, logging wrappers. Prefer hooks for logic reuse.
