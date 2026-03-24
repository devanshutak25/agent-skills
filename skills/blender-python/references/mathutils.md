# Mathutils

Core math types for 3D operations: Vector, Matrix, Quaternion, Euler, Color. For geometry utilities see [mathutils-geometry](mathutils-geometry.md). For spatial data structures see [mathutils-spatial](mathutils-spatial.md). For scalar math see [bl-math](bl-math.md).

## Vector

```python
from mathutils import Vector

# Construction
v2 = Vector((1.0, 2.0))          # 2D
v3 = Vector((1.0, 2.0, 3.0))    # 3D
v4 = Vector((1.0, 2.0, 3.0, 1.0))  # 4D (homogeneous)
v0 = Vector()                     # (0, 0, 0)

# Component access
x, y, z = v3.x, v3.y, v3.z
v3[0]  # index access
v3.xy  # swizzle → Vector 2D
v3.xz  # swizzle → Vector 2D
```

### Vector Arithmetic

```python
from mathutils import Vector

a = Vector((1, 2, 3))
b = Vector((4, 5, 6))

a + b           # (5, 7, 9)
a - b           # (-3, -3, -3)
a * 2.0         # (2, 4, 6)  — scalar multiply
a @ b           # 32.0       — dot product (use @ not *)
a.cross(b)      # (-3, 6, -3) — cross product (3D only)
a.dot(b)        # 32.0       — dot product (alternative)

a.length        # magnitude
a.length_squared  # magnitude² (faster, no sqrt)
a.normalized()  # unit vector (returns copy)
a.normalize()   # normalize in-place, returns None
a.negate()      # negate in-place
```

### Vector Methods

| Method | Description |
|---|---|
| `normalized()` | Return unit-length copy |
| `normalize()` | Normalize in-place |
| `resized(size)` | Return copy with different dimension count |
| `to_2d()` / `to_3d()` / `to_4d()` | Convert dimensions |
| `lerp(other, factor)` | Linear interpolation |
| `slerp(other, factor)` | Spherical linear interpolation |
| `project(other)` | Project onto another vector |
| `reflect(mirror)` | Reflect over a normal |
| `cross(other)` | Cross product (3D only) |
| `dot(other)` | Dot product |
| `angle(other, fallback=None)` | Angle between vectors (radians) |
| `angle_signed(other, fallback)` | Signed angle (2D only) |
| `rotation_difference(other)` | Quaternion rotation between vectors |
| `copy()` | Return a copy |
| `rotate(other)` | Rotate in-place by Euler, Quaternion, or Matrix |
| `orthogonal()` | Return an arbitrary perpendicular vector |
| `to_track_quat(track, up)` | Quaternion rotation to align with vector |
| `freeze()` | Make immutable (hashable) |

```python
from mathutils import Vector

a = Vector((1, 0, 0))
b = Vector((0, 1, 0))

a.lerp(b, 0.5)                # (0.5, 0.5, 0.0)
a.angle(b)                     # 1.5707... (π/2)
a.rotation_difference(b)       # Quaternion
a.to_4d()                      # (1, 0, 0, 1)

# Freeze for use as dict key
key = Vector((1, 2, 3)).freeze()
```

## Matrix

```python
from mathutils import Matrix, Vector

# Identity
m = Matrix.Identity(4)     # 4×4 identity
m = Matrix.Identity(3)     # 3×3 identity

# Transform constructors
m = Matrix.Translation(Vector((1, 2, 3)))
m = Matrix.Rotation(radians, size, axis)    # axis: 'X','Y','Z' or Vector
m = Matrix.Scale(factor, size, axis=None)   # axis=None for uniform
m = Matrix.OrthoProjection(axis, size)
m = Matrix.Diagonal(vector)                 # diagonal matrix
m = Matrix.LocRotScale(loc, rot, scale)     # compose from components
m = Matrix.Shear(plane, size, factor)       # shear matrix

# From rows/columns
m = Matrix(((1, 0, 0, 0),
            (0, 1, 0, 0),
            (0, 0, 1, 0),
            (0, 0, 0, 1)))
```

### Matrix Operations

