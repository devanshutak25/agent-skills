# BMesh

The `bmesh` module provides a full-featured mesh editing API. Unlike `bpy.types.Mesh` (which is compact, array-based storage — see [mesh-data](mesh-data.md)), BMesh is an edit-mesh representation with explicit vertex/edge/face/loop connectivity — designed for mesh manipulation, topology edits, and procedural generation. BMesh is used internally by Edit Mode.

## Creating and Converting

### bmesh.new

Create a standalone empty BMesh:

```python
import bmesh

bm = bmesh.new(use_operators=True)
# ... build or manipulate geometry ...
bm.free()  # always free when done
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `use_operators` | bool | True | Enable `bmesh.ops` support (uses extra memory per element) |

### from_mesh / to_mesh

Convert between `bpy.types.Mesh` and BMesh in Object Mode:

```python
import bpy
import bmesh

obj = bpy.context.object
mesh = obj.data

# Load mesh data into BMesh
bm = bmesh.new()
bm.from_mesh(mesh)

# ... edit geometry ...

# Write back to mesh
bm.to_mesh(mesh)
mesh.update()
bm.free()
```

`from_mesh` signature:

```python
bm.from_mesh(mesh, face_normals=True, vertex_normals=True,
             use_shape_key=False, shape_key_index=0)
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `mesh` | Mesh | required | Source mesh data-block |
| `face_normals` | bool | True | Load face normals |
| `vertex_normals` | bool | True | Load vertex normals |
| `use_shape_key` | bool | False | Load shape key data |
| `shape_key_index` | int | 0 | Which shape key to load |

### from_edit_mesh / update_edit_mesh

For Edit Mode — the BMesh is shared with Blender's edit state:

```python
import bpy
import bmesh

obj = bpy.context.edit_object
bm = bmesh.from_edit_mesh(obj.data)

# ... edit geometry ...

# Update the edit mesh display (do NOT call bm.free() here)
bmesh.update_edit_mesh(obj.data)
```

**Do not call `bm.free()`** on a BMesh obtained from `from_edit_mesh` — Blender owns it. Call `bmesh.update_edit_mesh(mesh)` to push changes to the viewport.

`update_edit_mesh` signature:

```python
bmesh.update_edit_mesh(mesh, loop_triangles=True, destructive=True)
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `mesh` | Mesh | required | The edit-mode mesh |
| `loop_triangles` | bool | True | Recalculate n-gon tessellation |
| `destructive` | bool | True | Set True when geometry was added or removed |

### from_object

Load an evaluated (post-modifier) mesh into BMesh:

```python
import bpy
import bmesh

depsgraph = bpy.context.evaluated_depsgraph_get()
bm = bmesh.new()
bm.from_object(bpy.context.object, depsgraph)
# bm now contains the modifier-applied mesh
bm.free()
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `object` | Object | required | Mesh object to read from |
| `depsgraph` | Depsgraph | required | Evaluated depsgraph |
| `cage` | bool | False | Use cage mesh (before last modifier) |
| `face_normals` | bool | True | Load face normals |
| `vertex_normals` | bool | True | Load vertex normals |

### bm.clear / bm.free

```python
bm.clear()  # Remove all geometry, keep BMesh alive
bm.free()   # Release all memory — BMesh is unusable after this
```

Additional BMesh methods:

| Method | Returns | Description |
|---|---|---|
| `bm.copy()` | BMesh | Deep copy of the BMesh |
| `bm.normal_update()` | None | Recalculate all normals |
| `bm.calc_volume(signed=False)` | float | Mesh volume (closed meshes only) |
| `bm.calc_loop_triangles()` | list | Triangulated loops as `(BMLoop, BMLoop, BMLoop)` tuples |
| `bm.transform(matrix, filter=None)` | None | Transform all verts by a 4x4 matrix |

## BMesh Elements

### BMVert

| Property/Method | Type | RO | Description |
|---|---|---|---|
| `co` | Vector | no | Vertex position |
| `normal` | Vector | yes | Vertex normal |
| `index` | int | no | Index (valid after `ensure_lookup_table` or `index_update`) |
| `select` | bool | no | Selection state |
| `hide` | bool | no | Hidden state |
| `tag` | bool | no | Temporary tag for algorithms |
| `is_boundary` | bool | yes | On a boundary edge |
| `is_wire` | bool | yes | Connected only to wire edges (no faces) |
| `is_manifold` | bool | yes | On a manifold edge boundary |
| `is_valid` | bool | yes | Element has not been removed |
| `link_edges` | BMElemSeq | yes | Connected edges |
| `link_faces` | BMElemSeq | yes | Connected faces |
| `link_loops` | BMElemSeq | yes | Connected loops |

