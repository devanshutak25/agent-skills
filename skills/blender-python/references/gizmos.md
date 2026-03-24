# Gizmos

Gizmos are interactive 3D/2D handles in the viewport for manipulating object properties visually. A `GizmoGroup` manages a set of `Gizmo` instances and controls when they appear. Use built-in gizmo types for common controls (arrows, dials, move handles, cages) or subclass `Gizmo` for custom drawing. See [operators-modal.md](operators-modal.md) for modal operators; see [gpu-drawing.md](gpu-drawing.md) for custom GPU drawing.

## GizmoGroup Class

`GizmoGroup` controls which gizmos exist, when they appear, and how they update:

```python
import bpy
from mathutils import Matrix

class OBJECT_GGT_light_energy(bpy.types.GizmoGroup):
    bl_idname = "OBJECT_GGT_light_energy"
    bl_label = "Light Energy Gizmo"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'WINDOW'
    bl_options = {'3D', 'PERSISTENT'}

    @classmethod
    def poll(cls, context):
        ob = context.active_object
        return ob is not None and ob.type == 'LIGHT'

    def setup(self, context):
        gz = self.gizmos.new("GIZMO_GT_arrow_3d")
        gz.color = (1.0, 0.8, 0.0)
        gz.color_highlight = (1.0, 1.0, 0.5)
        gz.alpha = 0.5
        gz.alpha_highlight = 1.0
        gz.scale_basis = 1.0
        ob = context.active_object
        gz.target_set_prop("offset", ob.data, "energy")
        self.energy_gizmo = gz

    def refresh(self, context):
        ob = context.active_object
        gz = self.energy_gizmo
        gz.matrix_basis = ob.matrix_world
        gz.target_set_prop("offset", ob.data, "energy")
```

### Required Attributes

| Attribute | Type | Description |
|---|---|---|
| `bl_idname` | `str` | Unique ID (e.g., `"OBJECT_GGT_my_group"`) |
| `bl_label` | `str` | Display name |
| `bl_space_type` | `str` | Space type (e.g., `'VIEW_3D'`, `'IMAGE_EDITOR'`) |
| `bl_region_type` | `str` | Region type (typically `'WINDOW'`) |

### bl_options

| Flag | Description |
|---|---|
| `'3D'` | Gizmos operate in 3D space |
| `'SCALE'` | Scale with viewport zoom |
| `'DEPTH_3D'` | Occlude behind scene geometry |
| `'SELECT'` | Gizmos are selectable |
| `'PERSISTENT'` | Stay active across mode changes |
| `'SHOW_MODAL_ALL'` | Show all gizmo groups while any gizmo is being interacted with |
| `'EXCLUDE_MODAL'` | Hide this group while another gizmo is being interacted with |
| `'TOOL_INIT'` | Postpone activation until tool operator runs |
| `'TOOL_FALLBACK_KEYMAP'` | Add fallback tools keymap |
| `'VR_REDRAWS'` | Special redraw management for VR |

### GizmoGroup Methods

| Method | Description |
|---|---|
| `poll(cls, context) → bool` | Classmethod — return `False` to hide the entire group |
| `setup(self, context)` | Create gizmos via `self.gizmos.new(type)`, set initial properties |
| `refresh(self, context)` | Update gizmo state on selection/property changes |
| `draw_prepare(self, context)` | Run before each redraw — update positions, visibility |
| `invoke_prepare(self, context, gizmo)` | Run before a gizmo's invoke |
| `setup_keymap(cls, keyconfig) → KeyMap` | Classmethod — initialize keymaps for the group |

### Gizmos Collection

`self.gizmos` provides:
- `new(type) → Gizmo` — create gizmo by type string
- `remove(gizmo)` — remove a gizmo
- `clear()` — remove all gizmos

## Gizmo Properties

### Transform

