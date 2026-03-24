# Asset Handling

## Import Suffixes

| Suffix | Result | Example |
|--------|--------|---------|
| (none) | URL string (resolved by bundler) | `import logo from './logo.png'` |
| `?url` | URL string (explicit) | `import url from './file.txt?url'` |
| `?raw` | Raw string contents | `import text from './file.txt?raw'` |
| `?worker` | Web Worker constructor | `import Worker from './worker.ts?worker'` |
| `?worker&inline` | Worker as base64 string | `import Worker from './worker.ts?worker&inline'` |
| `?sharedworker` | SharedWorker constructor | `import SW from './sw.ts?sharedworker'` |
| `?inline` | Asset as inline data URI | `import svg from './icon.svg?inline'` |

## Static Asset Imports

```ts
// Image — returns resolved URL
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl

// In JSX
function Logo() {
  return <img src={imgUrl} alt="Logo" />
}
```

### Supported Asset Types (auto-detected)

Images: `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.ico`, `.webp`, `.avif`
Media: `.mp4`, `.webm`, `.ogg`, `.mp3`, `.wav`, `.flac`, `.aac`
Fonts: `.woff`, `.woff2`, `.eot`, `.ttf`, `.otf`
Other: `.pdf`, `.txt`, `.wasm`

## Public Directory

- Files in `public/` served at root path `/`
- Never processed by Vite — copied as-is to `dist/`
- Reference with absolute paths: `/favicon.ico`, `/robots.txt`

```ts
// vite.config.ts
export default defineConfig({
  publicDir: 'public',       // default
  // publicDir: false,        // disable
  // publicDir: 'static',    // custom directory
})
```

**When to use `public/`:**
- Files that are never referenced in source code (robots.txt, favicons)
- Files that must retain exact filename (no hash)
- Files you don't want to import to get their URL

**When to use asset imports:**
- Files referenced in code — get hashed filenames for cache busting
- Files you want to inline below `assetsInlineLimit`
- Files you want processed/optimized

## Glob Imports

```ts
// Eager — all modules loaded immediately
const modules = import.meta.glob('./dir/*.ts', { eager: true })
// Type: Record<string, { default: ..., namedExport: ... }>
for (const [path, mod] of Object.entries(modules)) {
  console.log(path, mod.default)
}

// Lazy (default) — returns dynamic import functions
const modules = import.meta.glob('./dir/*.ts')
// Type: Record<string, () => Promise<{ default: ..., namedExport: ... }>>
for (const [path, importFn] of Object.entries(modules)) {
  const mod = await importFn()
}

// Multiple patterns
const modules = import.meta.glob(['./dir/**/*.ts', './other/*.ts'])

// Negation patterns
const modules = import.meta.glob(['./dir/**/*.ts', '!**/*.test.ts'])

// Named imports only
const modules = import.meta.glob('./dir/*.ts', { import: 'setup' })
// Each module returns only the `setup` export

// Default import only
const modules = import.meta.glob('./dir/*.ts', { import: 'default' })

// As strings (raw)
const modules = import.meta.glob('./dir/*.md', { query: '?raw', import: 'default' })

// As URLs
const modules = import.meta.glob('./dir/*.png', { query: '?url', import: 'default' })
```

### Glob Import Caveats
- Patterns must be string literals (no variables)
- Paths are relative to the importing file
- All matched files are included in the bundle (eager) or as split chunks (lazy)

## Web Workers

```ts
// Constructor syntax (recommended)
const worker = new Worker(new URL('./worker.ts', import.meta.url), {
  type: 'module',
})

// Import with query suffix
import MyWorker from './worker.ts?worker'
const worker = new MyWorker()

// Shared Worker
import SharedWorker from './worker.ts?sharedworker'
const sw = new SharedWorker()

// Inline Worker (bundled as base64)
import InlineWorker from './worker.ts?worker&inline'
const worker = new InlineWorker()
```

## WebAssembly

```ts
// Pre-initialized instance (recommended)
import init from './module.wasm?init'
const instance = await init()
instance.exports.greet()

// With import object
const instance = await init({
  imports: {
    someFunc() { /* ... */ },
  },
})

// Raw bytes
import wasmBytes from './module.wasm?raw'

// URL to wasm file
import wasmUrl from './module.wasm?url'
```

### Wasm Configuration

```ts
export default defineConfig({
  // Enable top-level await for wasm
  optimizeDeps: {
    exclude: ['my-wasm-package'],
  },
})
```

## `new URL()` Pattern

```ts
// Works in Vite — URL resolved at build time
const imgUrl = new URL('./img.png', import.meta.url).href

// Dynamic (with limitations — pattern must be statically analyzable)
function getImageUrl(name: string) {
  return new URL(`./assets/${name}.png`, import.meta.url).href
}
```

**Caveat:** Does not work in SSR since `import.meta.url` differs between browser and Node.

## Asset Inlining

```ts
export default defineConfig({
  build: {
    // Inline assets smaller than this as base64 (bytes)
    // Default: 4096 (4kb)
    assetsInlineLimit: 4096,

    // Callback for per-file control
    assetsInlineLimit: (filePath, content) => {
      if (filePath.endsWith('.svg')) return true  // Always inline SVGs
      return content.byteLength < 4096
    },
  },
})
```

## Decision Table

| Need | Solution |
|------|----------|
| Image in component | `import img from './img.png'` |
| File contents as string | `import text from './file.txt?raw'` |
| File URL without processing | `import url from './file.pdf?url'` |
| Batch import many files | `import.meta.glob('./dir/*.ts')` |
| File that must keep exact name | Put in `public/` |
| File never referenced in code | Put in `public/` |
| Web Worker | `new Worker(new URL('./w.ts', import.meta.url))` |
| WebAssembly module | `import init from './m.wasm?init'` |
| Dynamic image path | `new URL(\`./assets/${name}.png\`, import.meta.url)` |
