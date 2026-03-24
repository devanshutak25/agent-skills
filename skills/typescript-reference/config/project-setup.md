# Project Setup Recipes

Complete tsconfig configurations for common project types. See [tsconfig.md](./tsconfig.md) for option details.

## Library (ESM Only)

```json
{
  "extends": "@tsconfig/strictest/tsconfig.json",
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "sourceMap": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

Build with `tsup`:
```bash
tsup src/index.ts --format esm --dts
```

## Library (Dual CJS + ESM)

```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "./dist",
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

```bash
tsup src/index.ts --format esm,cjs --dts
```

package.json exports:
```json
{
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"]
}
```

## Application (Vite + React)

```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "skipLibCheck": true,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src", "vite-env.d.ts"]
}
```

## Application (Node.js)

```json
{
  "extends": "@tsconfig/node20/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "sourceMap": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

Run with `tsx`:
```bash
tsx src/index.ts           # Development
tsx watch src/index.ts     # Watch mode
tsc && node dist/index.js  # Production
```

## Monorepo Root

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "es2022",
    "module": "esnext",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "declaration": true,
    "declarationMap": true,
    "composite": true,
    "skipLibCheck": true
  },
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/ui" },
    { "path": "./packages/api" }
  ],
  "include": []
}
```

Build: `tsc --build` (incremental, respects references)

## JS → TS Migration

### Phase 1: Allow JS
```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": false,
    "strict": false,
    "noEmit": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

### Phase 2: Enable Checking
```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,        // Type-check .js files
    "strict": false,         // Enable later
    "noEmit": true
  }
}
```

### Phase 3: Strict Mode
```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "strict": true,          // Enable one flag at a time if needed
    "noEmit": true
  }
}
```

### Phase 4: Full TypeScript
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true,
    "noEmit": true
  }
}
```

## Common package.json Scripts

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "dev": "tsx watch src/index.ts",
    "lint": "eslint src --ext .ts,.tsx",
    "test": "vitest"
  }
}
```