| Property | Type | Description |
|---|---|---|
| `matrix_basis` | `Matrix` 4×4 | Base transform (position, rotation, scale) |
| `matrix_offset` | `Matrix` 4×4 | Additional offset applied after `matrix_basis` |
| `matrix_space` | `Matrix` 4×4 | Space the gizmo operates in |
| `matrix_world` | `Matrix` 4×4 | Final world matrix (read-only) |
| `scale_basis` | `float` | Base scale factor for drawing |

### Appearance

| Property | Type | Default | Description |
|---|---|---|---|
| `color` | `float[3]` | — | Default color RGB (0.0–1.0) |
| `color_highlight` | `float[3]` | — | Color when highlighted |
| `alpha` | `float` | — | Default alpha (0.0–1.0) |
| `alpha_highlight` | `float` | — | Alpha when highlighted |
| `line_width` | `float` | — | Line width for drawing |
| `hide` | `bool` | `False` | Hide this gizmo |
| `hide_keymap` | `bool` | `False` | Hide keymap |

### Behavior

| Property | Type | Default | Description |
|---|---|---|---|
| `use_draw_modal` | `bool` | `False` | Draw while being interacted with |
| `use_draw_value` | `bool` | `False` | Show value during interaction |
| `use_draw_hover` | `bool` | `False` | Only draw when highlighted |
| `use_draw_offset_scale` | `bool` | `False` | Apply `matrix_offset` scale |
| `use_draw_scale` | `bool` | `False` | Respect viewport zoom |
| `use_grab_cursor` | `bool` | `False` | Grab mouse cursor during interaction |
| `use_event_handle_all` | `bool` | `False` | Block other keymaps when highlighted |
| `use_select_background` | `bool` | `False` | Don't write to depth buffer |
| `select_bias` | `float` | — | Depth bias for selection testing |

### Read-only State

| Property | Type | Description |
|---|---|---|
| `is_modal` | `bool` | Currently being interacted with |
| `is_highlight` | `bool` | Currently highlighted |
| `group` | `GizmoGroup` | The group this gizmo belongs to |
| `select` | `bool` | Selected state |

## target_set_prop

Bind a gizmo target to an RNA property. The gizmo reads and writes the property automatically during interaction:

```python
gz.target_set_prop(
    target,                 # str — gizmo target name (e.g., "offset")
    data,                   # RNA data object
    property,               # str — property name
    index=-1,               # int — array index (-1 = all)
)
```

```python
# Arrow gizmo controlling light energy
gz = self.gizmos.new("GIZMO_GT_arrow_3d")
gz.target_set_prop("offset", light_data, "energy")

# Dial gizmo controlling rotation Z
gz = self.gizmos.new("GIZMO_GT_dial_3d")
gz.target_set_prop("offset", obj, "rotation_euler", index=2)
```

## target_set_handler

Use custom get/set callbacks instead of binding directly to a property:

```python
gz.target_set_handler(
    target,                 # str — gizmo target name
    get=get_func,           # callable: () -> float | Sequence[float]
    set=set_func,           # callable: (value) -> None
    range=range_func,       # callable: () -> tuple[float, float] (optional)
)
```

```python
def get_energy():
    return bpy.context.active_object.data.energy

def set_energy(value):
    bpy.context.active_object.data.energy = value

def energy_range():
    return (0.0, 1000.0)

gz.target_set_handler("offset", get=get_energy, set=set_energy, range=energy_range)
```

## target_set_operator

Assign an operator to run when the gizmo is activated:

```python
props = gz.target_set_operator(
    operator,               # str — operator idname
    index=0,                # int — part index (0–255)
)
# Returns OperatorProperties — set properties on it
props.constraint_axis = (False, False, True)
```

## Other Target Methods

```python
gz.target_get_value(target)   # get current value
gz.target_set_value(target)   # set value (use in modal, NOT in setup)
gz.target_get_range(target)   # returns (min, max) tuple
```

## Built-in Gizmo Types

### GIZMO_GT_arrow_3d

Arrow for linear offset along one axis:

