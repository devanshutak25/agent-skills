# Mathutils Spatial Data Structures

Spatial query structures for nearest-point and ray-cast lookups: KDTree and BVHTree. Also includes the noise module for procedural generation. For core math types see [mathutils](mathutils.md). For geometry functions see [mathutils-geometry](mathutils-geometry.md).

## KDTree

`mathutils.kdtree.KDTree` provides fast nearest-neighbor queries for point clouds.

### Build a KDTree

```python
from mathutils.kdtree import KDTree
import bpy

obj = bpy.context.active_object
mesh = obj.data

# Create tree with known size
tree = KDTree(len(mesh.vertices))

# Insert all points
for i, v in enumerate(mesh.vertices):
    tree.insert(v.co, i)

# MUST call balance before querying
tree.balance()
```

### KDTree Queries

```python
from mathutils import Vector

# Find single nearest point
co, index, dist = tree.find(Vector((1, 0, 0)))
# co: closest point (Vector)
# index: index passed during insert
# dist: distance to the point

# Find N nearest points
results = tree.find_n(Vector((1, 0, 0)), 5)
# Returns: [(co, index, dist), ...]  sorted by distance

# Find all points within radius
results = tree.find_range(Vector((1, 0, 0)), 2.0)
# Returns: [(co, index, dist), ...]  unsorted
```

### KDTree API Reference

| Method | Signature | Returns |
|---|---|---|
| `KDTree(size)` | Constructor | KDTree |
| `insert` | `(co, index)` | None |
| `balance` | `()` | None |
| `find` | `(co, filter=None)` | `(Vector, int, float)` |
| `find_n` | `(co, n)` | `list[(Vector, int, float)]` |
| `find_range` | `(co, radius)` | `list[(Vector, int, float)]` |

### KDTree with Filter

```python
from mathutils.kdtree import KDTree
from mathutils import Vector

tree = KDTree(100)
for i in range(100):
    tree.insert(Vector((i, 0, 0)), i)
tree.balance()

# Filter function receives index, returns True to include
co, index, dist = tree.find(Vector((50, 0, 0)), filter=lambda i: i % 2 == 0)
# Returns nearest even-indexed point
```

## BVHTree

`mathutils.bvhtree.BVHTree` provides spatial queries on mesh geometry: ray casting, nearest surface point, and overlap testing.

### Building from Different Sources

```python
from mathutils.bvhtree import BVHTree
import bpy
import bmesh

# From a Blender object (uses evaluated mesh)
obj = bpy.context.active_object
depsgraph = bpy.context.evaluated_depsgraph_get()
tree = BVHTree.FromObject(
    obj,
    depsgraph,
    deform=True,     # apply deform modifiers
    render=False,    # use render settings
    cage=False,      # use cage mesh
    epsilon=0.0      # tolerance
)

# From a BMesh
bm = bmesh.new()
bm.from_mesh(obj.data)
tree = BVHTree.FromBMesh(
    bm,
    epsilon=0.0
)
bm.free()

# From raw polygon data
vertices = [(0, 0, 0), (1, 0, 0), (1, 1, 0), (0, 1, 0)]
polygons = [(0, 1, 2, 3)]
tree = BVHTree.FromPolygons(
    vertices,
    polygons,
    all_triangles=False,   # True if all faces are triangles
    epsilon=0.0
)
```

### Ray Cast

```python
from mathutils import Vector

# Cast a ray
location, normal, index, distance = tree.ray_cast(
    origin=Vector((0, 0, 5)),
    direction=Vector((0, 0, -1)),
    distance=100.0    # max distance (default: sys.float_info.max)
)
# Returns (None, None, None, None) if no hit
# location: hit point (Vector)
# normal: face normal at hit (Vector)
# index: polygon index (int)
# distance: distance from origin (float)
```

### Find Nearest Surface Point

```python
from mathutils import Vector

# Find closest point on surface
location, normal, index, distance = tree.find_nearest(
    origin=Vector((0.5, 0.5, 2.0)),
    distance=100.0    # max search distance
)
# Same return pattern as ray_cast
```

### Find Nearest Range

```python
from mathutils import Vector

# Find all surface points within distance
results = tree.find_nearest_range(
    origin=Vector((0, 0, 0)),
    distance=5.0
)
# Returns: [(location, normal, index, distance), ...]
```

### Overlap Test (Two Trees)

```python
from mathutils.bvhtree import BVHTree

tree_a = BVHTree.FromObject(obj_a, depsgraph)
tree_b = BVHTree.FromObject(obj_b, depsgraph)

# Find overlapping face pairs
overlaps = tree_a.overlap(tree_b)
# Returns: [(index_a, index_b), ...]
# Each tuple is a pair of overlapping polygon indices
```

### BVHTree API Reference

| Method | Signature | Returns |
|---|---|---|
| `FromObject` | `(obj, depsgraph, deform=True, render=False, cage=False, epsilon=0.0)` | BVHTree |
| `FromBMesh` | `(bm, epsilon=0.0)` | BVHTree |
| `FromPolygons` | `(vertices, polygons, all_triangles=False, epsilon=0.0)` | BVHTree |
| `ray_cast` | `(origin, direction, distance=max)` | `(Vector, Vector, int, float)` or all `None` |
| `find_nearest` | `(origin, distance=max)` | `(Vector, Vector, int, float)` or all `None` |
| `find_nearest_range` | `(origin, distance)` | `list[(Vector, Vector, int, float)]` |
| `overlap` | `(other_tree)` | `list[(int, int)]` |

## Noise Module

`mathutils.noise` provides procedural noise functions.