```python
v = bm.verts.new((1.0, 2.0, 3.0))
v.co.z += 1.0
```

### BMEdge

| Property/Method | Type | RO | Description |
|---|---|---|---|
| `verts` | (BMVert, BMVert) | yes | Endpoint vertices |
| `index` | int | no | Index |
| `select` | bool | no | Selection state |
| `hide` | bool | no | Hidden state |
| `tag` | bool | no | Temporary tag |
| `is_boundary` | bool | yes | Borders exactly one face |
| `is_wire` | bool | yes | No connected faces |
| `is_contiguous` | bool | yes | Adjacent faces share same winding |
| `is_convex` | bool | yes | Angle between faces < 180° |
| `is_manifold` | bool | yes | Exactly two connected faces |
| `seam` | bool | no | UV seam flag |
| `smooth` | bool | no | Smooth shading flag |
| `link_faces` | BMElemSeq | yes | Connected faces |
| `link_loops` | BMElemSeq | yes | Connected loops |
| `calc_length()` | float | — | Edge length |
| `calc_face_angle(fallback=None)` | float | — | Angle between connected faces |
| `calc_face_angle_signed(fallback=None)` | float | — | Signed angle between faces |
| `other_vert(vert)` | BMVert | — | Other endpoint given one vertex |

```python
e = bm.edges.new((v1, v2))
length = e.calc_length()
```

### BMFace

| Property/Method | Type | RO | Description |
|---|---|---|---|
| `verts` | BMElemSeq | yes | Ordered face vertices |
| `edges` | BMElemSeq | yes | Ordered face edges |
| `loops` | BMElemSeq | yes | Face loops (corners) |
| `normal` | Vector | yes | Face normal |
| `material_index` | int | no | Material slot index |
| `index` | int | no | Index |
| `select` | bool | no | Selection state |
| `hide` | bool | no | Hidden state |
| `tag` | bool | no | Temporary tag |
| `smooth` | bool | no | Smooth shading |
| `calc_area()` | float | — | Face area |
| `calc_center_median()` | Vector | — | Center (average of vertices) |
| `calc_center_bounds()` | Vector | — | Center (bounding box center) |
| `calc_perimeter()` | float | — | Sum of edge lengths |
| `calc_tangent_edge()` | Vector | — | Tangent from longest edge |
| `calc_tangent_edge_pair()` | Vector | — | Tangent from edge pair |
| `calc_tangent_edge_diagonal()` | Vector | — | Tangent from diagonal |
| `calc_tangent_vert_diagonal()` | Vector | — | Tangent from vertex diagonal |

```python
f = bm.faces.new((v1, v2, v3, v4))
area = f.calc_area()
center = f.calc_center_median()
```

### BMLoop

Loops represent per-face-vertex corners. Each face has one loop per vertex, forming a cycle.

| Property/Method | Type | RO | Description |
|---|---|---|---|
| `vert` | BMVert | yes | The vertex at this corner |
| `edge` | BMEdge | yes | The outgoing edge |
| `face` | BMFace | yes | The owning face |
| `index` | int | no | Index |
| `tag` | bool | no | Temporary tag |
| `is_convex` | bool | yes | Corner angle < 180° |
| `link_loop_next` | BMLoop | yes | Next loop in face |
| `link_loop_prev` | BMLoop | yes | Previous loop in face |
| `link_loop_radial_next` | BMLoop | yes | Next loop around same edge |
| `link_loop_radial_prev` | BMLoop | yes | Previous loop around same edge |
| `calc_angle()` | float | — | Angle at this corner |
| `calc_normal()` | Vector | — | Normal at this corner |
| `calc_tangent()` | Vector | — | Tangent at this corner |

```python
for loop in face.loops:
    print(f"Vertex {loop.vert.index}, edge to {loop.edge.other_vert(loop.vert).index}")
```

## ensure_lookup_table

After adding or removing elements, index-based access (`bm.verts[i]`) requires lookup tables. Call `ensure_lookup_table()` to build them:

```python
bm.verts.ensure_lookup_table()
bm.edges.ensure_lookup_table()
bm.faces.ensure_lookup_table()

v = bm.verts[0]  # now safe
```

Lookup tables are invalidated by any topology change (adding/removing elements). Re-call after modifications. Iteration (`for v in bm.verts`) works without lookup tables.

