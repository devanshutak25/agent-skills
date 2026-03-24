# GPU Extras

Helper functions for GPU drawing, including batch creation shortcuts and preset drawing functions. For core GPU types see [gpu-module](gpu-module.md). For viewport draw handler setup see [gpu-drawing](gpu-drawing.md). For offscreen rendering see [gpu-offscreen](gpu-offscreen.md).

## batch_for_shader

`gpu_extras.batch.batch_for_shader(shader, type, content, indices=None)` creates a `GPUBatch` from a shader and data:

```python
import gpu
from gpu_extras.batch import batch_for_shader

shader = gpu.shader.from_builtin('UNIFORM_COLOR')

# Create a batch of triangles
batch = batch_for_shader(shader, 'TRIS', {
    "pos": [(0, 0, 0), (1, 0, 0), (1, 1, 0), (0, 1, 0)],
}, indices=[(0, 1, 2), (2, 3, 0)])

# Draw
shader.bind()
shader.uniform_float("color", (1.0, 0.0, 0.0, 1.0))
batch.draw(shader)
```

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `shader` | GPUShader | Shader to match attributes against |
| `type` | str | Primitive type (see below) |
| `content` | dict | Vertex attribute data: `{"attr_name": [values...]}` |
| `indices` | list or None | Optional index buffer for shared vertices |

### Primitive Types

| Type | Description |
|---|---|
| `'POINTS'` | Individual points |
| `'LINES'` | Line pairs (every 2 vertices = 1 line) |
| `'TRIS'` | Triangle triples (every 3 vertices = 1 triangle) |
| `'LINE_STRIP'` | Connected line chain |
| `'LINE_LOOP'` | Connected line chain, closed |
| `'TRI_FAN'` | Triangle fan from first vertex |
| `'TRI_STRIP'` | Triangle strip |
| `'LINES_ADJ'` | Lines with adjacency info (every 4 vertices) |

### Examples

```python
import gpu
from gpu_extras.batch import batch_for_shader

# Lines
shader = gpu.shader.from_builtin('UNIFORM_COLOR')
batch = batch_for_shader(shader, 'LINES', {
    "pos": [(0, 0, 0), (1, 1, 0), (1, 0, 0), (0, 1, 0)],
})

# Smooth-colored triangle strip
shader = gpu.shader.from_builtin('SMOOTH_COLOR')
batch = batch_for_shader(shader, 'TRI_STRIP', {
    "pos": [(0, 0, 0), (1, 0, 0), (0, 1, 0), (1, 1, 0)],
    "color": [(1, 0, 0, 1), (0, 1, 0, 1), (0, 0, 1, 1), (1, 1, 0, 1)],
})

# Indexed mesh (shared vertices)
shader = gpu.shader.from_builtin('UNIFORM_COLOR')
verts = [(0, 0, 0), (1, 0, 0), (1, 1, 0), (0, 1, 0)]
indices = [(0, 1, 2), (2, 3, 0)]
batch = batch_for_shader(shader, 'TRIS', {"pos": verts}, indices=indices)
```

## Preset Drawing Functions

### draw_texture_2d

`gpu_extras.presets.draw_texture_2d(texture, position, width, height)` draws a texture as a 2D overlay:

```python
import bpy
import gpu
from gpu_extras.presets import draw_texture_2d

image = bpy.data.images["MyImage"]
texture = gpu.texture.from_image(image)

def draw_callback():
    draw_texture_2d(texture, (100, 100), 256, 256)
```

For images in scene-linear color space (most Blender images), pass `is_scene_linear_with_rec709_srgb_target=True`:

```python
from gpu_extras.presets import draw_texture_2d

def draw_callback():
    draw_texture_2d(
        texture, (100, 100), 256, 256,
        is_scene_linear_with_rec709_srgb_target=True
    )
```

### draw_circle_2d

`gpu_extras.presets.draw_circle_2d(position, color, radius, *, segments=32)` draws a 2D circle outline:

```python
from gpu_extras.presets import draw_circle_2d

def draw_callback():
    draw_circle_2d((200, 200), (1.0, 1.0, 0.0, 1.0), 50, segments=64)
```

## Manual Batch Creation Workflow

For maximum control, create vertex buffers and batches manually:

```python
import gpu
import numpy as np

# 1. Define vertex format
fmt = gpu.types.GPUVertFormat()
pos_id = fmt.attr_add(id="pos", comp_type='F32', len=3, fetch_mode='FLOAT')
color_id = fmt.attr_add(id="color", comp_type='F32', len=4, fetch_mode='FLOAT')

# 2. Create vertex buffer
num_verts = 100
vbo = gpu.types.GPUVertBuf(format=fmt, len=num_verts)

# 3. Fill data
positions = np.random.uniform(-1, 1, (num_verts, 3)).tolist()
colors = [(1, 1, 1, 1)] * num_verts
vbo.attr_fill("pos", positions)
vbo.attr_fill("color", colors)

# 4. Create batch
batch = gpu.types.GPUBatch(type='POINTS', buf=vbo)

# 5. Draw with shader
shader = gpu.shader.from_builtin('POINT_FLAT_COLOR')
shader.bind()
gpu.state.point_size_set(3.0)
batch.draw(shader)
```

