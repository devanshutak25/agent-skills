# Objects & Transforms

Object transform matrices, setting transforms, constraints, parenting, and evaluated data. For math types see [mathutils](mathutils.md). For depsgraph see [depsgraph](depsgraph.md). For armatures see [armatures](armatures.md).

## Transform Matrices

Every object has four transform matrices:

| Matrix | Description |
|---|---|
| `matrix_world` | Final world-space transform (read/write) |
| `matrix_local` | Parent-space transform |
| `matrix_basis` | Basis transform before constraints |
| `matrix_parent_inverse` | Offset set when parenting |

```python
import bpy
from mathutils import Matrix, Vector

obj = bpy.context.active_object

# Read world transform
world = obj.matrix_world
loc = world.to_translation()
rot = world.to_euler()
scale = world.to_scale()

# Decompose into components
location, rotation, scale = world.decompose()
# location → Vector, rotation → Quaternion, scale → Vector

# Set world transform directly
obj.matrix_world = Matrix.Translation(Vector((5, 0, 0)))
```

### Transform Properties

```python
import bpy

obj = bpy.context.active_object

# Location
obj.location = (1, 2, 3)

# Rotation (depends on rotation_mode)
obj.rotation_mode = 'XYZ'          # Euler modes: XYZ, XZY, YXZ, YZX, ZXY, ZYX
obj.rotation_euler = (0.5, 0, 0)   # radians

obj.rotation_mode = 'QUATERNION'
obj.rotation_quaternion = (1, 0, 0, 0)

obj.rotation_mode = 'AXIS_ANGLE'
obj.rotation_axis_angle = (0, 0, 0, 1)  # (angle, x, y, z)

# Scale
obj.scale = (1, 1, 1)
```

### Delta Transforms

Delta transforms add an offset to the base transform:

```python
import bpy

obj = bpy.context.active_object

obj.delta_location = (0, 0, 1)         # added to location
obj.delta_rotation_euler = (0, 0, 0)   # added to rotation
obj.delta_scale = (1, 1, 1)            # multiplied with scale
```

## Constraints

```python
import bpy

obj = bpy.context.active_object

# Add a constraint
constraint = obj.constraints.new(type='COPY_LOCATION')
constraint.target = bpy.data.objects["Target"]

# Remove a constraint
obj.constraints.remove(constraint)

# Iterate constraints
for c in obj.constraints:
    print(c.type, c.name)
```

### Constraint Types

**Copy transforms:**

| Type | Description |
|---|---|
| `'COPY_LOCATION'` | Copy target location |
| `'COPY_ROTATION'` | Copy target rotation |
| `'COPY_SCALE'` | Copy target scale |
| `'COPY_TRANSFORMS'` | Copy all transforms |

**Limit transforms:**

| Type | Description |
|---|---|
| `'LIMIT_LOCATION'` | Clamp location to range |
| `'LIMIT_ROTATION'` | Clamp rotation to range |
| `'LIMIT_SCALE'` | Clamp scale to range |
| `'LIMIT_DISTANCE'` | Clamp distance to target |

**Tracking:**

| Type | Description |
|---|---|
| `'TRACK_TO'` | Point axis at target |
| `'DAMPED_TRACK'` | Smooth axis tracking |
| `'LOCKED_TRACK'` | Track with locked axis |
| `'STRETCH_TO'` | Stretch toward target |

**Inverse kinematics:**

| Type | Description |
|---|---|
| `'IK'` | Inverse kinematics solver |
| `'SPLINE_IK'` | IK along a spline curve |

**Relationship:**

| Type | Description |
|---|---|
| `'FOLLOW_PATH'` | Follow a curve path |
| `'CLAMP_TO'` | Clamp to curve |
| `'CHILD_OF'` | Parent-like constraint |
| `'ACTION'` | Drive transforms from action |
| `'ARMATURE'` | Multi-bone influence |
| `'PIVOT'` | Pivot around target |
| `'SHRINKWRAP'` | Project onto surface |
| `'FLOOR'` | Prevent passing through |
| `'GEOMETRY_ATTRIBUTE'` | Read transform from geometry attribute |

**Motion tracking:**

| Type | Description |
|---|---|
| `'CAMERA_SOLVER'` | Camera motion solve |
| `'FOLLOW_TRACK'` | Follow motion track |
| `'OBJECT_SOLVER'` | Object motion solve |

**Transform manipulation:**

| Type | Description |
|---|---|
| `'TRANSFORM'` | Map input to output range |
| `'TRANSFORM_CACHE'` | Alembic/USD cache |
| `'MAINTAIN_VOLUME'` | Preserve volume on squash/stretch |

### Constraint Properties

