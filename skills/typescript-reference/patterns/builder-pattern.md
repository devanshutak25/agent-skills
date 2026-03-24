# Builder Pattern

Type-safe builder with progressive type narrowing.

## Basic Type-Safe Builder

```typescript
interface QueryConfig {
  table: string;
  columns: string[];
  where?: string;
  orderBy?: string;
  limit?: number;
}

class QueryBuilder<T extends Partial<QueryConfig> = {}> {
  private config: Partial<QueryConfig> = {};

  from<Table extends string>(table: Table): QueryBuilder<T & { table: Table }> {
    return Object.assign(this.clone(), { config: { ...this.config, table } }) as any;
  }

  select<Cols extends string[]>(...columns: Cols): QueryBuilder<T & { columns: Cols }> {
    return Object.assign(this.clone(), { config: { ...this.config, columns } }) as any;
  }

  where(condition: string): QueryBuilder<T & { where: string }> {
    return Object.assign(this.clone(), { config: { ...this.config, where: condition } }) as any;
  }

  limit(n: number): QueryBuilder<T & { limit: number }> {
    return Object.assign(this.clone(), { config: { ...this.config, limit: n } }) as any;
  }

  // Only callable when required fields are set
  build(this: QueryBuilder<{ table: string; columns: string[] }>): string {
    const c = this.config as QueryConfig;
    let sql = `SELECT ${c.columns.join(", ")} FROM ${c.table}`;
    if (c.where) sql += ` WHERE ${c.where}`;
    if (c.limit) sql += ` LIMIT ${c.limit}`;
    return sql;
  }

  private clone(): QueryBuilder<T> {
    const b = new QueryBuilder<T>();
    (b as any).config = { ...this.config };
    return b;
  }
}

// Usage
const query = new QueryBuilder()
  .from("users")
  .select("id", "name")
  .where("active = true")
  .limit(10)
  .build(); // OK — table + columns set

// new QueryBuilder().select("id").build(); // Error — table not set
```

## Request Builder

```typescript
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestInit {
  method?: HttpMethod;
  url?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

type HasUrl = { url: string };
type HasMethod = { method: HttpMethod };

class RequestBuilder<State extends Partial<RequestInit> = {}> {
  private init: Partial<RequestInit> = {};

  url(url: string): RequestBuilder<State & HasUrl> {
    this.init.url = url;
    return this as any;
  }

  method(method: HttpMethod): RequestBuilder<State & HasMethod> {
    this.init.method = method;
    return this as any;
  }

  body(data: unknown): RequestBuilder<State & { body: unknown }> {
    this.init.body = data;
    return this as any;
  }

  header(key: string, value: string): RequestBuilder<State> {
    this.init.headers = { ...this.init.headers, [key]: value };
    return this;
  }

  // Requires both URL and method
  async send(this: RequestBuilder<HasUrl & HasMethod>): Promise<Response> {
    const { url, method, body, headers } = this.init as Required<Pick<RequestInit, "url" | "method">> & RequestInit;
    return fetch(url, { method, body: body ? JSON.stringify(body) : undefined, headers });
  }
}

// Usage
await new RequestBuilder()
  .url("/api/users")
  .method("POST")
  .body({ name: "Alice" })
  .header("Content-Type", "application/json")
  .send(); // OK

// new RequestBuilder().url("/api").send(); // Error: method missing
```

## Step Builder (Forced Order)

```typescript
// Each step returns the next step's interface
interface SetName { name(n: string): SetEmail }
interface SetEmail { email(e: string): SetRole }
interface SetRole { role(r: "admin" | "user"): Build }
interface Build { build(): User }

function userBuilder(): SetName {
  const data: Partial<User> = {};

  return {
    name(n: string) {
      data.name = n;
      return {
        email(e: string) {
          data.email = e;
          return {
            role(r: "admin" | "user") {
              data.role = r;
              return {
                build() { return data as User; }
              };
            }
          };
        }
      };
    }
  };
}

// Must follow exact order
const user = userBuilder()
  .name("Alice")
  .email("alice@example.com")
  .role("admin")
  .build();
```

## Generic Config Builder

```typescript
type Prettify<T> = { [K in keyof T]: T[K] } & {};

function configBuilder<T extends Record<string, unknown> = {}>() {
  const config = {} as Record<string, unknown>;

  return {
    set<K extends string, V>(key: K, value: V) {
      config[key] = value;
      return this as unknown as ReturnType<typeof configBuilder<Prettify<T & Record<K, V>>>>;
    },
    build(): Prettify<T> {
      return { ...config } as Prettify<T>;
    },
  };
}

const cfg = configBuilder()
  .set("host", "localhost")
  .set("port", 3000)
  .set("debug", true)
  .build();
// { host: string; port: number; debug: boolean }
```
