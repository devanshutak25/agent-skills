# Mathutils Geometry

Geometric computation functions for intersection tests, projections, and 2D utilities. For core math types see [mathutils](mathutils.md). For spatial data structures see [mathutils-spatial](mathutils-spatial.md).

## Intersection Functions

### Line-Line Intersection

```python
from mathutils.geometry import intersect_line_line

# 3D line-line closest points
# Returns (point_on_line1, point_on_line2) or None if parallel
p1, p2 = intersect_line_line(
    v1, v2,   # line 1: from v1 to v2
    v3, v4    # line 2: from v3 to v4
)
# p1 is closest point on line 1 to line 2
# p2 is closest point on line 2 to line 1
```

### Line-Line 2D Intersection

```python
from mathutils.geometry import intersect_line_line_2d

# Returns intersection Vector or None
point = intersect_line_line_2d(
    v1, v2,   # line segment 1
    v3, v4    # line segment 2
)
```

### Ray-Triangle Intersection

```python
from mathutils.geometry import intersect_ray_tri

# Returns intersection point or None
point = intersect_ray_tri(
    v1, v2, v3,        # triangle vertices
    ray_origin,         # ray start point
    ray_direction,      # ray direction
    clip=True           # True: segment only, False: infinite ray
)
```

### Line-Plane Intersection

```python
from mathutils.geometry import intersect_line_plane

# Returns intersection Vector or None (parallel)
point = intersect_line_plane(
    line_a, line_b,     # line endpoints
    plane_co,           # point on plane
    plane_no,           # plane normal
    no_flip=False       # don't flip normal to face the line
)
```

### Plane-Plane Intersection

```python
from mathutils.geometry import intersect_plane_plane

# Returns (point_on_line, direction) or (None, None) if parallel
point, direction = intersect_plane_plane(
    plane_a_co, plane_a_no,   # plane A: point + normal
    plane_b_co, plane_b_no    # plane B: point + normal
)
```

### Line-Sphere Intersection

```python
from mathutils.geometry import intersect_line_sphere

# Returns (point1, point2) — either or both may be None
p1, p2 = intersect_line_sphere(
    line_a, line_b,     # line endpoints
    sphere_co,          # sphere center
    sphere_radius,      # sphere radius
    clip=True           # clip to segment
)
```

```python
from mathutils.geometry import intersect_line_sphere_2d

# 2D variant
p1, p2 = intersect_line_sphere_2d(
    line_a, line_b,
    sphere_co, sphere_radius,
    clip=True
)
```

### Point-in-Triangle Test

```python
from mathutils.geometry import intersect_point_tri, intersect_point_tri_2d

# 3D — returns intersection point or None
point = intersect_point_tri(pt, tri_v1, tri_v2, tri_v3)

# 2D — returns intersection point or None
point = intersect_point_tri_2d(pt, tri_v1, tri_v2, tri_v3)
```

### Point-in-Quad Test (2D)

```python
from mathutils.geometry import intersect_point_quad_2d

# Returns 1 (inside), 0 (outside), or edge index
result = intersect_point_quad_2d(pt, quad_v1, quad_v2, quad_v3, quad_v4)
```

### Closest Point on Triangle

```python
from mathutils.geometry import closest_point_on_tri

# Returns the closest point on triangle to the given point
closest = closest_point_on_tri(pt, tri_v1, tri_v2, tri_v3)
```

### Triangle-Triangle Intersection (2D)

```python
from mathutils.geometry import intersect_tri_tri_2d

# Boolean test — True if triangles overlap
overlaps = intersect_tri_tri_2d(
    tri_a1, tri_a2, tri_a3,
    tri_b1, tri_b2, tri_b3
)
```

### Sphere-Sphere Intersection (2D)

```python
from mathutils.geometry import intersect_sphere_sphere_2d

# Returns (point1, point2) or None
p1, p2 = intersect_sphere_sphere_2d(p_a, radius_a, p_b, radius_b)
```

