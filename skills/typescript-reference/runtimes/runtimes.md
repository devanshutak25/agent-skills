# TypeScript Runtimes

Running TypeScript across Node.js, Deno, Bun, and tsx.

## Feature Matrix

| Feature | Node.js (--strip-types) | Deno | Bun | tsx |
|---------|------------------------|------|-----|-----|
| Native TS execution | 22.6+ (strip only) | Yes | Yes | Via esbuild |
| Type checking | No | `deno check` | No | No |
| Enums | No (strip-only) | Yes | Yes | Yes |
| Decorators | No (strip-only) | Yes | Yes | Yes |
| `paths` / aliases | No | `deno.json` | `bunfig.toml` | Yes (tsconfig) |
| npm packages | Yes | Yes (npm: prefix or node_modules) | Yes | Yes |
| Watch mode | `--watch` | `--watch` | `--watch` | `tsx watch` |
| Speed | Fast (no transform) | Fast | Fastest | Fast |
| Production use | Yes (with tsc build) | Yes | Yes | Dev only |

## Node.js (Native TypeScript)

### Strip Types Mode (22.6+)
```bash
node --experimental-strip-types src/index.ts  # Node 22.6–22.11
node src/index.ts                             # Node 23.6+ (unflagged)
```

**Limitations:**
- Strips types only — no transformation
- No `enum` (use string unions or `as const` objects)
- No `namespace` with runtime code
- No `const enum`
- No legacy decorators
- No `paths` in tsconfig
- Requires `type` keyword on type-only imports (`verbatimModuleSyntax`)

### Transform Mode (22.7+)
```bash
node --experimental-transform-types src/index.ts
```
- Enables `enum` and `namespace`
- Uses SWC under the hood
- Still no type checking

### Recommended Setup
```json
// tsconfig.json for Node.js native TS
{
  "compilerOptions": {
    "target": "esnext",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

## Deno

```bash
deno run src/index.ts           # Run
deno run --watch src/index.ts   # Watch mode
deno check src/index.ts         # Type-check (uses built-in tsc)
deno test                       # Run tests
deno compile src/index.ts       # Compile to binary
```

```json
// deno.json
{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  },
  "imports": {
    "@std/": "jsr:@std/",
    "zod": "npm:zod@3"
  },
  "nodeModulesDir": "auto"
}
```

**Key features:**
- Built-in TypeScript compiler (type checking)
- Permission system: `--allow-net`, `--allow-read`, `--allow-env`
- JSR registry support
- `npm:` specifier for npm packages
- Node.js compatibility layer

## Bun

```bash
bun run src/index.ts            # Run
bun --watch src/index.ts        # Watch mode
bun build src/index.ts --outdir dist  # Bundle
bun test                        # Run tests (Jest-compatible)
```

```toml
# bunfig.toml (optional)
[install]
peer = false

[test]
coverage = true
```

**Key features:**
- Fastest startup and execution
- Built-in bundler, test runner, package manager
- Native SQLite, HTTP server, WebSocket
- JSX/TSX support out of the box
- Drop-in Node.js replacement (mostly compatible)

## tsx (Development Runner)

```bash
tsx src/index.ts                # Run once
tsx watch src/index.ts          # Watch mode
node --import tsx src/index.ts  # As Node.js loader
npx tsx src/index.ts            # Without install
```

**Key features:**
- Powered by esbuild (fast transpilation)
- Supports all TS features (enums, decorators, paths)
- Works with existing tsconfig.json
- CJS and ESM support
- **Dev only** — not for production builds

## Decision Guide

| Scenario | Recommendation |
|----------|----------------|
| New app, want native | **Node.js 23+** strip-types (simple features) or **Bun** (full TS) |
| Library development | **tsc** for type checking + **tsup** for builds |
| Dev iteration speed | **tsx** (any Node version) or **Bun** |
| Edge/serverless | **Bun** or **Deno** |
| Full type checking at runtime | **Deno** (only runtime with built-in `tsc`) |
| Maximum compatibility | **Node.js** + tsx for dev |
