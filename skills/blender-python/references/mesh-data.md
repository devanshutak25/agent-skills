# Mesh Data

Core mesh data access in Blender's Python API. A `Mesh` data-block (`bpy.types.Mesh`) holds geometry — vertices, edges, polygons, and corner (loop) data — plus attributes, UV maps, color attributes, vertex groups, and shape keys. Access the mesh of a mesh object via `obj.data`. For advanced mesh operations see [mesh-advanced](mesh-advanced.md). For edit-mesh topology editing see [bmesh](bmesh.md).

## Mesh Elements

### Vertices (`mesh.vertices`)

`MeshVertex` collection. Each vertex has:

| Property | Type | RO | Description |
|---|---|---|---|
| `co` | float[3] | no | Position in local space |
| `normal` | float[3] | yes | Vertex normal (auto-calculated) |
| `index` | int | yes | Index in the vertices collection |
| `select` | bool | no | Selection state |
| `hide` | bool | no | Hidden state |
| `groups` | VertexGroupElement[] | yes | Vertex group memberships with weights |
| `undeformed_co` | float[3] | yes | Original position when shape keys active |

```python
import bpy

mesh = bpy.context.object.data
for v in mesh.vertices:
    v.co.z += 0.1  # move all vertices up
```

### Edges (`mesh.edges`)

`MeshEdge` collection. Each edge has:

| Property | Type | RO | Description |
|---|---|---|---|
| `vertices` | int[2] | yes | Indices of the two endpoint vertices |
| `index` | int | yes | Index in the edges collection |
| `select` | bool | no | Selection state |
| `hide` | bool | no | Hidden state |
| `use_seam` | bool | no | UV seam flag |
| `use_sharp` | bool | no | Sharp edge flag |
| `use_edge_sharp` | bool | no | Alias for `use_sharp` |
| `crease` | float | no | Subdivision surface crease weight (0.0–1.0) |
| `is_loose` | bool | yes | Not connected to any face |
| `use_freestyle_mark` | bool | no | Freestyle edge mark |

### Polygons (`mesh.polygons`)

`MeshPolygon` collection. Each polygon has:

| Property | Type | RO | Description |
|---|---|---|---|
| `vertices` | int[] | yes | Vertex indices (read-only tuple) |
| `loop_start` | int | yes | Index of first loop in `mesh.loops` |
| `loop_total` | int | yes | Number of loops (corners) |
| `normal` | float[3] | yes | Face normal |
| `center` | float[3] | yes | Face center position |
| `area` | float | yes | Face area |
| `index` | int | yes | Index in the polygons collection |
| `material_index` | int | no | Assigned material slot index |
| `select` | bool | no | Selection state |
| `hide` | bool | no | Hidden state |
| `use_smooth` | bool | no | Smooth shading flag |
| `use_freestyle_face_mark` | bool | no | Freestyle face mark |

### Loops (`mesh.loops`)

`MeshLoop` collection. Loops represent per-face-vertex data (corners). Each polygon has `loop_total` loops starting at `loop_start`.

| Property | Type | RO | Description |
|---|---|---|---|
| `vertex_index` | int | yes | Vertex this loop references |
| `edge_index` | int | yes | Edge this loop follows |
| `normal` | float[3] | no | Loop normal (for custom normals) |
| `tangent` | float[3] | yes | Loop tangent (valid after `calc_tangents()`) |
| `bitangent` | float[3] | yes | Loop bitangent |
| `bitangent_sign` | float | yes | Bitangent sign for TBN |
| `index` | int | yes | Index in the loops collection |

### Corner Verts & Corner Edges (Modern Access)

`mesh.corner_verts` and `mesh.corner_edges` provide flat integer arrays for per-corner vertex and edge indices. These are the preferred way to access loop topology — faster and more direct than iterating `mesh.loops`.

