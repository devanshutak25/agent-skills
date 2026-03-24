# Addon Structure

Define addon packages with `bl_info` metadata, `register()`/`unregister()` lifecycle functions, and ordered class registration. Legacy addons use `bl_info` dicts in `__init__.py`; new-style extensions use `blender_manifest.toml` (see [extensions-system.md](extensions-system.md)). Both coexist in Blender 5.0. See [addon-preferences.md](addon-preferences.md) for preference UI and [bpy-utils.md](bpy-utils.md) for registration helpers.

## bl_info Dictionary

Legacy addons declare metadata in a `bl_info` dict at the top of `__init__.py`. Blender parses this without importing the module.

```python
bl_info = {
    "name": "My Addon",
    "author": "Author Name",
    "version": (1, 2, 0),
    "blender": (5, 0, 0),
    "location": "View3D > Sidebar > My Tab",
    "description": "Short description of the addon",
    "doc_url": "https://example.com/docs",
    "tracker_url": "https://example.com/issues",
    "support": 'COMMUNITY',
    "category": "Object",
    "warning": "",
}
```

### bl_info Fields

| Field | Type | Default | Description |
|---|---|---|---|
| `"name"` | `str` | `""` | Display name in Preferences |
| `"author"` | `str` | `""` | Author name(s) |
| `"version"` | `tuple` | `()` | Addon version, e.g. `(1, 0, 0)` |
| `"blender"` | `tuple` | `()` | Minimum Blender version, e.g. `(5, 0, 0)` |
| `"location"` | `str` | `""` | UI location hint (e.g. `"View3D > Sidebar > My Tab"`) |
| `"description"` | `str` | `""` | Short description |
| `"doc_url"` | `str` | `""` | Documentation URL (button in Preferences) |
| `"tracker_url"` | `str` | `""` | Bug tracker URL (button in Preferences) |
| `"support"` | `str` | `'COMMUNITY'` | `'OFFICIAL'`, `'COMMUNITY'`, or `'TESTING'` |
| `"category"` | `str` | `""` | Category for filtering |
| `"warning"` | `str` | `""` | Warning text shown in Preferences (e.g. `"Experimental"`) |
| `"show_expanded"` | `bool` | `False` | Whether entry starts expanded in Preferences |

### Valid Categories

`3D View`, `Add Curve`, `Add Mesh`, `Animation`, `Compositing`, `Development`, `Game Engine`, `Import-Export`, `Lighting`, `Material`, `Mesh`, `Node`, `Object`, `Paint`, `Physics`, `Render`, `Rigging`, `Scene`, `Sequencer`, `System`, `Text Editor`, `UV`

## register() and unregister()

Every addon must define `register()` and `unregister()` functions. Blender calls `register()` when enabling the addon and `unregister()` when disabling it.

```python
import bpy

class MY_OT_simple(bpy.types.Operator):
    bl_idname = "object.my_simple"
    bl_label = "Simple Operator"

    def execute(self, context):
        self.report({'INFO'}, "Done")
        return {'FINISHED'}

class VIEW3D_PT_simple(bpy.types.Panel):
    bl_idname = "VIEW3D_PT_simple"
    bl_label = "Simple Panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "My Addon"

    def draw(self, context):
        self.layout.operator("object.my_simple")

def register():
    bpy.utils.register_class(MY_OT_simple)
    bpy.utils.register_class(VIEW3D_PT_simple)

def unregister():
    bpy.utils.unregister_class(VIEW3D_PT_simple)
    bpy.utils.unregister_class(MY_OT_simple)
```

### Registration Rules

- Call `bpy.utils.register_class()` for each class inside `register()` — never at module level.
- `unregister()` must reverse the registration order exactly.
- If a class defines a `register` classmethod, Blender calls it automatically during registration.
- Failing to unregister causes `"already registered as a subclass"` errors on re-enable.

## Class Registration Order

Classes must be registered in dependency order. A `PointerProperty(type=SomeClass)` or `CollectionProperty(type=SomeClass)` requires `SomeClass` to already be registered.

**Registration order (register):**
1. **PropertyGroup** subclasses (child groups before parent groups if nested)
2. **Operators**
3. **Menus**
4. **Panels**
5. **AddonPreferences** (if referencing PropertyGroups via PointerProperty)
6. **Attach properties to built-in types** (`bpy.types.Scene.my_props = ...`)

**Unregistration order (unregister) — exact reverse:**
1. Delete properties from built-in types
2. AddonPreferences
3. Panels
4. Menus
5. Operators
6. PropertyGroup subclasses (parent before child — reverse of registration)

### Standard Pattern

