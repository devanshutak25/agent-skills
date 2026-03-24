# Extensions System

Blender 5.0 uses an extension system based on `blender_manifest.toml` for packaging, distribution, and dependency management. Extensions replace legacy addon `bl_info` dicts with a standardized TOML manifest. Both systems coexist — legacy addons still work. See [addon-structure.md](addon-structure.md) for legacy `bl_info` and registration patterns; see [addon-preferences.md](addon-preferences.md) for preference UI.

## blender_manifest.toml — Complete Schema

The manifest file lives at the root of the extension package. Schema version is `1.0.0` (unchanged since Blender 4.2, stable through 5.0/5.1).

### Required Fields

| Field | Type | Description |
|---|---|---|
| `schema_version` | `str` | Must be `"1.0.0"` |
| `id` | `str` | Unique extension identifier — valid Python identifier, no double underscores, no leading/trailing underscore (e.g. `"my_addon"`) |
| `name` | `str` | Human-readable display name |
| `version` | `str` | Semantic version: `"MAJOR.MINOR.PATCH"` (e.g. `"1.0.0"`) |
| `tagline` | `str` | One-line description, max 64 characters, must end with alphanumeric or closing bracket |
| `type` | `str` | `"add-on"` or `"theme"` |
| `maintainer` | `str` | Maintainer name and optionally email: `"Name <email@example.com>"` |
| `license` | `[str]` | At least one SPDX identifier with prefix: `["SPDX:GPL-3.0-or-later"]` |
| `blender_version_min` | `str` | Oldest compatible version: `"4.2.0"` minimum |

### Optional Fields

| Field | Type | Description |
|---|---|---|
| `blender_version_max` | `str` | First **unsupported** version (exclusive upper bound) |
| `website` | `str` | Link to documentation, source, or support |
| `copyright` | `[str]` | Copyright holders: `["2024 Author Name"]` |
| `tags` | `[str]` | Category tags from predefined list (see below) |
| `platforms` | `[str]` | Target platforms (omit for all platforms) |
| `wheels` | `[str]` | Relative paths to bundled `.whl` Python packages |

All values must be non-empty. Omit optional fields entirely rather than using empty strings or empty arrays.

### Complete Example

```toml
schema_version = "1.0.0"

id = "my_cool_addon"
version = "1.2.0"
name = "My Cool Addon"
tagline = "Automates mesh cleanup and export"
maintainer = "Dev Name <dev@example.com>"
type = "add-on"

website = "https://example.com/my-addon"

tags = ["Mesh", "Import-Export"]

blender_version_min = "5.0.0"

license = [
  "SPDX:GPL-3.0-or-later",
]

copyright = [
  "2024 Dev Name",
]

[permissions]
files = "Read/write mesh files from disk"
network = "Check for addon updates"

[build]
paths_exclude_pattern = [
  "__pycache__/",
  "/.git/",
  "/*.zip",
]
```

## Permissions

Extensions must declare resource access. Each permission key maps to a single-sentence explanation (max 64 characters, no trailing period).

| Permission | Purpose |
|---|---|
| `files` | Filesystem read/write access |
| `network` | Internet access (must also check `bpy.app.online_access` at runtime) |
| `clipboard` | System clipboard read/write |
| `camera` | Photo/video capture |
| `microphone` | Audio capture |

```toml
[permissions]
files = "Import/export FBX from disk"
network = "Sync motion-capture data to server"
clipboard = "Copy bone transforms to clipboard"
```

Extensions without declared permissions cannot access these resources. The `network` permission additionally requires runtime checking of `bpy.app.online_access`, which the user can disable globally in Preferences.

## Platforms

Restrict an extension to specific platforms. Omit the field entirely to support all platforms.

| Value | Platform |
|---|---|
| `"windows-x64"` | Windows x86-64 |
| `"windows-arm64"` | Windows ARM64 |
| `"macos-x64"` | macOS Intel |
| `"macos-arm64"` | macOS Apple Silicon |
| `"linux-x64"` | Linux x86-64 |

```toml
platforms = ["windows-x64", "macos-arm64", "linux-x64"]
```

Platform restriction is primarily needed when bundling platform-specific Python wheels.

## Tags

Tags must come from predefined lists. Different lists for add-ons vs themes.

