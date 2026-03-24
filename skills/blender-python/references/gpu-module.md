# GPU Module

The `gpu` module provides access to Blender's GPU abstraction layer for custom drawing. Supports Metal, Vulkan, and OpenGL backends. For batch creation helpers see [gpu-extras](gpu-extras.md). For offscreen rendering see [gpu-offscreen](gpu-offscreen.md). For viewport drawing integration see [gpu-drawing](gpu-drawing.md).

## Built-in Shaders

`gpu.shader.from_builtin(shader_name)` returns a pre-compiled shader:

| Shader Name | Description | Attributes |
|---|---|---|
| `'UNIFORM_COLOR'` | Solid color for triangles/lines | `pos` (vec3) |
| `'POLYLINE_UNIFORM_COLOR'` | Solid color for wide lines | `pos` (vec3) |
| `'SMOOTH_COLOR'` | Per-vertex color interpolation | `pos` (vec3), `color` (vec4) |
| `'POLYLINE_SMOOTH_COLOR'` | Per-vertex color for wide lines | `pos` (vec3), `color` (vec4) |
| `'FLAT_COLOR'` | Flat shaded per-face color | `pos` (vec3), `color` (vec4) |
| `'POLYLINE_FLAT_COLOR'` | Flat color for wide lines | `pos` (vec3), `color` (vec4) |
| `'IMAGE'` | Textured quads (no tinting) | `pos` (vec2), `texCoord` (vec2) |
| `'IMAGE_COLOR'` | Textured quads with color tint | `pos` (vec2), `texCoord` (vec2) |
| `'IMAGE_SCENE_LINEAR_TO_REC709_SRGB'` | Image with linear→sRGB conversion | `pos` (vec2), `texCoord` (vec2) |
| `'IMAGE_COLOR_SCENE_LINEAR_TO_REC709_SRGB'` | Image+tint with linear→sRGB | `pos` (vec2), `texCoord` (vec2) |
| `'POINT_UNIFORM_COLOR'` | Solid color for point sprites | `pos` (vec3) |
| `'POINT_FLAT_COLOR'` | Per-point color for point sprites | `pos` (vec3), `color` (vec4) |

```python
import gpu

# Get a built-in shader
shader = gpu.shader.from_builtin('UNIFORM_COLOR')

# Use it
shader.bind()
shader.uniform_float("color", (1.0, 0.0, 0.0, 1.0))
```

### POLYLINE and POINT Variants

The `POLYLINE_*` and `POINT_*` variants are required for correct rendering on Metal and Vulkan backends. These handle wide lines and point sprites through geometry shader emulation:

- Use `POLYLINE_*` instead of `UNIFORM_COLOR`/`SMOOTH_COLOR`/`FLAT_COLOR` when drawing `'LINES'` or `'LINE_STRIP'` with `gpu.state.line_width_set()` > 1.0
- Use `POINT_*` when drawing `'POINTS'` with `gpu.state.point_size_set()` > 1.0

```python
import gpu
from gpu_extras.batch import batch_for_shader

# For wide lines — use POLYLINE variant
shader = gpu.shader.from_builtin('POLYLINE_UNIFORM_COLOR')
shader.bind()
shader.uniform_float("color", (1.0, 1.0, 0.0, 1.0))
shader.uniform_float("lineWidth", 3.0)
shader.uniform_float("viewportSize", gpu.state.viewport_get()[2:4])
```

## Custom Shaders

### From Shader Info

```python
import gpu

# Create shader info
vert_info = gpu.types.GPUStageInterfaceInfo("my_iface")
vert_info.smooth('VEC4', "fragColor")

shader_info = gpu.types.GPUShaderCreateInfo()
shader_info.push_constant('MAT4', "viewProjectionMatrix")
shader_info.push_constant('FLOAT', "brightness")
shader_info.vertex_in(0, 'VEC3', "position")
shader_info.vertex_in(1, 'VEC4', "color")
shader_info.vertex_out(vert_info)

shader_info.vertex_source("""
void main() {
    gl_Position = viewProjectionMatrix * vec4(position, 1.0);
    fragColor = color * brightness;
}
""")

shader_info.fragment_out(0, 'VEC4', "fragOutput")
shader_info.fragment_source("""
void main() {
    fragOutput = fragColor;
}
""")

shader = gpu.shader.create_from_info(shader_info)
```

