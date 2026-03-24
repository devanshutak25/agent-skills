# Type-Safe Events

Typed EventEmitter, pub/sub, and typed message patterns.

## Typed EventEmitter

```typescript
type EventMap = Record<string, any[]>;

class TypedEmitter<Events extends EventMap> {
  private listeners = new Map<keyof Events, Set<Function>>();

  on<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void): this {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
    return this;
  }

  off<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void): this {
    this.listeners.get(event)?.delete(listener);
    return this;
  }

  emit<K extends keyof Events>(event: K, ...args: Events[K]): void {
    this.listeners.get(event)?.forEach(fn => fn(...args));
  }

  once<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void): this {
    const wrapper = (...args: Events[K]) => {
      this.off(event, wrapper);
      listener(...args);
    };
    return this.on(event, wrapper);
  }
}

// Usage
interface AppEvents {
  userCreated: [user: { id: string; name: string }];
  orderPlaced: [orderId: string, total: number];
  error: [error: Error];
}

const emitter = new TypedEmitter<AppEvents>();

emitter.on("userCreated", (user) => {
  console.log(user.name); // Typed: { id: string; name: string }
});

emitter.on("orderPlaced", (orderId, total) => {
  console.log(orderId, total); // string, number
});

emitter.emit("userCreated", { id: "1", name: "Alice" }); // OK
// emitter.emit("userCreated", "wrong"); // Error
```

## Node.js EventEmitter Typing

```typescript
import { EventEmitter } from "events";

interface ServerEvents {
  connection: [socket: Socket];
  error: [error: Error];
  listening: [];
}

// Extend with type map
class TypedServer extends (EventEmitter as {
  new (): TypedEventEmitter<ServerEvents>;
}) {
  start() {
    this.emit("listening");
  }
}

// Or use declaration merging
interface TypedEventEmitter<Events extends Record<string, any[]>> {
  on<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void): this;
  emit<K extends keyof Events>(event: K, ...args: Events[K]): boolean;
  off<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void): this;
}
```

## Typed Pub/Sub

```typescript
type Subscriber<T> = (data: T) => void;
type Unsubscribe = () => void;

class TypedPubSub<Channels extends Record<string, unknown>> {
  private subs = new Map<keyof Channels, Set<Function>>();

  subscribe<K extends keyof Channels>(channel: K, fn: Subscriber<Channels[K]>): Unsubscribe {
    if (!this.subs.has(channel)) this.subs.set(channel, new Set());
    this.subs.get(channel)!.add(fn);
    return () => { this.subs.get(channel)?.delete(fn); };
  }

  publish<K extends keyof Channels>(channel: K, data: Channels[K]): void {
    this.subs.get(channel)?.forEach(fn => fn(data));
  }
}

// Usage
interface Channels {
  "user:created": { id: string; name: string };
  "user:deleted": { id: string };
  "order:placed": { orderId: string; items: string[] };
}

const bus = new TypedPubSub<Channels>();

const unsub = bus.subscribe("user:created", (data) => {
  console.log(data.name); // string
});

bus.publish("user:created", { id: "1", name: "Alice" });
unsub(); // Cleanup
```

## Typed Message Passing

```typescript
// Worker/iframe message typing
type Messages = {
  ping: { timestamp: number };
  pong: { timestamp: number; latency: number };
  data: { payload: unknown };
};

type Message<K extends keyof Messages = keyof Messages> = {
  [T in K]: { type: T } & Messages[T];
}[K];

function sendMessage<K extends keyof Messages>(type: K, data: Messages[K]) {
  postMessage({ type, ...data });
}

function handleMessage(msg: Message) {
  switch (msg.type) {
    case "ping":
      sendMessage("pong", { timestamp: msg.timestamp, latency: Date.now() - msg.timestamp });
      break;
    case "pong":
      console.log(`Latency: ${msg.latency}ms`);
      break;
    case "data":
      console.log(msg.payload);
      break;
  }
}
```

## Type-Safe Command Pattern

```typescript
interface CommandMap {
  createUser: { name: string; email: string };
  deleteUser: { id: string };
  updateRole: { userId: string; role: "admin" | "user" };
}

type CommandHandler<K extends keyof CommandMap> = (payload: CommandMap[K]) => Promise<void>;

class CommandBus {
  private handlers = new Map<string, Function>();

  register<K extends keyof CommandMap>(command: K, handler: CommandHandler<K>): void {
    this.handlers.set(command as string, handler);
  }

  async dispatch<K extends keyof CommandMap>(command: K, payload: CommandMap[K]): Promise<void> {
    const handler = this.handlers.get(command as string);
    if (!handler) throw new Error(`No handler for ${String(command)}`);
    await handler(payload);
  }
}

const bus = new CommandBus();
bus.register("createUser", async ({ name, email }) => { /* ... */ });
await bus.dispatch("createUser", { name: "Alice", email: "a@b.com" });
```

## DOM Event Typing

```typescript
// Built-in DOM event maps
element.addEventListener("click", (e: MouseEvent) => { /* ... */ });
element.addEventListener("keydown", (e: KeyboardEvent) => { /* ... */ });

// Custom element events
interface CustomEvents {
  "theme-change": CustomEvent<{ theme: "light" | "dark" }>;
  "item-select": CustomEvent<{ id: string; label: string }>;
}

// Typed dispatch
function dispatchTyped<K extends keyof CustomEvents>(
  el: Element,
  type: K,
  detail: CustomEvents[K] extends CustomEvent<infer D> ? D : never,
) {
  el.dispatchEvent(new CustomEvent(type, { detail }));
}

dispatchTyped(el, "theme-change", { theme: "dark" }); // Typed
```
