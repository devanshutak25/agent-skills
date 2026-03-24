# tsconfig.json Reference

Critical compiler options organized by category. See [project-setup.md](./project-setup.md) for complete recipes.

## Strict Mode Options

```json
{
  "compilerOptions": {
    "strict": true  // Enables ALL below:
    // "strictNullChecks": true,       — null/undefined are distinct types
    // "strictFunctionTypes": true,    — contravariant function params
    // "strictBindCallApply": true,    — typed bind/call/apply
    // "strictPropertyInitialization": true, — class properties must init
    // "noImplicitAny": true,          — error on implicit any
    // "noImplicitThis": true,         — error on implicit this
    // "useUnknownInCatchVariables": true,  — catch(e) is unknown
    // "alwaysStrict": true            — emit "use strict"
  }
}
```

## Module &amp; Resolution

| Option | Values | When |
|--------|--------|------|
| `module` | `esnext`, `nodenext`, `commonjs` | `esnext` for bundlers, `nodenext` for Node |
| `moduleResolution` | `bundler`, `node16`, `nodenext` | `bundler` for Vite/webpack, `node16+` for Node |
| `target` | `es2022`, `esnext` | `es2022` for modern browsers + Node 18+ |
| `verbatimModuleSyntax` | `true` | Always for new projects — replaces 3 older flags |
| `esModuleInterop` | `true` | Enable if not using `verbatimModuleSyntax` |
| `resolveJsonModule` | `true` | Import .json files |
| `allowImportingTsExtensions` | `true` | Import with `.ts` extensions (bundler only) |

## Output Options

| Option | Value | Purpose |
|--------|-------|---------|
| `outDir` | `"./dist"` | Output directory |
| `rootDir` | `"./src"` | Source root for directory structure |
| `declaration` | `true` | Generate .d.ts files |
| `declarationMap` | `true` | Source maps for declarations |
| `sourceMap` | `true` | JS source maps |
| `emitDeclarationOnly` | `true` | When bundler handles JS output |
| `noEmit` | `true` | Type-check only (tsc --noEmit) |

## Type Checking Extras

| Option | Purpose |
|--------|---------|
| `noUncheckedIndexedAccess` | `obj[key]` returns `T \| undefined` |
| `exactOptionalPropertyTypes` | `prop?: string` ≠ `prop: string \| undefined` |
| `noPropertyAccessFromIndexSignature` | Force bracket notation for index sigs |
| `noFallthroughCasesInSwitch` | Error on fallthrough switch cases |
| `forceConsistentCasingInFileNames` | Prevent case-sensitivity bugs |
| `skipLibCheck` | `true` — skip .d.ts checking (faster builds) |

## Path Mapping

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@utils/*": ["./src/utils/*"]
    }
  }
}
```

## Project References

```json
// Root tsconfig.json
{
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/ui" },
    { "path": "./packages/api" }
  ]
}

// packages/core/tsconfig.json
{
  "compilerOptions": {
    "composite": true,       // Required for references
    "outDir": "./dist",
    "declarationMap": true
  }
}
```

## @tsconfig/bases Presets

```json
// npm i -D @tsconfig/strictest
{ "extends": "@tsconfig/strictest/tsconfig.json" }

// npm i -D @tsconfig/node20
{ "extends": "@tsconfig/node20/tsconfig.json" }

// npm i -D @tsconfig/vite-react
{ "extends": "@tsconfig/vite-react/tsconfig.json" }
```

| Preset | Target | Module | Resolution | Use Case |
|--------|--------|--------|------------|----------|
| `@tsconfig/strictest` | — | — | — | Maximum strictness overlay |
| `@tsconfig/node20` | `es2023` | `nodenext` | `nodenext` | Node.js 20 |
| `@tsconfig/node22` | `es2024` | `nodenext` | `nodenext` | Node.js 22 |
| `@tsconfig/vite-react` | `es2022` | `esnext` | `bundler` | Vite + React |

## Include / Exclude

```json
{
  "include": ["src/**/*", "types/**/*.d.ts"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```
