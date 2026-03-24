# Export Basics

## Export Templates

Export templates are precompiled Godot engine binaries stripped of editor/debugger functionality — optimized for size and speed. They combine with your project's `.pck` (packed resources) to produce distributable builds.

### Installing Templates
- **Editor > Manage Export Templates > Download and Install**
- Templates install to: `~/.local/share/godot/export_templates/<version>/` (Linux), `%APPDATA%\Godot\export_templates\<version>\` (Windows), `~/Library/Application Support/Godot/export_templates/<version>/` (macOS)
- Version format: `4.6.stable`, `4.5.1.stable`
- Must match your editor version exactly

### Custom Templates
For smaller builds or disabled features, compile your own:
```
scons platform=<platform> target=template_release
```
Use a `custom.py` at the repo root to disable modules (e.g., `module_3d_enabled="no"` for 2D-only games). Specify custom template paths in export preset settings.

## Export Presets

Configured via **Project > Export**. Stored in `export_presets.cfg` (version-control friendly).

Each preset defines:
- **Platform** (Windows, Linux, macOS, Android, iOS, Web)
- **Runnable** flag — one per platform, enables one-click deploy
- **Export path** — output location for the build
- **Resources** — include/exclude filters (glob patterns)
- **Features** — custom feature tags for conditional logic
- **Script export mode** — text, compiled, or encrypted
- **Platform-specific settings** — signing, icons, permissions, etc.

### Resource Filters
```
# Include filters (export_presets.cfg)
include_filter = "*.json, *.csv, data/*"
exclude_filter = "*.import, dev/*"
```

Files in `res://` are packed unless excluded. Files outside `res://` are never packed.

### Script Export Modes
- **Text**: Scripts exported as-is (human-readable, debuggable)
- **Compiled**: GDScript compiled to bytecode (slightly faster load, not decompile-proof)
- **Encrypted**: Requires encryption key set in `Project > Export > Script > Encryption Key`

## Feature Tags

Feature tags enable conditional behavior at runtime:

```gdscript
# Built-in tags
if OS.has_feature("mobile"):
    # Android or iOS
if OS.has_feature("pc"):
    # Windows, Linux, macOS
if OS.has_feature("web"):
    # HTML5/WebAssembly
if OS.has_feature("debug"):
    # Debug build
if OS.has_feature("release"):
    # Release build
if OS.has_feature("editor"):
    # Running in editor (tool scripts)

# Platform tags: "windows", "linux", "macos", "android", "ios", "web"
# Renderer tags: "forward_plus", "mobile", "gl_compatibility"
```

### Custom Feature Tags
Add custom tags in export preset settings. Use for build variants:
```gdscript
if OS.has_feature("demo"):
    # Demo build — limit content
if OS.has_feature("steam"):
    # Enable Steam integration
```

### Override Files
Use `.godot` overrides per feature tag:
- `override.android.cfg` — applied on Android exports
- `override.release.cfg` — applied on release builds

## PCK Files

The `.pck` file contains all project resources. Options:
- **Embedded**: PCK appended to the executable (single file distribution)
- **Separate**: PCK alongside the executable

**Pitfall**: Windows embedded PCK can't be code-signed. Use separate PCK for signed distributions.

### Delta Encoding (4.6+)
Patch PCK files now use delta encoding — only changed parts of resources are included. Smaller updates for deployed games.

## Command-Line Export

```bash
# Export release build
godot --headless --export-release "Windows Desktop" /path/to/output.exe

# Export debug build
godot --headless --export-debug "Linux" /path/to/output.x86_64

# Export PCK only (no executable)
godot --headless --export-pack "Windows Desktop" /path/to/game.pck
```

### CI/CD Environment Variables
Export presets can be overridden via environment variables for automated builds:
- `GODOT_ANDROID_KEYSTORE_RELEASE_PATH`
- `GODOT_ANDROID_KEYSTORE_RELEASE_USER`
- `GODOT_ANDROID_KEYSTORE_RELEASE_PASSWORD`
- Platform-specific signing credentials

This enables secure credential management without storing secrets in `export_presets.cfg`.

## One-Click Deploy

For rapid testing on connected devices:
- Mark one preset per platform as **Runnable**
- Use the play button with device icon in the editor toolbar
- Always exports with debugging enabled (breakpoints work)
- Supports Android (USB/WiFi), Web (local server)

## Shader Baker (4.5+)

Pre-compiles shaders at export time, eliminating first-run shader compilation stutter:
- Scans project resources/scenes for all shader variants
- Compiles them for the target platform's GPU driver format
- Baked into the export — no code changes required

Enable in the export preset settings. Dramatically reduces startup time (reported: 20s → <1s on medium projects). Especially impactful on Apple and D3D12 backends.

## Customize Build Configuration (4.5+)

Project → Customize Engine Build Configuration opens a dialog detecting which classes, nodes, resources, and servers your project actually uses. Build a stripped template:

```bash
scons platform=linuxbsd target=template_release \
    disable_3d=yes module_camera_enabled=no \
    optimize=size use_lto=yes
```

**4.5 improvements**: Now also detects GDExtension dependencies and sets correct build options automatically.

## CI/CD Import Step (4.2.2+)

```bash
# Regenerate .godot/ (import cache) — needed in CI where .godot/ isn't committed
godot --headless --path /project --import

# As of 4.2.2, --export-release/--export-debug imply --import automatically
# So this is optional unless you need to run tests between import and export
```

Exit code is non-zero on export failure (4.2.2+), enabling proper CI script error handling.

## Project Setting Overrides with Feature Tags

Any project setting can be overridden per feature tag by appending `.tag_name`:

```ini
# project.godot
application/config/icon="res://icon.png"
application/config/icon.mobile="res://icon_mobile.png"
application/config/icon.demo="res://icon_demo.png"
```

Override settings appear in Project Settings with a "Feature Override" button. Many settings have built-in override support.

## Common Pitfalls

1. **Template version mismatch**: Templates must exactly match editor version
2. **Missing export templates**: Download for each platform you target
3. **Forgetting to rebuild C# before export**: C# projects require Build before export
4. **Resources not packed**: Check include/exclude filters if assets are missing at runtime
5. **`user://` vs `res://`**: `res://` is read-only in exports; write data to `user://`
6. **Android requires JDK + SDK**: Set paths in Editor Settings > Export > Android
