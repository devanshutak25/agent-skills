# Context API & Patterns

## Basic Context (React 19)

### Create
```tsx
import { createContext, useContext } from 'react';

interface Theme {
  color: string;
  background: string;
}

const ThemeContext = createContext<Theme>({
  color: '#000',
  background: '#fff',
});
```

### Provide (React 19 — Context as Provider)
```tsx
// React 19 — use <Context> directly
function App() {
  const [theme, setTheme] = useState<Theme>({ color: '#000', background: '#fff' });
  return (
    <ThemeContext value={theme}>
      {children}
    </ThemeContext>
  );
}

// React 18 (still works, deprecated)
<ThemeContext.Provider value={theme}>
  {children}
</ThemeContext.Provider>
```

### Consume
```tsx
// Hook (standard)
function Button() {
  const theme = useContext(ThemeContext);
  return <button style={{ color: theme.color }}>Click</button>;
}

// use() — React 19, can be conditional
function MaybeThemed({ useTheme }: { useTheme: boolean }) {
  if (!useTheme) return <div>Default</div>;
  const theme = use(ThemeContext);
  return <div style={{ background: theme.background }}>Themed</div>;
}
```

---

## Context + Reducer Pattern

```tsx
// types
type Action = { type: 'login'; user: User } | { type: 'logout' };
interface AuthState { user: User | null; isAuthenticated: boolean }

// contexts
const AuthStateContext = createContext<AuthState>(null!);
const AuthDispatchContext = createContext<Dispatch<Action>>(null!);

// reducer
function authReducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'login': return { user: action.user, isAuthenticated: true };
    case 'logout': return { user: null, isAuthenticated: false };
  }
}

// provider
function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
  });

  return (
    <AuthStateContext value={state}>
      <AuthDispatchContext value={dispatch}>
        {children}
      </AuthDispatchContext>
    </AuthStateContext>
  );
}

// hooks
function useAuthState() {
  const ctx = useContext(AuthStateContext);
  if (!ctx) throw new Error('useAuthState must be used within AuthProvider');
  return ctx;
}

function useAuthDispatch() {
  const ctx = useContext(AuthDispatchContext);
  if (!ctx) throw new Error('useAuthDispatch must be used within AuthProvider');
  return ctx;
}
```

**Why split state and dispatch?** Components that only dispatch don't re-render when state changes.

---

## Performance Optimization

### Problem: All consumers re-render on any context change
```tsx
// Bad — every consumer re-renders when ANY value changes
const AppContext = createContext({ user: null, theme: 'light', locale: 'en' });
```

### Solution 1: Split Contexts
```tsx
const UserContext = createContext<User | null>(null);
const ThemeContext = createContext<'light' | 'dark'>('light');
const LocaleContext = createContext<string>('en');
```

### Solution 2: Memoize Provider Value
```tsx
function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  // Memoize to prevent unnecessary consumer re-renders
  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
```

### Solution 3: Selector Pattern (with `use-context-selector`)
```tsx
import { createContext, useContextSelector } from 'use-context-selector';

const AppContext = createContext<AppState>(null!);

// Only re-renders when user changes
function UserName() {
  const name = useContextSelector(AppContext, (s) => s.user.name);
  return <span>{name}</span>;
}
```

---

## Context vs External State

| Need | Use |
|------|-----|
| Theme, locale, auth (low-frequency) | Context |
| Complex UI state, frequent updates | Zustand / Jotai |
| Server data (cache, sync) | TanStack Query / SWR |
| Form state | React Hook Form |

### When NOT to use Context
- High-frequency updates (typing, animation, mouse position)
- Complex state logic (use Zustand or useReducer)
- Server state / cache management (use TanStack Query)

---

## Server Component Considerations

- Server Components cannot use `useContext` — they don't have client-side React runtime
- Pass data as props from Server → Client instead
- Wrap client-only subtrees with Context providers in a Client Component

```tsx
// layout.tsx (Server Component)
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        <Providers> {/* Client Component */}
          {children}
        </Providers>
      </body>
    </html>
  );
}

// providers.tsx
'use client';
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
```