### With Index Buffer

```python
import gpu

fmt = gpu.types.GPUVertFormat()
fmt.attr_add(id="pos", comp_type='F32', len=3, fetch_mode='FLOAT')

# 8 vertices of a cube
verts = [
    (-1, -1, -1), (1, -1, -1), (1, 1, -1), (-1, 1, -1),
    (-1, -1,  1), (1, -1,  1), (1, 1,  1), (-1, 1,  1),
]
vbo = gpu.types.GPUVertBuf(format=fmt, len=8)
vbo.attr_fill("pos", verts)

# 12 triangles (6 faces × 2 triangles)
indices = [
    (0, 1, 2), (2, 3, 0),  # front
    (1, 5, 6), (6, 2, 1),  # right
    (5, 4, 7), (7, 6, 5),  # back
    (4, 0, 3), (3, 7, 4),  # left
    (3, 2, 6), (6, 7, 3),  # top
    (4, 5, 1), (1, 0, 4),  # bottom
]
ibo = gpu.types.GPUIndexBuf(type='TRIS', seq=indices)

batch = gpu.types.GPUBatch(type='TRIS', buf=vbo, elem=ibo)

shader = gpu.shader.from_builtin('UNIFORM_COLOR')
shader.bind()
shader.uniform_float("color", (0.5, 0.5, 0.5, 1.0))
batch.draw(shader)
```

## Common Patterns

### Draw a Wireframe Box

```python
import gpu
from gpu_extras.batch import batch_for_shader

def draw_wire_box(min_co, max_co, color=(1, 1, 1, 1)):
    x0, y0, z0 = min_co
    x1, y1, z1 = max_co

    verts = [
        (x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
        (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1),
    ]
    edges = [
        (0, 1), (1, 2), (2, 3), (3, 0),  # bottom
        (4, 5), (5, 6), (6, 7), (7, 4),  # top
        (0, 4), (1, 5), (2, 6), (3, 7),  # verticals
    ]

    shader = gpu.shader.from_builtin('POLYLINE_UNIFORM_COLOR')
    batch = batch_for_shader(shader, 'LINES', {"pos": verts},
                             indices=edges)

    shader.bind()
    shader.uniform_float("color", color)
    shader.uniform_float("lineWidth", 2.0)
    shader.uniform_float("viewportSize", gpu.state.viewport_get()[2:4])
    batch.draw(shader)
```

### Draw Points at Object Origins

```python
import bpy
import gpu
from gpu_extras.batch import batch_for_shader

def draw_origins():
    positions = [list(obj.location) for obj in bpy.data.objects]
    if not positions:
        return

    shader = gpu.shader.from_builtin('POINT_UNIFORM_COLOR')
    batch = batch_for_shader(shader, 'POINTS', {"pos": positions})

    shader.bind()
    shader.uniform_float("color", (1.0, 0.5, 0.0, 1.0))
    gpu.state.point_size_set(8.0)
    batch.draw(shader)
    gpu.state.point_size_set(1.0)
```

### Dynamic Batch Update

```python
import gpu
from gpu_extras.batch import batch_for_shader

shader = gpu.shader.from_builtin('UNIFORM_COLOR')
batch = None

def update_geometry(new_positions):
    global batch
    batch = batch_for_shader(shader, 'LINE_STRIP', {
        "pos": new_positions,
    })

def draw():
    if batch is None:
        return
    shader.bind()
    shader.uniform_float("color", (0, 1, 0, 1))
    batch.draw(shader)
```

## Gotchas

1. **`batch_for_shader` matches shader attributes.** The `content` dict keys must match the shader's vertex attribute names exactly. For `UNIFORM_COLOR`, use `"pos"`. For `SMOOTH_COLOR`, use `"pos"` and `"color"`.

2. **Data must be lists of tuples.** Pass coordinates as `[(x, y, z), ...]` — not numpy arrays directly. If using numpy, call `.tolist()` first.

3. **2D vs 3D positions.** `IMAGE` shader uses 2D positions `(x, y)`. Color shaders use 3D `(x, y, z)`. Mismatched dimensions cause crashes or garbled output.

4. **Index buffer face winding.** Triangle winding order affects face culling. Use consistent winding (counter-clockwise) when face culling is enabled.

5. **Batches are not reusable across shaders.** A batch created for one shader may not work with another if the attribute layout differs. Always create batches matched to their shader.

6. **`draw_texture_2d` color space.** Without `is_scene_linear_with_rec709_srgb_target=True`, scene-linear textures appear washed out (no sRGB conversion). Always pass this flag for Blender images unless rendering to a scene-linear target.
