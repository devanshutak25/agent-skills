# using & Disposable

Explicit Resource Management (TS 5.2+). Automatic cleanup with `using` and `await using`.

## Disposable Interface

```typescript
interface Disposable {
  [Symbol.dispose](): void;
}

interface AsyncDisposable {
  [Symbol.asyncDispose](): Promise<void>;
}
```

## using Declaration

```typescript
// Sync disposal
function readFile() {
  using file = openFile("data.txt");
  // file is automatically disposed when scope exits
  return file.read();
} // file[Symbol.dispose]() called here

// Creating a disposable
class TempFile implements Disposable {
  constructor(public path: string) {
    writeFileSync(path, "");
  }

  [Symbol.dispose]() {
    unlinkSync(this.path);
    console.log(`Cleaned up ${this.path}`);
  }
}

function processData() {
  using tmp = new TempFile("/tmp/work.txt");
  // ... use tmp
} // Automatically deleted
```

## await using (Async)

```typescript
class DbConnection implements AsyncDisposable {
  static async connect(url: string) {
    const conn = new DbConnection(url);
    await conn.init();
    return conn;
  }

  async [Symbol.asyncDispose]() {
    await this.close();
    console.log("Connection closed");
  }
}

async function query() {
  await using db = await DbConnection.connect("postgres://...");
  return db.execute("SELECT * FROM users");
} // db automatically closed
```

## DisposableStack

```typescript
function createResources() {
  using stack = new DisposableStack();

  const file = stack.use(openFile("data.txt"));
  const conn = stack.use(connectDb());
  const lock = stack.adopt(acquireLock(), (l) => l.release());

  // All disposed in reverse order when scope exits
  return processAll(file, conn, lock);
}
```

## AsyncDisposableStack

```typescript
async function setupPipeline() {
  await using stack = new AsyncDisposableStack();

  const producer = stack.use(await createProducer());
  const consumer = stack.use(await createConsumer());

  stack.defer(async () => {
    await flushMetrics();
    console.log("Metrics flushed");
  });

  return runPipeline(producer, consumer);
}
```

## Common Patterns

### Lock Management
```typescript
class Mutex implements Disposable {
  private locked = false;

  acquire(): Disposable {
    this.locked = true;
    return { [Symbol.dispose]: () => { this.locked = false; } };
  }
}

const mutex = new Mutex();
function criticalSection() {
  using lock = mutex.acquire();
  // ... mutex released automatically
}
```

### Timer / Performance
```typescript
function timer(label: string): Disposable {
  const start = performance.now();
  return {
    [Symbol.dispose]() {
      console.log(`${label}: ${(performance.now() - start).toFixed(2)}ms`);
    },
  };
}

function compute() {
  using _ = timer("compute");
  // ... heavy work
} // Logs: "compute: 142.50ms"
```

## Requirements

- TypeScript 5.2+
- Target: `es2022` or higher, or polyfill `Symbol.dispose` / `Symbol.asyncDispose`
- `lib`: include `"esnext.disposable"` or `"esnext"`
