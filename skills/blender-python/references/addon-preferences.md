# Addon Preferences

Define user-configurable preferences for addons by subclassing `bpy.types.AddonPreferences`. Preferences persist across sessions in the user's Blender configuration and appear in Edit > Preferences > Add-ons. See [addon-structure.md](addon-structure.md) for addon lifecycle and registration; see [bpy-props.md](bpy-props.md) for property types.

## AddonPreferences Class

```python
import bpy

class MyAddonPreferences(bpy.types.AddonPreferences):
    bl_idname = __package__

    api_key: bpy.props.StringProperty(
        name="API Key",
        description="Service API key",
        subtype='PASSWORD',
    )
    auto_save: bpy.props.BoolProperty(
        name="Auto Save",
        description="Automatically save after export",
        default=True,
    )
    export_path: bpy.props.StringProperty(
        name="Export Path",
        description="Default export directory",
        subtype='DIR_PATH',
        default="//exports/",
    )

    def draw(self, context):
        layout = self.layout
        layout.prop(self, "api_key")
        layout.prop(self, "auto_save")
        layout.prop(self, "export_path")
```

### Required Attributes

| Attribute | Type | Description |
|---|---|---|
| `bl_idname` | `str` | Must equal `__package__` — the addon's package name |

### Methods

| Method | Description |
|---|---|
| `draw(self, context)` | Draw the preferences UI. Called when the user expands the addon entry in Preferences. |

### bl_idname = __package__

The `bl_idname` must match the addon's package name. For single-file addons, use the module name. For multi-file addons (directories), `__package__` resolves to the directory name. This must match the name used by Blender's addon system.

```python
# Single-file addon (my_addon.py):
bl_idname = __name__  # "my_addon"

# Multi-file addon (my_addon/__init__.py):
bl_idname = __package__  # "my_addon"
```

For extensions with `blender_manifest.toml`, `__package__` matches the extension's `id` field.

## Accessing Preferences

Access addon preferences from anywhere using the addon's package name:

```python
import bpy

def get_prefs():
    return bpy.context.preferences.addons[__package__].preferences

# Usage in an operator
class MY_OT_export(bpy.types.Operator):
    bl_idname = "object.my_export"
    bl_label = "Export"

    def execute(self, context):
        prefs = context.preferences.addons[__package__].preferences
        if prefs.auto_save:
            bpy.ops.wm.save_mainfile()
        self.report({'INFO'}, f"Exporting to {prefs.export_path}")
        return {'FINISHED'}
```

### Accessing from a Panel

```python
class VIEW3D_PT_my_panel(bpy.types.Panel):
    bl_idname = "VIEW3D_PT_my_panel"
    bl_label = "My Panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "My Addon"

    def draw(self, context):
        layout = self.layout
        prefs = context.preferences.addons[__package__].preferences
        layout.label(text=f"Export to: {prefs.export_path}")
        layout.operator("object.my_export")
```

### Safe Access Pattern

Preferences may not exist if the addon is not enabled. Use `.get()` for defensive access:

```python
def get_prefs_safe():
    addon = bpy.context.preferences.addons.get(__package__)
    if addon is not None:
        return addon.preferences
    return None
```

## Preference Properties

AddonPreferences supports all `bpy.props` property types. Properties are stored in user preferences and survive Blender restarts.

```python
class MyAddonPreferences(bpy.types.AddonPreferences):
    bl_idname = __package__

    # String with subtype
    filepath: bpy.props.StringProperty(
        name="File Path",
        subtype='FILE_PATH',
    )

    # Enum for mode selection
    mode: bpy.props.EnumProperty(
        name="Mode",
        items=[
            ('FAST', "Fast", "Quick processing"),
            ('QUALITY', "Quality", "High quality processing"),
            ('CUSTOM', "Custom", "Custom settings"),
        ],
        default='FAST',
    )

    # Float with range
    threshold: bpy.props.FloatProperty(
        name="Threshold",
        default=0.5,
        min=0.0,
        max=1.0,
        subtype='FACTOR',
    )

    # Nested PropertyGroup via PointerProperty
    advanced: bpy.props.PointerProperty(type=AdvancedSettings)

    def draw(self, context):
        layout = self.layout
        layout.use_property_split = True

        layout.prop(self, "filepath")
        layout.prop(self, "mode")
        layout.prop(self, "threshold")

        if self.mode == 'CUSTOM':
            box = layout.box()
            box.label(text="Advanced Settings")
            box.prop(self.advanced, "iterations")
            box.prop(self.advanced, "use_gpu")
```

## bl_system_properties_get

A method available on ID types and other data structures (ViewLayer, Bone, EditBone, BoneCollection, PoseBone, Strip) for accessing the internal system property storage.

```python
bl_system_properties_get(*, do_create=False)
```

