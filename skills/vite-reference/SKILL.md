---
name: vite-reference
description: Comprehensive Vite 7 reference — dev server, build, plugins, HMR, SSR, library mode, Environment API, performance, ecosystem, templates. Auto-triggers when working on Vite-powered projects.
trigger: When the user is working with Vite, configuring Vite, building with Vite, or using Vite plugins
---

# Vite Reference Skill

Comprehensive, up-to-date Vite development reference. Split into focused files for targeted loading.

## File Index

### Core (`core/`)
| File | Contents |
|------|----------|
| [configuration.md](core/configuration.md) | defineConfig, shared options, CSS/JSON/esbuild options, conditional config, Environment API config |
| [dev-server.md](core/dev-server.md) | Server options, proxy, HTTPS, middleware mode, warmup, fs access, HMR config |
| [build-production.md](core/build-production.md) | Build target, Rolldown, rollupOptions, manual chunks, multi-page apps, preview server |
| [hmr-api.md](core/hmr-api.md) | hot.accept/dispose/prune/invalidate, hot.data, custom events, TypeScript types |
| [asset-handling.md](core/asset-handling.md) | Import suffixes (?url/?raw/?worker/?inline), public dir, glob imports, Wasm, Web Workers |
| [env-modes.md](core/env-modes.md) | .env loading order, VITE_ prefix, import.meta.env, TypeScript env.d.ts, custom modes |
| [dependency-optimization.md](core/dependency-optimization.md) | Esbuild pre-bundling, include/exclude, caching, force optimization, troubleshooting |

### Plugins (`plugins/`)
| File | Contents |
|------|----------|
| [plugin-api.md](plugins/plugin-api.md) | Universal + Vite-specific hooks, ordering, enforce, virtual modules, hook filters, HMR in plugins |
| [official-plugins.md](plugins/official-plugins.md) | @vitejs/plugin-vue, vue-jsx, react, react-swc, legacy, plugin-basic-ssl |
| [community-plugins.md](plugins/community-plugins.md) | Categorized popular plugins: build, DX, assets, PWA, CSS, desktop, SSR |

### Patterns (`patterns/`)
| File | Contents |
|------|----------|
| [ssr-patterns.md](patterns/ssr-patterns.md) | SSR setup, ssrLoadModule, streaming, ssr.external/noExternal, Environment API SSR |
| [backend-integration.md](patterns/backend-integration.md) | Manifest mode, proxy setup, Laravel/Django/Rails/Go integration patterns |
| [performance.md](patterns/performance.md) | Warmup, barrel files, profiling, Rolldown, tree-shaking, build optimization |
| [library-mode.md](patterns/library-mode.md) | build.lib, output formats, externals, dts generation, package.json exports |
| [migration-v6-v7.md](patterns/migration-v6-v7.md) | Breaking changes checklist, Node/browser baseline, Environment API, removed APIs |

### Ecosystem (`ecosystem/`)
| File | Contents |
|------|----------|
| [testing.md](ecosystem/testing.md) | Vitest setup/APIs, component testing, E2E (Cypress/Playwright), coverage, MSW |
| [tooling.md](ecosystem/tooling.md) | VS Code, vite-plugin-inspect, vite-plugin-checker, vite-node, debug configs, monorepos |

### Templates (`templates/`)
| File | Contents |
|------|----------|
| [starter-templates.md](templates/starter-templates.md) | create-vite table, official templates, community starters by framework |
| [project-structures.md](templates/project-structures.md) | SPA, MPA, SSR, library, monorepo project layouts |

### API (`api/`)
| File | Contents |
|------|----------|
| [javascript-api.md](api/javascript-api.md) | createServer, build, preview, resolveConfig, mergeConfig, loadEnv, types |

## Usage

When assisting with Vite development:
1. Load relevant file(s) based on the task domain
2. Follow Vite conventions — ESM-first, `vite.config.ts` with `defineConfig`
3. Reference plugin API hooks and ordering from plugin files
4. Recommend ecosystem tools from ecosystem files when applicable
5. Cross-reference with [react-reference](../react-reference/SKILL.md), [tailwind-reference](../tailwind-reference/SKILL.md), [nextjs-reference](../nextjs-reference/SKILL.md) when relevant

## Version Info
- Vite: 7.x (7.3.1 current)
- Node: ≥20.19 or ≥22.12
- Last updated: 2026-03
