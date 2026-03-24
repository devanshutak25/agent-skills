# Joints 3D Reference

## Overview

3D joints constrain two `PhysicsBody3D` nodes. Place the joint node as a sibling (not child) of the connected bodies. The joint's position and orientation define the anchor point and axis.

All joints share:
```gdscript
joint.node_a = body_a.get_path()
joint.node_b = body_b.get_path()
joint.exclude_nodes_from_collision = true  # Connected bodies don't collide (default)
```

If `node_a` or `node_b` is empty, that side anchors to the world.

## PinJoint3D

Ball-and-socket — constrains position but allows free rotation around the pin point.

Use for: ragdoll shoulders/hips, pendulums, wrecking balls, tethers.

```gdscript
var joint := PinJoint3D.new()
joint.position = anchor_point
joint.node_a = body_a.get_path()
joint.node_b = body_b.get_path()

# Parameters
joint.set_param(PinJoint3D.PARAM_BIAS, 0.3)             # Error correction speed
joint.set_param(PinJoint3D.PARAM_DAMPING, 1.0)           # Oscillation dampening
joint.set_param(PinJoint3D.PARAM_IMPULSE_CLAMP, 0.0)     # Max impulse (0 = unlimited)

add_child(joint)
```

## HingeJoint3D

Single-axis rotation (like a door hinge). Rotates around the joint's local Z-axis.

Use for: doors, gates, wheels, flaps, hinged lids.

```gdscript
var joint := HingeJoint3D.new()
joint.position = hinge_point
# Rotate joint so its Z-axis aligns with the desired hinge axis
joint.node_a = frame.get_path()
joint.node_b = door.get_path()

# Angular limits
joint.set_flag(HingeJoint3D.FLAG_USE_LIMIT, true)
joint.set_param(HingeJoint3D.PARAM_LIMIT_LOWER, deg_to_rad(-90))
joint.set_param(HingeJoint3D.PARAM_LIMIT_UPPER, deg_to_rad(90))
joint.set_param(HingeJoint3D.PARAM_LIMIT_BIAS, 0.3)       # Limit enforcement strength
joint.set_param(HingeJoint3D.PARAM_LIMIT_SOFTNESS, 0.9)
joint.set_param(HingeJoint3D.PARAM_LIMIT_RELAXATION, 1.0)

# Motor (apply constant rotation force)
joint.set_flag(HingeJoint3D.FLAG_ENABLE_MOTOR, true)
joint.set_param(HingeJoint3D.PARAM_MOTOR_TARGET_VELOCITY, 2.0)  # rad/s
joint.set_param(HingeJoint3D.PARAM_MOTOR_MAX_IMPULSE, 10.0)

add_child(joint)
```

#### Door Example
```gdscript
func create_door(frame: StaticBody3D, door: RigidBody3D) -> void:
    var joint := HingeJoint3D.new()
    joint.global_position = door.global_position + Vector3(-0.5, 0, 0)  # Hinge edge
    joint.node_a = frame.get_path()
    joint.node_b = door.get_path()
    
    joint.set_flag(HingeJoint3D.FLAG_USE_LIMIT, true)
    joint.set_param(HingeJoint3D.PARAM_LIMIT_LOWER, deg_to_rad(0))
    joint.set_param(HingeJoint3D.PARAM_LIMIT_UPPER, deg_to_rad(120))
    
    get_parent().add_child(joint)
```

## SliderJoint3D