## GPU Types

### GPUShader

```python
import gpu

shader = gpu.shader.from_builtin('UNIFORM_COLOR')

# Bind before setting uniforms or drawing
shader.bind()

# Set uniforms
shader.uniform_float("color", (1.0, 0.0, 0.0, 1.0))
shader.uniform_float("lineWidth", 2.0)
shader.uniform_int("myInt", 5)
shader.uniform_bool("myBool", True)
shader.uniform_sampler("image", texture)

# Get attribute info
print(shader.attrs_info_get())
```

### GPUTexture

```python
import gpu

# Create from dimensions
texture = gpu.types.GPUTexture((256, 256), format='RGBA8')

# From a Blender image
image = bpy.data.images["MyImage"]
texture = gpu.texture.from_image(image)

# Properties
print(texture.width, texture.height)
print(texture.format)

# Read back pixel data
buffer = texture.read()

# Clear
texture.clear(format='FLOAT', value=(0.0, 0.0, 0.0, 1.0))

# Free
texture.free()
```

### GPUVertBuf and GPUVertFormat

```python
import gpu
import numpy as np

# Create vertex format
fmt = gpu.types.GPUVertFormat()
fmt.attr_add(id="pos", comp_type='F32', len=3, fetch_mode='FLOAT')
fmt.attr_add(id="color", comp_type='F32', len=4, fetch_mode='FLOAT')

# Create vertex buffer
vbo = gpu.types.GPUVertBuf(format=fmt, len=3)

# Fill with data
positions = [(0, 0, 0), (1, 0, 0), (0.5, 1, 0)]
colors = [(1, 0, 0, 1), (0, 1, 0, 1), (0, 0, 1, 1)]
vbo.attr_fill("pos", positions)
vbo.attr_fill("color", colors)
```

### GPUIndexBuf

```python
import gpu

# Create index buffer for shared vertices
ibo = gpu.types.GPUIndexBuf(
    type='TRIS',
    seq=[(0, 1, 2), (2, 3, 0)]  # triangle indices
)
```

### GPUBatch

```python
import gpu

fmt = gpu.types.GPUVertFormat()
fmt.attr_add(id="pos", comp_type='F32', len=3, fetch_mode='FLOAT')

vbo = gpu.types.GPUVertBuf(format=fmt, len=4)
vbo.attr_fill("pos", [(0, 0, 0), (1, 0, 0), (1, 1, 0), (0, 1, 0)])

ibo = gpu.types.GPUIndexBuf(type='TRIS', seq=[(0, 1, 2), (2, 3, 0)])

# Create batch with index buffer
batch = gpu.types.GPUBatch(type='TRIS', buf=vbo, elem=ibo)

# Draw
shader = gpu.shader.from_builtin('UNIFORM_COLOR')
shader.bind()
shader.uniform_float("color", (1, 1, 1, 1))
batch.draw(shader)
```

## GPU State

```python
import gpu

# Blend modes
gpu.state.blend_set('ALPHA')          # standard alpha blending
gpu.state.blend_set('ALPHA_PREMULT')   # premultiplied alpha
gpu.state.blend_set('ADDITIVE')        # additive blending
gpu.state.blend_set('ADDITIVE_PREMULT')
gpu.state.blend_set('MULTIPLY')
gpu.state.blend_set('SUBTRACT')
gpu.state.blend_set('NONE')           # no blending (default)

# Depth testing
gpu.state.depth_test_set('LESS')
gpu.state.depth_test_set('LESS_EQUAL')
gpu.state.depth_test_set('ALWAYS')
gpu.state.depth_test_set('NONE')       # disable

# Depth mask (write to depth buffer)
gpu.state.depth_mask_set(True)

# Face culling
gpu.state.face_culling_set('BACK')
gpu.state.face_culling_set('FRONT')
gpu.state.face_culling_set('NONE')

# Line width and point size
gpu.state.line_width_set(2.0)
gpu.state.point_size_set(5.0)

# Clip distances
gpu.state.clip_distances_set(count)

# Read current viewport
x, y, w, h = gpu.state.viewport_get()
```

