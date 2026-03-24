# Declaration Files

Authoring `.d.ts` files, `declare module`, `@types/*`, and triple-slash directives.

## .d.ts Basics

```typescript
// types.d.ts — ambient declarations (no implementation)
declare function greet(name: string): string;
declare const VERSION: string;
declare class Logger {
  log(message: string): void;
  error(message: string, cause?: Error): void;
}
```

## declare module

### Typing Untyped Packages
```typescript
// global.d.ts or any .d.ts file
declare module "legacy-lib" {
  export function doStuff(input: string): number;
  export interface Config {
    verbose: boolean;
    timeout: number;
  }
}

// Quick escape hatch — types everything as any
declare module "untyped-lib";
```

### Wildcard Module Declarations
```typescript
// Asset imports
declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.css" {
  const classes: Record<string, string>;
  export default classes;
}

declare module "*.graphql" {
  import { DocumentNode } from "graphql";
  const doc: DocumentNode;
  export default doc;
}
```

## @types/* Packages

```typescript
// Install type definitions from DefinitelyTyped
// npm i -D @types/node @types/express @types/lodash

// tsconfig.json — control @types inclusion
{
  "compilerOptions": {
    // Only include these @types (default: all in node_modules/@types)
    "types": ["node", "jest"],
    // Or control search paths
    "typeRoots": ["./typings", "./node_modules/@types"]
  }
}
```

## Global Augmentation

```typescript
// Extend global types
declare global {
  interface Window {
    __APP_CONFIG__: { apiUrl: string; debug: boolean };
  }

  // Global variable
  var __DEV__: boolean;

  // Extend built-in
  interface Array<T> {
    toSorted(compareFn?: (a: T, b: T) => number): T[];
  }
}

// File must be a module
export {};
```

## Triple-Slash Directives

```typescript
/// <reference types="node" />           — include @types/node
/// <reference path="./other.d.ts" />    — include local declaration
/// <reference lib="dom" />              — include lib (e.g., dom, esnext)
/// <reference no-default-lib="true" />  — exclude default libs

// Modern alternative: use tsconfig "types" and "lib" instead
```

## Writing Library Declarations

### package.json Setup
```json
{
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.mjs"
    }
  }
}
```

### Generating Declarations
```json
// tsconfig.json
{
  "compilerOptions": {
    "declaration": true,
    "declarationDir": "./dist",
    "emitDeclarationOnly": true,  // Use when bundler handles JS
    "declarationMap": true         // Source maps for .d.ts
  }
}
```

## Ambient vs Module Declarations

| Aspect | Ambient (`.d.ts` no import/export) | Module (`.d.ts` with import/export) |
|--------|-------------------------------------|--------------------------------------|
| Scope | Global | File-scoped |
| Usage | Augmenting globals, legacy | Typing modules |
| import needed | No | Yes |
| Typical file | `global.d.ts` | `types/my-lib.d.ts` |

## Common Patterns

### Overloaded Functions
```typescript
declare function createElement(tag: "div"): HTMLDivElement;
declare function createElement(tag: "span"): HTMLSpanElement;
declare function createElement(tag: string): HTMLElement;
```

### Callable + Constructable
```typescript
declare class MyEvent {
  constructor(type: string);
  type: string;
  target: Element | null;
}

declare interface MyEventConstructor {
  new (type: string): MyEvent;
  (type: string): MyEvent; // Also callable without new
}
```

### Namespace as Type Container
```typescript
declare namespace API {
  interface User { id: string; name: string }
  interface Post { id: string; title: string; authorId: string }
  type Response<T> = { data: T; status: number };
}

// Usage: API.User, API.Response<API.Post>
```
