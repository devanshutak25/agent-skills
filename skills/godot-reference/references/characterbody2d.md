# Physics Bodies 2D Reference

## Body Types

| Body | Purpose | Movement | Collision Response |
|---|---|---|---|
| `StaticBody2D` | Immovable environment | None (or constant velocity) | Other bodies bounce off it |
| `CharacterBody2D` | Player/NPC characters | Code-driven via `move_and_slide()` | Slides along surfaces |
| `RigidBody2D` | Physics-simulated objects | Engine-driven (forces, gravity) | Full physics response |
| `AnimatableBody2D` | Moving platforms / kinematic | Animated via code/tween | Pushes other bodies along |
| `Area2D` | Detection zones, triggers | No physics response | Detects overlaps, no collision |

## StaticBody2D

Immovable by physics. Use for: walls, floors, platforms, obstacles.

```gdscript
# Typically no script needed — just add CollisionShape2D children

# Optional: constant velocity (moving platform without AnimatableBody2D)
constant_linear_velocity = Vector2(50, 0)
constant_angular_velocity = 0.5  # radians/sec

# Physics material for surface properties
physics_material_override = PhysicsMaterial.new()
physics_material_override.friction = 0.8
physics_material_override.bounce = 0.2
```

## CharacterBody2D

Code-controlled body with built-in collision response. Use for: players, enemies, NPCs.

### Platformer Movement
```gdscript
extends CharacterBody2D

@export var speed: float = 300.0
@export var jump_velocity: float = -400.0
@export var gravity: float = 980.0

func _physics_process(delta: float) -> void:
    # Gravity
    if not is_on_floor():
        velocity.y += gravity * delta
    
    # Jump
    if Input.is_action_just_pressed(&"jump") and is_on_floor():
        velocity.y = jump_velocity
    
    # Horizontal
    var direction: float = Input.get_axis(&"move_left", &"move_right")
    velocity.x = direction * speed
    
    move_and_slide()
```

### Top-Down Movement
```gdscript
extends CharacterBody2D

@export var speed: float = 200.0

func _physics_process(delta: float) -> void:
    var direction: Vector2 = Input.get_vector(
        &"move_left", &"move_right", &"move_up", &"move_down"
    )
    velocity = direction * speed
    move_and_slide()
```

### move_and_slide() Details

`move_and_slide()` uses the `velocity` property (built-in). It:
1. Attempts to move by `velocity * delta` (delta applied internally)
2. On collision, slides along the surface
3. Updates `velocity` to reflect the slide
4. Returns `true` if a collision occurred

Key properties:
```gdscript
# Floor detection
up_direction = Vector2.UP       # What counts as "floor" (default: up)
floor_max_angle = deg_to_rad(45)  # Max slope angle for floor
floor_snap_length = 4.0         # Snap to floor within this distance
floor_stop_on_slope = true      # Don't slide down slopes when idle
floor_block_on_wall = true      # Prevent sliding on walls

# Motion mode
motion_mode = MotionMode.MOTION_MODE_GROUNDED  # Default — floor/wall/ceiling
motion_mode = MotionMode.MOTION_MODE_FLOATING   # Top-down (no floor concept)

# Slide behavior
slide_on_ceiling = true
max_slides = 6                  # Max collision iterations
wall_min_slide_angle = deg_to_rad(15)

# Platform behavior
platform_on_leave = PLATFORM_ON_LEAVE_ADD_VELOCITY  # Inherit platform velocity
platform_floor_layers = 0xFFFFFFFF  # Which layers count as moving platforms
```

### Collision Queries After move_and_slide()
```gdscript
func _physics_process(delta: float) -> void:
    move_and_slide()
    
    # How many collisions this frame
    var count: int = get_slide_collision_count()
    
    for i in count:
        var collision: KinematicCollision2D = get_slide_collision(i)
        var collider: Object = collision.get_collider()
        var normal: Vector2 = collision.get_normal()
        var position: Vector2 = collision.get_position()
        
        # Push rigid bodies
        if collider is RigidBody2D:
            collider.apply_central_impulse(-normal * 80.0)
    
    # Last collision shortcut
    var last: KinematicCollision2D = get_last_slide_collision()
    
    # Floor/wall/ceiling checks
    is_on_floor()
    is_on_wall()
    is_on_ceiling()
    get_floor_normal()       # Normal of the floor surface
    get_wall_normal()        # Normal of the wall surface
    get_platform_velocity()  # Velocity of the platform stood on
```