Alternatively, call `bm.verts.index_update()` to update `.index` properties on all elements (useful when you need correct indices for export but don't need random access).

## Layers System

BMesh stores per-element custom data in layers. Access layers through `bm.verts.layers`, `bm.edges.layers`, `bm.faces.layers`, and `bm.loops.layers`.

### Available Layer Types

| Collection | Layer Types |
|---|---|
| `bm.verts.layers` | `deform`, `float`, `int`, `string`, `bool`, `shape`, `skin`, `color`, `float_color`, `float_vector` |
| `bm.edges.layers` | `float`, `int`, `string`, `bool`, `freestyle`, `color`, `float_color`, `float_vector` |
| `bm.faces.layers` | `float`, `int`, `string`, `bool`, `freestyle`, `color`, `float_color`, `float_vector` |
| `bm.loops.layers` | `uv`, `color`, `float_color`, `float_vector`, `float`, `int`, `string`, `bool` |

**Removed dedicated layer types (now generic float attributes):**
- `bevel_weight` on verts/edges → use `bm.verts.layers.float["bevel_weight_vert"]` / `bm.edges.layers.float["bevel_weight_edge"]`
- `crease` on edges → use `bm.edges.layers.float["crease_edge"]`
- `face_map` on faces → converted to integer attribute
- `paint_mask` on verts → use generic float layer

### Working with Layers

```python
import bpy
import bmesh

obj = bpy.context.object
bm = bmesh.new()
bm.from_mesh(obj.data)

# Access UV layer
uv_layer = bm.loops.layers.uv.active
if uv_layer is None:
    uv_layer = bm.loops.layers.uv.new("UVMap")

# Read/write UVs
for face in bm.faces:
    for loop in face.loops:
        uv = loop[uv_layer]
        print(f"UV: {uv.uv}")    # MLoopUV — .uv is a Vector
        uv.uv.x *= 0.5           # modify U

# Access vertex deform (vertex groups)
deform_layer = bm.verts.layers.deform.active
if deform_layer:
    for v in bm.verts:
        groups = v[deform_layer]   # dict-like: {group_index: weight}
        groups[0] = 1.0            # set weight for group 0

# Access color layer
color_layer = bm.loops.layers.color.active
if color_layer is None:
    color_layer = bm.loops.layers.color.new("Color")

for face in bm.faces:
    for loop in face.loops:
        loop[color_layer] = (1.0, 0.0, 0.0, 1.0)  # RGBA

# Create custom float layer on vertices
my_layer = bm.verts.layers.float.new("my_data")
for v in bm.verts:
    v[my_layer] = v.co.z  # store Z height

bm.to_mesh(obj.data)
obj.data.update()
bm.free()
```

### Shape Key Layers

```python
# Access shape keys through layers
shape_layer = bm.verts.layers.shape.get("Key 1")
if shape_layer:
    for v in bm.verts:
        shape_co = v[shape_layer]  # Vector — shape key position
        print(shape_co)
```

## Key bmesh.ops

`bmesh.ops` provides mesh operations that work directly on BMesh data. They accept a BMesh and named parameters, and return result dicts.

### Geometry Creation

```python
import bmesh

bm = bmesh.new()

# Create primitives
ret = bmesh.ops.create_grid(bm, x_segments=4, y_segments=4, size=1.0)
# ret["verts"] — list of created BMVerts

ret = bmesh.ops.create_cube(bm, size=1.0)

ret = bmesh.ops.create_circle(bm, cap_ends=True, segments=32, radius=1.0)

ret = bmesh.ops.create_cone(bm, cap_ends=True, segments=32,
                             radius1=1.0, radius2=0.0, depth=2.0)

ret = bmesh.ops.create_icosphere(bm, subdivisions=3, radius=1.0)

ret = bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=16, radius=1.0)

ret = bmesh.ops.create_monkey(bm)

bm.free()
```

### Extrusion

```python
# Extrude faces along normals
ret = bmesh.ops.extrude_face_region(bm, geom=selected_faces)
# ret["geom"] — all new geometry (verts, edges, faces)
# Filter new verts for translation
new_verts = [e for e in ret["geom"] if isinstance(e, bmesh.types.BMVert)]
bmesh.ops.translate(bm, vec=(0, 0, 1), verts=new_verts)

# Extrude edges only
ret = bmesh.ops.extrude_edge_only(bm, edges=edge_list)

# Extrude individual vertices
ret = bmesh.ops.extrude_vert_indiv(bm, verts=vert_list)
```

### Subdivision

```python
ret = bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=2,
                                 use_grid_fill=True, use_single_edge=False)
# ret["geom_inner"] — inner elements
# ret["geom_split"] — split elements
```

### Dissolution and Deletion

```python
# Dissolve faces (merge into surrounding)
bmesh.ops.dissolve_faces(bm, faces=face_list)

# Dissolve edges
bmesh.ops.dissolve_edges(bm, edges=edge_list)

# Dissolve vertices
bmesh.ops.dissolve_verts(bm, verts=vert_list)

# Delete geometry — del_context: 'VERTS', 'EDGES', 'FACES_ONLY', 'FACES'
bmesh.ops.delete(bm, geom=elements, context='FACES')
```

### Transforms

```python
import mathutils

# Translate
bmesh.ops.translate(bm, vec=(1, 0, 0), verts=bm.verts[:])

# Rotate
bmesh.ops.rotate(bm, cent=(0, 0, 0),
                  matrix=mathutils.Matrix.Rotation(0.5, 3, 'Z'),
                  verts=bm.verts[:])

# Scale
bmesh.ops.scale(bm, vec=(2, 2, 2), verts=bm.verts[:])

# General transform
bmesh.ops.transform(bm, matrix=some_4x4_matrix, verts=bm.verts[:])
```

### Boolean / Topology

```python
# Triangulate
ret = bmesh.ops.triangulate(bm, faces=bm.faces[:],
                             quad_method='BEAUTY', ngon_method='BEAUTY')

# Convex hull
ret = bmesh.ops.convex_hull(bm, input=bm.verts[:])
# ret["geom"] — hull geometry

# Bridge edge loops
ret = bmesh.ops.bridge_loops(bm, edges=loop_edges)

# Fill holes
ret = bmesh.ops.holes_fill(bm, edges=boundary_edges, sides=4)

# Recalculate normals
bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])

# Beautify fill (improve triangle quality)
bmesh.ops.beautify_fill(bm, faces=bm.faces[:], edges=bm.edges[:])

# Join triangles back into quads
bmesh.ops.join_triangles(bm, faces=bm.faces[:],
                          angle_face_threshold=0.7,
                          angle_shape_threshold=0.7)
```

### Inset and Spin

```python
# Inset faces (individual)
ret = bmesh.ops.inset_individual(bm, faces=face_list, thickness=0.1,
                                  depth=0.0, use_even_offset=True)

# Inset region
ret = bmesh.ops.inset_region(bm, faces=face_list, thickness=0.1,
                              depth=0.0, use_even_offset=True,
                              use_boundary=True)

# Spin (lathe)
ret = bmesh.ops.spin(bm, geom=geom_list, cent=(0, 0, 0),
                      axis=(0, 0, 1), angle=3.14159, steps=16)
```

### Mirror and Duplicate

```python
# Mirror geometry
ret = bmesh.ops.mirror(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:],
                        matrix=mathutils.Matrix.Identity(4),
                        merge_dist=0.001, axis='X')

# Duplicate geometry
ret = bmesh.ops.duplicate(bm, geom=selected_geom)
# ret["geom"] — duplicated elements

# Split — like duplicate but removes from original
ret = bmesh.ops.split(bm, geom=selected_geom)
```

### Merging

```python
# Remove doubles (two-step: find, then weld)
ret = bmesh.ops.find_doubles(bm, verts=bm.verts[:], dist=0.0001)
bmesh.ops.weld_verts(bm, targetmap=ret["targetmap"])

# Merge vertices at a point
bmesh.ops.pointmerge(bm, verts=vert_list, merge_co=(0, 0, 0))

# Collapse edges (merge edge endpoints)
bmesh.ops.collapse(bm, edges=edge_list, uvs=False)

# Convenience: remove_doubles combines find_doubles + weld_verts
bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=0.0001)
```

### Bisect

```python
# Cut mesh with a plane
ret = bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:],
                              plane_co=(0, 0, 0), plane_no=(0, 0, 1),
                              clear_inner=True, clear_outer=False)
# ret["geom_cut"] — edges/verts on the cut line
```

### Smooth

```python
# Smooth vertex positions
bmesh.ops.smooth_vert(bm, verts=bm.verts[:], factor=0.5,
                       use_axis_x=True, use_axis_y=True, use_axis_z=True)
```

## Selection

### select_flush

Propagate selection state from one element type to connected elements:

```python
# After selecting vertices, update edge/face selection
bm.select_flush(True)   # flush selection UP (verts → edges → faces)
bm.select_flush(False)  # flush deselection DOWN

# Match current select mode behavior
bm.select_flush_mode()
```

### Manual Selection

```python
# Select specific elements
for v in bm.verts:
    v.select = (v.co.z > 0)

# Deselect all
for v in bm.verts:
    v.select = False
for e in bm.edges:
    e.select = False
for f in bm.faces:
    f.select = False

# Select face and flush to verts/edges
face = bm.faces[0]
face.select = True
bm.select_flush(True)
```

## Common Patterns

### Procedural Mesh Generation

```python
import bpy
import bmesh
import math

bm = bmesh.new()

# Create a torus manually
major_r = 1.0
minor_r = 0.3
major_segs = 32
minor_segs = 16

verts = []
for i in range(major_segs):
    theta = 2 * math.pi * i / major_segs
    cx = major_r * math.cos(theta)
    cy = major_r * math.sin(theta)
    ring = []
    for j in range(minor_segs):
        phi = 2 * math.pi * j / minor_segs
        x = cx + minor_r * math.cos(phi) * math.cos(theta)
        y = cy + minor_r * math.cos(phi) * math.sin(theta)
        z = minor_r * math.sin(phi)
        ring.append(bm.verts.new((x, y, z)))
    verts.append(ring)

bm.verts.ensure_lookup_table()

# Create faces connecting rings
for i in range(major_segs):
    ni = (i + 1) % major_segs
    for j in range(minor_segs):
        nj = (j + 1) % minor_segs
        bm.faces.new((verts[i][j], verts[ni][j], verts[ni][nj], verts[i][nj]))

# Write to mesh
mesh = bpy.data.meshes.new("Torus")
bm.to_mesh(mesh)
bm.free()

obj = bpy.data.objects.new("Torus", mesh)
bpy.context.collection.objects.link(obj)
```

### Edit Mode Geometry Manipulation

```python
import bpy
import bmesh

obj = bpy.context.edit_object
bm = bmesh.from_edit_mesh(obj.data)

# Select faces with area > threshold
for face in bm.faces:
    face.select = face.calc_area() > 0.5

bm.select_flush(True)
bmesh.update_edit_mesh(obj.data)
```

### Remove Doubles and Clean Mesh

```python
import bpy
import bmesh

obj = bpy.context.object
bm = bmesh.new()
bm.from_mesh(obj.data)

# Remove doubles
ret = bmesh.ops.find_doubles(bm, verts=bm.verts[:], dist=0.0001)
bmesh.ops.weld_verts(bm, targetmap=ret["targetmap"])

# Recalculate normals
bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])

bm.to_mesh(obj.data)
obj.data.update()
bm.free()
```

### Copy BMesh to New Object

```python
import bpy
import bmesh

# Get evaluated mesh as BMesh
depsgraph = bpy.context.evaluated_depsgraph_get()
obj_eval = bpy.context.object.evaluated_get(depsgraph)

bm = bmesh.new()
bm.from_mesh(obj_eval.data)

# Create a new mesh from the BMesh
new_mesh = bpy.data.meshes.new("CopyMesh")
bm.to_mesh(new_mesh)
bm.free()

new_obj = bpy.data.objects.new("Copy", new_mesh)
bpy.context.collection.objects.link(new_obj)
```

## Gotchas

1. **Always call bm.free() for standalone BMesh.** BMesh allocates significant memory. Forgetting `bm.free()` causes memory leaks. Use try/finally or context patterns. Do NOT free a BMesh from `from_edit_mesh` — Blender owns it.

2. **ensure_lookup_table() after topology changes.** Index access `bm.verts[i]` crashes or returns wrong data without current lookup tables. Any add/remove invalidates them. Re-call after every topology modification.

3. **to_mesh does not call mesh.update().** After `bm.to_mesh(mesh)`, you must call `mesh.update()` separately to recalculate normals and edge data.

4. **bmesh.ops return dicts, not modified geometry.** Operation results contain the affected/created geometry in dict keys like `"geom"`, `"verts"`, `"faces"`. Check the specific operation's return keys.

5. **Element references invalidated by topology ops.** After `bmesh.ops.delete()`, `dissolve_*`, or similar operations, previously stored `BMVert`/`BMEdge`/`BMFace` references may be invalid. Check `.is_valid` or re-query.

6. **from_edit_mesh shares state.** The BMesh from `from_edit_mesh` IS the edit mesh. Changes affect the live edit state. Call `bmesh.update_edit_mesh(mesh)` to refresh the viewport, not `bm.to_mesh()`.

7. **Layer access requires active layer.** `bm.loops.layers.uv.active` returns `None` if no UV map exists. Always check for `None` before using, or create a new layer with `.new("name")`.

8. **select_flush direction matters.** `select_flush(True)` selects edges/faces only if ALL their vertices are selected. `select_flush(False)` deselects vertices only if ALL their faces are deselected. Use `select_flush_mode()` to match the current UI select mode behavior.
