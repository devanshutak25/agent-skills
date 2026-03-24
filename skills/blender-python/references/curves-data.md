# Curves Data

Curves data-block (`bpy.types.Curves`) for hair, paths, and procedural curves. Curves is the modern geometry type — distinct from the legacy `Curve` type (NURBS surfaces/text) and from `GreasePencilv3` (drawing/annotation strokes). Access via `obj.data` on objects of type `'CURVES'`. For geometry node interactions see [geometry-nodes-api](geometry-nodes-api.md).

## Curve Types

Each curve in a `Curves` data-block has a type controlling its interpolation:

| Type | Enum | Description |
|---|---|---|
| Poly | `'POLY'` | Linear interpolation between control points |
| Catmull-Rom | `'CATMULL_ROM'` | Smooth subdivision curve (default for hair) |
| Bézier | `'BEZIER'` | Bézier splines with left/right handles per point |
| NURBS | `'NURBS'` | Non-uniform rational B-splines with weights and knots |

```python
import bpy

curves = bpy.data.curves.new("MyCurves", type='CURVES')
obj = bpy.data.objects.new("CurvesObj", curves)
bpy.context.collection.objects.link(obj)
```

## Points and Per-Curve Data

### Points (`curves.points`)

All control points across all curves in a single flat collection. Each point has built-in attributes:

| Attribute | Type | Description |
|---|---|---|
| `position` | float[3] | Point position in local space |
| `radius` | float | Point radius (used for tapering in hair/curves) |

Additional per-point attributes (tilt, weight, etc.) are stored as named attributes via the attribute API.

```python
import bpy

curves = bpy.context.object.data  # Curves data-block
total_points = len(curves.points)

# Read all point positions
import numpy as np
positions = np.empty(total_points * 3, dtype=np.float32)
curves.points.foreach_get("position", positions)
positions = positions.reshape((total_points, 3))

# Write radii
radii = np.full(total_points, 0.01, dtype=np.float32)
curves.points.foreach_set("radius", radii)
curves.update_tag()
```

### Per-Curve Data (`curves.curves`)

Metadata for each curve in the collection:

| Property | Type | Description |
|---|---|---|
| `first_point_index` | int | Index of the first point in `curves.points` |
| `points_length` | int | Number of points in this curve |

```python
import bpy

curves = bpy.context.object.data
num_curves = len(curves.curves)

# Iterate over curves
for i in range(num_curves):
    curve = curves.curves[i]
    start = curve.first_point_index
    length = curve.points_length
    print(f"Curve {i}: points [{start}..{start + length - 1}]")

# Bulk read with foreach_get
import numpy as np
starts = np.empty(num_curves, dtype=np.int32)
lengths = np.empty(num_curves, dtype=np.int32)
curves.curves.foreach_get("first_point_index", starts)
curves.curves.foreach_get("points_length", lengths)
```

## Curve Type per Curve

Each curve can have a different type. The curve type is a per-curve attribute:

```python
import bpy

curves = bpy.context.object.data

# Read curve types (returns int enum values)
# 0=CATMULL_ROM, 1=POLY, 2=BEZIER, 3=NURBS
for i in range(len(curves.curves)):
    ct = curves.curves[i].type
    print(f"Curve {i}: {ct}")
```

## Modifying Curves

### Adding Curves

Use `curves.add_curves(sizes)` to add new curves with specified point counts:

```python
import bpy

curves = bpy.context.object.data

# Add 3 new curves with 5, 10, and 8 points respectively
curves.add_curves([5, 10, 8])
curves.update_tag()
```

### Resizing Curves

`curves.resize_curves(sizes, indices=None)` changes the point count of existing curves. If `indices` is `None`, `sizes` must match the total curve count:

```python
import bpy

curves = bpy.context.object.data

# Resize specific curves — curve 0 to 6 points, curve 2 to 12 points
curves.resize_curves(sizes=[6, 12], indices=[0, 2])
curves.update_tag()
```

### Removing Curves

`curves.remove_curves(indices)` removes curves by index:

```python
import bpy
import numpy as np

curves = bpy.context.object.data

# Remove curves at indices 1 and 3
indices_to_remove = np.array([1, 3], dtype=np.int32)
curves.remove_curves(indices=indices_to_remove)
curves.update_tag()
```

### Reordering Curves

`curves.reorder_curves(new_indices)` reorders curves. `new_indices` maps old positions to new:

```python
import bpy
import numpy as np

curves = bpy.context.object.data
n = len(curves.curves)

# Reverse curve order
new_order = np.arange(n - 1, -1, -1, dtype=np.int32)
curves.reorder_curves(new_indices=new_order)
curves.update_tag()
```

### Setting Curve Types

`curves.set_types(types, indices=None)` changes the interpolation type of curves:

```python
import bpy

curves = bpy.context.object.data

# Set curves 0 and 1 to Bézier
curves.set_types(types=[2, 2], indices=[0, 1])  # 2 = BEZIER

# Set all curves to POLY
import numpy as np
n = len(curves.curves)
curves.set_types(types=np.full(n, 1, dtype=np.int32))  # 1 = POLY
curves.update_tag()
```

## Bézier Handle Data

When a curve's type is `'BEZIER'`, each point has left and right handles stored as named attributes:

```python
import bpy
import numpy as np

curves = bpy.context.object.data

# Access handle positions (only meaningful for Bézier curves)
# Handle attributes are stored as point-domain built-in attributes
handle_left = curves.attributes.get("handle_position_left")
handle_right = curves.attributes.get("handle_position_right")
handle_type_left = curves.attributes.get("handle_type_left")
handle_type_right = curves.attributes.get("handle_type_right")

if handle_left is not None:
    n = len(curves.points)
    left_pos = np.empty(n * 3, dtype=np.float32)
    handle_left.data.foreach_get("vector", left_pos)
    left_pos = left_pos.reshape((n, 3))
```

Handle types: `FREE`, `AUTO`, `VECTOR`, `ALIGN`.

## Attributes API

Custom attributes can be added on the `POINT` or `CURVE` domain:

```python
import bpy

curves = bpy.context.object.data

# Add a per-point float attribute
attr = curves.attributes.new(name="stiffness", type='FLOAT', domain='POINT')

# Add a per-curve color attribute
color_attr = curves.attributes.new(name="strand_color", type='FLOAT_COLOR', domain='CURVE')

# Write attribute data
import numpy as np
n = len(curves.points)
values = np.random.uniform(0.5, 1.0, n).astype(np.float32)
attr.data.foreach_set("value", values)

# Remove an attribute
curves.attributes.remove(attr)
```

Attribute types: `FLOAT`, `INT`, `FLOAT_VECTOR`, `FLOAT_COLOR`, `BYTE_COLOR`, `BOOLEAN`, `FLOAT2`, `INT8`, `INT32_2D`, `QUATERNION`.

Attribute domains for Curves: `POINT`, `CURVE`.

## NURBS-Specific Properties

NURBS curves support additional attributes for weights and knot vectors:

```python
import bpy
import numpy as np

curves = bpy.context.object.data

# NURBS weights are stored as a point-domain attribute
nurbs_weight = curves.attributes.get("nurbs_weight")
if nurbs_weight is not None:
    n = len(curves.points)
    weights = np.empty(n, dtype=np.float32)
    nurbs_weight.data.foreach_get("value", weights)
```

## Curves vs GreasePencilv3

| | Curves | GreasePencilv3 |
|---|---|---|
| Object type | `'CURVES'` | `'GREASEPENCIL'` |
| Data collection | `bpy.data.curves` (type `'CURVES'`) | `bpy.data.grease_pencils` |
| Purpose | Hair, paths, procedural curves | Drawing strokes, 2D animation |
| Geometry Nodes | Full support | Full support |
| Points access | `curves.points` (flat) | Via `drawing.attributes` |
| Layers/Frames | None | `layers` → `frames` → `drawing` |
| Stroke structure | Continuous curves | Strokes with per-stroke attributes |

Both types store point data as attributes, but their structure and intended use differ. Curves is a single flat point collection partitioned by curve indices. GreasePencilv3 has a layer/frame/drawing hierarchy with per-drawing stroke collections. See [grease-pencil](grease-pencil.md).

