# Physics Bodies 3D Reference

## Physics Engine Selection

Godot 4 offers two 3D physics engines:

- **Godot Physics** — Built-in, default. Adequate for most games.
- **Jolt Physics** — Built-in since 4.4. More accurate, better performance with many bodies. Enable in Project Settings → Physics → 3D → Physics Engine → "Jolt Physics".

Both use the same node API — switching engines requires no code changes.

## Body Types

| Body | Purpose | Movement | Collision Response |
|---|---|---|---|
| `StaticBody3D` | Immovable environment | None (or constant velocity) | Other bodies bounce off it |
| `CharacterBody3D` | Player/NPC characters | Code-driven via `move_and_slide()` | Slides along surfaces |
| `RigidBody3D` | Physics-simulated objects | Engine-driven (forces, gravity) | Full physics response |
| `AnimatableBody3D` | Moving platforms / kinematic | Animated via code/tween | Pushes other bodies |
| `Area3D` | Detection volumes, triggers | No physics response | Detects overlaps |

## StaticBody3D

Immovable. Use for: level geometry, walls, floors, terrain.

```gdscript
# Optional: surface properties
constant_linear_velocity = Vector3(5, 0, 0)   # Conveyor belt
constant_angular_velocity = Vector3(0, 1, 0)  # Rotating platform

physics_material_override = PhysicsMaterial.new()
physics_material_override.friction = 0.8
physics_material_override.bounce = 0.1
```

For CSG or imported meshes, use "Create Trimesh Static Body" (Mesh menu) to auto-generate collision.

## CharacterBody3D

### First-Person / Third-Person Movement
```gdscript
extends CharacterBody3D

@export var speed: float = 5.0
@export var jump_velocity: float = 4.5
@export var mouse_sensitivity: float = 0.002

var gravity: float = ProjectSettings.get_setting("physics/3d/default_gravity")

@onready var camera_pivot: Node3D = $CameraPivot

func _unhandled_input(event: InputEvent) -> void:
    if event is InputEventMouseMotion:
        rotate_y(-event.relative.x * mouse_sensitivity)
        camera_pivot.rotate_x(-event.relative.y * mouse_sensitivity)
        camera_pivot.rotation.x = clampf(camera_pivot.rotation.x, -PI / 2.0, PI / 2.0)

func _physics_process(delta: float) -> void:
    # Gravity
    if not is_on_floor():
        velocity.y -= gravity * delta
    
    # Jump
    if Input.is_action_just_pressed(&"jump") and is_on_floor():
        velocity.y = jump_velocity
    
    # Movement (relative to camera facing)
    var input_dir: Vector2 = Input.get_vector(
        &"move_left", &"move_right", &"move_forward", &"move_back"
    )
    var direction: Vector3 = (transform.basis * Vector3(input_dir.x, 0, input_dir.y)).normalized()
    
    if direction:
        velocity.x = direction.x * speed
        velocity.z = direction.z * speed
    else:
        velocity.x = move_toward(velocity.x, 0, speed)
        velocity.z = move_toward(velocity.z, 0, speed)
    
    move_and_slide()
```

### move_and_slide() 3D Properties
```gdscript
# Floor detection
up_direction = Vector3.UP
floor_max_angle = deg_to_rad(45)
floor_snap_length = 0.1          # Meters (keep small in 3D)
floor_stop_on_slope = true
floor_block_on_wall = true

# Motion mode
motion_mode = MotionMode.MOTION_MODE_GROUNDED
# or MOTION_MODE_FLOATING for flying/swimming

# Slide settings
max_slides = 6
wall_min_slide_angle = deg_to_rad(15)

# Platform behavior
platform_on_leave = PLATFORM_ON_LEAVE_ADD_VELOCITY
platform_wall_layers = 0
platform_floor_layers = 0xFFFFFFFF
```

