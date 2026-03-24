# Utilities (bpy.utils)

Helper functions for class registration, previews, script paths, bundled module access, and miscellaneous utilities. This is the primary module for addon infrastructure tasks.

## Class Registration

### register_class / unregister_class

```python
bpy.utils.register_class(cls) -> None
bpy.utils.unregister_class(cls) -> None
```

Register or unregister a Blender class. The class must subclass one of the registerable types: `Panel`, `UIList`, `Menu`, `Header`, `Operator`, `KeyingSetInfo`, `RenderEngine`, `AssetShelf`, `FileHandler`, `PropertyGroup`, `AddonPreferences`, `NodeTree`, `Node`, `NodeSocket`, `Gizmo`, `GizmoGroup`.

**Order matters:** Register `PropertyGroup` classes before any `Panel`, `Operator`, or other class that references them via `PointerProperty`/`CollectionProperty`. Unregister in reverse order.

```python
import bpy

classes = (
    MyPropertyGroup,   # PropertyGroup first
    MY_PT_main_panel,  # Panel that uses it second
    MY_OT_do_thing,    # Operator third
)

def register():
    for cls in classes:
        bpy.utils.register_class(cls)

def unregister():
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)
```

### register_classes_factory

```python
bpy.utils.register_classes_factory(classes: Sequence[type]) -> tuple[Callable, Callable]
```

Returns a `(register, unregister)` pair that registers/unregisters all classes. Unregisters in reverse order automatically.

```python
import bpy

classes = (MyPropertyGroup, MY_PT_panel, MY_OT_operator)
register, unregister = bpy.utils.register_classes_factory(classes)
```

### register_submodule_factory

```python
bpy.utils.register_submodule_factory(module_name: str, submodule_names: list[str]) -> tuple[Callable, Callable]
```

Returns a `(register, unregister)` pair for multi-module addons. Imports each submodule and calls its `register()`/`unregister()`. Unregisters in reverse order.

```python
register, unregister = bpy.utils.register_submodule_factory(
    __name__, ["operators", "panels", "properties"]
)
```

## Previews

Custom icon loading for addon UI.

### Workflow

```python
import bpy
import os

preview_collections = {}

def register():
    pcoll = bpy.utils.previews.new()
    icons_dir = os.path.join(os.path.dirname(__file__), "icons")
    pcoll.load("my_icon", os.path.join(icons_dir, "icon.png"), 'IMAGE')
    preview_collections["main"] = pcoll

def unregister():
    for pcoll in preview_collections.values():
        bpy.utils.previews.remove(pcoll)
    preview_collections.clear()
```

### ImagePreviewCollection API

| Method | Signature | Description |
|---|---|---|
| `load` | `load(name, filepath, filetype, force_reload=False)` | Load preview from file. Returns `ImagePreview` |
| `new` | `new(name)` | Create blank preview. Returns `ImagePreview` |
| `clear` | `clear()` | Remove all previews |
| `close` | `close()` | Close collection and free resources |

`filetype`: `'IMAGE'`, `'MOVIE'`, `'BLEND'`, `'FONT'`

Access the icon ID for UI use:

```python
icon_value = preview_collections["main"]["my_icon"].icon_id
layout.operator("my.operator", icon_value=icon_value)
```

## Script Paths

### user_resource

```python
bpy.utils.user_resource(resource_type: str, path: str = '', create: bool = False) -> str
```

Valid `resource_type` values: `'DATAFILES'`, `'CONFIG'`, `'SCRIPTS'`, `'EXTENSIONS'`.

```python
import bpy

config_dir = bpy.utils.user_resource('CONFIG')
data_dir = bpy.utils.user_resource('DATAFILES', path="my_addon", create=True)
```

### resource_path

```python
bpy.utils.resource_path(type: str, major: int = ..., minor: int = ...) -> str
```

`type`: `'USER'`, `'LOCAL'`, `'SYSTEM'`. Defaults `major`/`minor` to current version.

### Other Path Functions

| Function | Returns | Description |
|---|---|---|
| `script_path_user()` | `str \| None` | User script path |
| `script_path_pref()` | `str \| None` | Preference script path |
| `script_paths(subdir=None)` | `list[str]` | All valid script search paths |

### extension_path_user

```python
bpy.utils.extension_path_user(package: str, path: str = '', create: bool = False) -> str
```

Returns a writable directory for the extension. Use `__package__` as the package name.

```python
import bpy

ext_data_dir = bpy.utils.extension_path_user(__package__, path="cache", create=True)
```

## VFX Library Access

```python
bpy.utils.expose_bundled_modules() -> None
```

Adds Blender-bundled VFX library Python bindings to `sys.path`. After calling, these modules become importable:

| Module | Library |
|---|---|
| `pxr` | OpenUSD (Universal Scene Description) |
| `MaterialX` | MaterialX |
| `OpenImageIO` | OpenImageIO |
| `PyOpenColorIO` | OpenColorIO |
| `openvdb` | OpenVDB |

The legacy name `pyopenvdb` is deprecated — use `openvdb`.

```python
import bpy
bpy.utils.expose_bundled_modules()

from pxr import Usd, UsdGeom
import MaterialX as mx
import openvdb
```

## CLI Commands