```python
gz = self.gizmos.new("GIZMO_GT_arrow_3d")
gz.draw_style = 'NORMAL'  # 'NORMAL', 'CROSS', 'BOX', 'CONE'
gz.length = 1.0
```

| Property | Values | Description |
|---|---|---|
| `draw_style` | `'NORMAL'`, `'CROSS'`, `'BOX'`, `'CONE'` | Arrow head shape |
| `length` | `float` | Arrow length |

### GIZMO_GT_dial_3d

Rotational dial for angular values:

```python
gz = self.gizmos.new("GIZMO_GT_dial_3d")
gz.draw_options = {'FILL'}
gz.wrap_angle = True
```

| Property | Values/Type | Description |
|---|---|---|
| `draw_options` | `{'CLIP', 'FILL', 'FILL_SELECT', 'ANGLE_MIRROR', 'ANGLE_START_Y', 'ANGLE_VALUE'}` | Display options |
| `wrap_angle` | `bool` | Wrap indefinitely vs single turn |
| `clip_range` | `float` | Clipping range |
| `arc_inner_factor` | `float` | Inner circle ratio (0.0–1.0) |
| `arc_partial_angle` | `float` | Partial arc angle |
| `incremental_angle` | `float` | Snap step angle |
| `click_value` | `float` | Value on single click |

### GIZMO_GT_move_3d

2D move handle:

```python
gz = self.gizmos.new("GIZMO_GT_move_3d")
gz.draw_style = 'RING_2D'  # 'RING_2D', 'CROSS_2D'
gz.draw_options = {'ALIGN_VIEW'}
```

| Property | Values | Description |
|---|---|---|
| `draw_style` | `'RING_2D'`, `'CROSS_2D'` | Handle shape |
| `draw_options` | `{'FILL', 'FILL_SELECT', 'ALIGN_VIEW'}` | Display options |
| `use_snap` | `bool` | Enable snapping |

### GIZMO_GT_cage_2d

2D bounding box with transform handles:

```python
gz = self.gizmos.new("GIZMO_GT_cage_2d")
gz.dimensions = (2.0, 2.0)
```

| Property | Type | Description |
|---|---|---|
| `draw_style` | `'BOX'`, `'CIRCLE'` | Cage shape (default = closed box) |
| `dimensions` | `float[2]` | Cage size |

### GIZMO_GT_cage_3d

3D bounding box:

```python
gz = self.gizmos.new("GIZMO_GT_cage_3d")
gz.dimensions = (1.0, 1.0, 1.0)
```

| Property | Type | Description |
|---|---|---|
| `draw_style` | `'BOX'`, `'CIRCLE'` | Cage shape |
| `dimensions` | `float[3]` | Cage size |

### GIZMO_GT_primitive_3d

Simple 3D primitive:

```python
gz = self.gizmos.new("GIZMO_GT_primitive_3d")
gz.draw_style = 'PLANE'  # only supported style
```

### GIZMO_GT_button_2d

2D button gizmo:

```python
gz = self.gizmos.new("GIZMO_GT_button_2d")
gz.draw_options = {'OUTLINE', 'BACKDROP'}
```

## Custom Gizmo Subclass

Override `Gizmo` methods for fully custom behavior:

```python
class MY_GT_custom(bpy.types.Gizmo):
    bl_idname = "MY_GT_custom"
    bl_label = "Custom Gizmo"

    def setup(self):
        # Called once when gizmo is created (no context parameter)
        self.custom_shape = self.new_custom_shape('LINE_STRIP', (
            (-1.0, 0.0, 0.0), (0.0, 1.0, 0.0), (1.0, 0.0, 0.0),
        ))

    def draw(self, context):
        self.draw_custom_shape(self.custom_shape)

    def draw_select(self, context, select_id):
        self.draw_custom_shape(self.custom_shape, select_id=select_id)

    def test_select(self, context, location):
        # location is (x, y) in region coordinates
        # return -1 to skip, 0+ for selection
        return -1

    def invoke(self, context, event):
        return {'RUNNING_MODAL'}

    def modal(self, context, event, tweak):
        # tweak is set: {'PRECISE', 'SNAP'}
        if event.type == 'MOUSEMOVE':
            return {'RUNNING_MODAL'}
        return {'FINISHED'}

    def exit(self, context, cancel):
        # cancel is True if cancelled, False if confirmed
        pass

    def refresh(self, context):
        pass
```

