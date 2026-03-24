# HMR API

Vite exposes its HMR API via `import.meta.hot`. Only available in dev mode.

## Guard Pattern

```ts
if (import.meta.hot) {
  // HMR code — tree-shaken in production
}
```

## Core API

### `hot.accept()`

Accept self-updates or dependency updates.

```ts
// Self-accepting module — re-executes when changed
import.meta.hot.accept()

// With callback
import.meta.hot.accept((newModule) => {
  if (newModule) {
    // newModule is the updated module
    newModule.render()
  }
})
```

### `hot.accept(deps, cb)`

Accept updates from dependencies.

```ts
// Single dependency
import.meta.hot.accept('./dep.ts', (newDep) => {
  // React to dep update
  newDep?.doSomething()
})

// Multiple dependencies
import.meta.hot.accept(['./foo.ts', './bar.ts'], ([newFoo, newBar]) => {
  // Either foo or bar updated
})
```

### `hot.dispose(cb)`

Cleanup when module is replaced or removed.

```ts
let timer: number

function setup() {
  timer = setInterval(() => console.log('tick'), 1000)
}

import.meta.hot.dispose(() => {
  clearInterval(timer) // Clean up side effects
})

setup()
```

### `hot.prune(cb)`

Called when module is no longer imported (removed from graph).

```ts
import.meta.hot.prune(() => {
  // Module completely removed — final cleanup
})
```

### `hot.invalidate(message?)`

Force full reload. Use when the module can't self-update cleanly.

```ts
import.meta.hot.accept((newModule) => {
  if (!canHotUpdate(newModule)) {
    import.meta.hot.invalidate('State incompatible, full reload needed')
  }
})
```

### `hot.data`

Persistent object across HMR updates of the same module.

```ts
// Store state before update
import.meta.hot.dispose((data) => {
  data.count = globalCount
  data.state = currentState
})

// Restore state after update
import.meta.hot.accept()
if (import.meta.hot.data.count) {
  globalCount = import.meta.hot.data.count
}
```

## Custom Events

### `hot.on(event, cb)`

Listen for custom HMR events.

```ts
import.meta.hot.on('special-update', (data) => {
  console.log('Custom event received:', data)
})
```

### `hot.send(event, data)`

Send events from client to server.

```ts
import.meta.hot.send('my-event', { msg: 'hello from client' })
```

### Built-in Events

| Event | Description |
|-------|-------------|
| `'vite:beforeUpdate'` | Before HMR update is applied |
| `'vite:afterUpdate'` | After HMR update is applied |
| `'vite:beforeFullReload'` | Before full page reload |
| `'vite:beforePrune'` | Before modules are pruned |
| `'vite:invalidate'` | When `import.meta.hot.invalidate()` is called |
| `'vite:error'` | When an error occurs (shown in overlay) |
| `'vite:ws:disconnect'` | When WebSocket connection is lost |
| `'vite:ws:connect'` | When WebSocket (re)connects |

```ts
import.meta.hot.on('vite:beforeUpdate', (payload) => {
  console.log('HMR update incoming:', payload)
})

import.meta.hot.on('vite:error', (payload) => {
  console.error('HMR error:', payload.err)
})
```

## Plugin-Side Custom Events

Send events from plugin (server) to client:

```ts
// In plugin
export default function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    configureServer(server) {
      server.hot.on('my-event', (data, client) => {
        // Handle client event
        console.log('Received from client:', data)

        // Send to specific client
        client.send('my-response', { ok: true })
      })

      // Broadcast to all clients
      server.hot.send('broadcast-event', { msg: 'hello all' })
    },
  }
}
```

## TypeScript Types

```ts
// env.d.ts — extend HMR types for custom events
interface ImportMetaHot {
  readonly data: Record<string, any>
  accept(): void
  accept(cb: (mod: any) => void): void
  accept(dep: string, cb: (mod: any) => void): void
  accept(deps: string[], cb: (mods: any[]) => void): void
  dispose(cb: (data: Record<string, any>) => void): void
  prune(cb: () => void): void
  invalidate(message?: string): void
  on(event: string, cb: (...args: any[]) => void): void
  send(event: string, data?: any): void
}

// Custom event typing
declare module 'vite/types/customEvent' {
  interface CustomEventMap {
    'my-event': { msg: string }
    'my-response': { ok: boolean }
  }
}
```

## HMR for Framework Authors

### Typical HMR Boundary Pattern

```ts
// Accept self updates
import.meta.hot.accept()

// Preserve state across updates
const state = import.meta.hot.data.state || createInitialState()
import.meta.hot.dispose((data) => {
  data.state = state
})

// Re-render on update
render(state)
```

### Decision Table

| Scenario | API |
|----------|-----|
| Module can re-render itself | `hot.accept()` |
| Need to react to dependency change | `hot.accept('./dep', cb)` |
| Has side effects to clean up | `hot.dispose(cb)` |
| Module removed from graph | `hot.prune(cb)` |
| Can't safely hot-update | `hot.invalidate()` |
| State to preserve across updates | `hot.data` |
| Server → client communication | `hot.on()` / `server.hot.send()` |
| Client → server communication | `hot.send()` / `server.hot.on()` |