## Distance Functions

### Point-to-Line Distance

```python
from mathutils.geometry import distance_point_to_plane

# Signed distance from point to plane
dist = distance_point_to_plane(
    pt,         # point
    plane_co,   # point on plane
    plane_no    # plane normal (should be normalized)
)
# Positive = same side as normal, negative = opposite side
```

### Closest Point on Line

```python
from mathutils.geometry import intersect_point_line

# Returns (closest_point, factor)
# factor: 0.0 = line_a, 1.0 = line_b, outside [0,1] = beyond segment
point, factor = intersect_point_line(pt, line_a, line_b)
```

## Area and Normal

```python
from mathutils.geometry import area_tri, normal
from mathutils import Vector

# Triangle area
area = area_tri(
    Vector((0, 0, 0)),
    Vector((1, 0, 0)),
    Vector((0, 1, 0))
)  # 0.5

# Normal from 3+ coplanar points
n = normal(
    Vector((0, 0, 0)),
    Vector((1, 0, 0)),
    Vector((0, 1, 0))
)  # (0, 0, 1)
# Accepts 3 or 4 vectors (triangle or quad)
```

## Barycentric Transform

```python
from mathutils.geometry import barycentric_transform
from mathutils import Vector

# Map a point from one triangle's space to another's
result = barycentric_transform(
    point,                                    # point to transform
    src_tri_a, src_tri_b, src_tri_c,         # source triangle
    dst_tri_a, dst_tri_b, dst_tri_c          # destination triangle
)
```

## Tessellation

```python
from mathutils.geometry import tessellate_polygon
from mathutils import Vector

# Tessellate a polygon (list of loops, each loop is a list of vectors)
# Returns list of triangle index tuples
outer = [Vector((0, 0, 0)), Vector((1, 0, 0)), Vector((1, 1, 0)), Vector((0, 1, 0))]
tris = tessellate_polygon([outer])
# [(0, 1, 2), (0, 2, 3)]

# With hole
hole = [Vector((0.2, 0.2, 0)), Vector((0.8, 0.2, 0)), Vector((0.8, 0.8, 0)), Vector((0.2, 0.8, 0))]
tris = tessellate_polygon([outer, hole])
```

## Convex Hull (2D)

```python
from mathutils.geometry import convex_hull_2d
from mathutils import Vector

points = [Vector((0, 0)), Vector((1, 0)), Vector((0.5, 0.5)), Vector((0, 1)), Vector((1, 1))]
hull_indices = convex_hull_2d(points)
# List of indices forming the convex hull in CCW order
```

## Bezier Interpolation

```python
from mathutils.geometry import interpolate_bezier
from mathutils import Vector

# Evaluate a cubic Bézier curve
points = interpolate_bezier(
    knot1,      # start point
    handle1,    # handle after knot1
    handle2,    # handle before knot2
    knot2,      # end point
    resolution  # number of segments (returns resolution+1 points)
)
# Returns list of Vectors
```

## Delaunay Triangulation (2D)

```python
from mathutils.geometry import delaunay_2d_cdt

# Constrained Delaunay Triangulation
# Input: vertices, edges, faces, output_type, epsilon
result = delaunay_2d_cdt(
    vert_coords,    # list of (x, y) tuples
    edges,          # list of (i, j) edge index pairs
    faces,          # list of face index lists
    output_type,    # 0-4, see below
    epsilon         # tolerance for merging
)
# Returns: (out_verts, out_edges, out_faces, orig_verts, orig_edges, orig_faces)
```

### Output Types

| Value | Description |
|---|---|
| 0 | Inside convex hull |
| 1 | Inside any input face |
| 2 | Inside all input faces |
| 3 | All except outer boundary |
| 4 | All |

## Box Fit (2D)

```python
from mathutils.geometry import box_fit_2d

# Find optimal rotation angle for minimal bounding box
angle = box_fit_2d(points)  # returns angle in radians
```

## Points in Planes