## Common Patterns

### Create Hair Curves Programmatically

```python
import bpy
import numpy as np

# Create curves data-block
curves = bpy.data.curves.new("HairCurves", type='CURVES')
obj = bpy.data.objects.new("Hair", curves)
bpy.context.collection.objects.link(obj)

# Add 100 curves, each with 8 points
num_curves = 100
points_per_curve = 8
curves.add_curves([points_per_curve] * num_curves)

# Set point positions — simple straight strands from scalp
total_points = len(curves.points)
positions = np.empty(total_points * 3, dtype=np.float32)

for c in range(num_curves):
    base_x = np.random.uniform(-1, 1)
    base_y = np.random.uniform(-1, 1)
    start = c * points_per_curve
    for p in range(points_per_curve):
        idx = (start + p) * 3
        positions[idx] = base_x + np.random.normal(0, 0.01)
        positions[idx + 1] = base_y + np.random.normal(0, 0.01)
        positions[idx + 2] = p * 0.05  # grow upward

curves.points.foreach_set("position", positions)

# Set radii — taper from root to tip
radii = np.empty(total_points, dtype=np.float32)
for c in range(num_curves):
    start = c * points_per_curve
    for p in range(points_per_curve):
        radii[start + p] = 0.005 * (1.0 - p / (points_per_curve - 1))
curves.points.foreach_set("radius", radii)

curves.update_tag()
```

### Read All Curve Segments for Export

```python
import bpy
import numpy as np

curves = bpy.context.object.data
num_curves = len(curves.curves)
total_points = len(curves.points)

# Bulk read
positions = np.empty(total_points * 3, dtype=np.float32)
curves.points.foreach_get("position", positions)
positions = positions.reshape((total_points, 3))

starts = np.empty(num_curves, dtype=np.int32)
lengths = np.empty(num_curves, dtype=np.int32)
curves.curves.foreach_get("first_point_index", starts)
curves.curves.foreach_get("points_length", lengths)

# Process each curve
for i in range(num_curves):
    curve_points = positions[starts[i]:starts[i] + lengths[i]]
    # Export curve_points...
```

### Surface Attachment (UV Surface)

```python
import bpy

curves = bpy.context.object.data

# Surface UV attribute stores where each curve root attaches to a mesh surface
surface_uv = curves.attributes.get("surface_uv_coordinate")
if surface_uv is not None:
    import numpy as np
    n = len(curves.curves)
    uvs = np.empty(n * 2, dtype=np.float32)
    surface_uv.data.foreach_get("vector", uvs)
    uvs = uvs.reshape((n, 2))
```

## Gotchas

1. **`add_curves` vs `resize_curves`.** `add_curves` appends new curves; `resize_curves` changes point counts of existing curves. They are not interchangeable. Use `add_curves` to create, `resize_curves` to change point counts, and `remove_curves` to delete.

2. **Flat point indexing.** `curves.points` is a flat array spanning all curves. Use `first_point_index` and `points_length` per curve to slice correctly. Points from different curves are contiguous but distinct.

3. **Type integer mapping.** `set_types` expects integer values, not strings: 0=CATMULL_ROM, 1=POLY, 2=BEZIER, 3=NURBS. The string enum names are used in the UI but the API uses integers for bulk operations.

4. **Bézier handles are attributes.** Unlike legacy `Curve` objects where handles were explicit properties, the modern `Curves` type stores handle positions and types as built-in attributes (`handle_position_left`, `handle_position_right`, `handle_type_left`, `handle_type_right`). These only exist when the curve type is BEZIER.

5. **`update_tag()` not `update()`.** After modifying Curves data, call `curves.update_tag()` to flag for depsgraph re-evaluation. Unlike Mesh which uses `mesh.update()`, Curves uses the tag pattern.

6. **Curves type vs Curve type.** `bpy.data.curves.new("name", type='CURVES')` creates the modern Curves data-block. `bpy.data.curves.new("name", type='CURVE')` creates the legacy Curve type (for NURBS surfaces, text, etc.). These are completely different data types despite sharing the `bpy.data.curves` collection.
