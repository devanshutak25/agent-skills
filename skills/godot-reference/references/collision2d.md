# Collision & Raycasting 2D Reference

## Collision Layers and Masks

Every `CollisionObject2D` (bodies + areas) has two 32-bit bitmasks:

- **Layer** — "I exist on these layers" (what I am)
- **Mask** — "I detect objects on these layers" (what I scan for)

Collision occurs when object A's **mask** overlaps object B's **layer** (or vice versa). Both directions are checked — if either A masks B's layer OR B masks A's layer, they collide.

### Configuration

Name layers in Project Settings → General → Layer Names → 2D Physics:
```
Layer 1: Player
Layer 2: Enemies
Layer 3: Environment
Layer 4: Projectiles
Layer 5: Pickups
Layer 6: Triggers
```

### Typical Setup

| Object | Layer | Mask | Effect |
|---|---|---|---|
| Player | 1 (Player) | 2,3 (Enemies, Environment) | Exists as Player, collides with enemies & environment |
| Enemy | 2 (Enemies) | 1,3 (Player, Environment) | Exists as Enemy, collides with player & environment |
| Wall | 3 (Environment) | — (none) | Exists as Environment, doesn't actively scan |
| Bullet | 4 (Projectiles) | 2,3 (Enemies, Environment) | Hits enemies and walls |
| Pickup | 5 (Pickups) | — (none) | Exists as Pickup (Area2D detects via mask) |
| Player Hitbox (Area2D) | 6 (Triggers) | 5 (Pickups) | Detects pickups |

### Code Configuration

```gdscript
# Set individual layers/masks (1-indexed)
set_collision_layer_value(1, true)    # Enable layer 1
set_collision_layer_value(2, false)   # Disable layer 2
set_collision_mask_value(3, true)     # Scan layer 3

# Set entire bitmask (0-indexed bits)
collision_layer = 1 << 0 | 1 << 2    # Layers 1 and 3
collision_mask = 1 << 1               # Mask layer 2 only

# Helpers
collision_layer = 0b00000101          # Binary: layers 1 and 3
collision_mask = 0b00000010           # Binary: mask layer 2
```

### One-Way Collisions

Enable `one_way_collision` on a `CollisionShape2D` for platforms you can jump through from below:
```gdscript
$CollisionShape2D.one_way_collision = true
$CollisionShape2D.one_way_collision_margin = 4.0  # Tolerance in pixels
```

## RayCast2D Node

Persistent raycast that updates every physics frame. Attach as child of a node:

```gdscript
# Setup in editor or code
@onready var ray: RayCast2D = $RayCast2D

func _ready() -> void:
    ray.target_position = Vector2(0, 100)   # Direction + length (local space)
    ray.collision_mask = 0b00000111          # Layers to detect
    ray.enabled = true
    ray.collide_with_areas = false           # Default: false
    ray.collide_with_bodies = true           # Default: true
    ray.hit_from_inside = false              # Detect if starting inside a shape
    ray.exclude_parent = true                # Skip parent body

func _physics_process(delta: float) -> void:
    if ray.is_colliding():
        var collider: Object = ray.get_collider()
        var point: Vector2 = ray.get_collision_point()    # World space
        var normal: Vector2 = ray.get_collision_normal()
        var rid: RID = ray.get_collider_rid()
        var shape_idx: int = ray.get_collider_shape()
        
        if collider is CharacterBody2D:
            print("Hit player at ", point)

# Exceptions (ignore specific objects)
ray.add_exception(some_body)
ray.remove_exception(some_body)
ray.clear_exceptions()
```

### Common RayCast2D Patterns

#### Floor Detection (Beyond is_on_floor)
```gdscript
# Detect ground ahead for cliff edge detection
@onready var edge_ray: RayCast2D = $EdgeDetector
# Position at character's feet, pointing down+forward

func _physics_process(delta: float) -> void:
    if not edge_ray.is_colliding():
        # No ground ahead — edge of cliff
        turn_around()
```

#### Line of Sight
```gdscript
@onready var los_ray: RayCast2D = $LineOfSight

func can_see_target(target_pos: Vector2) -> bool:
    los_ray.target_position = to_local(target_pos)
    los_ray.force_raycast_update()  # Immediate update (not next frame)
    
    if not los_ray.is_colliding():
        return true  # Nothing blocking
    
    # Check if the hit object IS the target
    return los_ray.get_collider() == target
```

## ShapeCast2D Node

Like RayCast2D but sweeps a shape instead of a line. Detects multiple collisions along the sweep:

```gdscript
@onready var shape_cast: ShapeCast2D = $ShapeCast2D

func _ready() -> void:
    shape_cast.shape = CircleShape2D.new()
    shape_cast.shape.radius = 20.0
    shape_cast.target_position = Vector2(200, 0)   # Sweep direction
    shape_cast.collision_mask = 0b00000110
    shape_cast.max_results = 8
    shape_cast.collide_with_areas = true

func _physics_process(delta: float) -> void:
    if shape_cast.is_colliding():
        var count: int = shape_cast.get_collision_count()
        for i in count:
            var collider: Object = shape_cast.get_collider(i)
            var point: Vector2 = shape_cast.get_collision_point(i)
            var normal: Vector2 = shape_cast.get_collision_normal(i)
```