### move_and_collide() (Alternative)

Lower-level than `move_and_slide()`. Moves by exact vector, returns collision info, no sliding:

```gdscript
func _physics_process(delta: float) -> void:
    var motion: Vector2 = velocity * delta
    var collision: KinematicCollision2D = move_and_collide(motion)
    
    if collision:
        # Manual bounce
        velocity = velocity.bounce(collision.get_normal())
        
        # Or manual slide
        # velocity = velocity.slide(collision.get_normal())
```

Use `move_and_collide()` when you need full control (custom bounce, projectiles, one-way collision logic).

## RigidBody2D

Fully physics-driven. Use for: crates, balls, ragdolls, destructibles, projectiles with physics.

```gdscript
extends RigidBody2D

@export var explosion_force: float = 500.0

func _ready() -> void:
    # Properties
    mass = 2.0
    gravity_scale = 1.0
    linear_damp = 0.0       # Air resistance (0 = none)
    angular_damp = 0.0      # Rotational damping
    
    # Freeze modes
    freeze = false
    freeze_mode = RigidBody2D.FREEZE_MODE_STATIC    # Acts like StaticBody2D
    # freeze_mode = RigidBody2D.FREEZE_MODE_KINEMATIC  # Acts like AnimatableBody2D
    
    # Contact monitoring (for body_entered/exited signals)
    contact_monitor = true
    max_contacts_reported = 4

func explode(direction: Vector2) -> void:
    # Apply forces (during physics step is safe)
    apply_central_impulse(direction * explosion_force)    # Instant impulse
    apply_impulse(direction * 100.0, Vector2(0, -10))    # Impulse at offset
    apply_central_force(direction * 50.0)                 # Continuous force
    apply_torque(200.0)                                   # Rotational force
```

### Applying Forces

| Method | Effect | When to Use |
|---|---|---|
| `apply_central_impulse(impulse)` | Instant velocity change at center | Explosions, jumps |
| `apply_impulse(impulse, offset)` | Instant velocity + torque at point | Shooting at specific point |
| `apply_central_force(force)` | Continuous force (per physics step) | Gravity, wind, magnets |
| `apply_force(force, offset)` | Continuous force at point | Engines, propulsion |
| `apply_torque(torque)` | Continuous rotation | Spinning |
| `apply_torque_impulse(impulse)` | Instant rotation | Impact spin |

**Pitfall**: Do NOT set `position` or `linear_velocity` directly on RigidBody2D from `_process` — this fights the physics engine. Use `_integrate_forces()` for direct state manipulation:

```gdscript
func _integrate_forces(state: PhysicsDirectBodyState2D) -> void:
    # Safe to modify state here
    state.linear_velocity = Vector2(100, 0)
    state.transform = Transform2D(0.0, Vector2(100, 200))
    
    # Access contacts
    for i in state.get_contact_count():
        var contact_pos: Vector2 = state.get_contact_local_position(i)
        var contact_body: Object = state.get_contact_collider_object(i)
```

### RigidBody2D Signals
```gdscript
body_entered(body: Node)       # PhysicsBody2D entered (requires contact_monitor)
body_exited(body: Node)        # PhysicsBody2D exited
body_shape_entered(body_rid, body, body_shape_index, local_shape_index)
body_shape_exited(body_rid, body, body_shape_index, local_shape_index)
sleeping_state_changed()       # Entered or left sleep
```

### Physics Materials
```gdscript
var mat := PhysicsMaterial.new()
mat.friction = 0.5    # 0 = frictionless, 1 = max friction
mat.bounce = 0.7      # 0 = no bounce, 1 = perfect bounce
mat.rough = false      # If true, uses max friction (not average)
mat.absorbent = false  # If true, uses min bounce (not average)
physics_material_override = mat
```

## Area2D

Detection zone — no collision response. Use for: hitboxes/hurtboxes, pickups, triggers, damage zones, gravity fields.

