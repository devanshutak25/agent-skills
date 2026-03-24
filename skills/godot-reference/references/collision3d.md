# Collision & Raycasting 3D Reference

## Collision Layers and Masks (3D)

Same system as 2D — 32-bit bitmasks. Named in Project Settings → General → Layer Names → 3D Physics.

Typical 3D layout:
```
Layer 1: Player
Layer 2: Enemies
Layer 3: Environment / Static
Layer 4: Projectiles
Layer 5: Interactables
Layer 6: Triggers / Areas
Layer 7: Hitboxes
Layer 8: Hurtboxes
Layer 9: Navigation Obstacles
```

```gdscript
# Code configuration (same API as 2D)
set_collision_layer_value(1, true)
set_collision_mask_value(3, true)
collision_layer = 1 << 0 | 1 << 2    # Layers 1 and 3
collision_mask = 0b00000110           # Mask layers 2 and 3
```

## RayCast3D Node

Persistent raycast, updates every physics frame.

```gdscript
@onready var ray: RayCast3D = $RayCast3D

func _ready() -> void:
    ray.target_position = Vector3(0, 0, -100)  # Local space (forward = -Z)
    ray.collision_mask = 0b00000111
    ray.enabled = true
    ray.collide_with_areas = false
    ray.collide_with_bodies = true
    ray.hit_from_inside = false
    ray.hit_back_faces = true        # Detect backfaces of concave shapes
    ray.exclude_parent = true

func _physics_process(delta: float) -> void:
    if ray.is_colliding():
        var collider: Object = ray.get_collider()
        var point: Vector3 = ray.get_collision_point()      # World space
        var normal: Vector3 = ray.get_collision_normal()
        var rid: RID = ray.get_collider_rid()
        var shape_idx: int = ray.get_collider_shape()
        var face_idx: int = ray.get_collision_face_index()   # Triangle index

# Exceptions
ray.add_exception(some_body)
ray.remove_exception(some_body)
ray.clear_exceptions()

# Force immediate update (for same-frame queries)
ray.force_raycast_update()
```

### Common 3D RayCast Patterns

#### Ground Check / Snap
```gdscript
# Place below character, pointing down
@onready var ground_ray: RayCast3D = $GroundRay
# target_position = Vector3(0, -2, 0)

func _physics_process(delta: float) -> void:
    if ground_ray.is_colliding():
        var ground_point: Vector3 = ground_ray.get_collision_point()
        var ground_normal: Vector3 = ground_ray.get_collision_normal()
        # Snap to ground, align to slope, etc.
```

#### Interaction / Crosshair Raycast
```gdscript
# Attach to Camera3D, pointing forward
@onready var interact_ray: RayCast3D = $InteractRay
# target_position = Vector3(0, 0, -3) — 3 meter range

func _physics_process(delta: float) -> void:
    if interact_ray.is_colliding():
        var obj: Object = interact_ray.get_collider()
        if obj is Node and obj.has_method(&"get_interaction_prompt"):
            show_prompt(obj.get_interaction_prompt())

func _unhandled_input(event: InputEvent) -> void:
    if event.is_action_pressed(&"interact") and interact_ray.is_colliding():
        var obj: Object = interact_ray.get_collider()
        if obj is Node and obj.has_method(&"interact"):
            obj.interact()
```

#### Line of Sight (3D)
```gdscript
func can_see(target: Node3D) -> bool:
    var ray: RayCast3D = $LineOfSight
    ray.target_position = to_local(target.global_position)
    ray.force_raycast_update()
    
    if not ray.is_colliding():
        return true
    return ray.get_collider() == target
```

## ShapeCast3D Node

Sweeps a shape along a vector, detects multiple collisions.

```gdscript
@onready var shape_cast: ShapeCast3D = $ShapeCast3D

func _ready() -> void:
    shape_cast.shape = SphereShape3D.new()
    shape_cast.shape.radius = 0.5
    shape_cast.target_position = Vector3(0, 0, -10)
    shape_cast.collision_mask = 0b00001110
    shape_cast.max_results = 16
    shape_cast.collide_with_areas = true
    shape_cast.collide_with_bodies = true

func _physics_process(delta: float) -> void:
    if shape_cast.is_colliding():
        for i in shape_cast.get_collision_count():
            var collider: Object = shape_cast.get_collider(i)
            var point: Vector3 = shape_cast.get_collision_point(i)
            var normal: Vector3 = shape_cast.get_collision_normal(i)
        
        # Fraction of travel before first collision (0-1)
        var safe: float = shape_cast.get_closest_collision_safe_fraction()
        var unsafe: float = shape_cast.get_closest_collision_unsafe_fraction()
```