```python
import bpy

class MySettings(bpy.types.PropertyGroup):
    scale: bpy.props.FloatProperty(name="Scale", default=1.0)
    count: bpy.props.IntProperty(name="Count", default=5, min=1)

class MY_OT_do_thing(bpy.types.Operator):
    bl_idname = "object.do_thing"
    bl_label = "Do Thing"

    def execute(self, context):
        settings = context.scene.my_settings
        self.report({'INFO'}, f"Scale={settings.scale}, Count={settings.count}")
        return {'FINISHED'}

class MY_MT_context_menu(bpy.types.Menu):
    bl_idname = "MY_MT_context_menu"
    bl_label = "My Menu"

    def draw(self, context):
        self.layout.operator("object.do_thing")

class VIEW3D_PT_my_panel(bpy.types.Panel):
    bl_idname = "VIEW3D_PT_my_panel"
    bl_label = "My Panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "My Addon"

    def draw(self, context):
        layout = self.layout
        settings = context.scene.my_settings
        layout.prop(settings, "scale")
        layout.prop(settings, "count")
        layout.operator("object.do_thing")
        layout.menu("MY_MT_context_menu")

classes = (
    MySettings,
    MY_OT_do_thing,
    MY_MT_context_menu,
    VIEW3D_PT_my_panel,
)

def register():
    for cls in classes:
        bpy.utils.register_class(cls)
    bpy.types.Scene.my_settings = bpy.props.PointerProperty(type=MySettings)

def unregister():
    del bpy.types.Scene.my_settings
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)
```

## Multi-File Addons

For larger addons, split code across submodules. The `__init__.py` imports submodules and handles registration.

### Directory Structure

```
my_addon/
    __init__.py
    operators.py
    panels.py
    properties.py
    utils.py
```

### __init__.py for Multi-File Addon

```python
bl_info = {
    "name": "My Multi-File Addon",
    "author": "Author",
    "version": (1, 0, 0),
    "blender": (5, 0, 0),
    "category": "Object",
}

import bpy

from . import properties
from . import operators
from . import panels

classes = (
    properties.MySettings,
    operators.MY_OT_do_thing,
    panels.VIEW3D_PT_my_panel,
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

### Relative Imports

Inside submodules, use `__package__` and relative imports:

```python
# operators.py
import bpy
from . import utils

class MY_OT_do_thing(bpy.types.Operator):
    bl_idname = "object.do_thing"
    bl_label = "Do Thing"

    def execute(self, context):
        utils.helper_function()
        return {'FINISHED'}
```

## Development Reloading with importlib

During development, Blender caches imported modules. Use `importlib.reload` to pick up code changes without restarting Blender:

```python
bl_info = {
    "name": "My Addon",
    "author": "Author",
    "version": (1, 0, 0),
    "blender": (5, 0, 0),
    "category": "Object",
}

import bpy

if "bpy" in locals():
    import importlib
    if "operators" in locals():
        importlib.reload(operators)
    if "panels" in locals():
        importlib.reload(panels)
    if "properties" in locals():
        importlib.reload(properties)

from . import operators
from . import panels
from . import properties
```

The `if "bpy" in locals()` guard detects re-import (Blender re-executes `__init__.py` on addon re-enable). On first import, the guard is `False` and the `from . import` lines run normally. On re-enable, the guard is `True` and `importlib.reload()` refreshes cached modules before the fresh imports.

### Reload Order

Reload in dependency order — utility modules first, then modules that depend on them. If `operators.py` imports from `utils.py`, reload `utils` before `operators`.

## Bundled Data Files

Addons can include non-Python files (icons, presets, JSON configs). Access them relative to the addon directory:

```python
import os
import bpy

def get_addon_directory():
    return os.path.dirname(os.path.realpath(__file__))

def load_icon():
    icon_path = os.path.join(get_addon_directory(), "icons", "my_icon.png")
    icons = bpy.utils.previews.new()
    icons.load("my_icon", icon_path, 'IMAGE')
    return icons

def load_preset():
    preset_path = os.path.join(get_addon_directory(), "presets", "default.json")
    import json
    with open(preset_path, 'r') as f:
        return json.load(f)
```

For extensions using `blender_manifest.toml`, bundled data files are included automatically unless excluded by `[build].paths_exclude_pattern`. See [extensions-system.md](extensions-system.md).

## Script Execution vs Module Import

Blender Python code runs in two distinct modes:

- **Script execution** — Code run via Text Editor "Run Script" or `blender --python script.py`. Executes in `__main__` namespace. `__name__ == "__main__"`. No package structure — relative imports fail.
- **Module import** — Addon/extension code loaded by Blender's addon system. `__name__` is the module path (e.g. `"my_addon"` or `"my_addon.operators"`). `__package__` is set. Relative imports work.

Use the `if __name__ == "__main__"` guard for code that should only run when executed as a script:

```python
import bpy

class MY_OT_example(bpy.types.Operator):
    bl_idname = "object.example"
    bl_label = "Example"

    def execute(self, context):
        return {'FINISHED'}

def register():
    bpy.utils.register_class(MY_OT_example)