**Parameters:**
- `do_create` (`bool`, keyword-only, default `False`) — if `True`, creates the system properties container if it does not yet exist.

**Returns:** The system properties root container (dict-like), or `None` if no system properties exist and `do_create` is `False`.

This method exists because of the 5.0 IDProperty/RNA storage separation. Properties defined via `bpy.props` are stored separately from custom IDProperties. `bl_system_properties_get` provides debug/internal access to the RNA storage.

### Versioning Use Case

When migrating addons from pre-5.0 to 5.0, use this to access old property data:

```python
import bpy

def version_addon_data():
    for obj in bpy.data.objects:
        sys_props = obj.bl_system_properties_get()
        if sys_props is not None and 'old_addon_data' in sys_props:
            old_value = sys_props['old_addon_data']['setting']
            # Migrate to new property location
            obj.my_addon.setting = old_value
```

Files from Blender 4.5 and earlier get custom-data IDProperties duplicated into system properties during versioning. Addons can clean up redundant pre-5.0 data:

```python
for obj in bpy.data.objects:
    if 'my_addon_legacy' in obj:
        del obj['my_addon_legacy']
```

## Keymap Registration in Preferences

Addon keymaps are typically registered alongside the addon and displayed in the preferences UI for user customization.

```python
import bpy

addon_keymaps = []

class MY_OT_action(bpy.types.Operator):
    bl_idname = "object.my_action"
    bl_label = "My Action"

    def execute(self, context):
        self.report({'INFO'}, "Action executed")
        return {'FINISHED'}

class MyAddonPreferences(bpy.types.AddonPreferences):
    bl_idname = __package__

    def draw(self, context):
        layout = self.layout

        layout.label(text="Keymap:")
        col = layout.column()

        wm = context.window_manager
        kc = wm.keyconfigs.user
        km = kc.keymaps.get("3D View")
        if km:
            for kmi in km.keymap_items:
                if kmi.idname == "object.my_action":
                    col.context_pointer_set("keymap", km)
                    rna_keymap_ui = bpy.utils.modules_from_path(
                        bpy.utils.resource_path('LOCAL')
                    )
                    col.prop(kmi, "type", text="Key", full_event=True)

def register():
    bpy.utils.register_class(MY_OT_action)
    bpy.utils.register_class(MyAddonPreferences)

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

    bpy.utils.unregister_class(MyAddonPreferences)
    bpy.utils.unregister_class(MY_OT_action)
```

### Keymap Best Practices

- Register keymaps on `keyconfigs.addon`, not `keyconfigs.user` — the user config is for user customization.
- Store `(km, kmi)` tuples for cleanup in `unregister()`.
- Check `if kc:` before creating keymaps — `keyconfigs.addon` may be `None` in background mode.
- Use `shift=True`, `ctrl=True`, `alt=True` for modifier keys.

## Saving Preferences

Blender auto-saves preferences on quit if "Auto-Save Preferences" is enabled. To force an immediate save programmatically:

```python
bpy.ops.wm.save_userpref()
```

This writes all preferences (including addon preferences) to the user's config file. Use this sparingly — typically only when the user explicitly saves settings in your addon's UI.

```python
class MY_OT_save_settings(bpy.types.Operator):
    bl_idname = "my_addon.save_settings"
    bl_label = "Save Addon Settings"

    def execute(self, context):
        bpy.ops.wm.save_userpref()
        self.report({'INFO'}, "Settings saved")
        return {'FINISHED'}
```

## Common Patterns

### Complete Addon with Preferences

