# Context Access (bpy.context)

Read-only accessor to Blender's current state. Context attributes change depending on the active editor, mode, and selection. Use `bpy.context` to query state; modify data through `bpy.data` or operators.

## Context Structure

### Global Attributes (Always Available)

| Attribute | Type | Description |
|---|---|---|
| `scene` | `Scene` | Active scene |
| `view_layer` | `ViewLayer` | Active view layer |
| `window_manager` | `WindowManager` | Window manager instance |
| `window` | `Window` | Active window (None in background) |
| `screen` | `Screen` | Active screen layout (None in background) |
| `area` | `Area` | Active UI area (None in background/menu-search) |
| `region` | `Region` | Active UI region |
| `region_data` | `RegionView3D` | 3D viewport region data (only in VIEW_3D) |
| `space_data` | `Space` | Active space (None in background) |
| `preferences` | `Preferences` | User preferences |
| `blend_data` | `BlendData` | Same as `bpy.data` |
| `workspace` | `WorkSpace` | Active workspace |
| `collection` | `Collection` | Active collection |
| `layer_collection` | `LayerCollection` | Active layer collection |
| `mode` | `str` | Context mode string |
| `engine` | `str` | Render engine identifier |
| `tool_settings` | `ToolSettings` | Active tool settings |

### Object Attributes

| Attribute | Type | When Available |
|---|---|---|
| `object` | `Object` | Active object exists |
| `active_object` | `Object` | Active object exists |
| `edit_object` | `Object` | In edit mode |
| `sculpt_object` | `Object` | In sculpt mode |
| `vertex_paint_object` | `Object` | In vertex paint |
| `weight_paint_object` | `Object` | In weight paint |
| `image_paint_object` | `Object` | In texture paint |
| `particle_edit_object` | `Object` | In particle edit |
| `pose_object` | `Object` | In pose mode |

### Selection Collections

| Attribute | Returns |
|---|---|
| `selected_objects` | All selected objects |
| `visible_objects` | All visible objects |
| `selectable_objects` | All selectable objects |
| `editable_objects` | All editable objects |
| `selected_editable_objects` | Selected and editable objects |
| `objects_in_mode` | Objects sharing the current mode |
| `objects_in_mode_unique_data` | Objects in mode with unique data |

### Bone/Armature Attributes

Available in pose or armature edit mode: `armature`, `bone`, `edit_bone`, `pose_bone`, `active_bone`, `active_pose_bone`, `visible_bones`, `editable_bones`, `selected_bones`, `selected_editable_bones`, `visible_pose_bones`, `selected_pose_bones`, `selected_pose_bones_from_active_object`.

### Editor-Specific Attributes

These appear only in their respective editors: `edit_image` (Image Editor), `edit_mask` (Mask Editor), `edit_movieclip` (Clip Editor), `edit_text` (Text Editor), `active_node`/`selected_nodes` (Node Editor), `active_file`/`selected_files` (File Browser), `asset`/`selected_assets` (Asset Browser), `active_action`/`selected_visible_actions` (Dope Sheet/Action Editor), `active_nla_track`/`active_nla_strip`/`selected_nla_strips` (NLA Editor), `visible_fcurves`/`selected_visible_fcurves`/`active_editable_fcurve` (Graph Editor), `active_strip`/`selected_strips` (Sequencer).

### Data-Type Attributes

When the active object is of the matching type: `mesh`, `curve`, `meta_ball`, `lattice`, `light`, `speaker`, `lightprobe`, `camera`, `gpencil`, `grease_pencil`, `curves`, `pointcloud`, `volume`. Also: `material`, `material_slot`, `world`, `brush`, `texture`, `line_style`.

## Mode Strings

`context.mode` returns object-type-specific strings. These differ from the generic values used by `bpy.ops.object.mode_set()`.

