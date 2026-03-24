# Render API

Custom render engine development and render control. For GPU drawing see [gpu-module](gpu-module.md). For offscreen rendering see [gpu-offscreen](gpu-offscreen.md). For handlers see [handlers-timers](handlers-timers.md).

## RenderEngine Subclass

Create a custom render engine by subclassing `bpy.types.RenderEngine`:

```python
import bpy

class MyRenderEngine(bpy.types.RenderEngine):
    bl_idname = "MY_RENDERER"
    bl_label = "My Renderer"
    bl_use_preview = True
    bl_use_eevee_viewport = False
    bl_use_shading_nodes_custom = False
    bl_use_gpu_context = False

    def render(self, depsgraph):
        """Render a single frame."""
        scene = depsgraph.scene
        scale = scene.render.resolution_percentage / 100.0
        width = int(scene.render.resolution_x * scale)
        height = int(scene.render.resolution_y * scale)

        # Begin result
        result = self.begin_result(0, 0, width, height)
        layer = result.layers[0]

        # Fill pixels (RGBA, row-major, bottom to top)
        import array
        pixels = array.array('f', [0.0] * width * height * 4)
        for y in range(height):
            for x in range(width):
                idx = (y * width + x) * 4
                pixels[idx] = x / width      # R
                pixels[idx + 1] = y / height  # G
                pixels[idx + 2] = 0.5         # B
                pixels[idx + 3] = 1.0         # A

        layer.passes["Combined"].rect = pixels
        self.end_result(result)

    def view_update(self, context, depsgraph):
        """Called when viewport scene data changes."""
        pass

    def view_draw(self, context, depsgraph):
        """Draw the viewport result."""
        pass

def register():
    bpy.utils.register_class(MyRenderEngine)

def unregister():
    bpy.utils.unregister_class(MyRenderEngine)
```

### Class Attributes