### Custom Shape Methods

```python
# Create a reusable shape
shape = self.new_custom_shape(type, verts)
# type: 'POINTS', 'LINES', 'TRIS', 'LINE_STRIP'
# verts: sequence of 2D or 3D coordinates

# Draw the shape
self.draw_custom_shape(shape, matrix=None, select_id=-1)
# matrix defaults to matrix_world if None
```

### Preset Drawing Methods

```python
# Draw preset shapes (useful in draw() and draw_select())
self.draw_preset_arrow(matrix, axis='POS_Z', select_id=-1)
self.draw_preset_circle(matrix, axis='POS_Z', select_id=-1)
self.draw_preset_box(matrix, select_id=-1)
# axis: 'POS_X', 'POS_Y', 'POS_Z', 'NEG_X', 'NEG_Y', 'NEG_Z'
# draw_preset_box does NOT take an axis parameter
```

## Registration

Register the `GizmoGroup` (and custom `Gizmo` subclass if any):

```python
def register():
    bpy.utils.register_class(MY_GT_custom)          # only if custom Gizmo subclass
    bpy.utils.register_class(OBJECT_GGT_light_energy)

def unregister():
    bpy.utils.unregister_class(OBJECT_GGT_light_energy)
    bpy.utils.unregister_class(MY_GT_custom)
```

Built-in types (`GIZMO_GT_arrow_3d`, etc.) are already registered — only register your `GizmoGroup`.

## Common Patterns

### Light Energy Arrow Gizmo

```python
import bpy
from mathutils import Matrix

class LIGHT_GGT_energy(bpy.types.GizmoGroup):
    bl_idname = "LIGHT_GGT_energy"
    bl_label = "Light Energy"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'WINDOW'
    bl_options = {'3D', 'PERSISTENT'}

    @classmethod
    def poll(cls, context):
        ob = context.active_object
        return ob is not None and ob.type == 'LIGHT'

    def setup(self, context):
        ob = context.active_object
        gz = self.gizmos.new("GIZMO_GT_arrow_3d")
        gz.draw_style = 'CONE'
        gz.color = (1.0, 0.5, 0.0)
        gz.color_highlight = (1.0, 0.8, 0.3)
        gz.alpha = 0.6
        gz.alpha_highlight = 1.0
        gz.scale_basis = 0.8
        gz.use_draw_modal = True
        gz.target_set_prop("offset", ob.data, "energy")
        self.energy_gizmo = gz

    def refresh(self, context):
        ob = context.active_object
        self.energy_gizmo.matrix_basis = ob.matrix_world
        self.energy_gizmo.target_set_prop("offset", ob.data, "energy")

    def draw_prepare(self, context):
        ob = context.active_object
        self.energy_gizmo.matrix_basis = ob.matrix_world


def register():
    bpy.utils.register_class(LIGHT_GGT_energy)

def unregister():
    bpy.utils.unregister_class(LIGHT_GGT_energy)
```

### Custom Dial Gizmo for Rotation