```python
from mathutils import Matrix, Vector
import math

# Multiply (compose transforms)
m = Matrix.Translation((1, 0, 0)) @ Matrix.Rotation(math.radians(90), 4, 'Z')

# Transform a vector
v = m @ Vector((0, 1, 0))

# Inverse
m_inv = m.inverted()
m_inv = m.inverted_safe()  # returns identity if singular

# Transpose
m_t = m.transposed()

# Decompose into loc, rot, scale
location, rotation, scale = m.decompose()
# location → Vector, rotation → Quaternion, scale → Vector
```

### Matrix Methods

| Method | Description |
|---|---|
| `inverted()` | Return inverse (raises error if singular) |
| `inverted_safe()` | Return inverse or identity if singular |
| `transposed()` | Return transpose |
| `normalized()` | Return orthonormalized copy |
| `decompose()` | → (Vector, Quaternion, Vector) |
| `to_euler(order='XYZ')` | → Euler |
| `to_quaternion()` | → Quaternion |
| `to_3x3()` | Extract rotation/scale part |
| `to_4x4()` | Extend 3×3 to 4×4 |
| `to_translation()` | → Vector (translation column) |
| `to_scale()` | → Vector (scale component) |
| `copy()` | Return a copy |
| `freeze()` | Make immutable |

### Matrix Access

```python
from mathutils import Matrix

m = Matrix.Identity(4)

# Row access
row = m[0]        # first row
m[0][3] = 5.0     # set element

# Column access
col = m.col[0]    # first column

# Translation shorthand (4×4)
m.translation = (1, 2, 3)  # set translation
loc = m.translation         # get translation Vector
```

## Quaternion

```python
from mathutils import Quaternion, Vector
import math

# Construction
q = Quaternion()                           # identity (1, 0, 0, 0)
q = Quaternion((1.0, 0.0, 0.0, 0.0))     # (w, x, y, z)
q = Quaternion((0, 0, 1), math.radians(90))  # axis, angle
q = Quaternion(Vector((0, 0, 1)), math.radians(90))

# Components
w, x, y, z = q.w, q.x, q.y, q.z
axis = q.axis       # rotation axis Vector
angle = q.angle     # rotation angle (radians)
```

### Quaternion Operations

```python
from mathutils import Quaternion, Vector
import math

q1 = Quaternion((0, 0, 1), math.radians(90))
q2 = Quaternion((0, 1, 0), math.radians(45))

# Compose rotations
q = q1 @ q2

# Rotate a vector
v = q @ Vector((1, 0, 0))

# Interpolation
q_mid = q1.slerp(q2, 0.5)

# Inverse
q_inv = q1.inverted()

# Difference
q_diff = q1.rotation_difference(q2)
```

### Quaternion Methods

| Method | Description |
|---|---|
| `slerp(other, factor)` | Spherical interpolation |
| `normalized()` | Return unit quaternion |
| `inverted()` | Return inverse rotation |
| `rotation_difference(other)` | Quaternion from self to other |
| `to_euler(order='XYZ')` | → Euler |
| `to_matrix()` | → 3×3 Matrix |
| `to_axis_angle()` | → (Vector, float) |
| `to_exponential_map()` | → Vector (exponential map) |
| `dot(other)` | Quaternion dot product |
| `negate()` | Negate in-place |
| `conjugated()` | Return conjugate |
| `copy()` | Return a copy |

## Euler

```python
from mathutils import Euler
import math

# Construction
e = Euler((math.radians(90), 0, 0), 'XYZ')
e = Euler((0, 0, 0))  # defaults to 'XYZ' order

# Components
e.x, e.y, e.z    # angles in radians
e.order           # 'XYZ', 'XZY', 'YXZ', 'YZX', 'ZXY', 'ZYX'
```

### Euler Rotation Orders

| Order | Description |
|---|---|
| `'XYZ'` | Default — rotate X, then Y, then Z |
| `'XZY'` | X, Z, Y |
| `'YXZ'` | Y, X, Z |
| `'YZX'` | Y, Z, X |
| `'ZXY'` | Z, X, Y |
| `'ZYX'` | Z, Y, X |

### Euler Methods

