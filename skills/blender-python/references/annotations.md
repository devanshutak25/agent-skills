# Annotations

Annotations are 2D/3D markup overlays used in viewports and editors. Renamed from the old GreasePencil system in 5.0. Not to be confused with GreasePencilv3 drawing objects (see [grease-pencil](grease-pencil.md)).

## Rename Table (5.0)

| Old Name (4.x) | New Name (5.0) |
|---|---|
| `bpy.data.grease_pencils` (for annotations) | `bpy.data.annotations` |
| `Scene.grease_pencil` | `Scene.annotation` |
| `Object.grease_pencil` | `Object.annotation` |
| `NodeTree.grease_pencil` | `NodeTree.annotation` |
| `MovieClip.grease_pencil` | `MovieClip.annotation` |
| `GPencilStroke` | `AnnotationStroke` |
| `GPencilFrame` | `AnnotationFrame` |
| `GPencilLayer` | `AnnotationLayer` |

## Creating Annotations

```python
import bpy

# Create annotation data
annotation = bpy.data.annotations.new("MyAnnotation")

# Assign to scene
bpy.context.scene.annotation = annotation

# Create a layer
layer = annotation.layers.new("Notes", set_active=True)

# Create a frame
frame = layer.frames.new(frame_number=1)
```

## Drawing Strokes

```python
import bpy

annotation = bpy.context.scene.annotation
layer = annotation.layers.active
frame = layer.active_frame

if frame is None:
    frame = layer.frames.new(bpy.context.scene.frame_current)

# Create a new stroke
stroke = frame.strokes.new()

# Add points
stroke.points.add(count=4)
stroke.points[0].co = (0.0, 0.0, 0.0)
stroke.points[1].co = (1.0, 0.0, 0.0)
stroke.points[2].co = (1.0, 1.0, 0.0)
stroke.points[3].co = (0.0, 1.0, 0.0)

# Stroke properties
stroke.display_mode = '3DSPACE'  # 3DSPACE, SCREEN, 2DSPACE
stroke.line_width = 3            # pixel width
```

## Layer Properties

```python
import bpy

annotation = bpy.context.scene.annotation
layer = annotation.layers["Notes"]

layer.color = (1.0, 0.0, 0.0)   # stroke color (RGB)
layer.thickness = 3               # default stroke thickness
layer.opacity = 1.0
layer.show_in_front = True        # draw on top of geometry
layer.annotation_hide = False     # visibility toggle
```

## Annotation Access Points

Annotations can be attached to various contexts:

```python
import bpy

# Scene annotation (3D viewport, compositor, etc.)
scene_ann = bpy.context.scene.annotation

# Node editor annotation
for node_tree in bpy.data.node_groups:
    ann = node_tree.annotation

# Movie clip annotation
for clip in bpy.data.movieclips:
    ann = clip.annotation
```

## Common Patterns

### Draw an Arrow Annotation

```python
import bpy
from mathutils import Vector

annotation = bpy.context.scene.annotation
if annotation is None:
    annotation = bpy.data.annotations.new("SceneAnnotation")
    bpy.context.scene.annotation = annotation

layer = annotation.layers.new("Arrows", set_active=True)
frame = layer.frames.new(1)

# Arrow shaft
shaft = frame.strokes.new()
shaft.points.add(2)
shaft.points[0].co = (0, 0, 0)
shaft.points[1].co = (2, 0, 0)
shaft.display_mode = '3DSPACE'

# Arrow head
head = frame.strokes.new()
head.points.add(3)
head.points[0].co = (1.8, 0.2, 0)
head.points[1].co = (2.0, 0.0, 0)
head.points[2].co = (1.8, -0.2, 0)
head.display_mode = '3DSPACE'
```

### Clear All Annotations

```python
import bpy

annotation = bpy.context.scene.annotation
if annotation:
    for layer in annotation.layers:
        for frame in layer.frames:
            frame.strokes.clear()
```

## Gotchas

1. **Annotations are not GreasePencilv3.** `bpy.data.annotations` creates lightweight markup. `bpy.data.grease_pencils` creates full drawing objects with materials and modifiers. They are completely separate systems.

2. **Property renames in 5.0.** All `grease_pencil` properties on Scene, Object, NodeTree, MovieClip are now `annotation`. Code using the old names will get `AttributeError`.

3. **Type renames in 5.0.** `GPencilStroke` → `AnnotationStroke`, `GPencilFrame` → `AnnotationFrame`, `GPencilLayer` → `AnnotationLayer`. Type checks and isinstance calls need updating.

4. **`display_mode` per stroke.** Each stroke can be in `'3DSPACE'` (world coordinates), `'SCREEN'` (screen-fixed), or `'2DSPACE'` (2D editor space). Mixing modes in the same layer works but can be confusing.

5. **Scene annotation may be `None`.** `bpy.context.scene.annotation` is `None` until an annotation data-block is created or assigned. Always check or create before use.

6. **Frames are per layer.** Each layer has its own frame timeline. Creating a frame on one layer does not affect others.