```python
from mathutils.geometry import points_in_planes

# Find vertices formed by plane intersections
# planes: list of (co, normal) tuples
points, plane_indices = points_in_planes(planes)
# points: list of intersection points
# plane_indices: list of plane index tuples that form each point
```

## Complete Function Reference

| Function | Signature | Returns |
|---|---|---|
| `intersect_line_line` | `(v1, v2, v3, v4)` | `(Vector, Vector)` or `None` |
| `intersect_line_line_2d` | `(v1, v2, v3, v4)` | `Vector` or `None` |
| `intersect_ray_tri` | `(v1, v2, v3, origin, dir, clip=True)` | `Vector` or `None` |
| `intersect_line_plane` | `(line_a, line_b, plane_co, plane_no, no_flip=False)` | `Vector` or `None` |
| `intersect_plane_plane` | `(co_a, no_a, co_b, no_b)` | `(Vector, Vector)` or `(None, None)` |
| `intersect_line_sphere` | `(line_a, line_b, co, radius, clip=True)` | `(Vector, Vector)` |
| `intersect_line_sphere_2d` | `(line_a, line_b, co, radius, clip=True)` | `(Vector, Vector)` |
| `intersect_point_line` | `(pt, line_a, line_b)` | `(Vector, float)` |
| `intersect_point_tri` | `(pt, v1, v2, v3)` | `Vector` or `None` |
| `intersect_point_tri_2d` | `(pt, v1, v2, v3)` | `int` |
| `intersect_point_quad_2d` | `(pt, v1, v2, v3, v4)` | `int` |
| `intersect_tri_tri_2d` | `(a1, a2, a3, b1, b2, b3)` | `bool` |
| `intersect_sphere_sphere_2d` | `(p_a, r_a, p_b, r_b)` | `(Vector, Vector)` or `None` |
| `closest_point_on_tri` | `(pt, v1, v2, v3)` | `Vector` |
| `distance_point_to_plane` | `(pt, plane_co, plane_no)` | `float` |
| `area_tri` | `(v1, v2, v3)` | `float` |
| `normal` | `(v1, v2, v3)` or `(v1, v2, v3, v4)` | `Vector` |
| `barycentric_transform` | `(pt, s1, s2, s3, d1, d2, d3)` | `Vector` |
| `tessellate_polygon` | `(veclist_list)` | `list[(int, int, int)]` |
| `convex_hull_2d` | `(points)` | `list[int]` |
| `interpolate_bezier` | `(k1, h1, h2, k2, resolution)` | `list[Vector]` |
| `delaunay_2d_cdt` | `(verts, edges, faces, type, eps, need_ids=True)` | `tuple` |
| `box_fit_2d` | `(points)` | `float` |
| `box_pack_2d` | `(boxes)` | `(float, float)` |
| `volume_tetrahedron` | `(v1, v2, v3, v4)` | `float` |
| `points_in_planes` | `(planes)` | `(list, list)` |

## Gotchas

1. **Return `None` on no intersection.** Most intersection functions return `None` when no intersection exists. Always check the return value before using the result.

2. **`clip` parameter semantics.** In `intersect_ray_tri`, `clip=True` tests the ray as a segment (origin to origin+direction). `clip=False` treats it as an infinite ray. For `intersect_line_sphere`, `clip=True` restricts to the segment.

3. **`normal()` requires 3 or 4 vectors.** Passing 2 or fewer raises an error. The returned normal is not guaranteed to be normalized — call `.normalized()` if needed.

4. **`tessellate_polygon` input format.** Input is a list of loops (list of lists of Vectors). The first loop is the outer boundary, subsequent loops are holes. Indices in the output refer to the flattened vertex list.

5. **Plane representation.** Planes use point + normal (not ax+by+cz+d). The normal should typically be unit length for `distance_point_to_plane` to return actual distances.

6. **2D functions use Vector x,y components.** Functions with `_2d` suffix ignore the z component. Pass 2D or 3D vectors — only x and y are used.