```python
import bpy

obj = bpy.context.active_object
c = obj.constraints.new('COPY_LOCATION')
c.target = bpy.data.objects["Target"]

# Common properties
c.name = "My Constraint"
c.influence = 0.5        # 0.0–1.0
c.mute = False           # disable without removing
c.owner_space = 'WORLD'  # WORLD, LOCAL, POSE, etc.
c.target_space = 'WORLD'

# Axis filtering (on Copy/Limit constraints)
c.use_x = True
c.use_y = True
c.use_z = False
```

## Parenting

```python
import bpy

parent_obj = bpy.data.objects["Parent"]
child_obj = bpy.data.objects["Child"]

# Set parent
child_obj.parent = parent_obj

# Parent type
child_obj.parent_type = 'OBJECT'  # default
# Other parent_type values:
# 'BONE' — parent to a bone (set parent_bone)
# 'VERTEX' — parent to vertex (set parent_vertices)
# 'VERTEX_3' — parent to 3 vertices

# Parent to bone
child_obj.parent = bpy.data.objects["Armature"]
child_obj.parent_type = 'BONE'
child_obj.parent_bone = "Bone.001"

# Clear parent
child_obj.parent = None

# Keep transform when unparenting (via operator)
bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
```

### matrix_parent_inverse

When parenting, Blender sets `matrix_parent_inverse` so the child doesn't jump. To parent without offset:

```python
import bpy
from mathutils import Matrix

child = bpy.data.objects["Child"]
parent = bpy.data.objects["Parent"]

child.parent = parent
child.matrix_parent_inverse = Matrix.Identity(4)
# Child will jump to parent's origin
```

## Evaluated Objects

```python
import bpy

obj = bpy.context.active_object
depsgraph = bpy.context.evaluated_depsgraph_get()

# Get the evaluated version (includes modifiers, constraints)
obj_eval = obj.evaluated_get(depsgraph)

# Read evaluated transform
final_location = obj_eval.matrix_world.to_translation()

# Get evaluated mesh (with all modifiers applied)
mesh_eval = obj_eval.to_mesh()
print(f"Evaluated verts: {len(mesh_eval.vertices)}")

# MUST clear when done
obj_eval.to_mesh_clear()
```

### to_mesh

```python
import bpy

obj = bpy.context.active_object
depsgraph = bpy.context.evaluated_depsgraph_get()
obj_eval = obj.evaluated_get(depsgraph)

# Convert to mesh (works for curves, surfaces, text, etc.)
mesh = obj_eval.to_mesh(
    preserve_all_data_layers=False,  # True to keep all custom data
    depsgraph=depsgraph
)

# Use the mesh data
for v in mesh.vertices:
    print(v.co)

# Clean up
obj_eval.to_mesh_clear()
```

## Common Patterns

### Apply Object Transform

```python
import bpy
from mathutils import Matrix

obj = bpy.context.active_object

# Apply location/rotation/scale to mesh data
obj.data.transform(obj.matrix_basis)
obj.matrix_basis = Matrix.Identity(4)
```

### World-Space Bounding Box

```python
import bpy
from mathutils import Vector

obj = bpy.context.active_object
world_corners = [obj.matrix_world @ Vector(c) for c in obj.bound_box]

min_co = Vector((
    min(c.x for c in world_corners),
    min(c.y for c in world_corners),
    min(c.z for c in world_corners),
))
max_co = Vector((
    max(c.x for c in world_corners),
    max(c.y for c in world_corners),
    max(c.z for c in world_corners),
))
```

### Copy Transform from One Object to Another

```python
import bpy

source = bpy.data.objects["Source"]
target = bpy.data.objects["Target"]

target.matrix_world = source.matrix_world.copy()
```

## Gotchas

1. **`matrix_world` vs `matrix_basis`.** `matrix_world` is the final transform after constraints and parenting. `matrix_basis` is the raw transform. Modify `matrix_basis` or individual properties (`location`, `rotation_euler`, `scale`) to set transforms; `matrix_world` writes are overridden by constraints.

2. **`to_mesh` requires cleanup.** Every `to_mesh()` call must be paired with `to_mesh_clear()`. Forgetting cleanup leaks mesh data.

3. **Evaluated vs original.** Read data from evaluated objects (`obj.evaluated_get(depsgraph)`), but modify original objects. Modifying evaluated objects has no effect.

4. **`matrix_parent_inverse` on parenting.** When setting `obj.parent`, also set `matrix_parent_inverse` if you want specific behavior. The operator `bpy.ops.object.parent_set()` handles this automatically.

5. **Rotation mode matters.** Setting `rotation_euler` when `rotation_mode` is `'QUATERNION'` has no effect on the visual result. Always check `rotation_mode` before setting rotation.

6. **Constraint order matters.** Constraints evaluate top-to-bottom. Reorder with `obj.constraints.move(from_index, to_index)`.
