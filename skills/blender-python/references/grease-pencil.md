# Grease Pencil v3

GreasePencilv3 is the current drawing/2D animation data type. Not to be confused with annotations (see [annotations](annotations.md)). For animation see [animation-actions](animation-actions.md).

## Creating Grease Pencil Objects

```python
import bpy

# Create grease pencil data
gp_data = bpy.data.grease_pencils.new("MyDrawing")

# Create object
gp_obj = bpy.data.objects.new("MyDrawing", gp_data)
bpy.context.collection.objects.link(gp_obj)

# Object type is 'GREASEPENCIL'
print(gp_obj.type)  # 'GREASEPENCIL'
```

## Layers

```python
import bpy

gp_data = bpy.data.grease_pencils["MyDrawing"]

# Create layer
layer = gp_data.layers.new("Outlines")

# Layer properties
layer.opacity = 1.0
layer.blend_mode = 'REGULAR'    # REGULAR, MULTIPLY, etc.
layer.use_masks = False
layer.pass_index = 0

# Layer groups
layer.is_group                  # bool — is this a group layer
layer.color_tag = 'NONE'       # color label

# Iterate layers
for layer in gp_data.layers:
    print(layer.name, layer.opacity)

# Remove layer
gp_data.layers.remove(layer)
```

## Frames

```python
import bpy

layer = bpy.data.grease_pencils["MyDrawing"].layers["Outlines"]

# Create a frame at a specific frame number
frame = layer.frames.new(frame_number=1)

# Access existing frame
frame = layer.frames[0]

# Frame properties
print(frame.frame_number)

# The drawing data
drawing = frame.drawing
```

## Drawings and Strokes

Drawings hold stroke data. Points are accessed via attributes (not individual point objects):

```python
import bpy

gp_data = bpy.data.grease_pencils["MyDrawing"]
layer = gp_data.layers["Outlines"]
frame = layer.frames[0]
drawing = frame.drawing

# Add strokes with specified point counts
# Each integer is the number of points in one stroke
drawing.add_strokes([4, 3])  # adds 2 strokes: one with 4 pts, one with 3 pts

# Access point data via attributes
positions = drawing.attributes["position"]    # float3 per point
# Stroke points are stored contiguously: stroke0_pts then stroke1_pts...
```

### Point Attributes

| Attribute | Type | Description |
|---|---|---|
| `position` | float3 | Point position (3D) |
| `radius` | float | Point radius/thickness |
| `opacity` | float | Point opacity |
| `vertex_color` | float4 | Per-point RGBA color |

```python
import bpy
import numpy as np

gp_data = bpy.data.grease_pencils["MyDrawing"]
drawing = gp_data.layers[0].frames[0].drawing

# Add a stroke with 5 points
drawing.add_strokes([5])

# Set positions via foreach_set
coords = [0, 0, 0,  1, 0, 0,  2, 1, 0,  3, 1, 0,  4, 0, 0]  # flat x,y,z
drawing.attributes["position"].data.foreach_set("vector", coords)

# Set radii
radii = [0.01] * 5
drawing.attributes["radius"].data.foreach_set("value", radii)
```

### Stroke Metadata

```python
import bpy

drawing = bpy.data.grease_pencils["MyDrawing"].layers[0].frames[0].drawing

# Read stroke info
for stroke in drawing.strokes:
    print(f"Points: {stroke.size}, Cyclic: {stroke.cyclic}")

# Reorder strokes
drawing.reorder_strokes([1, 0])  # swap stroke order
```

### Corner Types

Points can have corner type attributes controlling rendering:

| Type | Description |
|---|---|
| `FLAT` | Default smooth connection |
| `SHARP` | Sharp corner |
| `ROUND` | Rounded corner |

## Common Patterns

### Draw a Rectangle

```python
import bpy

gp_data = bpy.data.grease_pencils.new("Rectangle")
gp_obj = bpy.data.objects.new("Rectangle", gp_data)
bpy.context.collection.objects.link(gp_obj)

layer = gp_data.layers.new("Layer")
frame = layer.frames.new(1)
drawing = frame.drawing

# 5 points (closed rectangle: 4 corners + back to start)
drawing.add_strokes([5])

positions = [
    0, 0, 0,
    1, 0, 0,
    1, 1, 0,
    0, 1, 0,
    0, 0, 0,
]
drawing.attributes["position"].data.foreach_set("vector", positions)

radii = [0.005] * 5
drawing.attributes["radius"].data.foreach_set("value", radii)
```

### Animate Across Frames

```python
import bpy

gp_data = bpy.data.grease_pencils["MyDrawing"]
layer = gp_data.layers["Outlines"]

# Create drawings on different frames
for f in range(1, 25):
    frame = layer.frames.new(f)
    drawing = frame.drawing
    drawing.add_strokes([3])

    x_offset = f * 0.1
    positions = [
        x_offset, 0, 0,
        x_offset + 0.5, 0.5, 0,
        x_offset + 1.0, 0, 0,
    ]
    drawing.attributes["position"].data.foreach_set("vector", positions)
```

## Gotchas

1. **GreasePencilv3 vs Annotations.** `bpy.data.grease_pencils` creates drawing objects. `bpy.data.annotations` creates annotation data. They are separate systems. See [annotations](annotations.md).

2. **Point access is attribute-based.** There are no individual `point.co` objects. Use `drawing.attributes["position"]` with `foreach_get`/`foreach_set` for bulk access.

3. **`add_strokes` takes a list of point counts.** The argument is `[n1, n2, ...]` where each integer is the number of points in one stroke. It does not take point data.

4. **Points are contiguous.** After `add_strokes([4, 3])`, the first 4 entries in the position attribute belong to stroke 0, the next 3 to stroke 1.

5. **Stroke order matters.** Strokes draw back-to-front. Use `drawing.reorder_strokes()` to change draw order.

6. **`frame.drawing` is the same object for the frame's lifetime.** Modifying the drawing modifies the frame. To copy a drawing between frames, assign `frame.drawing = other_frame.drawing`.
