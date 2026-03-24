# Result Pattern

Type-safe error handling without exceptions.

## Basic Result Type

```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// Constructors
function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function Err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Usage
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return Err("Division by zero");
  return Ok(a / b);
}

const result = divide(10, 2);
if (result.ok) {
  console.log(result.value); // 5
} else {
  console.error(result.error); // string
}
```

## neverthrow Library

```bash
npm i neverthrow
```

```typescript
import { ok, err, Result, ResultAsync } from "neverthrow";

function parseJSON(input: string): Result<unknown, SyntaxError> {
  try {
    return ok(JSON.parse(input));
  } catch (e) {
    return err(e as SyntaxError);
  }
}

// Chainable API
const result = parseJSON('{"name":"Alice"}')
  .map((data) => data as { name: string })
  .map((user) => user.name.toUpperCase())
  .mapErr((e) => `Parse failed: ${e.message}`);

// Unwrap
result.match(
  (name) => console.log(`Name: ${name}`),
  (error) => console.error(error),
);

// andThen (flatMap)
function validateUser(data: unknown): Result<User, ValidationError> { /* ... */ }
function saveUser(user: User): Result<User, DbError> { /* ... */ }

const pipeline = parseJSON(input)
  .andThen(validateUser)
  .andThen(saveUser);
// Result<User, SyntaxError | ValidationError | DbError>
```

### ResultAsync

```typescript
import { ResultAsync, errAsync } from "neverthrow";

function fetchUser(id: string): ResultAsync<User, ApiError> {
  return ResultAsync.fromPromise(
    fetch(`/api/users/${id}`).then(r => r.json()),
    (e) => new ApiError("Fetch failed", { cause: e }),
  );
}

// Chain async operations
const result = await fetchUser("1")
  .andThen((user) => fetchPosts(user.id))
  .map((posts) => posts.filter(p => p.published))
  .mapErr((e) => `Pipeline failed: ${e.message}`);
```

### Combining Results

```typescript
import { Result, ok, err } from "neverthrow";

const results = Result.combine([
  parseJSON('{"a":1}'),
  parseJSON('{"b":2}'),
  parseJSON('{"c":3}'),
]);
// Result<[unknown, unknown, unknown], SyntaxError>

// If any fails, short-circuits to first error
```

## Error Union Pattern

```typescript
// Define specific error types
class NotFoundError { readonly _tag = "NotFoundError"; constructor(public id: string) {} }
class ValidationError { readonly _tag = "ValidationError"; constructor(public issues: string[]) {} }
class DbError { readonly _tag = "DbError"; constructor(public cause: Error) {} }

type AppError = NotFoundError | ValidationError | DbError;

function handleError(error: AppError) {
  switch (error._tag) {
    case "NotFoundError": return { status: 404, message: `Not found: ${error.id}` };
    case "ValidationError": return { status: 400, message: error.issues.join(", ") };
    case "DbError": return { status: 500, message: "Internal error" };
  }
}
```

## When to Use

| Scenario | Use Result | Use Exceptions |
|----------|-----------|----------------|
| Expected failures (validation, not found) | Yes | No |
| Unexpected failures (bugs, OOM) | No | Yes |
| Library boundaries | Yes | Catch at boundary |
| Internal helpers | Optional | Fine |
| Chaining operations | Yes (andThen) | Try/catch nesting |
