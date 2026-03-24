# Armatures

Armature data, bones in different modes, pose bones, bone collections, and mode switching. For transforms see [objects-transforms](objects-transforms.md). For animation see [animation-actions](animation-actions.md).

## Armature Structure

An armature has three bone access points depending on mode:

| Access | Mode | Type | Purpose |
|---|---|---|---|
| `armature.bones` | Any | `Bone` | Rest pose (read-only) |
| `armature.edit_bones` | Edit mode | `EditBone` | Edit structure |
| `obj.pose.bones` | Pose/Object | `PoseBone` | Pose transforms |

```python
import bpy

armature_obj = bpy.data.objects["Armature"]
armature = armature_obj.data  # bpy.types.Armature

# Rest pose bones (always accessible)
for bone in armature.bones:
    print(bone.name, bone.head, bone.tail)

# Pose bones (in object or pose mode)
for pbone in armature_obj.pose.bones:
    print(pbone.name, pbone.location, pbone.rotation_euler)
```

## Bone (Rest Pose)

`armature.bones` — read-only rest pose data, accessible in any mode:

```python
import bpy

armature = bpy.data.armatures["Armature"]
bone = armature.bones["Spine"]

# Position (rest pose, armature-local space)
bone.head            # Vector — head position
bone.tail            # Vector — tail position
bone.length          # float — bone length

# Matrices
bone.matrix          # 3×3 bone rotation matrix
bone.matrix_local    # 4×4 rest pose matrix in armature space

# Hierarchy
bone.parent          # parent Bone or None
bone.children        # child Bones list
bone.use_connect     # head connected to parent's tail

# Reference back to armature
bone.id_data         # the Armature data-block
```

## EditBone (Edit Mode)

`armature.edit_bones` — edit structure, only available in edit mode:

```python
import bpy

armature_obj = bpy.data.objects["Armature"]
bpy.context.view_layer.objects.active = armature_obj
bpy.ops.object.mode_set(mode='EDIT')

armature = armature_obj.data

# Create a new bone
bone = armature.edit_bones.new("NewBone")
bone.head = (0, 0, 0)
bone.tail = (0, 0, 1)

# Set parent
bone.parent = armature.edit_bones["Spine"]
bone.use_connect = False  # True = head snaps to parent's tail

# Properties
bone.roll = 0.0                  # twist around Y axis
bone.envelope_distance = 0.25    # envelope radius
bone.use_deform = True           # contributes to mesh deform

# B-Bone properties
bone.bbone_segments = 1          # subdivision segments
bone.bbone_curvein = 0.0
bone.bbone_curveout = 0.0

# Selection (edit mode only, moved from Bone in 5.0)
bone.select = True
bone.select_head = True
bone.select_tail = True

# Remove a bone
armature.edit_bones.remove(bone)

bpy.ops.object.mode_set(mode='OBJECT')
```

## PoseBone (Pose Mode)

`obj.pose.bones` — set pose transforms, manage constraints:

```python
import bpy

armature_obj = bpy.data.objects["Armature"]
pbone = armature_obj.pose.bones["UpperArm"]

# Transform
pbone.location = (0, 0, 0)
pbone.rotation_mode = 'QUATERNION'  # XYZ, QUATERNION, AXIS_ANGLE
pbone.rotation_quaternion = (1, 0, 0, 0)
pbone.rotation_euler = (0, 0, 0)
pbone.scale = (1, 1, 1)

# Matrices
pbone.matrix          # 4×4 pose-space matrix
pbone.matrix_basis    # 4×4 basis transform (before constraints)
pbone.matrix_channel  # 4×4 final matrix (with constraints)

# Constraints (same API as object constraints)
c = pbone.constraints.new('IK')
c.target = bpy.data.objects["IKTarget"]
c.chain_count = 3

# Custom shape (display bone as another object)
pbone.custom_shape = bpy.data.objects["BoneWidget"]
pbone.custom_shape_scale_xyz = (1, 1, 1)

# Access the rest bone
rest_bone = pbone.bone  # Bone type
```

## Bone Collections

Bone collections replace the legacy bone layers and bone groups:

```python
import bpy

armature = bpy.data.armatures["Armature"]

# Create a bone collection
coll = armature.collections.new("FK Controls")

# Assign bones
coll.assign(armature.bones["UpperArm"])
coll.assign(armature.bones["LowerArm"])
coll.assign(armature.bones["Hand"])

# Unassign
coll.unassign(armature.bones["Hand"])

# Iterate bones in collection
for bone in coll.bones:
    print(bone.name)

# Collection properties
coll.is_visible = True
coll.name = "FK_Controls"

# Iterate all collections (including nested)
for coll in armature.collections_all:
    print(coll.name, len(coll.bones))

# Remove a collection
armature.collections.remove(coll)
```

### Nested Collections

```python
import bpy

armature = bpy.data.armatures["Armature"]

parent_coll = armature.collections.new("Body")
child_coll = armature.collections.new("Arms", parent=parent_coll)

# Iterate children
for child in parent_coll.children:
    print(child.name)
```

## Mode Switching

Edit bones require edit mode. Always restore mode when done:

```python
import bpy

armature_obj = bpy.data.objects["Armature"]

# Save current mode
original_mode = armature_obj.mode

# Enter edit mode
bpy.context.view_layer.objects.active = armature_obj
bpy.ops.object.mode_set(mode='EDIT')

# Work with edit_bones
armature = armature_obj.data
for ebone in armature.edit_bones:
    ebone.roll = 0.0

# Restore mode
bpy.ops.object.mode_set(mode=original_mode)
```

## Bone Access Comparison

```python
import bpy

armature_obj = bpy.data.objects["Armature"]

# By name (dictionary-style access)
rest_bone = armature_obj.data.bones["Spine"]
pose_bone = armature_obj.pose.bones["Spine"]

# Edit bones (edit mode only)
# edit_bone = armature_obj.data.edit_bones["Spine"]

# Pose bone → rest bone
rest = pose_bone.bone

# Rest bone → pose bone (via armature object)
pose = armature_obj.pose.bones[rest_bone.name]
```

## Common Patterns

### Reset Pose to Rest Position

```python
import bpy
from mathutils import Quaternion

armature_obj = bpy.data.objects["Armature"]

for pbone in armature_obj.pose.bones:
    pbone.location = (0, 0, 0)
    pbone.rotation_quaternion = Quaternion()
    pbone.rotation_euler = (0, 0, 0)
    pbone.scale = (1, 1, 1)
```

### Create Armature from Scratch

```python
import bpy

# Create armature data
armature = bpy.data.armatures.new("MyArmature")
armature_obj = bpy.data.objects.new("MyArmature", armature)
bpy.context.collection.objects.link(armature_obj)

# Enter edit mode to add bones
bpy.context.view_layer.objects.active = armature_obj
bpy.ops.object.mode_set(mode='EDIT')

# Root bone
root = armature.edit_bones.new("Root")
root.head = (0, 0, 0)
root.tail = (0, 0, 0.5)

# Child bone
spine = armature.edit_bones.new("Spine")
spine.head = (0, 0, 0.5)
spine.tail = (0, 0, 1.0)
spine.parent = root
spine.use_connect = True

bpy.ops.object.mode_set(mode='OBJECT')
```

## Gotchas

1. **`edit_bones` only in edit mode.** Accessing `armature.edit_bones` outside edit mode returns an empty collection. Always switch to edit mode first.

2. **Bone select properties moved in 5.0.** `select`, `select_head`, `select_tail` are now on `EditBone` only, not on `Bone`. Code that reads selection from rest-pose bones must switch to edit mode.

3. **`bone.id_data` returns Armature, not Object.** To get the armature object from a bone, you need to search `bpy.data.objects` for one with matching armature data.

4. **Pose bone names match rest bone names.** `pose.bones["Name"]` and `data.bones["Name"]` refer to the same bone in different modes. Names are shared.

5. **Mode switching invalidates references.** Edit bone references become invalid after leaving edit mode. Re-fetch bones after mode changes.

6. **Bone collections replace bone groups and layers.** The legacy `bone_group` and 32-layer system are removed. Use `armature.collections` instead.