**Add-on tags (31):** `3D View`, `Add Curve`, `Add Mesh`, `Animation`, `Bake`, `Camera`, `Compositing`, `Development`, `Game Engine`, `Geometry Nodes`, `Grease Pencil`, `Import-Export`, `Lighting`, `Material`, `Mesh`, `Modeling`, `Node`, `Object`, `Paint`, `Pipeline`, `Physics`, `Render`, `Rigging`, `Scene`, `Sculpt`, `Sequencer`, `System`, `Text Editor`, `Tracking`, `User Interface`, `UV`

**Theme tags (7):** `Accessibility`, `Colorful`, `Dark`, `High Contrast`, `Inspired By`, `Light`, `Print`

## Bundled Python Wheels

Extensions can include pre-built Python wheel files for third-party dependencies:

```toml
wheels = [
  "./wheels/requests-2.31.0-py3-none-any.whl",
  "./wheels/urllib3-2.1.0-py3-none-any.whl",
]
```

Platform-specific wheels require the `platforms` field. Use `--split-platforms` during build to create per-platform packages.

## [build] Section

Controls what files are included in the built package.

| Field | Type | Description |
|---|---|---|
| `paths` | `[str]` | Explicit file paths to include (cannot combine with `paths_exclude_pattern`) |
| `paths_exclude_pattern` | `[str]` | Gitignore-style patterns to exclude (cannot combine with `paths`) |

Default when `[build]` is omitted:

```toml
[build]
paths_exclude_pattern = [
  "__pycache__/",
  ".*",
  "*.zip",
]
```

`paths` and `paths_exclude_pattern` are mutually exclusive — use one or the other.

## id Field Rules

The `id` must be:
- A valid Python identifier (letters, digits, underscores)
- No double underscores (`__`)
- No leading or trailing underscore
- Cannot start with a digit

Valid: `my_addon`, `cool_tool_v2`, `mesh_helper`
Invalid: `_private`, `my__addon`, `addon_`, `2fast`

## Local vs Remote Repositories

**Remote repositories** — hosted on a URL (e.g. `extensions.blender.org`). Blender syncs an index and downloads packages on demand. Managed in Edit > Preferences > Extensions.

**Local repositories** — a directory on disk. Useful for development, studio pipelines, and offline environments. Add via Preferences or CLI:

```
blender --command extension repo-add my_local --name "Local Dev" --directory "/path/to/repo"
```

**System repositories** — read-only, typically managed by IT administrators. Added with `--source SYSTEM`.

## Installation Methods

### Drag-and-Drop

Drag a `.zip` extension file onto the Blender window. Blender prompts for installation.

### Preferences UI

Edit > Preferences > Extensions. Browse remote repositories or use the Install button to install from a local `.zip` file.

### CLI install-file

```
blender --command extension install-file ./my_addon-1.0.0.zip --repo user_default --enable
```

### Script Directories (Development)

For development, add the parent directory of your extension to Edit > Preferences > File Paths > Script Directories. Blender discovers extensions in subdirectories with `blender_manifest.toml`.

## CLI Commands

All commands use the `blender --command extension` prefix.

### Package Management

```bash
# List installed packages
blender --command extension list

# List packages from remote repositories
blender --command extension list-remote

# Sync with remote repositories
blender --command extension sync

# Install from remote repository
blender --command extension install PACKAGE_ID --repo blender_org --enable

# Install from local file
blender --command extension install-file ./package.zip --repo user_default --enable

# Remove an installed package
blender --command extension remove PACKAGE_ID --repo user_default

# Update all outdated packages
blender --command extension update
```

### Development

```bash
# Build extension package from source directory
blender --command extension build --source-dir ./my_addon --output-dir ./dist

# Build with platform splitting (for native wheels)
blender --command extension build --source-dir ./my_addon --split-platforms

# Validate manifest without building
blender --command extension validate --source-dir ./my_addon

# Generate repository index from .zip files
blender --command extension server-generate --repo-dir ./packages --html
```

### Repository Management

```bash
# List configured repositories
blender --command extension list-repos

# Add a local repository
blender --command extension repo-add dev_local \
  --name "Local Dev" \
  --directory "/path/to/extensions"

# Add a remote repository
blender --command extension repo-add studio_repo \
  --name "Studio" \
  --url "https://studio.example.com/extensions" \
  --access-token "TOKEN"

# Remove a repository
blender --command extension repo-remove dev_local
```

### Key CLI Flags