def unregister():
    bpy.utils.unregister_class(MY_OT_example)

if __name__ == "__main__":
    register()
```

## Common Patterns

### Complete Single-File Addon

```python
bl_info = {
    "name": "Quick Rename",
    "author": "Dev",
    "version": (1, 0, 0),
    "blender": (5, 0, 0),
    "location": "View3D > Sidebar > Tool",
    "description": "Batch rename selected objects with prefix",
    "category": "Object",
}

import bpy

class RenameSettings(bpy.types.PropertyGroup):
    prefix: bpy.props.StringProperty(name="Prefix", default="obj_")
    start_number: bpy.props.IntProperty(name="Start", default=1, min=0)

class OBJECT_OT_batch_rename(bpy.types.Operator):
    bl_idname = "object.batch_rename"
    bl_label = "Batch Rename"
    bl_options = {'REGISTER', 'UNDO'}

    @classmethod
    def poll(cls, context):
        return context.selected_objects

    def execute(self, context):
        settings = context.scene.rename_settings
        for i, obj in enumerate(context.selected_objects):
            obj.name = f"{settings.prefix}{settings.start_number + i:03d}"
        self.report({'INFO'}, f"Renamed {len(context.selected_objects)} objects")
        return {'FINISHED'}

class VIEW3D_PT_batch_rename(bpy.types.Panel):
    bl_idname = "VIEW3D_PT_batch_rename"
    bl_label = "Batch Rename"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "Tool"

    def draw(self, context):
        layout = self.layout
        settings = context.scene.rename_settings
        layout.prop(settings, "prefix")
        layout.prop(settings, "start_number")
        layout.operator("object.batch_rename")

classes = (RenameSettings, OBJECT_OT_batch_rename, VIEW3D_PT_batch_rename)

def register():
    for cls in classes:
        bpy.utils.register_class(cls)
    bpy.types.Scene.rename_settings = bpy.props.PointerProperty(type=RenameSettings)

def unregister():
    del bpy.types.Scene.rename_settings
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)

if __name__ == "__main__":
    register()
```

### Addon with Keymap Registration

```python
import bpy

addon_keymaps = []

class MY_OT_action(bpy.types.Operator):
    bl_idname = "object.my_action"
    bl_label = "My Action"

    def execute(self, context):
        self.report({'INFO'}, "Action triggered")
        return {'FINISHED'}

def register():
    bpy.utils.register_class(MY_OT_action)

    wm = bpy.context.window_manager
    kc = wm.keyconfigs.addon
    if kc:
        km = kc.keymaps.new(name="3D View", space_type='VIEW_3D')
        kmi = km.keymap_items.new("object.my_action", 'Q', 'PRESS', shift=True)
        addon_keymaps.append((km, kmi))

def unregister():
    for km, kmi in addon_keymaps:
        km.keymap_items.remove(kmi)
    addon_keymaps.clear()

    bpy.utils.unregister_class(MY_OT_action)
```

### Addon with Menu Integration

```python
import bpy

class MY_OT_custom_action(bpy.types.Operator):
    bl_idname = "object.custom_action"
    bl_label = "Custom Action"

    def execute(self, context):
        return {'FINISHED'}

def draw_menu_func(self, context):
    self.layout.operator("object.custom_action")

def register():
    bpy.utils.register_class(MY_OT_custom_action)
    bpy.types.VIEW3D_MT_object.append(draw_menu_func)

def unregister():
    bpy.types.VIEW3D_MT_object.remove(draw_menu_func)
    bpy.utils.unregister_class(MY_OT_custom_action)
```

## Gotchas

1. **Registration at module level crashes** — never call `bpy.utils.register_class()` outside `register()`. Module-level registration causes errors when Blender scans the addon.

2. **Forgetting to unregister causes re-enable failures** — if `unregister()` skips a class, re-enabling the addon raises `"already registered as a subclass"`. Always mirror `register()` in reverse.

3. **PointerProperty requires target class to be registered first** — if `MySettings` references `MySubSettings` via `PointerProperty(type=MySubSettings)`, `MySubSettings` must be registered before `MySettings`.

4. **importlib.reload does not reload nested imports** — if `operators.py` imports from `utils.py`, reloading `operators` alone does not refresh `utils`. Reload `utils` first.

5. **Relative imports fail in script execution mode** — `from . import module` only works in addon/extension context where `__package__` is set. Scripts run from the Text Editor use `__main__` namespace.

6. **bl_info must be a literal dict** — Blender parses `bl_info` with `ast.literal_eval` without importing the module. Computed values, variables, or function calls inside `bl_info` are ignored.

7. **Properties attached to built-in types persist beyond addon disable** — if you attach `bpy.types.Scene.my_prop = ...` in `register()` but forget `del bpy.types.Scene.my_prop` in `unregister()`, the property leaks until Blender restarts.
