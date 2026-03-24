# Property Definitions (bpy.props)

Declares typed properties on registered Blender classes (Operator, Panel, PropertyGroup). Properties defined via `bpy.props` are RNA properties with type safety, UI integration, animation support, and undo tracking. They are distinct from IDProperties (dict-style custom properties). See [idprop](idprop.md).

## Property Types

### Scalar Properties

**BoolProperty**

```python
bpy.props.BoolProperty(
    name="",              # str — UI display name
    description="",       # str — tooltip text
    default=False,        # bool
    options={'ANIMATABLE'},  # set of option flags
    tags=set(),           # set of custom tags
    subtype='NONE',       # str — subtype
    update=None,          # callable — update(self, context)
    get=None,             # callable — get(self) → bool
    set=None,             # callable — set(self, value)
    get_transform=None,   # callable — get_transform(self, value, is_set) → bool
    set_transform=None,   # callable — set_transform(self, new_value, curr_value, is_set) → bool
)
```

**IntProperty**

```python
bpy.props.IntProperty(
    name="", description="", default=0,
    min=-2**31, max=2**31 - 1,
    soft_min=-2**31, soft_max=2**31 - 1,
    step=1,               # int — UI increment
    options={'ANIMATABLE'}, tags=set(),
    subtype='NONE',
    update=None, get=None, set=None,
    get_transform=None, set_transform=None,
)
```

**FloatProperty**

```python
bpy.props.FloatProperty(
    name="", description="", default=0.0,
    min=-3.4e+38, max=3.4e+38,
    soft_min=-3.4e+38, soft_max=3.4e+38,
    step=3,               # int (1–100) — UI step is step/100, so 3 → 0.03
    precision=2,          # int (0–6) — decimal places displayed
    options={'ANIMATABLE'}, tags=set(),
    subtype='NONE',
    unit='NONE',          # str — unit type
    update=None, get=None, set=None,
    get_transform=None, set_transform=None,
)
```

**StringProperty**

```python
bpy.props.StringProperty(
    name="", description="", default="",
    maxlen=0,             # int — 0 means unlimited
    options={'ANIMATABLE'}, tags=set(),
    subtype='NONE',
    update=None, get=None, set=None,
    get_transform=None, set_transform=None,
)
```

### Enum Property

```python
bpy.props.EnumProperty(
    items,                # list of tuples OR callback function (required)
    name="", description="",
    default=None,         # str (identifier) or set for ENUM_FLAG
    options={'ANIMATABLE'}, tags=set(),
    update=None,
    get=None,             # get/set work with INTEGER values, not identifiers
    set=None,
    get_transform=None, set_transform=None,
)
```

**Items format** — list of tuples:

```python
items=[
    ('OPT_A', "Option A", "Description of A", 'ICON_NAME', 0),
    ('OPT_B', "Option B", "Description of B", 'ICON_NAME', 1),
    None,  # separator in UI
    ('OPT_C', "Option C", "Description of C", 2),  # 4-element form (no icon)
]
# Tuple: (identifier, name, description, icon, number)
# Or:    (identifier, name, description, number)
```

**Dynamic items callback:**

```python
def my_items(self, context):
    return [('A', "A", ""), ('B', "B", "")]

# When using callback, do NOT specify default
my_enum: bpy.props.EnumProperty(items=my_items)
```

With `ENUM_FLAG` in options, item numbers must be powers of two and default must be a set.

### Vector Properties

```python
bpy.props.BoolVectorProperty(
    name="", description="",
    default=(False, False, False),
    size=3,               # int (1–32)
    options={'ANIMATABLE'}, tags=set(), subtype='NONE',
    update=None, get=None, set=None,
    get_transform=None, set_transform=None,
)

bpy.props.IntVectorProperty(
    name="", description="",
    default=(0, 0, 0),
    min=-2**31, max=2**31 - 1, soft_min=-2**31, soft_max=2**31 - 1,
    step=1, size=3,
    options={'ANIMATABLE'}, tags=set(), subtype='NONE',
    update=None, get=None, set=None,
    get_transform=None, set_transform=None,
)

bpy.props.FloatVectorProperty(
    name="", description="",
    default=(0.0, 0.0, 0.0),
    min=-3.4e+38, max=3.4e+38, soft_min=-3.4e+38, soft_max=3.4e+38,
    step=3, precision=2, size=3,
    options={'ANIMATABLE'}, tags=set(), subtype='NONE', unit='NONE',
    update=None, get=None, set=None,
    get_transform=None, set_transform=None,
)
```

### Pointer and Collection Properties

