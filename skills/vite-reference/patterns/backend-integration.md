# Backend Integration

## Manifest Mode

Enable manifest generation to map source files to hashed output:

```ts
// vite.config.ts
export default defineConfig({
  build: {
    manifest: true,          // Generates .vite/manifest.json in outDir
    rollupOptions: {
      input: '/path/to/main.ts',
    },
  },
})
```

### Reading the Manifest

```json
// dist/.vite/manifest.json
{
  "src/main.tsx": {
    "file": "assets/main-BhKl2e9f.js",
    "src": "src/main.tsx",
    "isEntry": true,
    "css": ["assets/main-DiwrgTda.css"],
    "imports": ["_vendor-CkeA32s1.js"],
    "dynamicImports": ["src/lazy.tsx"]
  },
  "src/lazy.tsx": {
    "file": "assets/lazy-kd82hf.js",
    "src": "src/lazy.tsx",
    "isDynamicEntry": true
  }
}
```

### HTML Generation from Manifest

```html
<!-- Development -->
<script type="module" src="http://localhost:5173/@vite/client"></script>
<script type="module" src="http://localhost:5173/src/main.tsx"></script>

<!-- Production (from manifest) -->
<link rel="stylesheet" href="/assets/main-DiwrgTda.css" />
<script type="module" src="/assets/main-BhKl2e9f.js"></script>
```

## Proxy Pattern (Dev)

Run Vite dev server alongside backend, proxy API requests:

```ts
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',  // Backend server
        changeOrigin: true,
      },
    },
  },
})
```

## Laravel Integration

### Vite Laravel Plugin

```bash
npm i -D laravel-vite-plugin
```

```ts
// vite.config.ts
import laravel from 'laravel-vite-plugin'

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/app.ts'],
      refresh: true,
    }),
  ],
})
```

```php
<!-- Blade template -->
@vite(['resources/css/app.css', 'resources/js/app.ts'])
```

### Laravel Options

```ts
laravel({
  input: ['resources/js/app.ts'],
  refresh: ['app/Livewire/**'],        // Watch for Livewire changes
  ssr: 'resources/js/ssr.ts',          // SSR entry
  buildDirectory: 'build',             // Output dir within public/
  hotFile: 'storage/vite.hot',         // HMR file path
  detectTls: 'my-app.test',            // Auto-detect TLS cert (Herd/Valet)
})
```

## Django Integration

### django-vite

```bash
pip install django-vite
```

```python
# settings.py
INSTALLED_APPS = ['django_vite']

DJANGO_VITE = {
    "default": {
        "dev_mode": DEBUG,
        "dev_server_host": "localhost",
        "dev_server_port": 5173,
        "manifest_path": BASE_DIR / "dist" / ".vite" / "manifest.json",
        "static_url_prefix": "",
    }
}
```

```html
<!-- template.html -->
{% load django_vite %}

{% vite_hmr_client %}
{% vite_asset 'src/main.ts' %}
```

```ts
// vite.config.ts
export default defineConfig({
  base: '/static/',
  build: {
    manifest: true,
    outDir: 'dist',
    rollupOptions: {
      input: 'src/main.ts',
    },
  },
})
```

## Rails Integration

### vite_rails gem

```ruby
# Gemfile
gem 'vite_rails'
```

```bash
bundle exec vite install
```

```erb
<!-- application.html.erb -->
<%= vite_client_tag %>
<%= vite_javascript_tag 'application' %>
<%= vite_stylesheet_tag 'application' %>
```

```ts
// vite.config.ts
import ViteRails from 'vite-plugin-ruby'

export default defineConfig({
  plugins: [ViteRails()],
})
```

## Go Integration

### Manual Manifest Integration

```go
// Load manifest.json
func loadManifest() map[string]ManifestEntry {
    data, _ := os.ReadFile("dist/.vite/manifest.json")
    var manifest map[string]ManifestEntry
    json.Unmarshal(data, &manifest)
    return manifest
}

// Render asset tags in template
func assetTags(entry string) template.HTML {
    if isDev {
        return template.HTML(fmt.Sprintf(
            `<script type="module" src="http://localhost:5173/@vite/client"></script>
             <script type="module" src="http://localhost:5173/%s"></script>`, entry))
    }
    m := loadManifest()
    e := m[entry]
    var tags string
    for _, css := range e.CSS {
        tags += fmt.Sprintf(`<link rel="stylesheet" href="/%s">`, css)
    }
    tags += fmt.Sprintf(`<script type="module" src="/%s"></script>`, e.File)
    return template.HTML(tags)
}
```

## Generic Backend Pattern

For any backend, the integration follows this pattern:

### Development
1. Run Vite dev server (`vite dev`)
2. Include Vite client script: `<script type="module" src="http://localhost:5173/@vite/client"></script>`
3. Include entry point: `<script type="module" src="http://localhost:5173/src/main.ts"></script>`
4. Proxy API calls from Vite → backend

### Production
1. Build with `vite build` (with manifest enabled)
2. Read `.vite/manifest.json` from backend
3. Render `<link>` and `<script>` tags from manifest entries

### Helper Function Pattern

```python
# Generic helper (pseudo-code)
def vite_asset(entry_point: str) -> str:
    if is_dev_mode():
        return f'''
            <script type="module" src="{VITE_DEV_URL}/@vite/client"></script>
            <script type="module" src="{VITE_DEV_URL}/{entry_point}"></script>
        '''

    manifest = load_json('dist/.vite/manifest.json')
    entry = manifest[entry_point]
    tags = ''
    for css in entry.get('css', []):
        tags += f'<link rel="stylesheet" href="/{css}">'
    tags += f'<script type="module" src="/{entry["file"]}"></script>'
    return tags
```

## CORS Configuration

When Vite dev server and backend are on different origins:

```ts
// vite.config.ts
export default defineConfig({
  server: {
    cors: true,
    origin: 'http://localhost:5173',
  },
})
```

## Decision Table

| Backend | Integration Package | Manifest Auto-Read |
|---------|--------------------|--------------------|
| Laravel | `laravel-vite-plugin` | ✅ `@vite()` directive |
| Rails | `vite_rails` gem | ✅ `vite_*_tag` helpers |
| Django | `django-vite` | ✅ `{% vite_asset %}` |
| Phoenix | `phoenix_vite` | ✅ `~V` sigil |
| Go | Manual | ❌ Read manifest yourself |
| Express/Node | Vite middleware mode | ❌ Use `ssrLoadModule` |
| Other | Manual | ❌ Read manifest yourself |