```python
import bpy
import numpy as np

mesh = bpy.context.object.data

# Read corner vertex indices as numpy array
n = len(mesh.loops)
corner_verts = np.empty(n, dtype=np.int32)
mesh.corner_verts.foreach_get(corner_verts)

# Read corner edge indices
corner_edges = np.empty(n, dtype=np.int32)
mesh.corner_edges.foreach_get(corner_edges)

# These replace the older pattern:
# [loop.vertex_index for loop in mesh.loops]
# [loop.edge_index for loop in mesh.loops]
```

`corner_verts` and `corner_edges` are `bpy.types.IntAttributeValue` collections supporting `foreach_get` and `foreach_set`. They map 1:1 with `mesh.loops` — index `i` in `corner_verts` gives the vertex index for loop `i`.

## Attribute API

Meshes use a generic attribute system for storing per-element data. Access via `mesh.attributes`.

### Creating Attributes

```python
import bpy

mesh = bpy.context.object.data

# Create a float attribute on vertices
attr = mesh.attributes.new(name="my_weight", type='FLOAT', domain='POINT')

# Create a vector attribute on faces
attr_v = mesh.attributes.new(name="face_dir", type='FLOAT_VECTOR', domain='FACE')

# Create a boolean attribute on corners
attr_b = mesh.attributes.new(name="corner_flag", type='BOOLEAN', domain='CORNER')
```

### Type Enum

| Value | Description |
|---|---|
| `'FLOAT'` | Single float |
| `'INT'` | 32-bit integer |
| `'FLOAT_VECTOR'` | 3D float vector (3 floats) |
| `'FLOAT_COLOR'` | RGBA float color (4 floats, linear) |
| `'BYTE_COLOR'` | RGBA byte color (4 bytes, sRGB) |
| `'BOOLEAN'` | Boolean |
| `'STRING'` | String |
| `'FLOAT2'` | 2D float vector (2 floats) |
| `'INT8'` | 8-bit integer |
| `'INT32_2D'` | 2D integer vector (2 ints) |
| `'QUATERNION'` | Quaternion (4 floats) |

### Domain Enum

| Value | Description | Count |
|---|---|---|
| `'POINT'` | Per-vertex | `len(mesh.vertices)` |
| `'EDGE'` | Per-edge | `len(mesh.edges)` |
| `'FACE'` | Per-polygon | `len(mesh.polygons)` |
| `'CORNER'` | Per-loop | `len(mesh.loops)` |

The `'CURVE'` and `'INSTANCE'` domains also exist in the enum but are not valid for meshes — they are used by Curves and Geometry Nodes instance data respectively.

### Reading and Writing Attributes

```python
import bpy
import numpy as np

mesh = bpy.context.object.data
attr = mesh.attributes.get("my_weight")
if attr is None:
    attr = mesh.attributes.new("my_weight", 'FLOAT', 'POINT')

# Read via foreach_get
n = len(mesh.vertices)
values = np.empty(n, dtype=np.float32)
attr.data.foreach_get("value", values)

# Modify
values *= 2.0

# Write via foreach_set
attr.data.foreach_set("value", values)

# Must update mesh after changes
mesh.update()
```

Attribute data items expose different properties depending on type:

| Attribute Type | Data Property |
|---|---|
| `FLOAT` | `.value` (float) |
| `INT` | `.value` (int) |
| `FLOAT_VECTOR` | `.vector` (float[3]) |
| `FLOAT_COLOR` | `.color` (float[4]) |
| `BYTE_COLOR` | `.color` (byte[4] as float 0–1) |
| `BOOLEAN` | `.value` (bool) |
| `STRING` | `.value` (str) |
| `FLOAT2` | `.vector` (float[2]) |
| `QUATERNION` | `.value` (float[4]) |

### Managing Attributes

```python
mesh.attributes.remove(attr)           # Remove attribute
mesh.attributes.active = attr          # Set active attribute
mesh.attributes.active_color = attr    # Set active color attribute
mesh.attributes.render_color_index     # Index of render color attribute

# Check if attribute exists
if "my_weight" in mesh.attributes:
    pass

# Iterate all attributes
for attr in mesh.attributes:
    print(attr.name, attr.data_type, attr.domain)

# Attribute properties
attr.is_internal   # True if used internally by Blender
attr.is_required   # True if cannot be removed (e.g., "position")
```

