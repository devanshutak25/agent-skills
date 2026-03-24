# Project Structures

## SPA (Single-Page Application)

```
my-app/
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── assets/                    # Images, fonts, SVGs
│   ├── components/
│   │   ├── ui/                    # Generic UI components
│   │   └── layout/                # Layout components
│   ├── features/                  # Feature-based modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── api.ts
│   │   │   └── types.ts
│   │   └── dashboard/
│   ├── hooks/                     # Shared hooks
│   ├── lib/                       # Utilities, helpers
│   ├── routes/                    # Route components
│   ├── stores/                    # State management
│   ├── styles/                    # Global styles
│   ├── types/                     # Shared types
│   ├── App.tsx
│   ├── main.tsx                   # Entry point
│   └── vite-env.d.ts
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── package.json
```

## MPA (Multi-Page Application)

```
my-mpa/
├── public/
├── src/
│   ├── shared/                    # Shared across pages
│   │   ├── components/
│   │   ├── styles/
│   │   └── utils/
│   ├── pages/
│   │   ├── home/
│   │   │   ├── main.ts
│   │   │   └── App.tsx
│   │   ├── about/
│   │   │   ├── main.ts
│   │   │   └── App.tsx
│   │   └── contact/
│   │       ├── main.ts
│   │       └── App.tsx
├── index.html                     # Home page
├── about/index.html               # About page
├── contact/index.html             # Contact page
├── vite.config.ts
└── package.json
```

```ts
// vite.config.ts
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about/index.html'),
        contact: resolve(__dirname, 'contact/index.html'),
      },
    },
  },
})
```

## SSR Application

```
my-ssr-app/
├── public/
├── src/
│   ├── components/
│   ├── routes/
│   ├── stores/
│   ├── App.tsx
│   ├── entry-client.tsx           # Hydration entry
│   ├── entry-server.tsx           # SSR render entry
│   └── main.tsx                   # Shared app setup
├── server/
│   ├── index.ts                   # Express/Hono server
│   ├── middleware/
│   └── renderer.ts                # HTML template + rendering
├── index.html                     # App shell with <!--ssr-outlet-->
├── vite.config.ts
├── tsconfig.json
└── package.json
```

```json
// package.json scripts
{
  "scripts": {
    "dev": "node server/index.ts",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build --outDir dist/client --ssrManifest",
    "build:server": "vite build --outDir dist/server --ssr src/entry-server.tsx",
    "preview": "NODE_ENV=production node dist/server/index.js"
  }
}
```

## Library Package

```
my-lib/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Dialog.tsx
│   ├── hooks/
│   │   └── useToggle.ts
│   ├── utils/
│   │   └── cn.ts
│   ├── styles/
│   │   └── index.css
│   └── index.ts                   # Public API barrel
├── dev/                           # Development playground
│   ├── App.tsx
│   └── main.tsx
├── index.html                     # Dev playground entry
├── vite.config.ts
├── tsconfig.json
├── tsconfig.build.json            # Stricter config for build
└── package.json
```

```ts
// vite.config.ts
import { resolve } from 'path'
import react from '@vitejs/plugin-react-swc'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      rollupTypes: true,
      tsconfigPath: './tsconfig.build.json',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
    sourcemap: true,
    minify: false,
  },
})
```

## Monorepo

```
my-monorepo/
├── apps/
│   ├── web/                       # Main web app
│   │   ├── src/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── admin/                     # Admin app
│   │   ├── src/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── docs/                      # Documentation site
├── packages/
│   ├── ui/                        # Shared component library
│   │   ├── src/
│   │   ├── vite.config.ts         # Library mode
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── utils/                     # Shared utilities
│   │   ├── src/
│   │   └── package.json
│   └── tsconfig/                  # Shared TS configs
│       ├── base.json
│       ├── react.json
│       └── node.json
├── pnpm-workspace.yaml
├── turbo.json                     # Turborepo config
├── tsconfig.json                  # Root tsconfig
└── package.json
```

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

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
    },
    "lint": {},
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

### Monorepo Vite Config Tips

```ts
// apps/web/vite.config.ts
export default defineConfig({
  resolve: {
    // Resolve workspace packages to source (live reload)
    conditions: ['development'],
  },
  optimizeDeps: {
    // Don't pre-bundle workspace packages
    exclude: ['@my-org/ui', '@my-org/utils'],
  },
  server: {
    // Watch workspace packages for changes
    watch: {
      ignored: ['!**/node_modules/@my-org/**'],
    },
  },
})
```

## Structure Decision Table

| App Type | Key Decisions |
|----------|--------------|
| SPA | Feature-based folders, lazy-loaded routes, single `index.html` |
| MPA | Separate HTML entries, shared code in `shared/`, page-specific bundles |
| SSR | Separate client/server entries, server directory, build scripts for both |
| Library | `src/index.ts` barrel, dev playground, dts generation, no minification |
| Monorepo | pnpm workspaces, Turborepo/Nx, shared packages, per-app configs |
