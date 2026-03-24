# shadcn/ui CLI

## Commands

### `init` — Initialize project
```bash
npx shadcn@latest init [options]
```
| Flag | Description |
|------|-------------|
| `-d, --defaults` | Use default configuration |
| `-f, --force` | Force overwrite existing config |
| `-y, --yes` | Skip confirmation prompts |
| `-c, --cwd <path>` | Working directory (default: cwd) |
| `--name <name>` | Project name for registry |
| `--pm <pm>` | Package manager (`npm`, `yarn`, `pnpm`, `bun`) |
| `-s, --silent` | Suppress output |
| `--src-dir` | Use `src/` directory structure |

### `add` — Add components
```bash
npx shadcn@latest add [component...] [options]
```
| Flag | Description |
|------|-------------|
| `-y, --yes` | Skip confirmation prompts |
| `-o, --overwrite` | Overwrite existing files |
| `-c, --cwd <path>` | Working directory |
| `-a, --all` | Add all available components |
| `-p, --path <path>` | Component install path |
| `-s, --silent` | Suppress output |
| `--registry <url>` | Custom registry URL |

```bash
# Examples
npx shadcn@latest add button
npx shadcn@latest add button card dialog sheet
npx shadcn@latest add --all
npx shadcn@latest add https://myregistry.com/r/my-component.json
```

### `diff` — Show component changes
```bash
npx shadcn@latest diff [component] [options]
```
Shows changes between your local component and the registry version.

| Flag | Description |
|------|-------------|
| `-y, --yes` | Skip confirmation |
| `-c, --cwd <path>` | Working directory |

### `build` — Build registry
```bash
npx shadcn@latest build [options]
```
Build a custom registry from `registry/` directory.

| Flag | Description |
|------|-------------|
| `-c, --cwd <path>` | Working directory |
| `-o, --output <path>` | Output directory (default: `public/r`) |

### `migrate` — Run migrations
```bash
npx shadcn@latest migrate [options]
```

### Available Migrations

#### RTL Support
```bash
npx shadcn@latest migrate rtl
```
Adds logical properties for RTL language support (e.g., `ml-2` -> `ms-2`).

#### Radix Updates
```bash
npx shadcn@latest migrate radix
```
Updates Radix UI imports for the latest package structure.

#### Icons Migration
```bash
npx shadcn@latest migrate icons
```
Migrates icon imports to the configured icon library.

## Component Resolution
1. CLI reads `components.json` for aliases and paths
2. Fetches component definition from registry (default: `https://ui.shadcn.com/r`)
3. Resolves dependencies (other shadcn components + npm packages)
4. Installs npm dependencies
5. Copies component files to the configured UI directory
6. Transforms imports based on alias configuration

## Package Manager Detection
CLI auto-detects from lock files:
| Lock File | Manager |
|-----------|---------|
| `bun.lockb` / `bun.lock` | bun |
| `pnpm-lock.yaml` | pnpm |
| `yarn.lock` | yarn |
| `package-lock.json` | npm |

Override with `--pm` flag or set in `components.json`.
