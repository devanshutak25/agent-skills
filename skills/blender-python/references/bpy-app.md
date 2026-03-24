# Application Data (bpy.app)

Read-only access to Blender's application state, version info, paths, build configuration, and runtime flags. Most attributes are read-only; notable exceptions are `debug_value` (writable int) and `driver_namespace` (mutable dict).

## Version Info

| Attribute | Type | Description |
|---|---|---|
| `version` | `tuple[int, int, int]` | Blender version, e.g. `(5, 0, 0)` |
| `version_string` | `str` | Formatted version, e.g. `"5.0.0"` or `"5.1.0 Alpha"` |
| `version_file` | `tuple[int, int, int]` | Version of the last-saved .blend file (third item is file sub-version) |
| `version_cycle` | `str` | Release stage: `'alpha'`, `'beta'`, `'rc'`, or `'release'` |

```python
import bpy

# Version-gated code
if bpy.app.version >= (5, 1, 0):
    cache = bpy.app.cachedir
else:
    cache = bpy.app.tempdir
```

Compare tuples directly — `version` is a tuple, not a string.

## Paths & Environment

| Attribute | Type | Description |
|---|---|---|
| `binary_path` | `str` | Path to the Blender executable |
| `tempdir` | `str` | Temporary directory for the current session |

> **5.1:** `bpy.app.cachedir` (`str | None`) — cache directory used by Blender. Returns `None` if the parent directory does not exist.

```python
import bpy

print(bpy.app.binary_path)   # e.g. "/usr/bin/blender"
print(bpy.app.tempdir)       # e.g. "/tmp/blender_a1b2c3/"
```

## Runtime State

| Attribute | Type | Description |
|---|---|---|
| `background` | `bool` | `True` when running headless (`--background` / `-b`) |
| `factory_startup` | `bool` | `True` when using `--factory-startup` (ignoring user prefs) |
| `debug` | `bool` | `True` when any `--debug` flag is active |
| `debug_value` | `int` | Writable debug integer for testing (set via UI or Python) |
| `module` | `bool` | `True` when running as a Python module (`pip install bpy`) |
| `portable` | `bool` | `True` for portable installations |
| `online_access` | `bool` | `True` when internet access is allowed |
| `online_access_override` | `bool` | `True` when online access pref is overridden by CLI |

### is_job_running

```python
bpy.app.is_job_running(job_type: str) -> bool
```

Check if a background job is currently running.

**Valid job types:**

| Job Type | Description |
|---|---|
| `'RENDER'` | Final render |
| `'RENDER_PREVIEW'` | Preview/viewport render |
| `'OBJECT_BAKE'` | Object baking |
| `'COMPOSITE'` | Compositing |
| `'SHADER_COMPILATION'` | Shader compilation |

```python
import bpy

if bpy.app.is_job_running('RENDER'):
    print("Render in progress")
```

**CAUTION:** Calling `is_job_running()` in background mode crashes Blender 5.0.0. Fixed in 5.0.1.

### Debug Flags

Fine-grained debug flags (all `bool`, read-only):

`debug_depsgraph`, `debug_depsgraph_build`, `debug_depsgraph_eval`, `debug_depsgraph_pretty`, `debug_depsgraph_tag`, `debug_depsgraph_time`, `debug_events`, `debug_freestyle`, `debug_handlers`, `debug_io`, `debug_python`, `debug_simdata`, `debug_wm`

### Driver Namespace

```python
bpy.app.driver_namespace  # dict[str, Any] — mutable, cleared on file load
```

Register custom functions for use in driver expressions:

```python
import bpy

def my_driver_func(val):
    return val * 2.0

bpy.app.driver_namespace["my_func"] = my_driver_func
# Use in driver expression: my_func(frame)
```

## Build Info

Build attributes are `bytes` type (decode with `.decode()` if needed). Exception: `build_commit_timestamp` is `int`.