```python
bpy.props.PointerProperty(
    type,                 # class — PropertyGroup or ID subclass (required)
    name="", description="",
    options={'ANIMATABLE'}, tags=set(),
    poll=None,            # callable — poll(self, object) → bool (filters valid targets)
    update=None,          # callable — update(self, context)
    # No get/set/get_transform/set_transform
)

bpy.props.CollectionProperty(
    type,                 # class — PropertyGroup subclass (required)
    name="", description="",
    options={'ANIMATABLE'}, tags=set(),
    # No update, get, set, or transform callbacks
)
```

**CollectionProperty runtime methods** (on the resulting `bpy_prop_collection`):

| Method | Description |
|---|---|
| `add()` | Add and return a new item |
| `remove(index)` | Remove item at index |
| `clear()` | Remove all items |
| `move(from_index, to_index)` | Reorder items |
| `find(key)` | Index of key, -1 if not found |
| `foreach_get(attr, seq)` | Fast bulk read |
| `foreach_set(attr, seq)` | Fast bulk write |
| `keys()`, `values()`, `items()` | Dict-like access |

### RemoveProperty

```python
bpy.props.RemoveProperty(cls, attr="prop_name")
```

Removes a previously defined property from a class.

## PropertyGroup

Subclass `bpy.types.PropertyGroup` to define structured property containers. Use annotation syntax for fields:

```python
import bpy

class MySettings(bpy.types.PropertyGroup):
    scale: bpy.props.FloatProperty(name="Scale", default=1.0, min=0.01, max=100.0)
    use_smooth: bpy.props.BoolProperty(name="Smooth", default=True)
    mode: bpy.props.EnumProperty(
        name="Mode",
        items=[
            ('FAST', "Fast", "Quick but rough"),
            ('QUALITY', "Quality", "Slow but precise"),
        ],
        default='FAST',
    )

# Plain Python attributes are IGNORED by RNA:
# count = 0  # WRONG — invisible to Blender
```

### Registration Order

Register PropertyGroups before classes that reference them. Unregister in reverse:

```python
classes = (MySettings, MY_OT_operator, MY_PT_panel)

def register():
    for cls in classes:
        bpy.utils.register_class(cls)
    bpy.types.Scene.my_settings = bpy.props.PointerProperty(type=MySettings)

def unregister():
    del bpy.types.Scene.my_settings
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)
```

### Nesting PropertyGroups

```python
class MaterialSettings(bpy.types.PropertyGroup):
    roughness: bpy.props.FloatProperty(default=0.5)
    metallic: bpy.props.FloatProperty(default=0.0)

class SceneSettings(bpy.types.PropertyGroup):
    mat: bpy.props.PointerProperty(type=MaterialSettings)
    items: bpy.props.CollectionProperty(type=MaterialSettings)

# Register order: MaterialSettings first, then SceneSettings
bpy.utils.register_class(MaterialSettings)
bpy.utils.register_class(SceneSettings)
bpy.types.Scene.my_settings = bpy.props.PointerProperty(type=SceneSettings)
```

Access: `bpy.context.scene.my_settings.mat.roughness`

## Options Flags

| Flag | Description |
|---|---|
| `HIDDEN` | Hide from auto-generated UI |
| `SKIP_SAVE` | Do not remember between operator invocations |
| `SKIP_PRESET` | Do not include in presets |
| `ANIMATABLE` | Can be animated (in default set for all property types) |
| `LIBRARY_EDITABLE` | Editable on linked data (changes not saved to source file) |
| `PROPORTIONAL` | Adjust values proportionally to each other |
| `TEXTEDIT_UPDATE` | Trigger update on every keystroke in text fields |
| `READ_ONLY` | Property cannot be edited in UI or from Python assignment |
| `ENUM_FLAG` | Enum allows multi-selection (default becomes a set, item values must be powers of 2) |
| `OUTPUT_PATH` | String property is an output path |
| `PATH_SUPPORTS_BLEND_RELATIVE` | Supports `//` prefix for blend-relative paths |
| `SUPPORTS_TEMPLATES` | Supports `{variable_name}` template syntax |

`READ_ONLY` replaces the pre-5.0 pattern of defining `get` without `set` to make a property read-only.

Default for all property types: `options={'ANIMATABLE'}`.

## Subtypes

### Scalar Number Subtypes

`'NONE'`, `'PIXEL'`, `'PIXEL_DIAMETER'`, `'UNSIGNED'`, `'PERCENTAGE'`, `'FACTOR'`, `'MASS'`, `'ANGLE'`, `'TIME'`, `'TIME_ABSOLUTE'`, `'DISTANCE'`, `'DISTANCE_DIAMETER'`, `'DISTANCE_CAMERA'`, `'POWER'`, `'TEMPERATURE'`, `'WAVELENGTH'`, `'COLOR_TEMPERATURE'`, `'FREQUENCY'`