```python
bl_info = {
    "name": "Texture Checker",
    "author": "Dev",
    "version": (1, 0, 0),
    "blender": (5, 0, 0),
    "category": "Material",
}

import bpy

class TexCheckerPrefs(bpy.types.AddonPreferences):
    bl_idname = __package__

    texture_size: bpy.props.EnumProperty(
        name="Default Size",
        items=[
            ('512', "512", "512x512"),
            ('1024', "1024", "1024x1024"),
            ('2048', "2048", "2048x2048"),
            ('4096', "4096", "4096x4096"),
        ],
        default='1024',
    )
    checker_color_a: bpy.props.FloatVectorProperty(
        name="Color A",
        subtype='COLOR',
        default=(1.0, 1.0, 1.0),
        min=0.0,
        max=1.0,
    )
    checker_color_b: bpy.props.FloatVectorProperty(
        name="Color B",
        subtype='COLOR',
        default=(0.8, 0.0, 0.8),
        min=0.0,
        max=1.0,
    )

    def draw(self, context):
        layout = self.layout
        layout.use_property_split = True
        layout.prop(self, "texture_size")
        row = layout.row(align=True)
        row.prop(self, "checker_color_a")
        row.prop(self, "checker_color_b")

class MATERIAL_OT_add_checker(bpy.types.Operator):
    bl_idname = "material.add_checker"
    bl_label = "Add Checker Texture"
    bl_options = {'REGISTER', 'UNDO'}

    @classmethod
    def poll(cls, context):
        return context.active_object and context.active_object.type == 'MESH'

    def execute(self, context):
        prefs = context.preferences.addons[__package__].preferences
        size = int(prefs.texture_size)

        obj = context.active_object
        mat = bpy.data.materials.new(name="Checker")
        mat.use_nodes = True
        tree = mat.node_tree

        checker = tree.nodes.new('ShaderNodeTexChecker')
        checker.inputs['Color1'].default_value = (*prefs.checker_color_a, 1.0)
        checker.inputs['Color2'].default_value = (*prefs.checker_color_b, 1.0)
        checker.inputs['Scale'].default_value = size / 64.0

        principled = tree.nodes.get("Principled BSDF")
        if principled:
            tree.links.new(checker.outputs['Color'], principled.inputs['Base Color'])

        if not obj.data.materials:
            obj.data.materials.append(mat)
        else:
            obj.data.materials[0] = mat

        self.report({'INFO'}, f"Added {size}x{size} checker texture")
        return {'FINISHED'}

class VIEW3D_PT_tex_checker(bpy.types.Panel):
    bl_idname = "VIEW3D_PT_tex_checker"
    bl_label = "Texture Checker"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "Material"

    @classmethod
    def poll(cls, context):
        return context.active_object and context.active_object.type == 'MESH'

    def draw(self, context):
        layout = self.layout
        prefs = context.preferences.addons[__package__].preferences
        layout.label(text=f"Size: {prefs.texture_size}x{prefs.texture_size}")
        layout.operator("material.add_checker")

classes = (
    TexCheckerPrefs,
    MATERIAL_OT_add_checker,
    VIEW3D_PT_tex_checker,
)

def register():
    for cls in classes:
        bpy.utils.register_class(cls)

def unregister():
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)

if __name__ == "__main__":
    register()
```

### Preferences with Conditional UI

```python
import bpy

class MyAddonPreferences(bpy.types.AddonPreferences):
    bl_idname = __package__

    backend: bpy.props.EnumProperty(
        name="Backend",
        items=[
            ('LOCAL', "Local", "Process locally"),
            ('REMOTE', "Remote", "Use remote server"),
        ],
        default='LOCAL',
    )
    server_url: bpy.props.StringProperty(
        name="Server URL",
        default="https://api.example.com",
    )
    server_token: bpy.props.StringProperty(
        name="Token",
        subtype='PASSWORD',
    )
    num_threads: bpy.props.IntProperty(
        name="Threads",
        default=4,
        min=1,
        max=32,
    )

    def draw(self, context):
        layout = self.layout
        layout.use_property_split = True

        layout.prop(self, "backend")

        if self.backend == 'LOCAL':
            layout.prop(self, "num_threads")
        else:
            box = layout.box()
            box.prop(self, "server_url")
            box.prop(self, "server_token")

classes = (MyAddonPreferences,)

def register():
    for cls in classes:
        bpy.utils.register_class(cls)

def unregister():
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)
```

### Open Preferences from Operator

```python
import bpy

class MY_OT_open_prefs(bpy.types.Operator):
    bl_idname = "my_addon.open_prefs"
    bl_label = "Open Addon Preferences"

    def execute(self, context):
        bpy.ops.screen.userpref_show()
        context.preferences.active_section = 'ADDONS'
        bpy.ops.preferences.addon_show(module=__package__)
        return {'FINISHED'}
```

## Gotchas

1. **bl_idname must match __package__ exactly** — if the addon directory is renamed, `__package__` changes and the preferences become inaccessible. For extensions, this must match the `id` in `blender_manifest.toml`.

2. **Preferences are not available until the addon is enabled** — accessing `context.preferences.addons[__package__]` before the addon is registered raises `KeyError`. Use `.get()` for safe access.

3. **PropertyGroup referenced by PointerProperty must be registered first** — if your AddonPreferences class uses `PointerProperty(type=MySettings)`, register `MySettings` before the preferences class.

4. **draw() is called on every Preferences redraw** — avoid expensive operations in the draw method. Cache results if needed.

5. **save_userpref() saves ALL preferences** — calling `bpy.ops.wm.save_userpref()` saves the entire preferences file, not just addon preferences. This includes user keymaps, themes, and all other settings.

6. **Preferences lost if user resets to factory defaults** — `bpy.ops.wm.read_factory_settings()` wipes all addon preferences. There is no built-in import/export for individual addon prefs — implement your own if needed.

7. **bl_system_properties_get is for debug/versioning only** — do not use it for regular property access in production code. It exposes internal RNA storage that may change between Blender versions.
