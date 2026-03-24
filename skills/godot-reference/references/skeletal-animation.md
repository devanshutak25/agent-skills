# Skeletal Animation

## Skeleton3D

Represents a 3D character's bone hierarchy. Imported models auto-generate a Skeleton3D with bones.

### Scene Structure
```
CharacterBody3D
+-- MeshInstance3D
|   +-- Skeleton3D
|       +-- BoneAttachment3D (weapons, accessories)
+-- AnimationPlayer
+-- AnimationTree
```

### Querying Bones
```gdscript
@onready var skeleton: Skeleton3D = $MeshInstance3D/Skeleton3D

func _ready() -> void:
    # List all bones
    for i in skeleton.get_bone_count():
        var name: String = skeleton.get_bone_name(i)
        var parent_idx: int = skeleton.get_bone_parent(i)
        print(name, " parent: ", parent_idx)

    # Find specific bone
    var head_idx: int = skeleton.find_bone("Head")
    if head_idx != -1:
        var pose: Transform3D = skeleton.get_bone_pose(head_idx)
        print("Head position: ", pose.origin)
```

### Modifying Bone Poses

```gdscript
func _process(delta: float) -> void:
    var head_idx: int = skeleton.find_bone("Head")

    # Override bone pose (in bone-local space)
    var current: Transform3D = skeleton.get_bone_pose(head_idx)
    var rotation := Basis(Vector3.UP, deg_to_rad(15))  # Tilt head 15 degrees
    skeleton.set_bone_pose_rotation(head_idx, Quaternion(rotation))

    # Or set full transform
    skeleton.set_bone_pose(head_idx, modified_transform)

    # Get global bone pose (world space)
    var global_pose: Transform3D = skeleton.get_bone_global_pose(head_idx)
```

### Bone Rest Pose
Each bone has a rest pose (T-pose or bind pose). The bone pose is relative to rest:
```gdscript
var rest: Transform3D = skeleton.get_bone_rest(head_idx)
# Global rest (bind pose in skeleton space)
var global_rest: Transform3D = skeleton.get_bone_global_rest(head_idx)
```

## BoneAttachment3D

Attaches a Node3D to follow a specific bone (for weapons, accessories, VFX):

```gdscript
# Add via editor: child of Skeleton3D, set bone_name property

# Or via code
var attachment := BoneAttachment3D.new()
attachment.bone_name = "RightHand"
skeleton.add_child(attachment)

# Attach a weapon mesh to it
var weapon := preload("res://weapons/sword.tscn").instantiate()
attachment.add_child(weapon)
```

**Pitfall**: BoneAttachment3D position updates happen after skeleton pose is calculated. If you read its global_position in `_process`, it may be one frame behind. Use `_physics_process` or call `skeleton.force_update_all_bone_transforms()`.

## Skeleton2D

2D bone system using `Bone2D` nodes in a hierarchy:

```
Skeleton2D
+-- Bone2D (hip)
    +-- Bone2D (spine)
        +-- Bone2D (head)
    +-- Bone2D (left_leg)
    +-- Bone2D (right_leg)
```

### Setup
1. Add Skeleton2D node
2. Add Bone2D children in hierarchy
3. Position bones to match your sprite
4. Use AnimationPlayer to animate bone rotations/positions

```gdscript
@onready var skeleton_2d: Skeleton2D = $Skeleton2D

func _ready() -> void:
    # Access bones
    var bone_count: int = skeleton_2d.get_bone_count()
    for i in bone_count:
        var bone: Bone2D = skeleton_2d.get_bone(i)
        print(bone.name, " rest: ", bone.rest)
```

## Inverse Kinematics (IK)

### SkeletonIK3D (Deprecated)

Still functional but marked deprecated. Will be replaced by SkeletonModifier3D system.

```gdscript
# Setup in scene tree as child of Skeleton3D
# Properties: root_bone, tip_bone, target (Node3D)

@onready var foot_ik: SkeletonIK3D = $Skeleton3D/FootIK

func _ready() -> void:
    foot_ik.start()

func _physics_process(delta: float) -> void:
    # Move the target node to where the foot should plant
    var space: PhysicsDirectSpaceState3D = get_world_3d().direct_space_state
    var query := PhysicsRayQueryParameters3D.create(
        global_position + Vector3.UP,
        global_position + Vector3.DOWN * 2.0
    )
    var result: Dictionary = space.intersect_ray(query)
    if result:
        $FootTarget.global_position = result.position

    # Adjust IK influence (0.0 = disabled, 1.0 = fully applied)
    foot_ik.interpolation = 1.0
```

### SkeletonModifier3D (4.4+)

The new system replacing SkeletonIK3D. Add modifiers as children of Skeleton3D:

- **SkeletonModifier3D** — Base class for custom bone modifications
- Various built-in modifiers for look-at, IK chains, etc.

```gdscript
# Custom modifier via script
extends SkeletonModifier3D

func _process_modification() -> void:
    var skeleton: Skeleton3D = get_skeleton()
    if skeleton == null:
        return

    var bone_idx: int = skeleton.find_bone("Head")
    # Modify bone pose here
    var pose: Transform3D = skeleton.get_bone_pose(bone_idx)
    # ... apply custom logic
    skeleton.set_bone_pose(bone_idx, pose)
```

### 2D IK

Use `SkeletonModificationStack2D` with `SkeletonModification2DFABRIK` or `SkeletonModification2DTwoBoneIK`:

```gdscript
# Setup via editor on Skeleton2D:
# 1. Add SkeletonModificationStack2D to modification_stack property
# 2. Add modifications (FABRIK, TwoBoneIK, CCDIK, etc.)
# 3. Set target bones and target nodes

# The stack is enabled/disabled:
skeleton_2d.modification_stack.enabled = true
```

## Retargeting

Share animations between different skeletons with different bone names/proportions.

### SkeletonProfile

A resource that defines a standard bone mapping (e.g., humanoid rig):

1. Create a `SkeletonProfile` resource (or use the built-in `SkeletonProfileHumanoid`)
2. In the import settings of your model, set the skeleton profile
3. Map your model's bone names to the profile's standard names

### BoneMap

Maps source bone names to target profile bone names:
```gdscript
var bone_map := BoneMap.new()
bone_map.profile = SkeletonProfileHumanoid.new()
bone_map.set_skeleton_bone_name("Hips", "mixamorig:Hips")
bone_map.set_skeleton_bone_name("Spine", "mixamorig:Spine")
# ... map all bones
```

### Import-Time Retargeting

The recommended workflow:
1. Import a source model with animations
2. In import settings → Skeleton → set Bone Map to your profile
3. Import a target model with different proportions
4. Use the same profile
5. Animations auto-retarget between skeletons sharing the same profile

## Performance Tips

1. **Disable unnecessary IK**: Set `interpolation = 0.0` or `active = false` when not needed
2. **LOD for animations**: At distance, reduce animation update rate or switch to simpler anims
3. **Animation compression**: Enable in import settings for smaller file sizes
4. **Bone count**: Fewer bones = faster. Mobile targets should aim for < 50 bones
5. **force_update_all_bone_transforms()**: Only call when you need immediate sync, not every frame
