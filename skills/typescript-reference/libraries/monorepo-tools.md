# Monorepo Tools

TypeScript monorepo management with Turborepo and Nx.

## Decision Matrix

| Tool | Approach | Cache | Best For |
|------|----------|-------|----------|
| **Turborepo** | Task runner | Remote + local | Simple setup, incremental adoption |
| **Nx** | Full build system | Remote + local | Large teams, code generation, plugins |

## Turborepo

### Setup
```bash
npx create-turbo@latest
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Workspace Structure
```
monorepo/
├── turbo.json
├── package.json          # "workspaces": ["apps/*", "packages/*"]
├── apps/
│   ├── web/              # Next.js app
│   └── api/              # Node.js API
└── packages/
    ├── ui/               # Shared components
    ├── config/           # Shared tsconfig, eslint
    └── types/            # Shared TypeScript types
```

### Shared TypeScript Config
```json
// packages/config/tsconfig.base.json
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
  }
}

// apps/web/tsconfig.json
{
  "extends": "@repo/config/tsconfig.base.json",
  "compilerOptions": { "outDir": "./dist" },
  "include": ["src"],
  "references": [{ "path": "../../packages/ui" }]
}
```

### Commands
```bash
turbo build               # Build all packages (parallel, cached)
turbo typecheck            # Type-check all
turbo test --filter=@repo/api  # Run tests for specific package
turbo dev                  # Dev mode for all apps
```

## Nx

### Setup
```bash
npx create-nx-workspace@latest
```

```json
// nx.json
{
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "cache": true,
      "outputs": ["{projectRoot}/dist"]
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "cache": true
    }
  }
}
```

### Commands
```bash
nx build my-app            # Build single project
nx run-many -t build       # Build all
nx affected -t test        # Test only affected packages
nx graph                   # Visualize dependency graph
```

## Shared Types Pattern

```typescript
// packages/types/src/index.ts
export interface User { id: string; name: string; email: string }
export interface Post { id: string; title: string; authorId: string }
export type ApiResponse<T> = { data: T; error: null } | { data: null; error: string };

// apps/web/src/features/users.ts
import type { User, ApiResponse } from "@repo/types";

// apps/api/src/routes/users.ts
import type { User } from "@repo/types";
```

## TypeScript Project References

```json
// packages/ui/tsconfig.json
{
  "compilerOptions": {
    "composite": true,     // Required
    "outDir": "./dist",
    "declarationMap": true // Navigate to source
  },
  "references": [
    { "path": "../types" } // Depends on types package
  ]
}
```

```bash
tsc --build              # Incremental build respecting references
tsc --build --watch      # Watch mode
```