```python
import bpy
from mathutils import Matrix

class OBJECT_GGT_rotation_dial(bpy.types.GizmoGroup):
    bl_idname = "OBJECT_GGT_rotation_dial"
    bl_label = "Rotation Dial"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'WINDOW'
    bl_options = {'3D', 'PERSISTENT'}

    @classmethod
    def poll(cls, context):
        return context.active_object is not None

    def setup(self, context):
        ob = context.active_object
        gz = self.gizmos.new("GIZMO_GT_dial_3d")
        gz.draw_options = {'FILL', 'ANGLE_VALUE'}
        gz.color = (0.2, 0.5, 1.0)
        gz.color_highlight = (0.4, 0.7, 1.0)
        gz.alpha = 0.5
        gz.alpha_highlight = 0.8
        gz.scale_basis = 1.5
        gz.wrap_angle = False
        gz.target_set_prop("offset", ob, "rotation_euler", index=2)
        self.dial_gizmo = gz

    def refresh(self, context):
        ob = context.active_object
        self.dial_gizmo.matrix_basis = ob.matrix_world.normalized()
        self.dial_gizmo.target_set_prop("offset", ob, "rotation_euler", index=2)

    def draw_prepare(self, context):
        ob = context.active_object
        self.dial_gizmo.matrix_basis = ob.matrix_world.normalized()


def register():
    bpy.utils.register_class(OBJECT_GGT_rotation_dial)

def unregister():
    bpy.utils.unregister_class(OBJECT_GGT_rotation_dial)
```

### Gizmo with Custom Handler and Range

```python
import bpy
from mathutils import Matrix

class CAMERA_GGT_focal(bpy.types.GizmoGroup):
    bl_idname = "CAMERA_GGT_focal"
    bl_label = "Camera Focal Length"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'WINDOW'
    bl_options = {'3D', 'PERSISTENT'}

    @classmethod
    def poll(cls, context):
        ob = context.active_object
        return ob is not None and ob.type == 'CAMERA'

    def setup(self, context):
        ob = context.active_object
        gz = self.gizmos.new("GIZMO_GT_arrow_3d")
        gz.draw_style = 'BOX'
        gz.color = (0.8, 0.2, 0.2)
        gz.color_highlight = (1.0, 0.4, 0.4)
        gz.alpha = 0.6
        gz.alpha_highlight = 1.0
        gz.scale_basis = 0.5
        gz.use_draw_value = True

        def get_focal():
            return bpy.context.active_object.data.lens

        def set_focal(value):
            bpy.context.active_object.data.lens = value

        def focal_range():
            return (1.0, 5000.0)

        gz.target_set_handler("offset", get=get_focal, set=set_focal, range=focal_range)
        self.focal_gizmo = gz

    def refresh(self, context):
        ob = context.active_object
        self.focal_gizmo.matrix_basis = ob.matrix_world

    def draw_prepare(self, context):
        ob = context.active_object
        self.focal_gizmo.matrix_basis = ob.matrix_world


def register():
    bpy.utils.register_class(CAMERA_GGT_focal)

def unregister():
    bpy.utils.unregister_class(CAMERA_GGT_focal)
```

## Gotchas

1. **target_set_value must not be called in setup()** — calling it during setup crashes Blender. Use it only in `modal()` or `refresh()`.

2. **Gizmo.setup() has no context parameter** — unlike `GizmoGroup.setup(self, context)`, the `Gizmo.setup(self)` method receives only `self`. Access context through `bpy.context` if needed.

3. **Built-in gizmo type properties are poorly documented** — properties like `draw_style`, `draw_options`, and `length` on `GIZMO_GT_arrow_3d` are not fully listed in the API docs. Refer to the tables in this file or inspect source code.

4. **GIZMO_GT_arrow_3d with transform={'CONSTRAIN'} may crash** — this option is unstable. Avoid using it in production addons.

5. **refresh() must re-call target_set_prop** — when the active object changes, the old data reference becomes stale. Always reassign the target in `refresh()`.

6. **matrix_basis must be set every frame** — use `draw_prepare()` or `refresh()` to keep gizmo positions in sync with object transforms. A stale `matrix_basis` causes gizmos to lag behind or appear at the origin.

7. **draw_preset_box has no axis parameter** — unlike `draw_preset_arrow` and `draw_preset_circle`, `draw_preset_box` only takes `matrix` and `select_id`. Orient the box through the matrix instead.