Use for: melee weapon swings (capsule sweep), thick projectiles, ground snapping, area-of-effect checks.

#### Immediate Overlap (target_position = zero)
```gdscript
# Detect all bodies overlapping a sphere RIGHT NOW
shape_cast.target_position = Vector3.ZERO
shape_cast.force_shapecast_update()

if shape_cast.is_colliding():
    for i in shape_cast.get_collision_count():
        var body: Object = shape_cast.get_collider(i)
```

## Direct Space State (Code-Only Queries)

Access via `PhysicsDirectSpaceState3D`. Call during `_physics_process()`.

### Raycast
```gdscript
func raycast(from: Vector3, to: Vector3) -> Dictionary:
    var space := get_world_3d().direct_space_state
    var query := PhysicsRayQueryParameters3D.create(from, to)
    query.collision_mask = 0b00000111
    query.collide_with_areas = false
    query.collide_with_bodies = true
    query.hit_from_inside = false
    query.hit_back_faces = true
    query.exclude = [self.get_rid()]
    
    return space.intersect_ray(query)
    # Returns: { position, normal, collider, collider_id, rid, shape, face_index }
    # Empty dict if no hit
```

### Mouse-to-World Raycast
```gdscript
func raycast_from_mouse(mouse_pos: Vector2, distance: float = 1000.0) -> Dictionary:
    var camera: Camera3D = get_viewport().get_camera_3d()
    var from: Vector3 = camera.project_ray_origin(mouse_pos)
    var to: Vector3 = from + camera.project_ray_normal(mouse_pos) * distance
    
    var space := get_world_3d().direct_space_state
    var query := PhysicsRayQueryParameters3D.create(from, to)
    query.collision_mask = 0b00000111
    return space.intersect_ray(query)
```

### Point Query
```gdscript
func query_point(point: Vector3) -> Array[Dictionary]:
    var space := get_world_3d().direct_space_state
    var params := PhysicsPointQueryParameters3D.new()
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
# Find all objects overlapping a sphere
func query_sphere(center: Vector3, radius: float) -> Array[Dictionary]:
    var space := get_world_3d().direct_space_state
    var params := PhysicsShapeQueryParameters3D.new()
    
    var sphere := SphereShape3D.new()
    sphere.radius = radius
    params.shape = sphere
    params.transform = Transform3D(Basis.IDENTITY, center)
    params.collision_mask = 0b00000110
    params.collide_with_areas = true
    params.max_results = 32
    
    return space.intersect_shape(params)
    # Each dict: { rid, collider_id, collider, shape }
```

### Motion / Sweep Test
```gdscript
# Test if a shape can move without collision
func can_move_shape(shape: Shape3D, from_transform: Transform3D, motion: Vector3) -> Array:
    var space := get_world_3d().direct_space_state
    var params := PhysicsShapeQueryParameters3D.new()
    params.shape = shape
    params.transform = from_transform
    params.motion = motion
    params.collision_mask = 0b00000111
    
    return space.cast_motion(params)
    # Returns [safe_fraction, unsafe_fraction]
    # safe = 1.0 means full motion is clear
```

### Multi-Hit Raycast (Penetrating)
```gdscript
# Cast through multiple objects by excluding previous hits
func multi_raycast(from: Vector3, to: Vector3, max_hits: int = 10) -> Array[Dictionary]:
    var space := get_world_3d().direct_space_state
    var exclude: Array[RID] = []
    var hits: Array[Dictionary] = []
    
    for i in max_hits:
        var query := PhysicsRayQueryParameters3D.create(from, to)
        query.collision_mask = 0b00000111
        query.exclude = exclude
        
        var result: Dictionary = space.intersect_ray(query)
        if result.is_empty():
            break
        
        hits.append(result)
        exclude.append(result.rid)
    
    return hits
```

## Collision Detection Patterns (3D)

### Hitbox / Hurtbox System
```gdscript
# Hitbox — Area3D on attacker, Layer 7, Mask 8
# Hurtbox — Area3D on defender, Layer 8, Mask none

# hitbox.gd
extends Area3D
@export var damage: float = 25.0

func _on_area_entered(area: Area3D) -> void:
    if area.is_in_group(&"hurtbox"):
        var target: Node3D = area.get_parent()
        if target.has_method(&"take_damage"):
            target.take_damage(damage, global_position)
```