### Collision Queries
```gdscript
func _physics_process(delta: float) -> void:
    move_and_slide()
    
    for i in get_slide_collision_count():
        var collision: KinematicCollision3D = get_slide_collision(i)
        var collider: Object = collision.get_collider()
        var normal: Vector3 = collision.get_normal()
        var point: Vector3 = collision.get_position()
        
        if collider is RigidBody3D:
            collider.apply_central_impulse(-normal * 5.0)
    
    is_on_floor()
    is_on_wall()
    is_on_ceiling()
    get_floor_normal()
    get_wall_normal()
    get_platform_velocity()
    get_real_velocity()         # Actual velocity after sliding
```

### move_and_collide() 3D
```gdscript
func _physics_process(delta: float) -> void:
    var collision: KinematicCollision3D = move_and_collide(velocity * delta)
    if collision:
        velocity = velocity.bounce(collision.get_normal()) * 0.8
```

## RigidBody3D

Physics-driven. Use for: crates, barrels, vehicles, ragdoll parts, debris.

```gdscript
extends RigidBody3D

func _ready() -> void:
    mass = 10.0                    # kg
    gravity_scale = 1.0
    linear_damp = 0.0              # Air resistance
    angular_damp = 0.0             # Rotational damping
    
    # Continuous collision detection (prevents fast objects tunneling)
    continuous_cd = true
    
    # Contact monitoring
    contact_monitor = true
    max_contacts_reported = 4
    
    # Sleeping (optimization for stationary bodies)
    can_sleep = true
    
    # Lock specific axes
    axis_lock_linear_x = false
    axis_lock_linear_y = false
    axis_lock_linear_z = false
    axis_lock_angular_x = false
    axis_lock_angular_y = false
    axis_lock_angular_z = false

func launch(direction: Vector3, force: float) -> void:
    apply_central_impulse(direction.normalized() * force)
```

### Forces and Impulses

| Method | Effect | Duration |
|---|---|---|
| `apply_central_impulse(impulse)` | Instant velocity change | One-shot |
| `apply_impulse(impulse, offset)` | Instant velocity + torque at point | One-shot |
| `apply_central_force(force)` | Continuous force at center | Per physics step |
| `apply_force(force, offset)` | Continuous force at point | Per physics step |
| `apply_torque(torque)` | Continuous rotation force | Per physics step |
| `apply_torque_impulse(impulse)` | Instant rotation | One-shot |

```gdscript
# Explosion
func apply_explosion(center: Vector3, radius: float, force: float) -> void:
    var dir: Vector3 = global_position - center
    var distance: float = dir.length()
    if distance < radius:
        var falloff: float = 1.0 - (distance / radius)
        apply_central_impulse(dir.normalized() * force * falloff)

# Directional gravity (inside _integrate_forces)
func _integrate_forces(state: PhysicsDirectBodyState3D) -> void:
    var custom_gravity := Vector3(0, -20, 0)
    state.apply_central_force(custom_gravity * mass)
```

### Freeze Modes
```gdscript
freeze = true
freeze_mode = RigidBody3D.FREEZE_MODE_STATIC     # Behaves like StaticBody3D
freeze_mode = RigidBody3D.FREEZE_MODE_KINEMATIC   # Behaves like AnimatableBody3D
```

### Signals
```gdscript
body_entered(body: Node)        # Requires contact_monitor + max_contacts > 0
body_exited(body: Node)
body_shape_entered(body_rid, body, body_shape_index, local_shape_index)
body_shape_exited(body_rid, body, body_shape_index, local_shape_index)
sleeping_state_changed()
```

## Area3D

Detection volume — no physics response. Use for: triggers, damage zones, gravity fields, audio zones.

```gdscript
extends Area3D

func _ready() -> void:
    # Gravity override
    gravity_space_override = Area3D.SPACE_OVERRIDE_REPLACE
    gravity_direction = Vector3.DOWN
    gravity = 9.8
    
    # Wind (linear/angular damping override)
    linear_damp_space_override = Area3D.SPACE_OVERRIDE_COMBINE
    linear_damp = 5.0
    
    body_entered.connect(_on_body_entered)
    body_exited.connect(_on_body_exited)
    area_entered.connect(_on_area_entered)

func _on_body_entered(body: Node3D) -> void:
    if body.is_in_group(&"player"):
        trigger_cutscene()
```

