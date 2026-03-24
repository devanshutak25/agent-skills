# Claude Skills

A collection of reference skills for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) that give Claude deep, up-to-date knowledge of specific technologies.

## Skills

| Skill | Description |
|---|---|
| **animejs-web** | Anime.js V4 — animated websites, scroll effects, SVG morphing, interactive UI |
| **blender-python** | Blender 5.0/5.1 Python API — bpy, bmesh, addons, GPU drawing, extensions |
| **godot-reference** | Godot Engine 4.x — GDScript, C#, physics, shaders, UI, networking, tilemaps |
| **houdini-viewport-states** | Houdini 21.0 Python viewer states — drawables, handles, selectors, HDA states |
| **nextjs-reference** | Next.js 16.1 — App Router, Server Components, `use cache`, Turbopack |
| **react-reference** | React 19 — core APIs, hooks, ecosystem libraries, meta-frameworks, patterns |
| **reactbits-reference** | ReactBits — 122 animated/interactive React components by David Haz |
| **shadcn-reference** | shadcn/ui — components, CLI, theming, registry system, blocks, templates |
| **tailwind-reference** | Tailwind CSS v4 — CSS-first config, utility classes, theme system, patterns |
| **typescript-reference** | TypeScript 5.4–5.9 — type system, configuration, patterns, runtimes |
| **vite-reference** | Vite 7 — dev server, build, plugins, HMR, SSR, library mode, Environment API |
| **21st-dev-reference** | 21st.dev — 60 categories of shadcn/ui-compatible React landing page components |

## Installation

Install all skills at once:

```bash
npx @anthropic-ai/claude-code skills add ./skills/*
```

Or install individual skills:

```bash
npx @anthropic-ai/claude-code skills add ./skills/react-reference
```
