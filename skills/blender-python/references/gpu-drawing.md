# GPU Drawing (Viewport Overlays)

Register custom draw callbacks to render overlays in the 3D viewport. For core GPU types see [gpu-module](gpu-module.md). For batch helpers see [gpu-extras](gpu-extras.md). For offscreen rendering see [gpu-offscreen](gpu-offscreen.md). For text drawing see [blf](blf.md).

## Draw Handler Registration

`SpaceView3D.draw_handler_add(callback, args, region_type, draw_type)` registers a draw callback:

```python
import bpy
import gpu
from gpu_extras.batch import batch_for_shader

# Create shader and batch (outside the callback for performance)
shader = gpu.shader.from_builtin('UNIFORM_COLOR')
coords = [(0, 0, 0), (1, 0, 0), (1, 1, 0)]
batch = batch_for_shader(shader, 'TRIS', {"pos": coords})

def draw_callback():
    shader.bind()
    shader.uniform_float("color", (1.0, 0.0, 0.0, 0.5))
    gpu.state.blend_set('ALPHA')
    batch.draw(shader)
    gpu.state.blend_set('NONE')

# Register the handler
handle = bpy.types.SpaceView3D.draw_handler_add(
    draw_callback,
    (),               # args tuple passed to callback
    'WINDOW',         # region_type
    'POST_VIEW'       # draw_type
)
```

### Draw Types

| Draw Type | Description | Coordinate Space |
|---|---|---|
| `'PRE_VIEW'` | Before scene geometry | 3D world space |
| `'POST_VIEW'` | After scene geometry, before grease pencil | 3D world space |
| `'POST_PIXEL'` | After everything, in 2D screen space | 2D pixel coordinates |
| `'BACKDROP'` | Background, before grid | 3D world space |

### Region Types

| Region Type | Description |
|---|---|
| `'WINDOW'` | Main viewport area (most common) |
| `'HEADER'` | Header bar |
| `'UI'` | Sidebar/N-panel |

### Removing Handlers

```python
import bpy

# Remove by stored handle reference
bpy.types.SpaceView3D.draw_handler_remove(handle, 'WINDOW')
```

## Complete 3D Drawing Workflow

### Draw in World Space (POST_VIEW)

```python
import bpy
import gpu
from gpu_extras.batch import batch_for_shader

class ViewportOverlay:
    def __init__(self):
        self.shader = gpu.shader.from_builtin('UNIFORM_COLOR')
        self.batch = batch_for_shader(self.shader, 'LINES', {
            "pos": [(-5, 0, 0), (5, 0, 0), (0, -5, 0), (0, 5, 0)],
        })
        self.handle = bpy.types.SpaceView3D.draw_handler_add(
            self.draw, (), 'WINDOW', 'POST_VIEW'
        )

    def draw(self):
        self.shader.bind()
        self.shader.uniform_float("color", (1, 1, 0, 1))
        self.batch.draw(self.shader)

    def remove(self):
        bpy.types.SpaceView3D.draw_handler_remove(self.handle, 'WINDOW')

overlay = ViewportOverlay()
# Later: overlay.remove()
```

### Draw in Screen Space (POST_PIXEL)

```python
import bpy
import gpu
import blf
from gpu_extras.batch import batch_for_shader

class ScreenOverlay:
    def __init__(self):
        self.shader = gpu.shader.from_builtin('UNIFORM_COLOR')
        self.handle = bpy.types.SpaceView3D.draw_handler_add(
            self.draw, (), 'WINDOW', 'POST_PIXEL'
        )

    def draw(self):
        # Draw a 2D rectangle in pixel coordinates
        x, y = 20, 40
        w, h = 200, 30

        batch = batch_for_shader(self.shader, 'TRI_FAN', {
            "pos": [(x, y, 0), (x + w, y, 0), (x + w, y + h, 0), (x, y + h, 0)],
        })

        gpu.state.blend_set('ALPHA')
        self.shader.bind()
        self.shader.uniform_float("color", (0, 0, 0, 0.5))
        batch.draw(self.shader)
        gpu.state.blend_set('NONE')

        # Draw text on top
        blf.position(0, x + 10, y + 8, 0)
        blf.size(0, 14)
        blf.color(0, 1, 1, 1, 1)
        blf.draw(0, "Viewport Overlay")

    def remove(self):
        bpy.types.SpaceView3D.draw_handler_remove(self.handle, 'WINDOW')
```

## Wide Lines and Points

For lines wider than 1px or points larger than 1px, use the POLYLINE_* and POINT_* shader variants:

```python
import gpu
from gpu_extras.batch import batch_for_shader

def draw_wide_lines():
    shader = gpu.shader.from_builtin('POLYLINE_UNIFORM_COLOR')
    batch = batch_for_shader(shader, 'LINES', {
        "pos": [(0, 0, 0), (5, 0, 0), (0, 0, 0), (0, 5, 0)],
    })

    shader.bind()
    shader.uniform_float("color", (1, 0, 0, 1))
    shader.uniform_float("lineWidth", 3.0)
    # viewportSize is required for POLYLINE shaders
    region = gpu.state.viewport_get()
    shader.uniform_float("viewportSize", (region[2], region[3]))
    batch.draw(shader)
```

## Color Space Handling

Textures loaded from Blender images are in **scene-linear** color space. When drawing to the viewport (sRGB display), apply color conversion:

```python
import bpy
import gpu
from gpu_extras.presets import draw_texture_2d

image = bpy.data.images["MyTexture"]
texture = gpu.texture.from_image(image)

def draw_image():
    # Option 1: Use draw_texture_2d with color management flag
    draw_texture_2d(
        texture, (10, 10), 256, 256,
        is_scene_linear_with_rec709_srgb_target=True
    )

    # Option 2: Use IMAGE shader (no conversion — raw linear display)
    # Only use this if the target is scene-linear or if you handle conversion
```

The `is_scene_linear_with_rec709_srgb_target=True` parameter applies the same color transform as Blender's display pipeline (scene linear → sRGB).

## Persistent Draw Handlers

Draw handlers are lost when Blender loads a new file. Re-register them in a persistent `load_post` handler:

```python
import bpy
from bpy.app.handlers import persistent

draw_handle = None

def my_draw():
    # ... drawing code ...
    pass

@persistent
def on_load(filepath, success):
    global draw_handle
    # Remove old handler if exists
    if draw_handle is not None:
        try:
            bpy.types.SpaceView3D.draw_handler_remove(draw_handle, 'WINDOW')
        except ValueError:
            pass
    # Re-register
    draw_handle = bpy.types.SpaceView3D.draw_handler_add(
        my_draw, (), 'WINDOW', 'POST_VIEW'
    )

bpy.app.handlers.load_post.append(on_load)
```

## Draw Handler in a Modal Operator

```python
import bpy
import gpu
from gpu_extras.batch import batch_for_shader

class DrawModalOperator(bpy.types.Operator):
    bl_idname = "view3d.draw_modal"
    bl_label = "Draw Modal"

    def __init__(self):
        self.shader = gpu.shader.from_builtin('UNIFORM_COLOR')
        self.batch = None
        self._handle = None

    def modal(self, context, event):
        context.area.tag_redraw()

        if event.type == 'MOUSEMOVE':
            # Update batch based on mouse position
            from bpy_extras.view3d_utils import region_2d_to_location_3d
            region = context.region
            rv3d = context.region_data
            coord = (event.mouse_region_x, event.mouse_region_y)
            loc = region_2d_to_location_3d(region, rv3d, coord, (0, 0, 0))

            self.batch = batch_for_shader(self.shader, 'POINTS', {
                "pos": [loc[:]]
            })

        elif event.type in {'RIGHTMOUSE', 'ESC'}:
            bpy.types.SpaceView3D.draw_handler_remove(self._handle, 'WINDOW')
            return {'CANCELLED'}

        return {'RUNNING_MODAL'}

    def invoke(self, context, event):
        if context.area.type == 'VIEW_3D':
            self._handle = bpy.types.SpaceView3D.draw_handler_add(
                self.draw_callback, (context,), 'WINDOW', 'POST_VIEW'
            )
            context.window_manager.modal_handler_add(self)
            return {'RUNNING_MODAL'}
        return {'CANCELLED'}

    def draw_callback(self, context):
        if self.batch:
            self.shader.bind()
            self.shader.uniform_float("color", (1, 1, 0, 1))
            gpu.state.point_size_set(10.0)
            self.batch.draw(self.shader)
            gpu.state.point_size_set(1.0)
```

## Common Patterns

### Draw Object Bounding Boxes

```python
import bpy
import gpu
from gpu_extras.batch import batch_for_shader
from mathutils import Vector

def draw_bounding_boxes():
    shader = gpu.shader.from_builtin('POLYLINE_UNIFORM_COLOR')

    for obj in bpy.context.selected_objects:
        corners = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
        edges = [
            corners[0], corners[1], corners[1], corners[2],
            corners[2], corners[3], corners[3], corners[0],
            corners[4], corners[5], corners[5], corners[6],
            corners[6], corners[7], corners[7], corners[4],
            corners[0], corners[4], corners[1], corners[5],
            corners[2], corners[6], corners[3], corners[7],
        ]

        batch = batch_for_shader(shader, 'LINES', {
            "pos": [e[:] for e in edges]
        })

        shader.bind()
        shader.uniform_float("color", (0, 1, 0, 1))
        shader.uniform_float("lineWidth", 1.5)
        shader.uniform_float("viewportSize", gpu.state.viewport_get()[2:4])
        batch.draw(shader)
```

## Gotchas

1. **Create batches outside callbacks.** `batch_for_shader()` allocates GPU memory. Creating batches every frame inside a draw callback causes performance issues. Create/update batches only when data changes.

2. **Restore GPU state.** Draw callbacks share GPU state with Blender's own drawing. Always restore state after changes: `blend_set('NONE')`, `depth_test_set('NONE')`, `point_size_set(1.0)`.

3. **`tag_redraw()` for updates.** The viewport only redraws when needed. Call `context.area.tag_redraw()` in modal operators to force a redraw after updating draw data.

4. **Remove handlers on cleanup.** Always remove draw handlers in operator cancel/finish or addon unregister. Orphaned handlers cause crashes or visual artifacts.

5. **POST_PIXEL uses screen coordinates.** (0, 0) is the bottom-left of the region. The Y axis goes up. Use `context.region.width/height` for bounds.

6. **POST_VIEW uses world coordinates.** Geometry is drawn in world space with the active view/projection matrix. No manual matrix setup needed.