### Space Override Modes
```gdscript
SPACE_OVERRIDE_DISABLED    # No override
SPACE_OVERRIDE_COMBINE     # Add to default
SPACE_OVERRIDE_COMBINE_REPLACE  # Add, then stop processing
SPACE_OVERRIDE_REPLACE     # Replace default entirely
SPACE_OVERRIDE_REPLACE_COMBINE  # Replace, then combine with lower priority
```

Areas with higher `priority` are processed first. Use for: water zones (reduced gravity), space (zero gravity), wind tunnels.

## CollisionShape3D

Available 3D shapes:

```gdscript
BoxShape3D             # Fast — axis-aligned box
SphereShape3D          # Fastest — use wherever possible
CapsuleShape3D         # Good for characters (smooth sliding)
CylinderShape3D        # Upright cylinder
ConvexPolygonShape3D   # Convex hull (auto-generated from mesh)
ConcavePolygonShape3D  # Triangle mesh (STATIC ONLY, expensive)
WorldBoundaryShape3D   # Infinite plane
SeparationRayShape3D   # Ray with separation
HeightMapShape3D       # Terrain heightmap
```

**Performance rules**:
- Sphere is fastest, Box is second
- Capsule is best for characters
- ConvexPolygon: keep under 32 faces
- ConcavePolygon / Trimesh: ONLY for `StaticBody3D` — never for moving bodies
- HeightMapShape3D: efficient for large terrains
- Multiple simple shapes > one complex shape

### Auto-Generating Collision from Meshes

In the editor, select a MeshInstance3D → Mesh menu:
- **Create Trimesh Static Body** — ConcavePolygon (precise, static only)
- **Create Simplified Convex Collision Sibling** — single ConvexPolygon (fast, approximate)
- **Create Multiple Convex Collision Siblings** — decomposed convex hulls (fast, more precise)

For imported scenes (.glTF, .fbx), use `-col`, `-colonly`, `-convcol`, `-convcolonly` suffixes in mesh names for automatic collision generation.

## AnimatableBody3D

Moving platform that pushes other bodies. Unlike StaticBody3D, it correctly transfers velocity to bodies standing on it.

```gdscript
extends AnimatableBody3D

@export var travel: Vector3 = Vector3(0, 5, 0)
@export var duration: float = 3.0

func _ready() -> void:
    var tween := create_tween().set_loops()
    tween.tween_property(self, "position", position + travel, duration)
    tween.tween_property(self, "position", position, duration)
```

## Physics Material

```gdscript
var mat := PhysicsMaterial.new()
mat.friction = 0.5      # 0 = ice, 1 = rubber
mat.bounce = 0.3        # 0 = no bounce, 1 = perfect bounce
mat.rough = false        # true: use max friction (not average)
mat.absorbent = false    # true: use min bounce (not average)

body.physics_material_override = mat
```

When two bodies collide, friction/bounce are averaged between them (unless `rough`/`absorbent` overrides).

## C# Equivalents

```csharp
// CharacterBody3D
public override void _PhysicsProcess(double delta)
{
    var velocity = Velocity;
    if (!IsOnFloor())
        velocity.Y -= Gravity * (float)delta;
    
    var inputDir = Input.GetVector("move_left", "move_right", "move_forward", "move_back");
    var direction = (Transform.Basis * new Vector3(inputDir.X, 0, inputDir.Y)).Normalized();
    velocity.X = direction.X * Speed;
    velocity.Z = direction.Z * Speed;
    Velocity = velocity;
    MoveAndSlide();
}

// RigidBody3D
ApplyCentralImpulse(direction * force);
ApplyForce(new Vector3(0, -10, 0));

// Area3D
BodyEntered += OnBodyEntered;
```