```gdscript
extends Area2D

func _ready() -> void:
    # What this Area detects
    collision_mask = 1           # Detect objects on layer 1
    
    # Monitoring settings
    monitoring = true            # Detect bodies/areas entering
    monitorable = true           # Allow other areas to detect this
    
    # Optional: gravity override
    gravity_space_override = Area2D.SPACE_OVERRIDE_REPLACE
    gravity_direction = Vector2.DOWN
    gravity = 980.0
    
    # Connect signals
    body_entered.connect(_on_body_entered)
    body_exited.connect(_on_body_exited)
    area_entered.connect(_on_area_entered)
    area_exited.connect(_on_area_exited)

func _on_body_entered(body: Node2D) -> void:
    if body.is_in_group(&"player"):
        body.take_damage(10)

func _on_body_exited(body: Node2D) -> void:
    pass

func _on_area_entered(area: Area2D) -> void:
    if area.is_in_group(&"hitbox"):
        queue_free()
```

### Overlap Queries (Instant)
```gdscript
# Get all overlapping bodies right now
var bodies: Array[Node2D] = get_overlapping_bodies()
var areas: Array[Area2D] = get_overlapping_areas()

# Check specific overlap
var has_bodies: bool = has_overlapping_bodies()
var has_areas: bool = has_overlapping_areas()
```

**Pitfall**: `get_overlapping_bodies()` returns empty on the first frame after creation. Use `await get_tree().physics_frame` or connect to signals instead.

### Common Area2D Patterns

#### Pickup / Collectible
```gdscript
extends Area2D

signal collected

func _on_body_entered(body: Node2D) -> void:
    if body.is_in_group(&"player"):
        collected.emit()
        queue_free()
```

#### Damage Zone
```gdscript
extends Area2D

@export var damage_per_second: float = 10.0

func _physics_process(delta: float) -> void:
    for body in get_overlapping_bodies():
        if body.has_method(&"take_damage"):
            body.take_damage(damage_per_second * delta)
```

#### Kill Zone
```gdscript
extends Area2D

func _on_body_entered(body: Node2D) -> void:
    if body.has_method(&"die"):
        body.die()
```

## AnimatableBody2D

Kinematic body that can push other bodies when moved. Use for: moving platforms, elevators, crushers.

```gdscript
extends AnimatableBody2D

@export var move_distance: Vector2 = Vector2(0, -100)
@export var move_duration: float = 2.0

func _ready() -> void:
    var tween := create_tween().set_loops()
    tween.tween_property(self, "position", position + move_distance, move_duration)
    tween.tween_property(self, "position", position, move_duration)
```

Unlike `StaticBody2D`, `AnimatableBody2D` properly pushes `CharacterBody2D` and `RigidBody2D` nodes when moving.

## CollisionShape2D

Every physics body needs at least one `CollisionShape2D` child:

```gdscript
# Available shapes
CircleShape2D           # Fast, use for round objects
RectangleShape2D        # Fast, use for boxes
CapsuleShape2D          # Good for characters
SegmentShape2D          # Line segment
SeparationRayShape2D    # Ray that separates on contact
WorldBoundaryShape2D    # Infinite plane
ConvexPolygonShape2D    # Convex hull (max ~8 vertices for speed)
ConcavePolygonShape2D   # Concave mesh (static only, expensive)
```

**Performance rules**:
- Circle and Rectangle are fastest
- Capsule is best for characters (smooth sliding)
- ConvexPolygon: keep vertex count low (under 8)
- ConcavePolygon: use ONLY for static geometry, never for moving bodies
- Multiple simple shapes > one complex shape

```gdscript
# Disable/enable collision at runtime
$CollisionShape2D.disabled = true
# Or deferred (safe during physics callbacks)
$CollisionShape2D.set_deferred(&"disabled", true)
```

**Pitfall**: Never `queue_free()` a CollisionShape2D during a physics callback. Use `set_deferred(&"disabled", true)` instead.

## C# Equivalents

```csharp
// CharacterBody2D
public override void _PhysicsProcess(double delta)
{
    var velocity = Velocity;
    if (!IsOnFloor())
        velocity.Y += Gravity * (float)delta;
    
    var direction = Input.GetVector("move_left", "move_right", "move_up", "move_down");
    velocity.X = direction.X * Speed;
    Velocity = velocity;
    MoveAndSlide();
}

// RigidBody2D
ApplyCentralImpulse(new Vector2(100, -200));
ApplyForce(new Vector2(0, -50));

// Area2D
BodyEntered += OnBodyEntered;
private void OnBodyEntered(Node2D body) { }
```
