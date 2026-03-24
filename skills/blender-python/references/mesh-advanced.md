# Mesh Advanced Operations

Advanced mesh operations for calculation, validation, construction, and transformation. These methods operate on `bpy.types.Mesh` data-blocks and cover normals, smooth groups, triangulation, validation, and the attribute domain size API. For basic mesh data access see [mesh-data](mesh-data.md). For edit-mesh topology editing see [bmesh](bmesh.md).

## from_pydata

Construct mesh geometry from Python data. This is the standard way to build meshes programmatically.

```python
mesh.from_pydata(vertices, edges, faces)
```

| Parameter | Type | Description |
|---|---|---|
| `vertices` | list of (float, float, float) | Vertex positions |
| `edges` | list of (int, int) | Edge vertex index pairs (can be empty) |
| `faces` | list of (int, ...) | Face vertex index tuples (can be empty, variable length) |

```python
import bpy

mesh = bpy.data.meshes.new("Pyramid")
verts = [
    (0, 0, 0), (1, 0, 0), (1, 1, 0), (0, 1, 0),  # base
    (0.5, 0.5, 1.0),                                 # apex
]
faces = [
    (0, 1, 2, 3),  # base
    (0, 1, 4),      # sides
    (1, 2, 4),
    (2, 3, 4),
    (3, 0, 4),
]
mesh.from_pydata(verts, [], faces)
mesh.update()

obj = bpy.data.objects.new("Pyramid", mesh)
bpy.context.collection.objects.link(obj)
```

After `from_pydata`, call `mesh.update()` to calculate edges and normals. If you pass edges explicitly and also have faces, the edges for the faces are created automatically — you only need explicit edges for wire edges not part of any face.

## Normals

### calc_normals_split

Calculates split (per-loop/corner) normals, taking into account sharp edges, custom normals, and auto-smooth. Must be called before reading `mesh.loops[i].normal`.

```python
import bpy
import numpy as np

mesh = bpy.context.object.data
mesh.calc_normals_split()

# Read split normals
n = len(mesh.loops)
normals = np.empty(n * 3, dtype=np.float32)
mesh.loops.foreach_get("normal", normals)
normals = normals.reshape((n, 3))

# Free when done (releases internal cache)
mesh.free_normals_split()
```

### Setting Custom Normals

```python
import bpy
import mathutils

mesh = bpy.context.object.data

# Set custom split normals per-loop
# normals_split_custom_set expects a flat sequence of (x, y, z) per loop
custom_normals = [(0, 0, 1)] * len(mesh.loops)
mesh.normals_split_custom_set(custom_normals)
mesh.update()

# Alternative: set from corner vertices
# normals_split_custom_set_from_vertices expects one normal per vertex
vert_normals = [(0, 0, 1)] * len(mesh.vertices)
mesh.normals_split_custom_set_from_vertices(vert_normals)

# Check if mesh has custom normals
has_custom = mesh.has_custom_normals

# Clear custom normals
mesh.free_normals_split()
```

## calc_smooth_groups

Calculate smooth groups based on sharp edges.

```python
groups, group_count = mesh.calc_smooth_groups(use_bitflags=False, use_boundary_vertices=False)
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `use_bitflags` | bool | False | If True, return bitmask groups (multiple groups per face); if False, return integer group IDs |
| `use_boundary_vertices` | bool | False | If True, treat boundary vertices (non-manifold) as group separators. Added in 4.5 |

Returns a tuple `(groups, group_count)`:
- `groups`: int array, one per polygon — the smooth group ID (or bitmask)
- `group_count`: total number of smooth groups

```python
import bpy

mesh = bpy.context.object.data
groups, count = mesh.calc_smooth_groups(use_bitflags=True)
print(f"Found {count} smooth groups")

# Each polygon's smooth group
for i, g in enumerate(groups):
    print(f"Polygon {i}: group bitmask {g:#010x}")
```

## calc_loop_triangles

Tessellate polygons into triangles for rendering or export. Results are cached until geometry changes.

```python
import bpy
import numpy as np

mesh = bpy.context.object.data
mesh.calc_loop_triangles()