## foreach_get / foreach_set

The fastest way to read/write mesh data in bulk. These methods transfer data between Blender's internal arrays and flat Python sequences (lists, numpy arrays).

```python
import bpy
import numpy as np

mesh = bpy.context.object.data
n = len(mesh.vertices)

# Read all vertex positions — flat array of n*3 floats
co = np.empty(n * 3, dtype=np.float32)
mesh.vertices.foreach_get("co", co)
co = co.reshape((n, 3))

# Modify: scale X by 2
co[:, 0] *= 2.0

# Write back — must be flat
mesh.vertices.foreach_set("co", co.ravel())
mesh.update()

# Read edge vertex pairs
ne = len(mesh.edges)
edge_verts = np.empty(ne * 2, dtype=np.int32)
mesh.edges.foreach_get("vertices", edge_verts)
edge_verts = edge_verts.reshape((ne, 2))

# Read polygon normals
nf = len(mesh.polygons)
normals = np.empty(nf * 3, dtype=np.float32)
mesh.polygons.foreach_get("normal", normals)
```

**Key rule:** The array must be flat. A `(n, 3)` numpy array won't work — use `.ravel()` or `.flatten()` or allocate as `n * 3`.

## Color Attributes

Color data is stored as mesh attributes. `mesh.color_attributes` provides a filtered view of color-type attributes.

```python
import bpy

mesh = bpy.context.object.data

# Create a vertex color layer
color_attr = mesh.color_attributes.new(
    name="MyColor",
    type='BYTE_COLOR',   # or 'FLOAT_COLOR' for linear HDR
    domain='CORNER'      # per-corner (most common) or 'POINT'
)

# Set all corners to red
for item in color_attr.data:
    item.color = (1.0, 0.0, 0.0, 1.0)

# Active color attribute (used by vertex paint)
mesh.color_attributes.active_color = color_attr

# Render color attribute (used by materials)
mesh.color_attributes.render_color_index = 0
```

## UV Maps

UV maps are corner-domain `FLOAT2` attributes. `mesh.uv_layers` provides access.

```python
import bpy
import numpy as np

mesh = bpy.context.object.data

# Create a UV map
uv_layer = mesh.uv_layers.new(name="MyUVMap")

# Access the active UV map
uv_layer = mesh.uv_layers.active

# Read UV coordinates (per-corner)
n = len(mesh.loops)
uvs = np.empty(n * 2, dtype=np.float32)
uv_layer.uv.foreach_get("vector", uvs)
uvs = uvs.reshape((n, 2))

# Write UV coordinates
uvs[:, 0] *= 0.5  # scale U
uv_layer.uv.foreach_set("vector", uvs.ravel())

# Pin and select flags
for uv_data in uv_layer.uv:
    uv_data.pin_uv = True
    uv_data.select = True
```

## Vertex Groups

Vertex groups store per-vertex weights for deformation, masking, and other uses. Vertex groups belong to the **Object**, not the Mesh, but weight data is stored per-vertex on the mesh.

```python
import bpy

obj = bpy.context.object

# Create a vertex group
vg = obj.vertex_groups.new(name="MyGroup")

# Add vertices with weights
# add(indices, weight, type) — type: 'REPLACE', 'ADD', 'SUBTRACT'
vg.add([0, 1, 2, 3], 1.0, 'REPLACE')

# Remove vertices from group
vg.remove([3])

# Read weight for a vertex
weight = vg.weight(0)  # raises RuntimeError if vertex not in group

# Iterate vertex group assignments on a vertex
mesh = obj.data
for g in mesh.vertices[0].groups:
    group_name = obj.vertex_groups[g.group].name
    print(f"{group_name}: {g.weight}")

# Active vertex group
obj.vertex_groups.active_index = vg.index

# Remove a vertex group
obj.vertex_groups.remove(vg)
```

## Shape Keys

Shape keys store alternate vertex positions for blend-shape animation.