| Attribute | Type | Description |
|---|---|---|
| `bl_idname` | str | Unique engine identifier |
| `bl_label` | str | Display name |
| `bl_use_preview` | bool | Support material preview renders |
| `bl_use_eevee_viewport` | bool | Use EEVEE for viewport shading |
| `bl_use_shading_nodes_custom` | bool | Use custom shading nodes (not Blender's) |
| `bl_use_gpu_context` | bool | Engine manages its own GPU context |
| `bl_use_postprocess` | bool | Apply compositor post-processing |
| `bl_use_stereo_viewport` | bool | Support stereo 3D viewport |

### Engine Methods

| Method | Signature | Description |
|---|---|---|
| `render` | `(self, depsgraph)` | Render a frame |
| `view_update` | `(self, context, depsgraph)` | Scene changed in viewport |
| `view_draw` | `(self, context, depsgraph)` | Draw viewport result |
| `bake` | `(self, depsgraph, obj, pass_type, pass_filter, width, height)` | Bake textures |
| `update_script_node` | `(self, node)` | Update OSL script node |

### Engine Utility Methods

```python
class MyRenderEngine(bpy.types.RenderEngine):
    def render(self, depsgraph):
        # Report messages
        self.report({'INFO'}, "Starting render...")
        self.report({'ERROR'}, "Something failed")
        self.report({'WARNING'}, "Potential issue")

        # Progress (0.0 to 1.0)
        self.update_progress(0.5)

        # Check for cancellation
        if self.test_break():
            return

        # Update render status text
        self.update_stats("My Engine", "Rendering tile 3/16")

        # Check if this is a preview render
        if self.is_preview:
            # simplified render for material previews
            pass
```

## RenderResult / RenderLayer / RenderPass

```python
class MyRenderEngine(bpy.types.RenderEngine):
    def render(self, depsgraph):
        scene = depsgraph.scene
        scale = scene.render.resolution_percentage / 100.0
        w = int(scene.render.resolution_x * scale)
        h = int(scene.render.resolution_y * scale)

        # Begin result for a tile or full image
        result = self.begin_result(0, 0, w, h)

        # Access layers and passes
        layer = result.layers[0]
        combined = layer.passes["Combined"]  # RGBA pass

        # Set pixel data (flat float array: R,G,B,A,R,G,B,A,...)
        import numpy as np
        pixels = np.ones(w * h * 4, dtype=np.float32)
        combined.rect = pixels.tolist()

        # Finalize
        self.end_result(result)
```

### Adding Custom Render Passes

```python
import bpy

class MyRenderEngine(bpy.types.RenderEngine):
    bl_idname = "MY_RENDERER"
    bl_label = "My Renderer"

    def update_render_passes(self, scene, render_layer):
        """Register custom AOV passes."""
        self.register_pass(
            scene, render_layer,
            "MyCustomAOV", 3, "RGB", 'COLOR'
        )
        self.register_pass(
            scene, render_layer,
            "ObjectID", 1, "X", 'VALUE'
        )

    def render(self, depsgraph):
        scene = depsgraph.scene
        w = int(scene.render.resolution_x * scene.render.resolution_percentage / 100)
        h = int(scene.render.resolution_y * scene.render.resolution_percentage / 100)

        result = self.begin_result(0, 0, w, h)
        layer = result.layers[0]

        # Write to standard pass
        combined = layer.passes["Combined"]
        # ... fill pixels ...

        # Write to custom pass
        custom = layer.passes["MyCustomAOV"]
        # ... fill pixels (3 channels for RGB) ...

        self.end_result(result)
```

## Engine ID Names

In 5.0, the EEVEE engine ID was renamed:

| Engine | 4.x ID | 5.0 ID |
|---|---|---|
| EEVEE | `'BLENDER_EEVEE_NEXT'` | `'BLENDER_EEVEE'` |
| Cycles | `'CYCLES'` | `'CYCLES'` (unchanged) |
| Workbench | `'BLENDER_WORKBENCH'` | `'BLENDER_WORKBENCH'` (unchanged) |

```python
import bpy

# Set render engine
bpy.context.scene.render.engine = 'BLENDER_EEVEE'   # EEVEE in 5.0
bpy.context.scene.render.engine = 'CYCLES'           # Cycles
bpy.context.scene.render.engine = 'BLENDER_WORKBENCH' # Workbench
```

## Render Pass Name Renames (5.0)

Render pass names were renamed from abbreviated to full descriptive names in 5.0:

| Old Name (4.x) | New Name (5.0) |
|---|---|
| `"Z"` | `"Depth"` |
| `"IndexOB"` | `"Object Index"` |
| `"IndexMA"` | `"Material Index"` |
| `"Emit"` | `"Emission"` |
| `"Env"` | `"Environment"` |
| `"DiffDir"` | `"Diffuse Direct"` |
| `"DiffInd"` | `"Diffuse Indirect"` |
| `"DiffCol"` | `"Diffuse Color"` |
| `"GlossDir"` | `"Glossy Direct"` |
| `"GlossInd"` | `"Glossy Indirect"` |
| `"GlossCol"` | `"Glossy Color"` |
| `"TransDir"` | `"Transmission Direct"` |
| `"TransInd"` | `"Transmission Indirect"` |
| `"TransCol"` | `"Transmission Color"` |
| `"SubsurfaceDir"` | `"Subsurface Direct"` |
| `"SubsurfaceInd"` | `"Subsurface Indirect"` |
| `"SubsurfaceCol"` | `"Subsurface Color"` |

Unchanged pass names: `"Combined"`, `"Mist"`, `"Normal"`, `"Vector"`, `"UV"`, `"Position"`, `"Shadow"`, `"AO"`.

```python
import bpy

# Accessing render passes by new names
scene = bpy.context.scene
view_layer = bpy.context.view_layer

# Enable passes
view_layer.use_pass_diffuse_direct = True
view_layer.use_pass_glossy_direct = True
view_layer.use_pass_transmission_direct = True
```

## Rendering via Python

```python
import bpy

scene = bpy.context.scene

# Render current frame
bpy.ops.render.render(write_still=True)

# Render animation
bpy.ops.render.render(animation=True)

# Render with custom frame range (5.0+)
bpy.ops.render.render(
    animation=True,
    write_still=False,
    use_viewport=False
)

# Set frame range on scene
scene.frame_start = 1
scene.frame_end = 250
scene.frame_step = 1

# Output settings
scene.render.filepath = "//output/render_"
scene.render.image_settings.file_format = 'PNG'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
```

## Common Patterns

### Minimal Custom Render Engine

```python
import bpy
import numpy as np

class GradientEngine(bpy.types.RenderEngine):
    bl_idname = "GRADIENT_ENGINE"
    bl_label = "Gradient Engine"
    bl_use_preview = False

    def render(self, depsgraph):
        scene = depsgraph.scene
        scale = scene.render.resolution_percentage / 100.0
        w = int(scene.render.resolution_x * scale)
        h = int(scene.render.resolution_y * scale)

        result = self.begin_result(0, 0, w, h)

        # Generate gradient pixels
        pixels = np.zeros((h, w, 4), dtype=np.float32)
        for y in range(h):
            t = y / max(h - 1, 1)
            pixels[y, :, 0] = t        # R gradient
            pixels[y, :, 1] = 1.0 - t  # G gradient
            pixels[y, :, 2] = 0.5      # B constant
            pixels[y, :, 3] = 1.0      # A

        result.layers[0].passes["Combined"].rect = pixels.reshape(-1).tolist()
        self.end_result(result)

def register():
    bpy.utils.register_class(GradientEngine)

def unregister():
    bpy.utils.unregister_class(GradientEngine)
```

### Batch Render Multiple Cameras

```python
import bpy

scene = bpy.context.scene
original_camera = scene.camera
original_filepath = scene.render.filepath

for camera in [obj for obj in bpy.data.objects if obj.type == 'CAMERA']:
    scene.camera = camera
    scene.render.filepath = f"//output/{camera.name}_"
    bpy.ops.render.render(write_still=True)

scene.camera = original_camera
scene.render.filepath = original_filepath
```

## Gotchas

1. **`BLENDER_EEVEE_NEXT` is gone.** In 5.0, use `'BLENDER_EEVEE'` for the EEVEE engine. Code checking for `'BLENDER_EEVEE_NEXT'` will fail.

2. **Render pass name renames.** Pass names like `"DiffDir"` are now `"DiffuseDir"`. Code accessing passes by the old short names will get `KeyError`. Update to the new names.

3. **`begin_result` / `end_result` must pair.** Every `begin_result()` must have a matching `end_result()`. Missing the end call causes render artifacts or crashes.

4. **Pixel data format.** Pass `rect` expects a flat list/array of floats in row-major order, bottom-to-top, with channels matching the pass type (4 for RGBA, 3 for RGB, 1 for value).

5. **`test_break()` for cancellation.** Always check `self.test_break()` in render loops. Without it, the user cannot cancel a render in progress.

6. **`is_preview` detection.** Check `self.is_preview` to differentiate material preview renders from final renders. Preview renders should be fast and simplified.

7. **Thread safety.** Render engine methods may be called from different threads. Avoid modifying Blender data from render threads — only read scene data and write to the render result.
