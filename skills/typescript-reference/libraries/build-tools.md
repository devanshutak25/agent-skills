# Build Tools

TypeScript compilation and bundling tools.

## Decision Matrix

| Tool | Speed | Use Case | Output | Declaration Files |
|------|-------|----------|--------|-------------------|
| **tsup** | Fast | Libraries, CLIs | ESM, CJS, IIFE | Yes (via API) |
| **tsx** | Fast | Dev runner (no build) | N/A (in-memory) | No |
| **esbuild** | Fastest | Custom bundling | ESM, CJS, IIFE | No |
| **SWC** | Very fast | Transpilation, Next.js | ESM, CJS | Via plugin |
| **tsc** | Slow | Type-checking, .d.ts | ESM, CJS | Yes (native) |

## tsup (Recommended for Libraries)

```typescript
// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,             // Generate .d.ts
  splitting: true,       // Code splitting
  sourcemap: true,
  clean: true,           // Clean dist before build
  minify: false,         // Set true for production
  target: "es2022",
  outDir: "dist",
});
```

```bash
tsup                      # Build
tsup --watch              # Watch mode
tsup src/cli.ts --format esm --minify  # CLI build
```

### Multi-Entry
```typescript
export default defineConfig({
  entry: {
    index: "src/index.ts",
    cli: "src/cli.ts",
    utils: "src/utils/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
});
```

## tsx (Dev Runner)

```bash
tsx src/index.ts           # Run once
tsx watch src/index.ts     # Watch mode
tsx --tsconfig tsconfig.json src/index.ts

# Use as Node.js loader
node --import tsx ./src/index.ts
```

- No build step — transpiles on-the-fly
- Supports ESM + CJS, path aliases
- Powered by esbuild

## esbuild

```typescript
import { build } from "esbuild";

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/index.js",
  format: "esm",
  platform: "node",
  target: "es2022",
  sourcemap: true,
  external: ["express"],  // Don't bundle
});
```

- **No type checking** — use `tsc --noEmit` separately
- **No .d.ts** — use `tsc --emitDeclarationOnly`
- Plugin ecosystem for custom transforms

## SWC

```json
// .swcrc
{
  "jsc": {
    "parser": { "syntax": "typescript", "decorators": true },
    "target": "es2022"
  },
  "module": { "type": "es6" }
}
```

```bash
swc src -d dist --strip-leading-paths
```

- Used by Next.js, Parcel
- Rust-based, very fast
- Plugin system (Wasm-based)

## tsc (Type Checker + Emitter)

```bash
tsc                       # Compile
tsc --noEmit              # Type-check only
tsc --watch               # Watch mode
tsc --build               # Build project references
tsc --emitDeclarationOnly # .d.ts only (pair with bundler)
```

## Recommended Workflow

```
Development:  tsx watch src/index.ts       (fast iteration)
Type check:   tsc --noEmit                 (CI + pre-commit)
Build:        tsup src/index.ts            (production bundle)
```