| Flag | Description |
|---|---|
| `--repo` / `-r` | Target repository identifier |
| `--enable` / `-e` | Enable extension after install |
| `--no-prefs` | Treat user preferences as read-only |
| `--source-dir` | Package source directory (defaults to CWD) |
| `--output-dir` | Build output directory (defaults to CWD) |
| `--output-filepath` | Explicit output `.zip` path |
| `--split-platforms` | Build separate package per platform |
| `--verbose` | Verbose output |
| `--valid-tags` | JSON file with allowed tag lists; `=""` disables validation |

## Publishing to extensions.blender.org

1. Build the extension: `blender --command extension build`
2. Test locally: install the `.zip` and verify functionality
3. Create an account at `extensions.blender.org`
4. Upload the `.zip` — the platform validates the manifest
5. The extension enters a review queue

Extensions must comply with license requirements (SPDX identifiers), provide accurate metadata, and declare all required permissions.

## Extension Structure Example

```
my_extension/
    blender_manifest.toml
    __init__.py
    operators.py
    panels.py
    properties.py
    icons/
        my_icon.png
    wheels/
        some_lib-1.0.0-py3-none-any.whl
```

The `__init__.py` uses the same `register()`/`unregister()` pattern as legacy addons but omits `bl_info` — metadata comes from `blender_manifest.toml`.

```python
import bpy

from . import operators
from . import panels
from . import properties

classes = (
    properties.MySettings,
    operators.MY_OT_example,
    panels.VIEW3D_PT_example,
)

def register():
    for cls in classes:
        bpy.utils.register_class(cls)
    bpy.types.Scene.my_settings = bpy.props.PointerProperty(
        type=properties.MySettings,
    )

def unregister():
    del bpy.types.Scene.my_settings
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)
```

## Common Patterns

### Minimal Extension Manifest

```toml
schema_version = "1.0.0"

id = "quick_export"
version = "1.0.0"
name = "Quick Export"
tagline = "One-click FBX export for game assets"
maintainer = "Dev <dev@example.com>"
type = "add-on"
license = ["SPDX:GPL-3.0-or-later"]
blender_version_min = "5.0.0"

tags = ["Import-Export"]

[permissions]
files = "Export mesh files to disk"
```

### Extension with Python Dependencies

```toml
schema_version = "1.0.0"

id = "cloud_sync"
version = "2.0.0"
name = "Cloud Sync"
tagline = "Sync blend files to cloud storage"
maintainer = "Studio <tools@studio.com>"
type = "add-on"
license = ["SPDX:MIT"]
blender_version_min = "5.0.0"

tags = ["Pipeline", "System"]

platforms = ["windows-x64", "macos-arm64", "linux-x64"]

wheels = [
  "./wheels/httpx-0.27.0-py3-none-any.whl",
  "./wheels/certifi-2024.2.2-py3-none-any.whl",
]

[permissions]
files = "Read blend files for upload"
network = "Upload files to cloud storage"

[build]
paths_exclude_pattern = [
  "__pycache__/",
  "/.git/",
  "/tests/",
  "*.zip",
]
```

### Build and Install Workflow

```bash
# Development workflow
cd my_extension/

# Validate the manifest
blender --command extension validate

# Build the package
blender --command extension build --output-dir ../dist

# Install for testing
blender --command extension install-file ../dist/my_extension-1.0.0.zip \
  --repo user_default --enable
```

## Gotchas

1. **No `description` field** — the manifest uses `tagline` (max 64 chars) for the short description. Longer descriptions are managed on the extensions platform website, not in the manifest.

2. **`blender_version_max` is exclusive** — it specifies the first **unsupported** version. If your extension works with 5.0 but not 5.1, set `blender_version_max = "5.1.0"`.

3. **Empty values are invalid** — do not use `tags = []` or `website = ""`. Omit optional fields entirely if not needed.

4. **`paths` and `paths_exclude_pattern` are mutually exclusive** — using both in `[build]` causes a validation error.

5. **Network permission requires runtime check** — declaring `network` in `[permissions]` is necessary but not sufficient. Code must also check `bpy.app.online_access` before making network requests, as the user can disable online access globally.

6. **Permissions changed from list to dict** — older documentation may show `permissions = ["files", "network"]`. The current format is a `[permissions]` table with explanation strings.

7. **`id` validation is strict** — no double underscores, no leading/trailing underscores, must be a valid Python identifier. Test with `blender --command extension validate` before publishing.
