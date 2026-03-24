# Error Boundaries

## Class-Based Error Boundary

Error boundaries are still class components — no hook equivalent exists.

```tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  fallback: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  children: ReactNode;
}

interface State {
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error reporting service
    console.error('Error boundary caught:', error, errorInfo.componentStack);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      const { fallback } = this.props;
      if (typeof fallback === 'function') {
        return fallback(this.state.error, this.reset);
      }
      return fallback;
    }
    return this.props.children;
  }
}
```

### Usage
```tsx
<ErrorBoundary fallback={<p>Something went wrong</p>}>
  <UserProfile />
</ErrorBoundary>

// With reset callback
<ErrorBoundary fallback={(error, reset) => (
  <div>
    <p>Error: {error.message}</p>
    <button onClick={reset}>Try Again</button>
  </div>
)}>
  <Dashboard />
</ErrorBoundary>
```

---

## React 19: Root Error Handlers

```tsx
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root')!, {
  // Errors caught by an Error Boundary
  onCaughtError(error, errorInfo) {
    reportError(error, {
      componentStack: errorInfo.componentStack,
      type: 'caught',
    });
  },

  // Errors NOT caught by any Error Boundary
  onUncaughtError(error, errorInfo) {
    reportError(error, {
      componentStack: errorInfo.componentStack,
      type: 'uncaught',
    });
    // Show global error UI
    showFatalErrorOverlay(error);
  },

  // Errors React recovers from automatically (e.g., hydration mismatches)
  onRecoverableError(error, errorInfo) {
    reportError(error, {
      componentStack: errorInfo.componentStack,
      type: 'recoverable',
    });
  },
});
```

---

## Error Boundary Patterns

### Per-Route Boundaries
```tsx
function App() {
  return (
    <Layout>
      <ErrorBoundary fallback={<PageError />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </ErrorBoundary>
    </Layout>
  );
}
```

### Per-Feature Boundaries
```tsx
function Dashboard() {
  return (
    <div className="grid">
      <ErrorBoundary fallback={<WidgetError name="Analytics" />}>
        <AnalyticsWidget />
      </ErrorBoundary>
      <ErrorBoundary fallback={<WidgetError name="Revenue" />}>
        <RevenueWidget />
      </ErrorBoundary>
    </div>
  );
}
```

### With Suspense
```tsx
<ErrorBoundary fallback={<ErrorUI />}>
  <Suspense fallback={<Loading />}>
    <AsyncComponent />
  </Suspense>
</ErrorBoundary>
```
- Suspense handles loading state
- ErrorBoundary catches rejected promises and render errors

---

## Third-Party: react-error-boundary

```bash
npm install react-error-boundary
```

```tsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onError={(error, info) => logToService(error, info)}
  onReset={(details) => {
    // Reset app state when user clicks "try again"
    queryClient.clear();
  }}
  resetKeys={[userId]} // Auto-reset when keys change
>
  <App />
</ErrorBoundary>

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert">
      <p>Error: {error.message}</p>
      <button onClick={resetErrorBoundary}>Try Again</button>
    </div>
  );
}
```

### useErrorBoundary Hook
```tsx
import { useErrorBoundary } from 'react-error-boundary';

function DataLoader() {
  const { showBoundary } = useErrorBoundary();

  async function fetchData() {
    try {
      const data = await api.getData();
      setData(data);
    } catch (error) {
      showBoundary(error); // Programmatically trigger error boundary
    }
  }
}
```

---

## What Error Boundaries DON'T Catch

- Event handlers (use try-catch)
- Async code outside React (setTimeout, fetch callbacks)
- Server-side rendering errors
- Errors in the boundary itself
