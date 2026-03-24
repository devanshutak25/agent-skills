# Starter Configs

Ready-to-use tsconfig presets and @tsconfig/bases references.

## @tsconfig/bases Presets

Install and extend official community presets:

```bash
npm i -D @tsconfig/strictest @tsconfig/node20 @tsconfig/vite-react
```

| Preset | target | module | moduleResolution | Key Settings |
|--------|--------|--------|------------------|--------------|
| `@tsconfig/strictest` | — | — | — | All strict flags + `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess` |
| `@tsconfig/node18` | `es2023` | `node16` | `node16` | Node.js 18 |
| `@tsconfig/node20` | `es2023` | `nodenext` | `nodenext` | Node.js 20 |
| `@tsconfig/node22` | `es2024` | `nodenext` | `nodenext` | Node.js 22 |
| `@tsconfig/vite-react` | `es2022` | `esnext` | `bundler` | Vite + React |
| `@tsconfig/deno` | — | — | — | Deno runtime |

## Library (ESM)

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
    "outDir": "dist",
    "rootDir": "src",
    "sourceMap": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

## Library (Dual CJS + ESM)

```json
{
  "extends": "@tsconfig/strictest/tsconfig.json",
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "dist",
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

package.json:
```json
{
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

## React App (Vite)

```json
{
  "extends": "@tsconfig/vite-react/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src", "vite-env.d.ts"]
}
```

## Next.js App

```json
{
  "compilerOptions": {
    "target": "es2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Node.js API

```json
{
  "extends": "@tsconfig/node20/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true,
    "outDir": "dist",
    "rootDir": "src",
    "sourceMap": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
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
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "skipLibCheck": true
  },
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/ui" },
    { "path": "./apps/web" }
  ],
  "include": []
}
```

## JS -> TS Migration (Incremental)

```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "strict": false,
    "noEmit": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "module": "esnext",
    "target": "es2022"
  },
  "include": ["src"]
}
```

Enable strict flags incrementally:
```json
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": true,
    "strictNullChecks": true
    // Add more flags as you fix errors
  }
}
```

## Bundler Scripts

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "dev": "tsx watch src/index.ts",
    "test": "vitest",
    "lint": "eslint src --ext .ts,.tsx"
  }
}
```