```python
import bpy

obj = bpy.context.object
mesh = obj.data

# Add basis shape key (required first)
if mesh.shape_keys is None:
    obj.shape_key_add(name="Basis")

# Add a shape key
key = obj.shape_key_add(name="Smile")
key.value = 0.0  # blend value (0.0–1.0)

# Access shape key data (same length as mesh.vertices)
for i, sv in enumerate(key.data):
    sv.co = mesh.vertices[i].co.copy()
    sv.co.z += 0.1  # offset up

# Access all shape keys
shape_keys = mesh.shape_keys  # bpy.types.Key
for kb in shape_keys.key_blocks:
    print(kb.name, kb.value, kb.mute)

# Shape key properties
key.slider_min = -1.0
key.slider_max = 2.0
key.mute = False
key.relative_key = shape_keys.key_blocks["Basis"]

# Bulk read/write shape key vertex positions
import numpy as np
n = len(mesh.vertices)
coords = np.empty(n * 3, dtype=np.float32)
key.data.foreach_get("co", coords)
```

## Common Patterns

### Create a Mesh from Scratch

```python
import bpy

mesh = bpy.data.meshes.new("MyMesh")
obj = bpy.data.objects.new("MyObject", mesh)
bpy.context.collection.objects.link(obj)

# Define geometry
verts = [(0, 0, 0), (1, 0, 0), (1, 1, 0), (0, 1, 0)]
edges = []
faces = [(0, 1, 2, 3)]
mesh.from_pydata(verts, edges, faces)
mesh.update()
```

### High-Performance Vertex Read with NumPy

```python
import bpy
import numpy as np

mesh = bpy.context.object.data
n = len(mesh.vertices)

# Read positions
co = np.empty(n * 3, dtype=np.float32)
mesh.vertices.foreach_get("co", co)
positions = co.reshape((n, 3))

# Read selection state
sel = np.empty(n, dtype=bool)
mesh.vertices.foreach_get("select", sel)

# Get selected vertex positions
selected_pos = positions[sel]
```

### Copy Attributes Between Meshes

```python
import bpy
import numpy as np

src_mesh = bpy.data.meshes["Source"]
dst_mesh = bpy.data.meshes["Target"]

# Copy a vertex attribute
src_attr = src_mesh.attributes["my_weight"]
if "my_weight" not in dst_mesh.attributes:
    dst_mesh.attributes.new("my_weight", src_attr.data_type, src_attr.domain)
dst_attr = dst_mesh.attributes["my_weight"]

n = len(src_attr.data)
values = np.empty(n, dtype=np.float32)
src_attr.data.foreach_get("value", values)
dst_attr.data.foreach_set("value", values)
dst_mesh.update()
```

## Gotchas

1. **foreach_get/set requires flat arrays.** Passing a `(n, 3)` shaped numpy array silently fails or crashes. Always use `n * 3` size and reshape after reading, or `ravel()` before writing.

2. **mesh.update() after modifications.** Forgetting to call `mesh.update()` after changing geometry or attributes leaves normals, edges, and display state stale. Always call it after bulk writes.

3. **corner_verts vs loops.** `mesh.corner_verts` and `mesh.corner_edges` are flat integer arrays — they do not have `.vertex_index` or `.edge_index` properties. Access values via `foreach_get` or index directly: `mesh.corner_verts[i]`.

4. **Vertex groups are on Object, not Mesh.** `obj.vertex_groups` belongs to the Object. Multiple objects sharing a mesh have independent vertex group assignments. The weight data in `mesh.vertices[i].groups` corresponds to the active object's groups.

5. **Attribute name conflicts.** Built-in attributes like `position`, `normal`, `shade_smooth`, `material_index`, `sharp_edge`, `sharp_face`, `crease` are reserved. Creating attributes with these names will conflict or fail. Use the built-in accessors instead.

6. **foreach_get dtype matters.** Use `np.float32` for float properties (positions, normals), `np.int32` for integer properties (indices), and `bool` for boolean properties. Mismatched dtypes produce garbage values.

7. **Shape keys require Basis.** The first shape key must be the Basis (reference shape). Calling `shape_key_add()` on a mesh with no shape keys automatically creates the Basis with that name. Subsequent calls create blend shapes relative to the Basis.