# mesh.loop_triangles is now populated
print(f"{len(mesh.loop_triangles)} triangles from {len(mesh.polygons)} polygons")

# Each MeshLoopTriangle has:
for tri in mesh.loop_triangles:
    print(f"  vertices: {tri.vertices[:]}")      # 3 vertex indices
    print(f"  loops: {tri.loops[:]}")             # 3 loop indices
    print(f"  polygon_index: {tri.polygon_index}")  # source polygon
    print(f"  normal: {tri.normal[:]}")
    print(f"  area: {tri.area}")
    print(f"  material_index: {tri.material_index}")
    print(f"  use_smooth: {tri.use_smooth}")
    break

# Bulk read triangle vertex indices
nt = len(mesh.loop_triangles)
tri_verts = np.empty(nt * 3, dtype=np.int32)
mesh.loop_triangles.foreach_get("vertices", tri_verts)
tri_verts = tri_verts.reshape((nt, 3))
```

## validate

Check mesh integrity and optionally repair problems.

```python
result = mesh.validate(verbose=False, clean_customdata=True)
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `verbose` | bool | False | Print detailed validation info to console |
| `clean_customdata` | bool | True | Remove unused custom data layers |

Returns `True` if any errors were found and fixed.

> **5.1:** `validate()` also detects and fixes non-finite (NaN/Inf) values in multiresolution tangent data, preventing crashes in the subdivision surface modifier.

```python
import bpy

mesh = bpy.context.object.data
had_errors = mesh.validate(verbose=True)
if had_errors:
    print("Mesh had errors that were repaired")
mesh.update()
```

## transform

Apply a transformation matrix to all vertex positions.

```python
import bpy
import mathutils

mesh = bpy.context.object.data

# Scale mesh geometry by 2x
mat = mathutils.Matrix.Scale(2.0, 4)
mesh.transform(mat)
mesh.update()

# Rotate 45 degrees around Z
import math
mat_rot = mathutils.Matrix.Rotation(math.radians(45), 4, 'Z')
mesh.transform(mat_rot)
mesh.update()
```

This modifies the actual vertex positions in the mesh data. It does not affect the object's transform (`obj.matrix_world`). Call `mesh.update()` afterward to recalculate normals.

## flip_normals

Flip (reverse) the normals of all polygons.

```python
mesh.flip_normals()
```

This reverses the winding order of all faces. To flip normals on specific faces, use bmesh or the `mesh.polygons[i].flip()` method.

## update

Recalculate derived mesh data.

```python
mesh.update(calc_edges=False, calc_edges_loose=False)
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `calc_edges` | bool | False | Force recalculation of edges from face data |
| `calc_edges_loose` | bool | False | Calculate loose edge flags |

Always call `mesh.update()` after modifying geometry via `foreach_set`, `from_pydata`, or direct property writes. Without it, normals, edge topology, and display caches are stale.

## Smooth Shading

### Per-Face

The `use_smooth` property on polygons controls per-face smooth/flat shading:

```python
import bpy

mesh = bpy.context.object.data

# Smooth shade all faces
for poly in mesh.polygons:
    poly.use_smooth = True

# Or use foreach_set for speed
import numpy as np
smooth = np.ones(len(mesh.polygons), dtype=bool)
mesh.polygons.foreach_set("use_smooth", smooth)
mesh.update()
```

### Attribute-Based Shading

The modern approach uses the `sharp_face` boolean attribute (domain `FACE`). A face with `sharp_face = True` renders flat; `False` renders smooth. This attribute is the inverse of `use_smooth`:

```python
import bpy

mesh = bpy.context.object.data

# Ensure the attribute exists
if "sharp_face" not in mesh.attributes:
    mesh.attributes.new("sharp_face", 'BOOLEAN', 'FACE')

attr = mesh.attributes["sharp_face"]

# Set all faces smooth (sharp_face = False)
for item in attr.data:
    item.value = False

mesh.update()
```

Similarly, `sharp_edge` (domain `EDGE`) marks edges as sharp for the auto-smooth system.

## unit_test_compare

Compare two meshes for equality within a tolerance.

```python
result = mesh.unit_test_compare(other_mesh, threshold=1e-6)
```

Returns an empty string if meshes match, or a description of the first difference found.

## domain_size

Get the element count for an attribute domain. Available on `AttributeGroup` (`mesh.attributes`).

```python
import bpy

