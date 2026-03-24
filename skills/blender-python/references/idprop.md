# ID Properties (idprop.types)

Low-level custom data storage on any Blender data-block. IDProperties provide dict-like key/value storage that persists in .blend files. In 5.0, IDProperty storage is fully separated from `bpy.props`-defined RNA properties — they are distinct systems. See [bpy-props](bpy-props.md).

## IDPropertyGroup

Every data-block (Object, Mesh, Scene, etc.) can hold custom properties accessed with dict syntax:

```python
import bpy

obj = bpy.data.objects["Cube"]

# Assign custom properties
obj["health"] = 100
obj["speed"] = 2.5
obj["label"] = "Player"
obj["position"] = [1.0, 2.0, 3.0]
obj["config"] = {"mode": "fast", "level": 3}
obj["target"] = bpy.data.objects["Target"]  # ID reference
```

### Supported Value Types

| Python Type | IDProperty Type | Notes |
|---|---|---|
| `int` | IDP_INT | 32-bit integer |
| `float` | IDP_DOUBLE | Always 64-bit (Python floats are 64-bit) |
| `str` | IDP_STRING | UTF-8 encoded |
| `bytes` | IDP_STRING | Raw bytes mode |
| `list`/`tuple` (uniform numeric) | IDP_ARRAY | All elements must be same type |
| `dict` | IDP_GROUP | String keys only, nested |
| `bpy.types.ID` subclass | IDP_ID | Data-block pointer (Object, Image, etc.) |

Nested dicts create IDPropertyGroups, not plain Python dicts on read-back.

## API

### Dict-Like Access

```python
import bpy

obj = bpy.data.objects["Cube"]
obj["score"] = 42

# Read
val = obj["score"]          # 42 (KeyError if missing)
val = obj.get("score", 0)  # 42 (default if missing)

# Test membership
if "score" in obj:
    print("Has score")

# Delete
del obj["score"]

# Iterate
for key in obj.keys():
    print(key, obj[key])

for key, value in obj.items():
    print(key, value)

for value in obj.values():
    print(value)

# Length
count = len(obj.id_properties_group)  # number of custom properties
```

### Methods on bpy_struct

These are available on all RNA types (Object, Scene, Bone, etc.):

| Method | Description |
|---|---|
| `id_properties_ensure()` | Ensure custom property group exists, returns IDPropertyGroup |
| `id_properties_clear()` | Remove all custom properties |
| `id_properties_ui(key)` | Get IDPropertyUIManager for UI metadata |

### IDPropertyGroup Methods

| Method | Description |
|---|---|
| `keys()` | Returns IDPropertyGroupViewKeys |
| `values()` | Returns IDPropertyGroupViewValues |
| `items()` | Returns IDPropertyGroupViewItems |
| `get(key, default=None)` | Safe access with default |
| `pop(key, default)` | Remove and return (KeyError if missing and no default) |
| `clear()` | Remove all members |
| `update(other)` | Update from IDPropertyGroup or dict |
| `to_dict()` | Convert to plain Python dict (recursive) |

### IDPropertyArray

Created when assigning a uniform numeric list:

```python
obj["coords"] = [1.0, 2.0, 3.0]
arr = obj["coords"]      # IDPropertyArray
arr.to_list()             # [1.0, 2.0, 3.0]
arr.typecode              # 'd' (double)
```

Typecodes: `'i'` (int 32-bit), `'f'` (float 32-bit, rare — from C code), `'d'` (double 64-bit, default for Python floats), `'b'` (bool).

## UI Metadata (id_properties_ui)

Set display hints for custom properties in the UI:

```python
import bpy

obj = bpy.data.objects["Cube"]
obj["health"] = 100

ui = obj.id_properties_ui("health")
ui.update(
    min=0,
    max=200,
    soft_min=0,
    soft_max=100,
    step=1,
    default=100,
    description="Character health points",
    subtype='NONE',
)

# Read current UI data
print(ui.as_dict())

# Clear UI data
ui.clear()

# Copy UI data between properties
other_ui = obj.id_properties_ui("other_prop")
other_ui.update_from(ui)
```

### Available UI Parameters by Type

| Parameter | Int | Float | String | ID |
|---|---|---|---|---|
| `min` | yes | yes | — | — |
| `max` | yes | yes | — | — |
| `soft_min` | yes | yes | — | — |
| `soft_max` | yes | yes | — | — |
| `step` | yes | yes | — | — |
| `precision` | — | yes | — | — |
| `default` | yes | yes | yes | — |
| `description` | yes | yes | yes | yes |
| `subtype` | yes | yes | — | — |
| `id_type` | — | — | — | yes |

**Number subtypes:** `'NONE'`, `'PIXEL'`, `'PERCENTAGE'`, `'FACTOR'`, `'ANGLE'`, `'TIME'`, `'TIME_ABSOLUTE'`, `'DISTANCE'`, `'POWER'`, `'TEMPERATURE'`, `'WAVELENGTH'`

**Array subtypes:** `'NONE'`, `'COLOR'`, `'TRANSLATION'`, `'DIRECTION'`, `'VELOCITY'`, `'EULER'`, `'QUATERNION'`, `'AXISANGLE'`, `'XYZ'`, `'COLOR_GAMMA'`, `'COORDINATES'`

## Relationship with bpy.props (5.0)

This is the single biggest breaking change in 5.0: `bpy.props` properties and IDProperties occupy **completely separate storage**.

### Before 5.0

`bpy.props` properties were internally stored as IDProperties. Both systems shared the same container:

```python
# Pre-5.0 — these accessed the SAME storage:
obj.my_addon_scale          # bpy.props attribute access
obj["my_addon_scale"]       # dict-like access (also worked)
del obj["my_addon_scale"]   # reset to default (worked)
```

### After 5.0

`bpy.props` properties use a separate internal system. Dict-like access only reaches true custom properties:

```python
# 5.0 — these access DIFFERENT storage:
obj.my_addon_scale          # bpy.props RNA property (system storage)
obj["my_addon_scale"]       # IDProperty storage (independent)

# Reset bpy.props property to default:
obj.property_unset("my_addon_scale")  # correct way

# del obj["my_addon_scale"]  — only removes the IDProperty, not the RNA property
```

### What Breaks

| Pattern | Pre-5.0 | 5.0 |
|---|---|---|
| `obj["bpy_prop"]` reads RNA property | Works | Fails — separate storage |
| `del obj["bpy_prop"]` resets RNA default | Works | Only deletes IDProperty |
| `scene["cycles"]` accesses addon data | Works | Fails |
| `get`/`set` callbacks with self-storage | Works | Still works, but use `get_transform`/`set_transform` instead |
| `obj["custom_prop"]` for true custom props | Works | Works (unchanged) |

### Versioning

Blend files from Blender 4.5 and earlier get their IDProperties duplicated: the values are copied into both the new system storage and the old IDProperty container. This ensures no data loss but may leave stale copies. Clean up in addon code:

```python
import bpy

def cleanup_legacy_props(obj):
    """Remove stale IDProperty copies of bpy.props properties."""
    stale_keys = ["my_addon_scale", "my_addon_mode"]
    for key in stale_keys:
        if key in obj:
            del obj[key]
```

### Affected Data Types

The storage split applies to: all ID types (Object, Mesh, Scene, etc.), ViewLayer, Bone, EditBone, BoneCollection, PoseBone, and Strip.

## Type Mapping Table

| Python Value | IDP Type | Storage | Read-Back Type |
|---|---|---|---|
| `42` | IDP_INT | 32-bit int | `int` |
| `3.14` | IDP_DOUBLE | 64-bit float | `float` |
| `"hello"` | IDP_STRING | UTF-8 bytes | `str` |
| `b"\x00\x01"` | IDP_STRING | Raw bytes | `bytes` |
| `[1, 2, 3]` | IDP_ARRAY | int32 array | `IDPropertyArray` |
| `[1.0, 2.0]` | IDP_ARRAY | float64 array | `IDPropertyArray` |
| `{"a": 1}` | IDP_GROUP | nested group | `IDPropertyGroup` |
| `bpy.data.objects["X"]` | IDP_ID | data-block pointer | `bpy.types.Object` |

IDP_FLOAT (32-bit) exists in Blender's C internals but Python floats are always 64-bit, so Python-created properties are IDP_DOUBLE. Arrays created from Python float lists get typecode `'d'` (double), not `'f'` (float).

## Common Patterns

### Storing Addon State on Objects

```python
import bpy

def setup_object_data(obj):
    obj["addon_version"] = 2
    obj["settings"] = {
        "quality": "high",
        "iterations": 5,
        "weights": [0.1, 0.5, 0.9],
    }
    ui = obj.id_properties_ui("addon_version")
    ui.update(min=1, max=99, description="Addon data version")

obj = bpy.context.active_object
if obj is not None:
    setup_object_data(obj)
    # Read back
    cfg = obj["settings"]
    print(cfg["quality"])          # "high"
    print(cfg["weights"].to_list())  # [0.1, 0.5, 0.9]
```

### Iterating All Custom Properties

```python
import bpy

obj = bpy.context.active_object
if obj is not None:
    for key, value in obj.items():
        ui_data = obj.id_properties_ui(key).as_dict()
        print(f"{key} = {value}  (meta: {ui_data})")
```

### Transferring Custom Properties Between Objects

```python
import bpy

def copy_custom_props(src, dst):
    for key, value in src.items():
        try:
            dst[key] = value
            # Copy UI metadata
            src_ui = src.id_properties_ui(key)
            dst_ui = dst.id_properties_ui(key)
            dst_ui.update_from(src_ui)
        except TypeError:
            pass  # skip unsupported types

src = bpy.data.objects["Source"]
dst = bpy.data.objects["Dest"]
copy_custom_props(src, dst)
```

## Gotchas

- **Lists must be uniform type.** `[1, 2.0, "x"]` raises TypeError. All elements must be the same type (all int, all float, or all bool).
- **Nested dicts return IDPropertyGroup, not dict.** `obj["config"]["key"]` works, but `type(obj["config"])` is `IDPropertyGroup`. Use `.to_dict()` for a plain Python dict.
- **ID references affect user count.** `obj["ref"] = other_obj` increments `other_obj.users`. Deleting the property decrements it. This can prevent `orphans_purge()` from removing the referenced data-block.
- **IDP_DOUBLE, not IDP_FLOAT.** Python floats are 64-bit, so custom float properties are stored as doubles. The 32-bit IDP_FLOAT type exists only for C-created properties.
- **Keys are strings only.** Non-string keys raise TypeError.
- **5.0 separation is critical.** `obj["prop"]` does NOT access `bpy.props`-defined properties. Use attribute access for RNA properties, dict access for custom properties. See [bpy-props](bpy-props.md).
- **id_properties_ui requires existing property.** Calling `id_properties_ui("key")` on a non-existent key may create an empty UI entry. Set the property value first.
- **Library-overridable properties become statically typed.** Custom properties with "Library Overridable" enabled cannot change type or array length after creation.