```python
from mathutils.noise import (
    random, random_unit_vector, seed_set,
    noise, turbulence, fractal,
    cell, cell_vector
)
from mathutils import Vector

# Set random seed
seed_set(42)

# Random float [0, 1)
val = random()

# Random unit vector
v = random_unit_vector(size=3)  # 2, 3, or 4
```

### Noise Functions

```python
from mathutils.noise import noise, turbulence
from mathutils import Vector

pos = Vector((1.0, 2.0, 3.0))

# Basic noise
val = noise(pos, noise_basis='PERLIN_ORIGINAL')

# Turbulence (accumulated octaves)
val = turbulence(
    pos,
    octaves=4,
    hard=False,           # True for ridged/abs noise
    noise_basis='PERLIN_ORIGINAL',
    amplitude_scale=0.5,
    frequency_scale=2.0
)
```

### Noise Basis Types

| Basis | Description |
|---|---|
| `'PERLIN_ORIGINAL'` | Classic Perlin noise |
| `'PERLIN_NEW'` | Improved Perlin noise |
| `'VORONOI_F1'` | Voronoi — closest point |
| `'VORONOI_F2'` | Voronoi — second closest |
| `'VORONOI_F3'` | Voronoi — third closest |
| `'VORONOI_F4'` | Voronoi — fourth closest |
| `'VORONOI_F2F1'` | Voronoi F2 - F1 |
| `'VORONOI_CRACKLE'` | Voronoi crackle |
| `'CELLNOISE'` | Cell/grid noise |
| `'BLENDER'` | Blender's original noise |

### Fractal Noise

```python
from mathutils.noise import fractal, hetero_terrain, hybrid_multi_fractal
from mathutils import Vector

pos = Vector((1, 2, 3))

# fBm fractal
val = fractal(pos, H=1.0, lacunarity=2.0, octaves=4,
              noise_basis='PERLIN_ORIGINAL')

# Heterogeneous terrain
val = hetero_terrain(pos, H=1.0, lacunarity=2.0, octaves=4,
                     offset=1.0, noise_basis='PERLIN_ORIGINAL')

# Hybrid multifractal
val = hybrid_multi_fractal(pos, H=1.0, lacunarity=2.0, octaves=4,
                           offset=1.0, gain=1.0,
                           noise_basis='PERLIN_ORIGINAL')
```

### Cell Noise

```python
from mathutils.noise import cell, cell_vector
from mathutils import Vector

pos = Vector((1.5, 2.5, 3.5))

# Scalar cell noise
val = cell(pos)

# Vector cell noise
vec = cell_vector(pos)  # returns Vector
```

## Common Patterns

### Find Closest Vertex to a Point

```python
import bpy
from mathutils.kdtree import KDTree
from mathutils import Vector

obj = bpy.context.active_object
mesh = obj.data

tree = KDTree(len(mesh.vertices))
for i, v in enumerate(mesh.vertices):
    tree.insert(obj.matrix_world @ v.co, i)
tree.balance()

# Query in world space
target = Vector((5, 0, 0))
co, index, dist = tree.find(target)
print(f"Nearest vertex {index} at distance {dist:.3f}")
```

### Raycast from Camera Through Mouse

```python
import bpy
from mathutils.bvhtree import BVHTree
from bpy_extras.view3d_utils import region_2d_to_origin_3d, region_2d_to_vector_3d

def raycast_mouse(context, event):
    depsgraph = context.evaluated_depsgraph_get()
    obj = context.active_object
    tree = BVHTree.FromObject(obj, depsgraph)

    region = context.region
    rv3d = context.region_data
    coord = (event.mouse_region_x, event.mouse_region_y)

    origin = region_2d_to_origin_3d(region, rv3d, coord)
    direction = region_2d_to_vector_3d(region, rv3d, coord)

    # Transform to object space
    mat_inv = obj.matrix_world.inverted()
    origin_local = mat_inv @ origin
    direction_local = (mat_inv.to_3x3() @ direction).normalized()

    location, normal, index, distance = tree.ray_cast(origin_local, direction_local)
    return location, normal, index
```

### Collision Detection Between Objects

```python
import bpy
from mathutils.bvhtree import BVHTree

depsgraph = bpy.context.evaluated_depsgraph_get()
obj_a = bpy.data.objects["Cube"]
obj_b = bpy.data.objects["Sphere"]

tree_a = BVHTree.FromObject(obj_a, depsgraph)
tree_b = BVHTree.FromObject(obj_b, depsgraph)

overlaps = tree_a.overlap(tree_b)
if overlaps:
    print(f"Collision detected: {len(overlaps)} overlapping face pairs")
```

## Gotchas

1. **Must call `balance()` before KDTree queries.** Forgetting `balance()` after inserting points gives wrong results or crashes. Always insert all points, then balance, then query.

2. **BVHTree.FromObject uses world space.** `FromObject` returns a tree in the object's world space. Ray origins and directions must be in world space, or transform them to object-local space if building from `FromBMesh`/`FromPolygons`.

3. **`ray_cast` returns all-`None` tuple on miss.** Check `if location is not None:` rather than `if result:` since the return is always a 4-tuple.

4. **KDTree size is a hint.** The `size` parameter in `KDTree(size)` is a pre-allocation hint. You can insert fewer or more points than `size`, but performance is best when it matches.

5. **Noise functions return scene-linear values.** For visual use, noise values may need remapping. Most functions return values in roughly [-1, 1] or [0, 1] depending on the basis type.

6. **BVHTree from evaluated mesh.** Always use `FromObject` with a depsgraph to include modifiers. `FromBMesh` or `FromPolygons` use raw data without modifiers unless you evaluate first.