### Explosion / Area Damage
```gdscript
func apply_explosion(center: Vector3, radius: float, max_damage: float) -> void:
    var space := get_world_3d().direct_space_state
    var params := PhysicsShapeQueryParameters3D.new()
    var sphere := SphereShape3D.new()
    sphere.radius = radius
    params.shape = sphere
    params.transform = Transform3D(Basis.IDENTITY, center)
    params.collision_mask = 0b00000010  # Enemies
    
    for result in space.intersect_shape(params):
        var body: Node3D = result.collider
        var dist: float = center.distance_to(body.global_position)
        var falloff: float = 1.0 - clampf(dist / radius, 0.0, 1.0)
        
        # Line-of-sight check (don't damage through walls)
        var los_query := PhysicsRayQueryParameters3D.create(center, body.global_position)
        los_query.collision_mask = 0b00000100  # Environment only
        var los_result := space.intersect_ray(los_query)
        
        if los_result.is_empty():
            if body.has_method(&"take_damage"):
                body.take_damage(max_damage * falloff)
            if body is RigidBody3D:
                var dir: Vector3 = (body.global_position - center).normalized()
                body.apply_central_impulse(dir * max_damage * falloff)
```

### Projectile with Raycasting
```gdscript
# For fast projectiles that might tunnel through thin walls
extends Node3D

var direction: Vector3
var speed: float = 100.0

func _physics_process(delta: float) -> void:
    var motion: Vector3 = direction * speed * delta
    var space := get_world_3d().direct_space_state
    var query := PhysicsRayQueryParameters3D.create(
        global_position, global_position + motion
    )
    query.collision_mask = 0b00000110
    
    var result := space.intersect_ray(query)
    if result:
        global_position = result.position
        on_hit(result.collider, result.normal)
    else:
        global_position += motion
```

## Collision Shape Generation

### From Mesh (Editor)
Select MeshInstance3D → Mesh menu:
- **Create Trimesh Static Body** — precise concave mesh (static only)
- **Create Single Convex Collision Sibling** — one convex hull
- **Create Simplified Convex Collision Sibling** — simplified convex hull
- **Create Multiple Convex Collision Siblings** — V-HACD decomposition

### Import Hints (glTF / FBX)
Append suffixes to mesh names in your 3D modeling tool:
```
MeshName-col       → Trimesh (concave) collision
MeshName-colonly   → Trimesh collision, mesh hidden
MeshName-convcol   → Single convex collision
MeshName-convcolonly → Convex collision, mesh hidden
```

### Code Generation
```gdscript
# From MeshInstance3D
var mesh_instance: MeshInstance3D = $MeshInstance3D
mesh_instance.create_trimesh_collision()           # Concave (static only)
mesh_instance.create_convex_collision()            # Single convex
mesh_instance.create_multiple_convex_collisions()  # Decomposed convex
```

## Performance Tips

- Use Jolt Physics for scenes with many rigid bodies (better performance, more accurate stacking)
- Sphere and Box shapes are cheapest; Trimesh/ConcavePolygon is most expensive
- ConcavePolygon/Trimesh: ONLY for StaticBody3D — never for moving bodies
- Enable continuous collision detection (`continuous_cd`) on fast-moving RigidBody3D to prevent tunneling
- Use `sleeping` on idle RigidBody3D nodes — wake automatically on collision
- Minimize `max_contacts_reported` on RigidBody3D
- For many static meshes, combine collision shapes where possible
- Direct space state queries are cheaper than adding/removing nodes, but RayCast3D nodes are optimized for persistent checks

## C# Equivalents

```csharp
// RayCast3D node
if (ray.IsColliding())
{
    var collider = ray.GetCollider() as Node3D;
    Vector3 point = ray.GetCollisionPoint();
    Vector3 normal = ray.GetCollisionNormal();
}

// Direct space state
var spaceState = GetWorld3D().DirectSpaceState;
var query = PhysicsRayQueryParameters3D.Create(from, to);
query.CollisionMask = 0b00000111;
query.Exclude = new Godot.Collections.Array<Rid> { GetRid() };
var result = spaceState.IntersectRay(query);

if (result.Count > 0)
{
    var collider = result["collider"].As<Node3D>();
    var position = result["position"].AsVector3();
    var normal = result["normal"].AsVector3();
}

// Shape query
var sphere = new SphereShape3D { Radius = 5.0f };
var shapeParams = new PhysicsShapeQueryParameters3D
{
    Shape = sphere,
    Transform = new Transform3D(Basis.Identity, center),
    CollisionMask = 0b00000110
};
var results = spaceState.IntersectShape(shapeParams);
```