```python
bpy.utils.register_cli_command(id: str, execute: Callable[[list[str]], int]) -> handle
bpy.utils.unregister_cli_command(handle) -> None
```

Register a custom command invokable via `blender --command <id>` or `blender -c <id>`. The callback receives a list of arguments and returns an exit code (0 = success).

```python
import bpy

def my_batch_process(args):
    # args is the list of CLI arguments after the command name
    print(f"Processing with args: {args}")
    return 0  # success

_handle = None

def register():
    global _handle
    _handle = bpy.utils.register_cli_command("my_process", my_batch_process)

def unregister():
    global _handle
    if _handle is not None:
        bpy.utils.unregister_cli_command(_handle)
        _handle = None
```

## Other Utilities

| Function | Signature | Description |
|---|---|---|
| `blend_paths` | `blend_paths(absolute=False, packed=False, local=False) → list[str]` | All external file paths referenced by the .blend |
| `escape_identifier` | `escape_identifier(string) → str` | Escape string for use in RNA/animation paths |
| `unescape_identifier` | `unescape_identifier(string) → str` | Reverse of `escape_identifier` |
| `flip_name` | `flip_name(name, strip_digits=False) → str` | Flip left/right naming (e.g. `"Bone.L"` → `"Bone.R"`) |
| `manual_map` | `manual_map() → Iterator` | Yields registered manual URL mappings |
| `register_manual_map` | `register_manual_map(hook)` | Register a manual URL mapping function |
| `unregister_manual_map` | `unregister_manual_map(hook)` | Unregister a manual URL mapping |
| `preset_find` | `preset_find(name, preset_path, ...) → str \| None` | Find a preset file |
| `preset_paths` | `preset_paths(subdir) → list[str]` | List preset directories |
| `time_from_frame` | `time_from_frame(frame, fps=None, fps_base=None) → timedelta` | Convert frame number to time |
| `smpte_from_frame` | `smpte_from_frame(frame, ...) → str` | Frame to SMPTE timecode (HH:MM:SS:FF) |

### Manual URL Mapping

```python
import bpy

def my_manual_map():
    url_prefix = "https://example.com/docs/"
    return (url_prefix, [
        ("bpy.ops.object.my_operator", "operators/my_op.html"),
        ("bpy.types.MyPropertyGroup.*", "properties.html"),
    ])

def register():
    bpy.utils.register_manual_map(my_manual_map)

def unregister():
    bpy.utils.unregister_manual_map(my_manual_map)
```

## Common Patterns

### Multi-file addon with submodule factory

```python
# __init__.py
import bpy

# Submodules must each have register() and unregister()
register, unregister = bpy.utils.register_submodule_factory(
    __name__, ["operators", "panels", "properties"]
)
```

### Custom icon loading workflow

```python
import bpy
import os

_preview_collections = {}

def get_icon(name):
    return _preview_collections["main"][name].icon_id

class MY_PT_panel(bpy.types.Panel):
    bl_label = "My Panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "My Tab"

    def draw(self, context):
        self.layout.label(text="Custom Icon", icon_value=get_icon("my_icon"))

def register():
    pcoll = bpy.utils.previews.new()
    icons_dir = os.path.join(os.path.dirname(__file__), "icons")
    pcoll.load("my_icon", os.path.join(icons_dir, "custom.png"), 'IMAGE')
    _preview_collections["main"] = pcoll
    bpy.utils.register_class(MY_PT_panel)

def unregister():
    bpy.utils.unregister_class(MY_PT_panel)
    for pcoll in _preview_collections.values():
        bpy.utils.previews.remove(pcoll)
    _preview_collections.clear()
```

### Finding resource paths cross-platform

```python
import bpy
import os

# User config directory (e.g. ~/.config/blender/5.0/)
config_path = bpy.utils.resource_path('USER')

# All script search paths
for p in bpy.utils.script_paths():
    print(p)

# Extension-specific writable directory
ext_dir = bpy.utils.extension_path_user(__package__, path="data", create=True)
cache_file = os.path.join(ext_dir, "cache.json")
```

## Gotchas

- **Unregister in reverse order.** If a Panel references a PropertyGroup, unregistering the PropertyGroup first raises an error. Always reverse the registration order.
- **`previews.remove()` is mandatory.** Failing to call it in `unregister()` leaks memory. Use `bpy.utils.previews.remove(pcoll)`, not `pcoll.close()`.
- **`expose_bundled_modules` availability.** Primarily designed for the `bpy` PyPI package context. In a regular Blender install, the modules may already be available on `sys.path` depending on the build, but calling this function ensures they are.
- **`register_classes_factory` does not handle PropertyGroup ordering for you.** The classes sequence must already be in the correct dependency order.
- **Privatized modules in 5.0.** Several previously-importable internal modules became private: `animsys_refactor`, `bl_console_utils`, `bl_i18n_utils`, `bl_previews_utils`, `bl_rna_utils`, `bl_text_utils`, `bl_ui_utils`, `bpy_restrict_state`, `console_python`, `console_shell`, `graphviz_export`, `keyingsets_utils`, `rna_info`, `rna_manual_reference`, `rna_xml`. Do not rely on importing these.
- **`user_resource` type change.** The `'AUTOSAVE'` resource type was removed; `'EXTENSIONS'` was added. Using `'AUTOSAVE'` raises an error.