| `context.mode` | `mode_set()` equivalent | Description |
|---|---|---|
| `'OBJECT'` | `'OBJECT'` | Object mode |
| `'EDIT_MESH'` | `'EDIT'` | Mesh edit mode |
| `'EDIT_CURVE'` | `'EDIT'` | Curve edit mode |
| `'EDIT_CURVES'` | `'EDIT'` | Hair curves edit mode |
| `'EDIT_SURFACE'` | `'EDIT'` | Surface edit mode |
| `'EDIT_TEXT'` | `'EDIT'` | Font/text edit mode |
| `'EDIT_ARMATURE'` | `'EDIT'` | Armature edit mode |
| `'EDIT_METABALL'` | `'EDIT'` | Metaball edit mode |
| `'EDIT_LATTICE'` | `'EDIT'` | Lattice edit mode |
| `'POSE'` | `'POSE'` | Pose mode |
| `'SCULPT'` | `'SCULPT'` | Sculpt mode |
| `'PAINT_WEIGHT'` | `'WEIGHT_PAINT'` | Weight paint |
| `'PAINT_VERTEX'` | `'VERTEX_PAINT'` | Vertex paint |
| `'PAINT_TEXTURE'` | `'TEXTURE_PAINT'` | Texture paint |
| `'PARTICLE'` | `'PARTICLE_EDIT'` | Particle edit |
| `'SCULPT_CURVES'` | `'SCULPT_CURVES'` | Curves sculpt |
| `'EDIT_GREASE_PENCIL'` | `'EDIT_GREASE_PENCIL'` | GP v3 edit |
| `'PAINT_GREASE_PENCIL'` | `'PAINT_GREASE_PENCIL'` | GP v3 draw/paint |
| `'SCULPT_GREASE_PENCIL'` | `'SCULPT_GREASE_PENCIL'` | GP v3 sculpt |
| `'WEIGHT_GREASE_PENCIL'` | `'WEIGHT_GREASE_PENCIL'` | GP v3 weight paint |

`mode_set(mode='EDIT')` produces different `context.mode` values depending on the active object's type (e.g., `'EDIT_MESH'` for a mesh, `'EDIT_CURVE'` for a curve).

## Temporary Context Overrides

```python
context.temp_override(*, window=None, screen=None, area=None, region=None, **keywords)
```

Context manager that temporarily replaces context members for the duration of the `with` block. All parameters are keyword-only.

**Parameters:**
- `window` (`Window | None`) — Window override
- `screen` (`Screen | None`) — Screen override
- `area` (`Area | None`) — Area override
- `region` (`Region | None`) — Region override
- `**keywords` — Any other context member names (e.g., `active_object`, `selected_objects`)

**Consistency rules:** `region` must belong to the overridden `area`, and `area` must belong to the overridden `window`/`screen`. Processing order is always: window → screen → area → region. Switching to/from full-screen areas and temporary screens is not supported.

```python
import bpy

# Override active object for an operator
obj = bpy.data.objects["Cube"]
with bpy.context.temp_override(active_object=obj, selected_objects=[obj]):
    bpy.ops.object.shade_smooth()
```

```python
import bpy

# Find a 3D viewport area and run a viewport-only operator
for window in bpy.context.window_manager.windows:
    for area in window.screen.areas:
        if area.type == 'VIEW_3D':
            with bpy.context.temp_override(window=window, area=area):
                bpy.ops.view3d.camera_to_view()
            break
```

`context.copy()` returns a dict snapshot of all current context members. Useful as a base for overrides:

```python
import bpy

override = bpy.context.copy()
override["selected_objects"] = list(bpy.context.scene.objects)
with bpy.context.temp_override(**override):
    bpy.ops.object.delete()
```

## Evaluated Data Access

```python
context.evaluated_depsgraph_get() -> bpy.types.Depsgraph
```

Returns a fully evaluated dependency graph for the current scene and view layer. If any data has changed since the last evaluation, the depsgraph is updated first (which may be expensive). After the update, previous references to evaluated data-blocks become invalid.