mesh = bpy.context.object.data

# Get counts per domain
print(mesh.attributes.domain_size('POINT'))   # == len(mesh.vertices)
print(mesh.attributes.domain_size('EDGE'))    # == len(mesh.edges)
print(mesh.attributes.domain_size('FACE'))    # == len(mesh.polygons)
print(mesh.attributes.domain_size('CORNER'))  # == len(mesh.loops)
```

This is useful when you need the element count for a domain without accessing the specific collection.

## Common Patterns

### Export Mesh to Custom Format

```python
import bpy
import numpy as np

mesh = bpy.context.object.data
mesh.calc_loop_triangles()
mesh.calc_normals_split()

# Vertex positions
nv = len(mesh.vertices)
positions = np.empty(nv * 3, dtype=np.float32)
mesh.vertices.foreach_get("co", positions)
positions = positions.reshape((nv, 3))

# Triangle indices
nt = len(mesh.loop_triangles)
tri_verts = np.empty(nt * 3, dtype=np.int32)
mesh.loop_triangles.foreach_get("vertices", tri_verts)
tri_verts = tri_verts.reshape((nt, 3))

# Per-loop normals
nl = len(mesh.loops)
normals = np.empty(nl * 3, dtype=np.float32)
mesh.loops.foreach_get("normal", normals)
normals = normals.reshape((nl, 3))

# Per-loop UVs
uv_layer = mesh.uv_layers.active
if uv_layer:
    uvs = np.empty(nl * 2, dtype=np.float32)
    uv_layer.uv.foreach_get("vector", uvs)
    uvs = uvs.reshape((nl, 2))

mesh.free_normals_split()

# Now use positions, tri_verts, normals, uvs for export...
```

### Apply Object Transform to Mesh

```python
import bpy

obj = bpy.context.object
mesh = obj.data

# Apply the object's world matrix to mesh vertices
mesh.transform(obj.matrix_world)
mesh.update()

# Reset the object transform to identity
obj.matrix_world.identity()
```

### Batch Create Mesh from Evaluated Data

```python
import bpy
import numpy as np

depsgraph = bpy.context.evaluated_depsgraph_get()
obj = bpy.context.object
obj_eval = obj.evaluated_get(depsgraph)
mesh_eval = obj_eval.data

# Read evaluated (post-modifier) vertex positions
n = len(mesh_eval.vertices)
co = np.empty(n * 3, dtype=np.float32)
mesh_eval.vertices.foreach_get("co", co)
positions = co.reshape((n, 3))
print(f"Evaluated mesh has {n} vertices")
```

## Gotchas

1. **calc_normals_split requires call before reading.** Loop normals in `mesh.loops[i].normal` are zero until you call `mesh.calc_normals_split()`. Always call it before reading, and `free_normals_split()` when done.

2. **from_pydata clears existing geometry.** Calling `from_pydata` replaces all vertices, edges, and faces. It does not append — it starts fresh.

3. **validate() may remove geometry.** With `clean_customdata=True` (default), validation can remove degenerate geometry and unused custom data. Run it intentionally, not blindly in production code.

4. **transform() modifies mesh data permanently.** Unlike object transforms, `mesh.transform()` changes actual vertex coordinates. There is no undo within the script — store the inverse matrix if you need to revert.

5. **calc_loop_triangles results are cached.** The triangulation is cached and reused on subsequent calls. If you modify the mesh between calls, the cache is invalidated automatically. However, accessing `mesh.loop_triangles` without calling `calc_loop_triangles()` first returns an empty collection.

6. **shade_smooth/shade_flat on mesh object.** The operators `bpy.ops.object.shade_smooth()` and `bpy.ops.object.shade_flat()` work on the selected objects in context. For programmatic per-face control, set `polygon.use_smooth` or the `sharp_face` attribute directly.

7. **update() parameters rarely needed.** `calc_edges=True` is only needed when you've created faces via `from_pydata` or `foreach_set` without providing edges. `calc_edges_loose` is for specific edge-status queries. Plain `mesh.update()` is sufficient for most cases.