Allows translation along one axis (joint's local X-axis) with optional rotation around that axis.

Use for: pistons, sliding doors, drawer mechanisms, elevators.

```gdscript
var joint := SliderJoint3D.new()
joint.position = slide_origin
joint.node_a = rail.get_path()
joint.node_b = slider.get_path()

# Linear limits (along X-axis)
joint.set_param(SliderJoint3D.PARAM_LINEAR_LIMIT_LOWER, -2.0)  # meters
joint.set_param(SliderJoint3D.PARAM_LINEAR_LIMIT_UPPER, 2.0)
joint.set_param(SliderJoint3D.PARAM_LINEAR_LIMIT_SOFTNESS, 1.0)
joint.set_param(SliderJoint3D.PARAM_LINEAR_LIMIT_RESTITUTION, 0.7)
joint.set_param(SliderJoint3D.PARAM_LINEAR_LIMIT_DAMPING, 1.0)

# Angular limits (around X-axis)
joint.set_param(SliderJoint3D.PARAM_ANGULAR_LIMIT_LOWER, 0.0)
joint.set_param(SliderJoint3D.PARAM_ANGULAR_LIMIT_UPPER, 0.0)  # Lock rotation

# Linear motor
joint.set_param(SliderJoint3D.PARAM_LINEAR_MOTOR_TARGET_VELOCITY, 1.0)
joint.set_param(SliderJoint3D.PARAM_LINEAR_MOTOR_MAX_FORCE, 100.0)

add_child(joint)
```

## ConeTwistJoint3D

Allows rotation within a cone and twist around the axis. Body B swings relative to body A within angular limits.

Use for: ragdoll necks, shoulder joints, spine segments, lamp arms.

```gdscript
var joint := ConeTwistJoint3D.new()
joint.position = joint_point
joint.node_a = torso.get_path()
joint.node_b = head.get_path()

# Swing limit (cone half-angle)
joint.set_param(ConeTwistJoint3D.PARAM_SWING_SPAN, deg_to_rad(40))

# Twist limit (rotation around axis)
joint.set_param(ConeTwistJoint3D.PARAM_TWIST_SPAN, deg_to_rad(30))

# Softness and relaxation
joint.set_param(ConeTwistJoint3D.PARAM_BIAS, 0.3)
joint.set_param(ConeTwistJoint3D.PARAM_SOFTNESS, 0.8)
joint.set_param(ConeTwistJoint3D.PARAM_RELAXATION, 1.0)

add_child(joint)
```

## Generic6DOFJoint3D

Full control over all 6 degrees of freedom (3 linear axes + 3 angular axes). Each axis can be individually locked, limited, or free. Use when the specialized joints don't fit.

Use for: complex mechanical assemblies, custom vehicle suspension, robotic arms, crane mechanisms.

```gdscript
var joint := Generic6DOFJoint3D.new()
joint.position = joint_point
joint.node_a = body_a.get_path()
joint.node_b = body_b.get_path()

# Per-axis flags (enable/disable limits)
# Axes: Vector3.AXIS_X (0), Vector3.AXIS_Y (1), Vector3.AXIS_Z (2)

# Lock linear Y and Z, allow X sliding
joint.set_flag_x(Generic6DOFJoint3D.FLAG_ENABLE_LINEAR_LIMIT, true)
joint.set_param_x(Generic6DOFJoint3D.PARAM_LINEAR_LOWER_LIMIT, -5.0)
joint.set_param_x(Generic6DOFJoint3D.PARAM_LINEAR_UPPER_LIMIT, 5.0)

joint.set_flag_y(Generic6DOFJoint3D.FLAG_ENABLE_LINEAR_LIMIT, true)
joint.set_param_y(Generic6DOFJoint3D.PARAM_LINEAR_LOWER_LIMIT, 0.0)
joint.set_param_y(Generic6DOFJoint3D.PARAM_LINEAR_UPPER_LIMIT, 0.0)  # Locked

joint.set_flag_z(Generic6DOFJoint3D.FLAG_ENABLE_LINEAR_LIMIT, true)
joint.set_param_z(Generic6DOFJoint3D.PARAM_LINEAR_LOWER_LIMIT, 0.0)
joint.set_param_z(Generic6DOFJoint3D.PARAM_LINEAR_UPPER_LIMIT, 0.0)  # Locked

# Allow Y rotation (hinge-like), lock X and Z
joint.set_flag_y(Generic6DOFJoint3D.FLAG_ENABLE_ANGULAR_LIMIT, true)
joint.set_param_y(Generic6DOFJoint3D.PARAM_ANGULAR_LOWER_LIMIT, deg_to_rad(-90))
joint.set_param_y(Generic6DOFJoint3D.PARAM_ANGULAR_UPPER_LIMIT, deg_to_rad(90))

joint.set_flag_x(Generic6DOFJoint3D.FLAG_ENABLE_ANGULAR_LIMIT, true)
joint.set_param_x(Generic6DOFJoint3D.PARAM_ANGULAR_LOWER_LIMIT, 0.0)
joint.set_param_x(Generic6DOFJoint3D.PARAM_ANGULAR_UPPER_LIMIT, 0.0)

joint.set_flag_z(Generic6DOFJoint3D.FLAG_ENABLE_ANGULAR_LIMIT, true)
joint.set_param_z(Generic6DOFJoint3D.PARAM_ANGULAR_LOWER_LIMIT, 0.0)
joint.set_param_z(Generic6DOFJoint3D.PARAM_ANGULAR_UPPER_LIMIT, 0.0)

# Linear motor on X axis
joint.set_flag_x(Generic6DOFJoint3D.FLAG_ENABLE_LINEAR_MOTOR, true)
joint.set_param_x(Generic6DOFJoint3D.PARAM_LINEAR_MOTOR_TARGET_VELOCITY, 2.0)
joint.set_param_x(Generic6DOFJoint3D.PARAM_LINEAR_MOTOR_FORCE_LIMIT, 50.0)

# Angular motor on Y axis
joint.set_flag_y(Generic6DOFJoint3D.FLAG_ENABLE_MOTOR, true)
joint.set_param_y(Generic6DOFJoint3D.PARAM_MOTOR_TARGET_VELOCITY, 1.0)
joint.set_param_y(Generic6DOFJoint3D.PARAM_MOTOR_MAX_FORCE, 20.0)

# Spring on X axis
joint.set_flag_x(Generic6DOFJoint3D.FLAG_ENABLE_LINEAR_SPRING, true)
joint.set_param_x(Generic6DOFJoint3D.PARAM_LINEAR_SPRING_STIFFNESS, 100.0)
joint.set_param_x(Generic6DOFJoint3D.PARAM_LINEAR_SPRING_DAMPING, 5.0)
joint.set_param_x(Generic6DOFJoint3D.PARAM_LINEAR_SPRING_EQUILIBRIUM_POINT, 0.0)

add_child(joint)
```

### Lock Shorthand
When lower limit == upper limit == 0, the axis is locked. When lower > upper, the axis is free (unlimited).

```gdscript
# Lock axis: lower = upper = 0
joint.set_param_x(Generic6DOFJoint3D.PARAM_LINEAR_LOWER_LIMIT, 0.0)
joint.set_param_x(Generic6DOFJoint3D.PARAM_LINEAR_UPPER_LIMIT, 0.0)

# Free axis: lower > upper
joint.set_param_x(Generic6DOFJoint3D.PARAM_LINEAR_LOWER_LIMIT, 1.0)
joint.set_param_x(Generic6DOFJoint3D.PARAM_LINEAR_UPPER_LIMIT, -1.0)
```

## Choosing a Joint

| Need | Joint |
|---|---|
| Free rotation at a point (ball socket) | `PinJoint3D` |
| Single-axis rotation (door, wheel) | `HingeJoint3D` |
| Slide along one axis (piston, rail) | `SliderJoint3D` |
| Rotation within a cone (ragdoll limb) | `ConeTwistJoint3D` |
| Multiple constrained axes, springs, motors | `Generic6DOFJoint3D` |

## Ragdoll Setup

Typical ragdoll uses one `RigidBody3D` per bone segment connected by joints:

```
Torso (RigidBody3D)
  ├── [ConeTwistJoint3D] → Head (RigidBody3D)
  ├── [ConeTwistJoint3D] → UpperArm_L (RigidBody3D)
  │     └── [HingeJoint3D] → ForeArm_L (RigidBody3D)
  ├── [ConeTwistJoint3D] → UpperArm_R (RigidBody3D)
  │     └── [HingeJoint3D] → ForeArm_R (RigidBody3D)
  ├── [ConeTwistJoint3D] → UpperLeg_L (RigidBody3D)
  │     └── [HingeJoint3D] → LowerLeg_L (RigidBody3D)
  └── [ConeTwistJoint3D] → UpperLeg_R (RigidBody3D)
        └── [HingeJoint3D] → LowerLeg_R (RigidBody3D)
```

Key settings for ragdoll joints:
- Head: `ConeTwistJoint3D`, swing ~30°, twist ~20°
- Shoulders: `ConeTwistJoint3D`, swing ~60°, twist ~40°
- Elbows: `HingeJoint3D`, 0° to 140°
- Hips: `ConeTwistJoint3D`, swing ~50°, twist ~15°
- Knees: `HingeJoint3D`, 0° to 130°

Activate ragdoll by unfreezing all rigid bodies and disabling the animation:
```gdscript
func activate_ragdoll() -> void:
    for body in get_tree().get_nodes_in_group(&"ragdoll_parts"):
        body.freeze = false
    $AnimationPlayer.stop()
    # Optionally transfer current animation velocities to rigid bodies
```

## Breakable Joints

Joints don't expose applied force directly. Approximate breakage:

```gdscript
@export var break_threshold: float = 20.0

func _physics_process(delta: float) -> void:
    if not is_instance_valid(joint):
        return
    
    var a: RigidBody3D = get_node(joint.node_a)
    var b: RigidBody3D = get_node(joint.node_b)
    
    var relative_vel: float = (a.linear_velocity - b.linear_velocity).length()
    if relative_vel > break_threshold:
        joint.queue_free()
        # Spawn break effect, etc.
```

## Jolt Physics Notes

Jolt (built-in since 4.4) generally produces more stable joint behavior, especially for stacking and complex multi-joint setups. Some differences:
- Better solver convergence for chains of joints
- More predictable motor behavior
- Springs on Generic6DOFJoint3D may behave slightly differently — test with both engines if targeting both
- Jolt-specific joint nodes (`JoltHingeJoint3D`, etc.) are only available via the GDExtension version, not the built-in engine module

## C# Equivalents

```csharp
// HingeJoint3D
var joint = new HingeJoint3D();
joint.NodeA = bodyA.GetPath();
joint.NodeB = bodyB.GetPath();
joint.Position = hingePoint;
joint.SetFlag(HingeJoint3D.Flag.UseLimit, true);
joint.SetParam(HingeJoint3D.Param.LimitLower, Mathf.DegToRad(-90));
joint.SetParam(HingeJoint3D.Param.LimitUpper, Mathf.DegToRad(90));
AddChild(joint);

// Generic6DOFJoint3D
var g6dof = new Generic6DofJoint3D();
g6dof.SetFlagX(Generic6DofJoint3D.Flag.EnableLinearLimit, true);
g6dof.SetParamX(Generic6DofJoint3D.Param.LinearLowerLimit, -5.0f);
g6dof.SetParamX(Generic6DofJoint3D.Param.LinearUpperLimit, 5.0f);
```
