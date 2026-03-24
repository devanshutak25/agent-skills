# Branded Types

Nominal/branded types for type-safe identifiers and domain values.

## The Problem

```typescript
// Structural typing allows mixing up compatible types
function getUser(id: string): User { /* ... */ }
function getOrder(id: string): Order { /* ... */ }

const userId = "usr_123";
const orderId = "ord_456";
getUser(orderId); // No error! Wrong ID type passed
```

## Brand Pattern

```typescript
// Create a unique brand using intersection with a phantom type
type Brand<T, B extends string> = T & { readonly __brand: B };

type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;
type Email = Brand<string, "Email">;

// Constructor functions (validate + brand)
function UserId(id: string): UserId {
  if (!id.startsWith("usr_")) throw new Error("Invalid UserId");
  return id as UserId;
}

function OrderId(id: string): OrderId {
  if (!id.startsWith("ord_")) throw new Error("Invalid OrderId");
  return id as OrderId;
}

function Email(value: string): Email {
  if (!value.includes("@")) throw new Error("Invalid Email");
  return value as Email;
}

// Now type-safe
function getUser(id: UserId): User { /* ... */ }
function getOrder(id: OrderId): Order { /* ... */ }

const uid = UserId("usr_123");
const oid = OrderId("ord_456");
getUser(uid);  // OK
// getUser(oid); // Error: OrderId not assignable to UserId
```

## Unique Symbol Brand (Stricter)

```typescript
// Uses unique symbol for guaranteed uniqueness
declare const brand: unique symbol;
type Branded<T, B> = T & { [brand]: B };

type USD = Branded<number, "USD">;
type EUR = Branded<number, "EUR">;

function usd(amount: number): USD { return amount as USD; }
function eur(amount: number): EUR { return amount as EUR; }

function addUSD(a: USD, b: USD): USD {
  return (a + b) as USD;
}

const price = usd(10);
const tax = usd(2);
const euroPrice = eur(9);

addUSD(price, tax);       // OK
// addUSD(price, euroPrice); // Error: EUR not assignable to USD
```

## Branded Primitives with Validation

```typescript
type PositiveInt = Brand<number, "PositiveInt">;
type NonEmptyString = Brand<string, "NonEmptyString">;
type Percentage = Brand<number, "Percentage">;

function PositiveInt(n: number): PositiveInt {
  if (!Number.isInteger(n) || n <= 0) throw new RangeError(`Not positive int: ${n}`);
  return n as PositiveInt;
}

function NonEmptyString(s: string): NonEmptyString {
  if (s.length === 0) throw new Error("String is empty");
  return s as NonEmptyString;
}

function Percentage(n: number): Percentage {
  if (n < 0 || n > 100) throw new RangeError(`Not a percentage: ${n}`);
  return n as Percentage;
}
```

## With Zod

```typescript
import { z } from "zod";

const UserIdSchema = z.string().startsWith("usr_").brand<"UserId">();
type UserId = z.infer<typeof UserIdSchema>; // string & { __brand: "UserId" }

const result = UserIdSchema.parse("usr_123"); // UserId
// UserIdSchema.parse("ord_456"); // Throws
```

## Database ID Pattern

```typescript
type Brand<T, B extends string> = T & { readonly __brand: B };

// One brand per entity
type UserId = Brand<string, "UserId">;
type PostId = Brand<string, "PostId">;
type CommentId = Brand<string, "CommentId">;

interface User { id: UserId; name: string }
interface Post { id: PostId; title: string; authorId: UserId }
interface Comment { id: CommentId; postId: PostId; authorId: UserId; text: string }

// API functions are type-safe
async function getPost(id: PostId): Promise<Post> { /* ... */ }
async function getComments(postId: PostId): Promise<Comment[]> { /* ... */ }
async function getUserPosts(userId: UserId): Promise<Post[]> { /* ... */ }
```

## Opaque Type Helper

```typescript
// Generic helper type
type Opaque<T, Token extends string> = T & { readonly __opaque__: Token };

// Companion module pattern
namespace Latitude {
  export type T = Opaque<number, "Latitude">;
  export function create(n: number): T {
    if (n < -90 || n > 90) throw new RangeError("Invalid latitude");
    return n as T;
  }
}

namespace Longitude {
  export type T = Opaque<number, "Longitude">;
  export function create(n: number): T {
    if (n < -180 || n > 180) throw new RangeError("Invalid longitude");
    return n as T;
  }
}

function setLocation(lat: Latitude.T, lng: Longitude.T) { /* ... */ }

const lat = Latitude.create(40.7);
const lng = Longitude.create(-74.0);
setLocation(lat, lng); // OK
// setLocation(lng, lat); // Error
```
