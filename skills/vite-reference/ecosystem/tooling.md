# Tooling

## VS Code

### Recommended Extensions
- **Vite** — official Vite extension (debugging, preview)

### Debug Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Vite App",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/*"
      }
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Vite SSR",
      "program": "${workspaceFolder}/server.js",
      "restart": true,
      "sourceMaps": true,
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

### TypeScript Setup

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

## vite-plugin-inspect

Inspect intermediate plugin transforms — invaluable for plugin debugging.

```bash
npm i -D vite-plugin-inspect
```

```ts
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  plugins: [Inspect()],
})
```

- Visit `http://localhost:5173/__inspect/` in dev mode
- Shows each plugin's transform output per module
- Visualizes the plugin pipeline
- Useful for debugging transform ordering issues

## vite-plugin-checker

Run TypeScript, ESLint, vue-tsc, Stylelint checks in a worker thread alongside dev server.

```bash
npm i -D vite-plugin-checker
```

```ts
import checker from 'vite-plugin-checker'

export default defineConfig({
  plugins: [
    checker({
      typescript: true,
      // Or with custom config:
      // typescript: { tsconfigPath: './tsconfig.app.json' },

      eslint: {
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
        useFlatConfig: true,
      },

      // Overlay settings
      overlay: {
        initialIsOpen: false,
        position: 'br',         // 'tl' | 'tr' | 'bl' | 'br'
        badgeStyle: 'margin-bottom: 4px',
      },
    }),
  ],
})
```

## vite-node

Run Node.js scripts with Vite's transform pipeline. Used internally by Vitest.

```bash
npx vite-node script.ts
```

```ts
// script.ts — can use Vite features (env, aliases, etc.)
import { someUtil } from '@/utils'
console.log(import.meta.env.VITE_API_URL)
```

Useful for:
- Running seed scripts with Vite config
- Testing server code with Vite transforms
- Development scripts that need path aliases

## Profiling & Debugging

### Debug Vite Transforms

```bash
# Enable Vite debug logs
DEBUG="vite:*" vite

# Specific namespaces
DEBUG="vite:transform" vite
DEBUG="vite:resolve" vite
DEBUG="vite:deps" vite
DEBUG="vite:hmr" vite

# Multiple
DEBUG="vite:resolve,vite:transform" vite
```

### Build Profiling

```bash
# CPU profile during build
vite build --profile

# Generates vite-profile-*.cpuprofile
# Open in: Chrome DevTools → Performance → Load Profile
```

### Bundle Analysis

```bash
# rollup-plugin-visualizer
npm i -D rollup-plugin-visualizer
```

```ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'stats.html',
    }),
  ],
})
```

## Monorepo Tools

### Turborepo

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### pnpm Workspaces

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

```ts
// vite.config.ts in a workspace package
export default defineConfig({
  resolve: {
    // Resolve workspace packages to their source (not dist)
    conditions: ['development'],
  },
  optimizeDeps: {
    // Don't pre-bundle workspace packages
    exclude: ['@my-org/shared'],
  },
})
```

### Nx

```bash
npx create-nx-workspace --preset=vite
```

Nx supports Vite natively with:
- `@nx/vite` plugin for executors/generators
- Automatic project graph from Vite config
- Distributed caching for builds

## ESLint & Prettier

### ESLint Flat Config

```ts
// eslint.config.js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
)
```

### Prettier

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all"
}
```

## CLI Shortcuts (Dev Mode)

| Key | Action |
|-----|--------|
| `r` + Enter | Restart server |
| `u` + Enter | Show server URL |
| `o` + Enter | Open in browser |
| `c` + Enter | Clear console |
| `q` + Enter | Quit |

## Tooling Decision Table

| Need | Tool |
|------|------|
| Type checking in dev | `vite-plugin-checker` |
| Inspect plugin transforms | `vite-plugin-inspect` |
| Run scripts with Vite config | `vite-node` |
| Profile builds | `vite build --profile` |
| Bundle size analysis | `rollup-plugin-visualizer` |
| Monorepo builds | Turborepo / Nx |
| Monorepo package management | pnpm workspaces |
| Debug Vite internals | `DEBUG="vite:*" vite` |