## GPU Matrix Stack

```python
import gpu
from mathutils import Matrix

# Push/pop matrix stack
gpu.matrix.push()

# Load a custom matrix
model_view = gpu.matrix.get_model_view_matrix()
projection = gpu.matrix.get_projection_matrix()

# Multiply by a transform
gpu.matrix.multiply_matrix(Matrix.Translation((1, 0, 0)))

# Load identity
gpu.matrix.load_identity()

# Load specific matrix
gpu.matrix.load_matrix(my_matrix)
gpu.matrix.load_projection_matrix(proj_matrix)

gpu.matrix.pop()
```

## GPU Platform Info

```python
import gpu

# Platform info
print(gpu.platform.backend_type_get())   # 'OPENGL', 'VULKAN', 'METAL'
print(gpu.platform.renderer_get())       # GPU name
print(gpu.platform.vendor_get())
print(gpu.platform.version_get())

# Capabilities
print(gpu.capabilities.max_texture_size_get())
print(gpu.capabilities.max_textures_get())
print(gpu.capabilities.max_batch_indices_get())
print(gpu.capabilities.max_batch_vertices_get())
```

## Common Patterns

### Draw a Colored Triangle

```python
import gpu
from gpu_extras.batch import batch_for_shader

shader = gpu.shader.from_builtin('SMOOTH_COLOR')
batch = batch_for_shader(shader, 'TRIS', {
    "pos": [(0, 0, 0), (1, 0, 0), (0.5, 1, 0)],
    "color": [(1, 0, 0, 1), (0, 1, 0, 1), (0, 0, 1, 1)],
})

def draw():
    shader.bind()
    batch.draw(shader)
```

### Draw a Textured Quad

```python
import bpy
import gpu
from gpu_extras.batch import batch_for_shader

image = bpy.data.images["MyTexture"]
texture = gpu.texture.from_image(image)

shader = gpu.shader.from_builtin('IMAGE')
batch = batch_for_shader(shader, 'TRI_FAN', {
    "pos": [(0, 0), (1, 0), (1, 1), (0, 1)],
    "texCoord": [(0, 0), (1, 0), (1, 1), (0, 1)],
})

def draw():
    shader.bind()
    shader.uniform_sampler("image", texture)
    batch.draw(shader)
```

## Gotchas

1. **Use POLYLINE_* for wide lines.** On Metal and Vulkan, `UNIFORM_COLOR` with `line_width_set(>1)` renders 1px lines. Use `POLYLINE_UNIFORM_COLOR` and set `lineWidth` uniform for wide lines.

2. **Shader must be bound before uniforms.** Calling `shader.uniform_float()` before `shader.bind()` raises an error. Always bind first.

3. **State is global.** `gpu.state` changes are persistent. Always restore state after drawing (e.g., `blend_set('NONE')` after alpha blending).

4. **Matrix stack is shared.** `gpu.matrix.push/pop` shares the stack with Blender's own drawing. Always pop what you push.

5. **GPUTexture from image is scene-linear.** Textures loaded via `gpu.texture.from_image()` are in scene-linear color space. Use `IMAGE` shader for correct display or handle color conversion manually. See [gpu-drawing](gpu-drawing.md).

6. **Backend differences.** Behavior varies between OpenGL, Vulkan, and Metal. Test on multiple backends. Use `gpu.platform.backend_type_get()` to detect.
