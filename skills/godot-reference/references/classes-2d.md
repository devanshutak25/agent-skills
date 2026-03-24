# 2D Node Classes Quick Reference

## Physics Bodies

### CharacterBody2D
Player-controlled bodies with `move_and_slide()`.
- **Key properties**: `velocity`, `floor_max_angle`, `up_direction`, `slide_on_ceiling`, `max_slides`, `floor_snap_length`, `platform_floor_layers`, `motion_mode` (Grounded vs Floating)
- **Key methods**: `move_and_slide()`, `is_on_floor()`, `is_on_wall()`, `is_on_ceiling()`, `get_floor_normal()`, `get_slide_collision(idx)`, `get_last_slide_collision()`, `get_platform_velocity()`

### RigidBody2D
Physics-simulated bodies.
- **Key properties**: `mass`, `gravity_scale`, `linear_velocity`, `angular_velocity`, `linear_damp`, `angular_damp`, `freeze`, `freeze_mode`, `continuous_cd`, `contact_monitor`, `max_contacts_reported`
- **Key methods**: `apply_force(force, position)`, `apply_impulse(impulse, position)`, `apply_central_force(force)`, `apply_central_impulse(impulse)`, `apply_torque(torque)`
- **Signals**: `body_entered(body)`, `body_exited(body)` (requires `contact_monitor = true`)
- **Modes**: Dynamic (default), Static, Kinematic (via `freeze` + `freeze_mode`)

### StaticBody2D
Immovable collision body. Use for walls, floors, platforms.
- **Key properties**: `physics_material_override` (bounce, friction), `constant_linear_velocity`, `constant_angular_velocity`

### AnimatableBody2D
StaticBody2D that can be moved via animation/code without teleporting physics objects. Use for moving platforms.

### Area2D
Trigger zone — detects overlaps, applies physics overrides.
- **Key properties**: `gravity`, `gravity_direction`, `linear_damp`, `angular_damp`, `monitoring`, `monitorable`, `priority`
- **Signals**: `body_entered(body)`, `body_exited(body)`, `area_entered(area)`, `area_exited(area)`
- **Key methods**: `get_overlapping_bodies()`, `get_overlapping_areas()`, `has_overlapping_bodies()`

## Collision

### CollisionShape2D
Defines collision geometry. Must be child of a physics body or Area2D.
- **Shapes**: RectangleShape2D, CircleShape2D, CapsuleShape2D, SegmentShape2D, WorldBoundaryShape2D, ConvexPolygonShape2D, ConcavePolygonShape2D
- `disabled` — toggle without removing

### CollisionPolygon2D
Custom polygon collision shape. Slower than primitives.

### RayCast2D
Casts a ray from its position. Set `target_position` for direction/length.
- **Key methods**: `is_colliding()`, `get_collider()`, `get_collision_point()`, `get_collision_normal()`
- `force_raycast_update()` — query immediately outside physics step
- `collision_mask` — which layers to detect

### ShapeCast2D
Like RayCast2D but sweeps a shape. Detects all objects along the path.

## Sprites & Visual

### Sprite2D
Displays a texture.
- **Key properties**: `texture`, `offset`, `flip_h`, `flip_v`, `hframes`, `vframes`, `frame`, `region_enabled`, `region_rect`

### AnimatedSprite2D
Sprite with frame-based animation via SpriteFrames resource.
- **Key methods**: `play(anim)`, `stop()`, `pause()`
- **Signals**: `animation_finished`, `frame_changed`
- `sprite_frames` — the SpriteFrames resource

### MeshInstance2D
Renders a Mesh in 2D. Useful for procedural geometry.

### MultiMeshInstance2D
Renders thousands of 2D meshes efficiently. Good for particles, grass.

### Line2D
Renders a polyline with width, gradient, texture.
- **Key properties**: `points: PackedVector2Array`, `width`, `default_color`, `gradient`, `texture`, `joint_mode`, `begin_cap_mode`, `end_cap_mode`

### Polygon2D
Renders a filled polygon. Supports UV mapping, skeleton deformation.

## Camera & Viewport

### Camera2D
2D camera with smoothing, limits, zoom.
- **Key properties**: `zoom`, `offset`, `position_smoothing_enabled`, `position_smoothing_speed`, `limit_left/right/top/bottom`, `drag_horizontal_enabled`, `anchor_mode`
- `make_current()` — activate this camera

### SubViewport
Off-screen render target. Access texture via `get_texture()`.

### SubViewportContainer
Control node that displays a SubViewport. Set `stretch = true` to scale.

## Navigation

### NavigationAgent2D
Pathfinding agent.
- **Key methods**: `set_target_position(pos)`, `get_next_path_position()`, `is_navigation_finished()`, `is_target_reachable()`
- **Signals**: `navigation_finished`, `target_reached`, `velocity_computed`

### NavigationRegion2D
Defines walkable area. Holds a NavigationPolygon resource.

### NavigationObstacle2D
Dynamic obstacle that agents avoid.

### NavigationLink2D
Connects two navigation regions (e.g., jump points, teleporters).

## Particles

### GPUParticles2D
GPU-accelerated particles. Use ParticleProcessMaterial.
- **Key properties**: `amount`, `lifetime`, `process_material`, `texture`, `emitting`, `one_shot`

### CPUParticles2D
CPU particles. More features (no shader needed), but slower at high counts. Good for < 200 particles.

## Audio

### AudioStreamPlayer2D
Positional 2D audio. Volume attenuates with distance from AudioListener2D (or Camera2D).
- **Key properties**: `stream`, `volume_db`, `max_distance`, `attenuation`, `bus`

## Tilemap

### TileMapLayer (4.0+, replaces TileMap layers)
Single tilemap layer. Use multiple TileMapLayer nodes for multiple layers.
- **Key methods**: `set_cell(coords, source_id, atlas_coords)`, `get_cell_source_id(coords)`, `get_used_cells()`, `local_to_map(local_pos)`, `map_to_local(map_coords)`

## Joints

### PinJoint2D
Pins two bodies at a point.

### DampedSpringJoint2D
Spring connection between two bodies.

### GrooveJoint2D
Constrains a body to slide along a groove.

## Light & Shadow

### PointLight2D / DirectionalLight2D
2D lighting. Requires CanvasItem materials that support lighting.
- **Key properties**: `texture`, `energy`, `color`, `shadow_enabled`, `blend_mode`

### LightOccluder2D
Casts 2D shadows. Child of a Node2D, references an OccluderPolygon2D.

### CanvasModulate
Multiplies all CanvasItem colors in its viewport. Use for day/night cycles.