### Vector Number Subtypes

`'NONE'`, `'COLOR'`, `'TRANSLATION'`, `'DIRECTION'`, `'VELOCITY'`, `'ACCELERATION'`, `'MATRIX'`, `'EULER'`, `'QUATERNION'`, `'AXISANGLE'`, `'XYZ'`, `'XYZ_LENGTH'`, `'COLOR_GAMMA'`, `'COORDINATES'`, `'LAYER'`, `'LAYER_MEMBER'`

### String Subtypes

`'NONE'`, `'FILE_PATH'`, `'DIR_PATH'`, `'FILE_NAME'`, `'BYTE_STRING'`, `'PASSWORD'`

### Unit Values (FloatProperty / FloatVectorProperty only)

`'NONE'`, `'LENGTH'`, `'AREA'`, `'VOLUME'`, `'ROTATION'`, `'TIME'`, `'TIME_ABSOLUTE'`, `'VELOCITY'`, `'ACCELERATION'`, `'MASS'`, `'CAMERA'`, `'POWER'`, `'TEMPERATURE'`, `'WAVELENGTH'`, `'COLOR_TEMPERATURE'`, `'FREQUENCY'`

## Callbacks

### update

Called after the value changes:

```python
def my_update(self, context):
    print(f"Value changed to {self.my_prop}")
    # Do NOT set the same property here — causes infinite loop

class MyGroup(bpy.types.PropertyGroup):
    my_prop: bpy.props.FloatProperty(update=my_update)
```

Available on all property types except `CollectionProperty`.

### get / set

Custom storage — the property is NOT stored automatically. You must handle storage yourself:

```python
def get_value(self):
    return self.get("_internal", 0.0)

def set_value(self, value):
    self["_internal"] = value  # stored as IDProperty

class MyGroup(bpy.types.PropertyGroup):
    my_prop: bpy.props.FloatProperty(get=get_value, set=set_value)
```

Rules:
- Defining `set` without `get` is an error
- For `EnumProperty`, get/set work with **integer** values, not identifier strings
- For vector properties, `get` must return a sequence matching the `size`

### get_transform / set_transform

Transform the value while keeping default internal storage. Several times faster than `get`/`set` because Blender still manages the storage:

```python
def clamp_get(self, curr_value, is_set):
    # curr_value: the stored value
    # is_set: whether the property has been explicitly set (vs. using default)
    return max(0.0, curr_value)

def clamp_set(self, new_value, curr_value, is_set):
    # new_value: the value being assigned
    # curr_value: the currently stored value
    # is_set: whether the property was previously set
    # Return value is what gets stored
    return max(0.0, new_value)

class MyGroup(bpy.types.PropertyGroup):
    clamped: bpy.props.FloatProperty(
        get_transform=clamp_get,
        set_transform=clamp_set,
    )
```

Use `get_transform`/`set_transform` instead of `get`/`set` when you only need to transform values, not change storage. They keep animation, undo, and library overrides working correctly.

## IDProperty Storage Separation (5.0)

Properties defined via `bpy.props` are stored in a separate internal system, not in the IDProperty container. This is the single biggest breaking change in 5.0.

**What this means:**

```python
# bpy.props property (RNA property)
class MyGroup(bpy.types.PropertyGroup):
    scale: bpy.props.FloatProperty(default=1.0)

# Accessing RNA property — use attribute syntax
settings = bpy.context.scene.my_settings
val = settings.scale           # correct — reads RNA property

# This does NOT access the bpy.props property:
val = settings["scale"]        # WRONG — looks in IDProperty storage, not RNA
```

**Resetting properties:**

```python
# Pre-5.0 pattern (no longer works for RNA properties):
# del obj["my_prop"]

# 5.0 pattern:
obj.property_unset("my_prop")
```

**Versioning:** Blend files from 4.5 and earlier get custom data IDProperties duplicated into the new system storage during file versioning. Addons should clean up stale IDProperties from pre-5.0:

```python
# Cleanup pattern for pre-5.0 data
if "my_addon_prop" in obj:
    del obj["my_addon_prop"]  # remove the stale IDProperty copy
```

## Custom Properties (NOT bpy.props)

Custom properties are IDProperties — arbitrary key/value storage on any data-block. They are completely separate from `bpy.props` properties:

```python
obj["health"] = 100           # int custom property
obj["speed"] = 3.14           # float custom property
obj["label"] = "Player"       # string custom property
obj["coords"] = [1.0, 2.0]   # array custom property
obj["config"] = {"a": 1}     # group custom property

# UI hints
ui = obj.id_properties_ui("health")
ui.update(min=0, max=100, description="Character health")
```

See [idprop](idprop.md) for the full IDProperty API.

## Common Patterns

### Complete Addon Settings Workflow

```python
import bpy

class MyAddonSettings(bpy.types.PropertyGroup):
    resolution: bpy.props.IntProperty(
        name="Resolution", default=512,
        min=1, max=8192, subtype='PIXEL',
    )
    output_path: bpy.props.StringProperty(
        name="Output", default="//render/",
        subtype='DIR_PATH',
    )
    quality: bpy.props.EnumProperty(
        name="Quality",
        items=[
            ('LOW', "Low", "Fast preview"),
            ('MEDIUM', "Medium", "Balanced"),
            ('HIGH', "High", "Full quality"),
        ],
        default='MEDIUM',
    )

class MY_PT_settings(bpy.types.Panel):
    bl_label = "My Addon"
    bl_idname = "MY_PT_settings"
    bl_space_type = 'PROPERTIES'
    bl_region_type = 'WINDOW'
    bl_context = "scene"

    def draw(self, context):
        settings = context.scene.my_addon
        layout = self.layout
        layout.prop(settings, "resolution")
        layout.prop(settings, "output_path")
        layout.prop(settings, "quality")

classes = (MyAddonSettings, MY_PT_settings)

def register():
    for cls in classes:
        bpy.utils.register_class(cls)
    bpy.types.Scene.my_addon = bpy.props.PointerProperty(type=MyAddonSettings)

def unregister():
    del bpy.types.Scene.my_addon
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)
```

### Enum with Dynamic Items

```python
import bpy

# Items list must be kept at module level to avoid garbage collection
_cached_items = []

def get_material_items(self, context):
    global _cached_items
    _cached_items = [
        (mat.name, mat.name, f"Material: {mat.name}")
        for mat in bpy.data.materials
    ]
    if not _cached_items:
        _cached_items = [('NONE', "None", "No materials available")]
    return _cached_items

class MY_OT_select_material(bpy.types.Operator):
    bl_idname = "my.select_material"
    bl_label = "Select Material"

    material: bpy.props.EnumProperty(items=get_material_items)

    def execute(self, context):
        self.report({'INFO'}, f"Selected: {self.material}")
        return {'FINISHED'}
```

### Pointer to Another Data-Block

```python
import bpy

def filter_mesh_objects(self, obj):
    return obj.type == 'MESH'

class MySettings(bpy.types.PropertyGroup):
    target: bpy.props.PointerProperty(
        name="Target",
        type=bpy.types.Object,
        poll=filter_mesh_objects,
    )
```

### Collection of Custom Items

```python
import bpy

class MyItem(bpy.types.PropertyGroup):
    name: bpy.props.StringProperty(name="Name", default="Item")
    value: bpy.props.FloatProperty(name="Value", default=0.0)

class MySettings(bpy.types.PropertyGroup):
    items: bpy.props.CollectionProperty(type=MyItem)
    active_index: bpy.props.IntProperty()

# Usage after registration:
settings = bpy.context.scene.my_settings
item = settings.items.add()
item.name = "First"
item.value = 42.0

# Remove by index
settings.items.remove(0)
```

## Gotchas

- **Circular PointerProperty causes crash.** If type A has a PointerProperty to B and B has one to A, Blender may crash during GC. Avoid circular references between PropertyGroups.
- **Enum items callback must return stable references.** The returned list is not copied — if it is garbage-collected, Blender accesses freed memory. Store the list at module level or as a class attribute.
- **Cannot point to embedded IDs.** `PointerProperty(type=bpy.types.Object)` works, but pointing to non-ID types like `Bone` or `Modifier` raises `RuntimeError`.
- **get/set: get MUST be defined if set is defined.** Defining only `set` raises an error at registration.
- **update callback must not set the same property.** Setting the property inside its own `update` callback creates an infinite loop.
- **Enum get/set use integers.** The `get` callback returns and the `set` callback receives the integer number value from the items tuple, not the string identifier.
- **CollectionProperty has no update callback.** You cannot get notified when items are added or removed. Use the message bus or poll-based checks instead.
- **IDProperty storage separation (5.0).** Dict-style access (`obj["prop"]`) does NOT reach `bpy.props`-defined properties. Use attribute access (`obj.prop`). See [idprop](idprop.md).
- **READ_ONLY is new in 5.0.** For read-only properties, prefer `options={'READ_ONLY'}` over the legacy `get`-without-`set` pattern.