Use for: wide attacks (sword swings), thick laser beams, ground snap, area scanning.

## Direct Space State (Code-Only Queries)

For one-shot queries without persistent nodes. Access via `PhysicsDirectSpaceState2D`:

### Raycast
```gdscript
func raycast_from_to(from: Vector2, to: Vector2) -> Dictionary:
    var space := get_world_2d().direct_space_state
    var query := PhysicsRayQueryParameters2D.create(from, to)
    query.collision_mask = 0b00000111
    query.collide_with_areas = false
    query.collide_with_bodies = true
    query.exclude = [self.get_rid()]  # Exclude self
    
    var result: Dictionary = space.intersect_ray(query)
    # Returns: { position, normal, collider, collider_id, rid, shape }
    # Returns empty dict if no hit
    return result
```

### Point Query
```gdscript
# Find all objects at a specific point
func query_point(point: Vector2) -> Array[Dictionary]:
    var space := get_world_2d().direct_space_state
    var params := PhysicsPointQueryParameters2D.new()
    params.position = point
    params.collision_mask = 0b11111111
    params.collide_with_areas = true
    params.collide_with_bodies = true
    params.max_results = 32
    
    return space.intersect_point(params)
    # Each dict: { rid, collider_id, collider, shape }
```

### Shape Query
```gdscript
# Find all objects overlapping a shape
func query_shape(center: Vector2, radius: float) -> Array[Dictionary]:
    var space := get_world_2d().direct_space_state
    var params := PhysicsShapeQueryParameters2D.new()
    
    var circle := CircleShape2D.new()
    circle.radius = radius
    params.shape = circle
    params.transform = Transform2D(0.0, center)
    params.collision_mask = 0b00000110
    params.collide_with_areas = true
    params.max_results = 32
    
    return space.intersect_shape(params)
    # Each dict: { rid, collider_id, collider, shape }

# Motion query — test if a shape CAN move without collision
func can_move(shape: Shape2D, from: Transform2D, motion: Vector2) -> bool:
    var space := get_world_2d().direct_space_state
    var params := PhysicsShapeQueryParameters2D.new()
    params.shape = shape
    params.transform = from
    params.motion = motion
    params.collision_mask = 0b00000111
    
    var result: Array = space.cast_motion(params)
    # Returns [safe_fraction, unsafe_fraction]
    return result[0] >= 1.0  # 1.0 means full motion is clear
```

**Important**: Direct space state queries must be called during `_physics_process()` or after `force_raycast_update()`. Calling during `_process()` may give stale results.

## Collision Detection Patterns

### Hitbox / Hurtbox System
```gdscript
# Hitbox (deals damage) — Area2D on attacker
# Layer: 7 (Hitboxes), Mask: 8 (Hurtboxes)

# Hurtbox (receives damage) — Area2D on defender
# Layer: 8 (Hurtboxes), Mask: none (passive)

# On hitbox:
func _on_area_entered(area: Area2D) -> void:
    if area.is_in_group(&"hurtbox"):
        var target: Node2D = area.get_parent()
        if target.has_method(&"take_damage"):
            target.take_damage(damage)
```

### Projectile Collision
```gdscript
# Option A: Area2D projectile (lightweight, no physics response)
extends Area2D

func _physics_process(delta: float) -> void:
    position += direction * speed * delta

func _on_body_entered(body: Node2D) -> void:
    if body.has_method(&"take_damage"):
        body.take_damage(damage)
    queue_free()

# Option B: CharacterBody2D projectile (uses move_and_collide for precise hit)
extends CharacterBody2D

func _physics_process(delta: float) -> void:
    var collision := move_and_collide(direction * speed * delta)
    if collision:
        var body := collision.get_collider()
        if body.has_method(&"take_damage"):
            body.take_damage(damage)
        queue_free()
```

### Overlap Test (Instant)
```gdscript
# Check if a position is inside a solid before spawning
func is_position_clear(pos: Vector2, radius: float = 16.0) -> bool:
    var space := get_world_2d().direct_space_state
    var params := PhysicsPointQueryParameters2D.new()
    params.position = pos
    params.collision_mask = 0b00000100  # Environment layer
    params.max_results = 1
    return space.intersect_point(params).is_empty()
```

## Performance Tips

- Prefer `RayCast2D` nodes over direct space state queries for persistent checks (they're optimized)
- Use `force_raycast_update()` sparingly — it's a synchronous physics query
- Minimize the number of `RigidBody2D` nodes; use `StaticBody2D` wherever possible
- Disable `contact_monitor` on RigidBody2D unless you need body_entered/exited signals
- Set `sleeping` on RigidBody2D for objects at rest
- Use simple shapes (Circle, Rectangle) over polygons
- Disable processing on bodies that don't need per-frame updates: `set_physics_process(false)`

## C# Equivalents

```csharp
// Raycast
var spaceState = GetWorld2D().DirectSpaceState;
var query = PhysicsRayQueryParameters2D.Create(from, to);
query.CollisionMask = 0b00000111;
var result = spaceState.IntersectRay(query);

if (result.Count > 0)
{
    var collider = result["collider"].As<Node2D>();
    var point = result["position"].AsVector2();
}

// RayCast2D node
if (ray.IsColliding())
{
    var collider = ray.GetCollider();
    var point = ray.GetCollisionPoint();
}
```