| Method | Description |
|---|---|
| `to_matrix()` | → 3×3 Matrix |
| `to_quaternion()` | → Quaternion |
| `rotate(other)` | Rotate by another Euler |
| `rotate_axis(axis, angle)` | Rotate around single axis |
| `make_compatible(other)` | Adjust to minimize flip relative to other |
| `copy()` | Return a copy |

## Color

```python
from mathutils import Color

# Construction (RGB, 0.0–1.0)
c = Color((1.0, 0.5, 0.0))

# Component access
c.r, c.g, c.b

# HSV access
c.h, c.s, c.v       # read/write
c.hsv = (0.5, 1.0, 1.0)

# Copy
c2 = c.copy()

# Color space conversions (return new Color)
linear = c.from_srgb_to_scene_linear()
srgb = linear.from_scene_linear_to_srgb()
# Also: from_aces_to_scene_linear, from_scene_linear_to_aces,
# from_rec709_linear_to_scene_linear, from_scene_linear_to_rec709_linear, etc.
```

## Numpy Interop

```python
import numpy as np
from mathutils import Vector, Matrix

# Vector ↔ numpy
v = Vector((1, 2, 3))
arr = np.array(v)              # array([1., 2., 3.])
v2 = Vector(arr.tolist())

# Matrix ↔ numpy
m = Matrix.Identity(4)
arr = np.array(m)              # (4, 4) array

# Bulk operations with foreach_get/set use flat float arrays
import bpy
mesh = bpy.context.object.data
verts = np.empty(len(mesh.vertices) * 3, dtype=np.float32)
mesh.vertices.foreach_get("co", verts)
```

**Buffer protocol note (5.0):** mathutils types use `float32` internally. When converting to numpy, data is already single-precision. In earlier versions the buffer protocol exposed `float64`.

## Frozen / Hashable Types

```python
from mathutils import Vector

# Frozen vectors/matrices can be used as dict keys or in sets
v = Vector((1, 2, 3)).freeze()
d = {v: "data"}

# Cannot modify frozen objects
# v.x = 5  # raises TypeError
```

## Common Patterns

### World-Space Vertex Positions

```python
import bpy
from mathutils import Vector

obj = bpy.context.active_object
mesh = obj.data
world_matrix = obj.matrix_world

world_positions = [world_matrix @ v.co for v in mesh.vertices]
```

### Look-At Matrix

```python
from mathutils import Vector, Matrix

def look_at(eye, target, up=Vector((0, 0, 1))):
    forward = (target - eye).normalized()
    right = forward.cross(up).normalized()
    true_up = right.cross(forward)

    mat = Matrix.Identity(4)
    mat[0][0:3] = right
    mat[1][0:3] = true_up
    mat[2][0:3] = -forward
    mat[0][3], mat[1][3], mat[2][3] = -right.dot(eye), -true_up.dot(eye), forward.dot(eye)
    return mat
```

### Smooth Rotation

```python
from mathutils import Quaternion
import math

start = Quaternion((0, 0, 1), math.radians(0))
end = Quaternion((0, 0, 1), math.radians(180))

# Interpolate at 30% between start and end
current = start.slerp(end, 0.3)
```

## Gotchas

1. **Use `@` for dot product and transforms.** `Vector * Vector` is element-wise multiplication. Use `a @ b` for dot product and `matrix @ vector` for transforms.

2. **`normalize()` vs `normalized()`.** `normalize()` modifies in-place and returns `None`. `normalized()` returns a new vector. Same pattern applies to `invert()`/`inverted()`, `negate()`/`negated()`.

3. **Matrix multiplication order.** Transforms compose right-to-left: `Translation @ Rotation @ Scale` applies scale first, then rotation, then translation. This is standard column-major convention.

4. **Euler gimbal lock.** Euler rotations suffer from gimbal lock at ±90° on the middle axis. Use Quaternions for interpolation and animation; convert to Euler only for display or final assignment.

5. **`decompose()` scale sign ambiguity.** `Matrix.decompose()` may return negative scale components for mirrored transforms. The quaternion rotation absorbs the sign. Check the matrix determinant to detect mirroring.

6. **Frozen objects are immutable.** After `freeze()`, any modification raises `TypeError`. Create a `copy()` first if you need to modify a frozen object.