```python
import bpy

# Get final mesh after all modifiers
depsgraph = bpy.context.evaluated_depsgraph_get()
obj = bpy.context.active_object
obj_eval = obj.evaluated_get(depsgraph)
mesh_eval = obj_eval.to_mesh()

# Read vertex positions from the evaluated mesh
for v in mesh_eval.vertices:
    print(v.co)

# Clean up the temporary mesh
obj_eval.to_mesh_clear()
```

Edits must always target original data — changes to evaluated copies are discarded. See [depsgraph](depsgraph.md) for the full dependency graph API.

## Context in Operators

Operator methods receive `context` as their second parameter:

```python
import bpy

class OBJECT_OT_example(bpy.types.Operator):
    bl_idname = "object.example"
    bl_label = "Example"

    @classmethod
    def poll(cls, context):
        return context.active_object is not None and context.mode == 'OBJECT'

    def execute(self, context):
        obj = context.active_object
        self.report({'INFO'}, f"Active object: {obj.name}")
        return {'FINISHED'}
```

The `poll()` classmethod checks context prerequisites. If `poll()` returns False, the operator is grayed out in menus and raises `RuntimeError` if called from a script. Always check `poll()` or handle the exception when calling operators programmatically.

## Common Patterns

### Finding a Specific Area Type

```python
import bpy

def find_area(area_type):
    """Find the first area of the given type across all windows."""
    for window in bpy.context.window_manager.windows:
        for area in window.screen.areas:
            if area.type == area_type:
                return window, area
    return None, None

window, area = find_area('VIEW_3D')
if area is not None:
    with bpy.context.temp_override(window=window, area=area):
        bpy.ops.view3d.snap_cursor_to_center()
```

### Safe Active Object Access

```python
import bpy

obj = bpy.context.active_object
if obj is not None and obj.type == 'MESH':
    print(f"Mesh: {obj.data.name}, vertices: {len(obj.data.vertices)}")
```

### Mode Checking Before Operations

```python
import bpy

def ensure_object_mode(context):
    """Switch to object mode if not already there."""
    if context.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')

def ensure_edit_mode(context):
    """Switch to edit mode if not already there."""
    if context.active_object and context.mode != 'EDIT_MESH':
        bpy.ops.object.mode_set(mode='EDIT')
```

### VSE Scene Access

```python
import bpy

# The scene shown in the sequencer (may differ from context.scene)
vse_scene = bpy.context.sequencer_scene
# The active window scene
active_scene = bpy.context.scene
```

## Gotchas

- **Context is read-only.** You cannot assign to context attributes (`context.object = ...` raises `AttributeError`). Change selection or the active object through the data API: `view_layer.objects.active = obj` and `obj.select_set(True)`.

- **Context changes between operator calls.** Each operator may modify the active object, selection, or mode. Do not rely on context state surviving across multiple `bpy.ops` calls — re-query after each operator if needed.

- **Background mode has no UI areas.** In `blender --background`, `context.area`, `context.region`, `context.space_data`, and `context.region_data` are all None. Operators that `poll()` for a specific area type will fail. There is no clean workaround since no real areas exist.

- **`context.mode` vs `mode_set()` values.** `context.mode` returns type-specific strings like `'EDIT_MESH'`, but `bpy.ops.object.mode_set()` takes generic strings like `'EDIT'`. Do not pass `context.mode` directly to `mode_set()`.

- **`temp_override` region/area consistency.** The overridden region must belong to the overridden area. Passing mismatched area/region pairs raises an error. Always find the region from within the target area.

- **`evaluated_depsgraph_get()` invalidates previous evaluated refs.** After calling this, any previously obtained evaluated data-block references are stale. Always call `evaluated_get()` after obtaining a fresh depsgraph.

- **`context.copy()` returns a snapshot, not a live view.** The dict reflects state at call time. If selection or mode changes after the copy, the dict is outdated.
