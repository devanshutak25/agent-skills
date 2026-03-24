# Module System

ESM/CJS interop, module resolution, verbatimModuleSyntax, and module augmentation.

## Module Resolution Modes

| `moduleResolution` | Use Case |
|--------------------|----------|
| `bundler` | Vite, webpack, esbuild, tsup — **most common** |
| `node16` / `nodenext` | Direct Node.js execution (no bundler) |
| `node10` (legacy) | Older projects, avoid for new code |

## verbatimModuleSyntax (TS 5.0+)

Replaces `isolatedModules`, `importsNotUsedAsValues`, `preserveValueImports`.

```typescript
// Must use explicit `type` keyword for type-only imports
import type { User } from "./types";      // Erased at runtime
import { createUser } from "./users";     // Kept at runtime

// Mixed import
import { type Config, loadConfig } from "./config";

// Re-exports
export type { User };
export { createUser };
```

## ESM / CJS Interop

### package.json Type Field
```json
{ "type": "module" }   // .js = ESM, .cjs = CJS
{ "type": "commonjs" } // .js = CJS, .mjs = ESM (default if omitted)
```

### Dual Package (CJS + ESM)
```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

### CJS Default Import Gotcha
```typescript
// CJS module: module.exports = { foo: 1 }
import lib from "cjs-lib";       // lib = { foo: 1 }  (default = module.exports)
import { foo } from "cjs-lib";   // May not work in all resolvers

// Safe: use esModuleInterop or allowSyntheticDefaultImports
```

## Declaration Merging

```typescript
// Interface merging
interface Window {
  myGlobal: string;
}

// Namespace merging with function
function doStuff(value: string): void;
namespace doStuff {
  export const version = "1.0";
}
doStuff("hello");
doStuff.version; // "1.0"

// Enum + namespace
enum Color { Red, Blue }
namespace Color {
  export function parse(s: string): Color {
    return s === "red" ? Color.Red : Color.Blue;
  }
}
```

## Module Augmentation

```typescript
// Augment a third-party module
declare module "express" {
  interface Request {
    user?: { id: string; role: string };
  }
}

// Augment global
declare global {
  interface Window {
    analytics: Analytics;
  }

  var __DEV__: boolean;
}

// Must be in a module file (has import/export)
export {};
```

## Import Attributes (TS 5.3+)

```typescript
import config from "./config.json" with { type: "json" };
import styles from "./app.css" with { type: "css" };

// Dynamic import
const data = await import("./data.json", { with: { type: "json" } });
```

## Namespace vs Module

| Feature | Namespace (`namespace X {}`) | Module (file-based) |
|---------|------------------------------|---------------------|
| Scope | Global or nested | File-scoped |
| Loading | Script concatenation | Import/export |
| Tree-shaking | No | Yes |
| Recommendation | **Avoid** (legacy) | **Use always** |
