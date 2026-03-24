# GPU Offscreen Rendering

`GPUOffScreen` provides a render target for offscreen drawing — rendering to a texture without displaying to the screen. For core GPU types see [gpu-module](gpu-module.md). For viewport drawing see [gpu-drawing](gpu-drawing.md).

## Creating an Offscreen Buffer

```python
import gpu

# Create offscreen buffer
width, height = 512, 512
offscreen = gpu.types.GPUOffScreen(width, height, format='RGBA8')
```

### Format Options

| Format | Description |
|---|---|
| `'RGBA8'` | 8-bit per channel RGBA (default) |
| `'RGBA16F'` | 16-bit float per channel RGBA |
| `'RGBA32F'` | 32-bit float per channel RGBA |

## Drawing to an Offscreen Buffer

### Bind / Unbind Pattern

```python
import gpu
import bpy

offscreen = gpu.types.GPUOffScreen(512, 512)

# Bind the offscreen as the render target
offscreen.bind()

# Clear and draw
import gpu
gpu.state.blend_set('NONE')

# ... perform drawing operations here ...
# All GPU draw calls go to the offscreen buffer

offscreen.unbind()
```

### draw_view3d — Render the 3D Viewport

```python
import bpy
import gpu
from mathutils import Matrix

offscreen = gpu.types.GPUOffScreen(1920, 1080)

scene = bpy.context.scene
view_layer = bpy.context.view_layer
space = bpy.context.space_data
region = bpy.context.region_data

# Render the viewport to the offscreen buffer
offscreen.draw_view3d(
    scene,
    view_layer,
    space,          # SpaceView3D
    region,         # RegionView3D
    Matrix.Identity(4),    # view matrix
    Matrix.Identity(4),    # projection matrix
    do_color_management=True,
    draw_background=True
)
```

**`draw_view3d` parameters:**

| Parameter | Type | Description |
|---|---|---|
| `scene` | Scene | Scene to render |
| `view_layer` | ViewLayer | View layer to render |
| `view3d` | SpaceView3D | 3D viewport space |
| `region` | RegionView3D | Region data with view matrices |
| `view_matrix` | Matrix | Custom view (camera) matrix |
| `projection_matrix` | Matrix | Custom projection matrix |
| `do_color_management` | bool | Apply color management |
| `draw_background` | bool | Draw the background |

## Reading Pixels

### From texture_color

```python
import gpu
import numpy as np

offscreen = gpu.types.GPUOffScreen(256, 256)

# ... draw something ...

# Read the color texture
buffer = offscreen.texture_color.read()

# buffer is a gpu.types.Buffer — convert to numpy
pixels = np.array(buffer, dtype=np.float32)
pixels = pixels.reshape((256, 256, 4))  # RGBA
```

### Saving to an Image

```python
import bpy
import gpu
import numpy as np

width, height = 512, 512
offscreen = gpu.types.GPUOffScreen(width, height)

# Draw something to the offscreen buffer
offscreen.bind()
# ... drawing code ...
offscreen.unbind()

# Read pixels
buffer = offscreen.texture_color.read()
pixels = np.array(buffer, dtype=np.float32).reshape((height, width, 4))

# Create a Blender image and set pixels
image = bpy.data.images.new("OffscreenResult", width, height)
image.pixels.foreach_set(pixels.ravel())
image.update()

# Save to disk
image.filepath_raw = "//offscreen_output.png"
image.file_format = 'PNG'
image.save()
```

## Depth Format Deprecations

Several depth formats were deprecated or changed:

| Deprecated Format | Replacement |
|---|---|
| `DEPTH24_STENCIL8` | Use `DEPTH32F` variant |
| `DEPTH_COMPONENT24` | Use `DEPTH_COMPONENT32F` |
| `UINT_24_8` data type | Deprecated — use float depth |

Prefer `DEPTH_COMPONENT32F` for depth buffers in new code.

## Cleanup

Always free offscreen buffers when done to release GPU memory:

```python
import gpu

offscreen = gpu.types.GPUOffScreen(1024, 1024)
try:
    offscreen.bind()
    # ... draw ...
    offscreen.unbind()
    # ... read pixels ...
finally:
    offscreen.free()
```

## Common Patterns

### Render a Custom Camera View

```python
import bpy
import gpu
from mathutils import Matrix

def render_camera_view(camera, width, height):
    """Render the viewport from a camera's perspective."""
    scene = bpy.context.scene
    view_layer = bpy.context.view_layer

    offscreen = gpu.types.GPUOffScreen(width, height)

    # Get camera matrices
    depsgraph = bpy.context.evaluated_depsgraph_get()
    cam_eval = camera.evaluated_get(depsgraph)

    view_matrix = cam_eval.matrix_world.inverted()

    # Build projection matrix from camera data
    cam_data = cam_eval.data
    aspect = width / height
    if cam_data.type == 'PERSP':
        import math
        fov = cam_data.angle
        near = cam_data.clip_start
        far = cam_data.clip_end
        proj_matrix = Matrix.Identity(4)
        proj_matrix = cam_eval.calc_matrix_camera(
            depsgraph, x=width, y=height
        )
    else:
        proj_matrix = cam_eval.calc_matrix_camera(
            depsgraph, x=width, y=height
        )

    # Find a 3D viewport space
    for area in bpy.context.screen.areas:
        if area.type == 'VIEW_3D':
            space = area.spaces[0]
            region = None
            for r in area.regions:
                if r.type == 'WINDOW':
                    region = r
                    break
            if region:
                offscreen.draw_view3d(
                    scene, view_layer,
                    space, region.data if hasattr(region, 'data') else space.region_3d,
                    view_matrix, proj_matrix,
                    do_color_management=True
                )
                break

    # Read result
    import numpy as np
    buffer = offscreen.texture_color.read()
    pixels = np.array(buffer, dtype=np.float32).reshape((height, width, 4))

    offscreen.free()
    return pixels
```

### Thumbnail Generator

```python
import bpy
import gpu
import numpy as np

def generate_thumbnail(obj, size=128):
    """Generate a thumbnail image of an object."""
    offscreen = gpu.types.GPUOffScreen(size, size)

    scene = bpy.context.scene
    view_layer = bpy.context.view_layer

    # Position camera to frame the object
    from mathutils import Matrix, Vector
    bounds = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    center = sum(bounds, Vector()) / 8
    view_matrix = Matrix.Translation(-center) @ Matrix.Rotation(0.5, 4, 'X')

    for area in bpy.context.screen.areas:
        if area.type == 'VIEW_3D':
            space = area.spaces[0]
            offscreen.draw_view3d(
                scene, view_layer,
                space, space.region_3d,
                view_matrix, gpu.matrix.get_projection_matrix(),
                do_color_management=True,
                draw_background=False
            )
            break

    buffer = offscreen.texture_color.read()
    pixels = np.array(buffer, dtype=np.float32).reshape((size, size, 4))
    offscreen.free()
    return pixels
```

## Gotchas

1. **Always free offscreen buffers.** `GPUOffScreen` objects consume GPU memory. Call `offscreen.free()` when done. Use try/finally to ensure cleanup.

2. **`draw_view3d` needs a SpaceView3D.** The method requires valid SpaceView3D and RegionView3D references. These are only available when a 3D viewport exists. In background mode, you may need to create a temporary window.

3. **Bind/unbind must pair.** Every `offscreen.bind()` must have a matching `offscreen.unbind()`. Failing to unbind leaves the GPU rendering to the offscreen buffer.

4. **Pixel data is bottom-to-top.** GPU textures store pixels bottom-to-top. When saving to image formats that expect top-to-bottom, flip the array: `pixels = np.flipud(pixels)`.

5. **Color management.** `draw_view3d(do_color_management=True)` applies the scene's color management. For raw pixel data (e.g., object IDs), set it to `False`.

6. **Offscreen buffer size is fixed.** You cannot resize an offscreen buffer. Create a new one at the desired size and free the old one.