| Attribute | Type | Description |
|---|---|---|
| `build_type` | `bytes` | `b'Release'`, `b'Debug'`, etc. |
| `build_platform` | `bytes` | OS/architecture identifier |
| `build_date` | `bytes` | Build creation date |
| `build_time` | `bytes` | Build creation time |
| `build_hash` | `bytes` | Git commit hash |
| `build_branch` | `bytes` | Git branch name |
| `build_commit_date` | `bytes` | Commit date |
| `build_commit_time` | `bytes` | Commit time |
| `build_commit_timestamp` | `int` | Unix timestamp of the commit |
| `build_cflags` | `bytes` | C compiler flags |
| `build_cxxflags` | `bytes` | C++ compiler flags |
| `build_linkflags` | `bytes` | Linker flags |
| `build_system` | `bytes` | Build system (e.g. `b'CMake'`) |

### build_options

`bpy.app.build_options` is a **named tuple of booleans**, not bytes:

```python
import bpy

if bpy.app.build_options.cycles:
    print("Cycles is available")
if bpy.app.build_options.usd:
    print("USD support compiled in")
```

Fields include: `bullet`, `codec_avi`, `codec_ffmpeg`, `codec_sndfile`, `compositor`, `cycles`, `cycles_osl`, `freestyle`, `image_cineon`, `image_hdr`, `image_openexr`, `image_openjpeg`, `image_tiff`, `input_ndof`, `audaspace`, `international`, `openal`, `opensubdiv`, `coreaudio`, `jack`, `pulseaudio`, `wasapi`, `libmv`, `mod_oceansim`, `mod_remesh`, `collada`, `io_wavefront_obj`, `io_stl`, `io_gpencil`, `opencolorio`, `openmp`, `openvdb`, `alembic`, `usd`, `fluid`, `xr_openxr`, `potrace`, `pugixml`, `haru`.

## Library Versions

Named tuples with `supported` (bool), `version` (tuple), `version_string` (str):

```python
import bpy

usd = bpy.app.usd
if usd.supported:
    print(f"USD version: {usd.version_string}")
```

Available: `bpy.app.alembic`, `bpy.app.ffmpeg`, `bpy.app.ocio`, `bpy.app.oiio`, `bpy.app.opensubdiv`, `bpy.app.openvdb`, `bpy.app.sdl`, `bpy.app.usd`.

`bpy.app.ffmpeg` has additional fields: `avcodec_version`, `avdevice_version`, `avformat_version`, `avutil_version`, `swscale_version`.

## Submodules

| Submodule | Description |
|---|---|
| `bpy.app.handlers` | Application event handlers (load_post, frame_change, etc.) |
| `bpy.app.timers` | Timer registration for deferred/repeated callbacks |
| `bpy.app.translations` | Translation registration for internationalization |
| `bpy.app.icons` | Custom icon management |

See [handlers-timers.md](handlers-timers.md) for handler and timer details.

## Common Patterns

### Version-gated code for cross-version addons

```python
import bpy

if bpy.app.version >= (5, 0, 0):
    comp_tree = bpy.context.scene.compositing_node_group
else:
    comp_tree = bpy.context.scene.node_tree
```

### Background mode detection

```python
import bpy

if bpy.app.background:
    # Skip UI setup
    print("Running in background mode")
else:
    # Register panels, menus, etc.
    register_ui()
```

### Checking build capabilities before using optional features

```python
import bpy

if bpy.app.build_options.openvdb:
    # Safe to work with VDB volumes
    pass

if bpy.app.build_options.cycles:
    bpy.context.scene.render.engine = 'CYCLES'
```

## Gotchas

- **`is_job_running` crash.** Calling in background mode crashes Blender 5.0.0 (fixed in 5.0.1). Guard with `if not bpy.app.background:` when targeting 5.0.0.
- **`version` is a tuple, not a string.** Compare with tuples: `bpy.app.version >= (5, 1, 0)`. Do not compare with strings.
- **Build info is `bytes`, not `str`.** Use `.decode()` to get strings: `bpy.app.build_date.decode()`.
- **`driver_namespace` clears on file load.** Re-populate in a `load_post` handler with `@persistent`.
- **`version_file` sub-version.** The third element of `version_file` is the file sub-version (incremented during development), not the release patch number. Do not compare it directly with `version`.
