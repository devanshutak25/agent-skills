# Joints 2D Reference

## Overview

Joints constrain two physics bodies relative to each other. Attach a joint node as a sibling (not child) of the bodies it connects. Each joint connects two `PhysicsBody2D` nodes specified by `node_a` and `node_b`.

If `node_a` or `node_b` is empty, the joint anchors to the world (static point).

## Joint Types

### PinJoint2D
Pins two bodies at a single point — they can rotate around the pin but cannot separate.

Use for: chains, pendulums, hinges, flails, wrecking balls.

```gdscript
var joint := PinJoint2D.new()
joint.position = pin_position
joint.node_a = body_a.get_path()
joint.node_b = body_b.get_path()
joint.softness = 0.0          # 0 = rigid, higher = more flex
joint.angular_limit_enabled = true
joint.angular_limit_lower = deg_to_rad(-45)
joint.angular_limit_upper = deg_to_rad(45)
add_child(joint)
```

### GrooveJoint2D
Constrains body B to slide along a groove (line segment) defined on body A. Body B's anchor slides between the groove endpoints.

Use for: sliding doors, pistons, rail-mounted objects.

```gdscript
var joint := GrooveJoint2D.new()
joint.position = groove_start
joint.node_a = rail.get_path()
joint.node_b = slider.get_path()
joint.length = 200.0           # Groove length in pixels
joint.initial_offset = 100.0   # Starting offset along groove
add_child(joint)
```

### DampedSpringJoint2D
Spring connection between two bodies. Bodies are pulled toward rest length.

Use for: springs, soft connections, elastic tethers, suspension.

```gdscript
var joint := DampedSpringJoint2D.new()
joint.position = anchor_a
joint.node_a = body_a.get_path()
joint.node_b = body_b.get_path()
joint.rest_length = 100.0      # Distance at which spring is relaxed
joint.length = 150.0           # Maximum stretch distance
joint.stiffness = 20.0         # Spring force multiplier
joint.damping = 1.0            # Dampening (reduces oscillation)
add_child(joint)
```

## Common Patterns

### Rope / Chain
```gdscript
func create_chain(start: Vector2, segments: int, segment_length: float) -> void:
    var prev_body: RigidBody2D = null
    
    for i in segments:
        var body := RigidBody2D.new()
        var shape := CollisionShape2D.new()
        var rect := RectangleShape2D.new()
        rect.size = Vector2(8, segment_length)
        shape.shape = rect
        body.add_child(shape)
        body.position = start + Vector2(0, i * segment_length)
        add_child(body)
        
        var pin := PinJoint2D.new()
        pin.position = body.position - Vector2(0, segment_length / 2.0)
        if prev_body:
            pin.node_a = prev_body.get_path()
        # else: anchored to world (static pin)
        pin.node_b = body.get_path()
        add_child(pin)
        
        prev_body = body
```

### Breakable Joint
```gdscript
@export var break_force: float = 500.0

func _physics_process(delta: float) -> void:
    # Joints don't expose force directly — approximate via body velocities
    var body_a: RigidBody2D = get_node(joint.node_a)
    var body_b: RigidBody2D = get_node(joint.node_b)
    var separation_force: float = (body_a.linear_velocity - body_b.linear_velocity).length()
    
    if separation_force > break_force:
        joint.queue_free()
```

## Joint Properties (Common)

```gdscript
# Disable collision between connected bodies
joint.disable_collision = true  # Default: true (connected bodies don't collide)

# Bias — error correction speed (0-1). Higher = snappier but less stable
joint.bias = 0.3
```

## C# Equivalents

```csharp
var joint = new PinJoint2D();
joint.NodeA = bodyA.GetPath();
joint.NodeB = bodyB.GetPath();
joint.Position = pinPosition;
AddChild(joint);

var spring = new DampedSpringJoint2D();
spring.RestLength = 100.0f;
spring.Stiffness = 20.0f;
spring.Damping = 1.0f;
```
