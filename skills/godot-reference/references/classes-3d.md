# 3D Node Classes Quick Reference

## Physics Bodies

### CharacterBody3D
Player-controlled 3D body with `move_and_slide()`.
- **Key properties**: `velocity`, `floor_max_angle`, `up_direction`, `slide_on_ceiling`, `max_slides`, `floor_snap_length`, `wall_min_slide_angle`, `platform_floor_layers`, `motion_mode` (Grounded vs Floating)
- **Key methods**: `move_and_slide()`, `is_on_floor()`, `is_on_wall()`, `is_on_ceiling()`, `get_floor_normal()`, `get_wall_normal()`, `get_slide_collision(idx)`, `get_platform_velocity()`

### RigidBody3D
Physics-simulated body.
- **Key properties**: `mass`, `gravity_scale`, `linear_velocity`, `angular_velocity`, `linear_damp`, `angular_damp`, `freeze`, `continuous_cd`, `contact_monitor`, `max_contacts_reported`, `can_sleep`
- **Key methods**: `apply_force(force, position)`, `apply_impulse(impulse, position)`, `apply_central_force(force)`, `apply_central_impulse(impulse)`, `apply_torque(torque)`
- **Signals**: `body_entered(body)`, `body_exited(body)` (requires `contact_monitor = true`)

### StaticBody3D
Immovable collision body. Walls, floors, terrain.
- **Key properties**: `physics_material_override` (bounce, friction)

### AnimatableBody3D
Movable static body for moving platforms (won't teleport physics objects).

### Area3D
Trigger zone — detects overlaps, applies gravity/damp overrides.
- **Key properties**: `gravity`, `gravity_direction`, `gravity_point_center`, `wind_force_magnitude`, `monitoring`, `monitorable`
- **Signals**: `body_entered`, `body_exited`, `area_entered`, `area_exited`

## Collision

### CollisionShape3D
Defines collision geometry. Child of physics body or Area3D.
- **Shapes**: SphereShape3D, BoxShape3D, CapsuleShape3D, CylinderShape3D, ConvexPolygonShape3D, ConcavePolygonShape3D, HeightMapShape3D, WorldBoundaryShape3D

### CollisionPolygon3D
Extrudes a 2D polygon into 3D collision.

### RayCast3D
Casts a ray. Set `target_position` for direction/length.
- **Key methods**: `is_colliding()`, `get_collider()`, `get_collision_point()`, `get_collision_normal()`
- `collision_mask`, `hit_from_inside`, `hit_back_faces`

### ShapeCast3D
Sweeps a shape along a direction. Detects all objects in path.

## Visual

### MeshInstance3D
Renders a Mesh resource.
- **Key properties**: `mesh`, `surface_get_material(idx)`, `material_override`, `skeleton`, `skin`, `lod_bias`
- **Key methods**: `create_trimesh_collision()`, `create_convex_collision()` — auto-generate collision from mesh

### MultiMeshInstance3D
Renders thousands of meshes in a single draw call.
- Uses `MultiMesh` resource: set `instance_count`, `transform_array`, `color_array`
- Ideal for vegetation, debris, crowds

### CSGBox3D / CSGSphere3D / CSGCylinder3D / CSGMesh3D / CSGPolygon3D / CSGTorus3D / CSGCombiner3D
Constructive Solid Geometry — boolean mesh operations (union, intersection, subtraction). Good for prototyping, not for production performance.

### GeometryInstance3D (base class)
Common properties for all visual 3D instances:
- `material_override`, `material_overlay`, `transparency`, `cast_shadow`, `gi_mode`, `visibility_range_begin/end`

### Decal
Projects a texture onto surfaces.
- **Key properties**: `texture_albedo`, `size`, `cull_mask`, `upper_fade`, `lower_fade`

### FogVolume
Volumetric fog region with custom density.

## Lighting

### DirectionalLight3D
Sun/moon light. Affects entire scene.
- **Key properties**: `shadow_enabled`, `shadow_max_distance`, `directional_shadow_mode` (Orthogonal, PSSM 2/4 splits)

### OmniLight3D
Point light radiating in all directions.
- **Key properties**: `omni_range`, `omni_attenuation`, `shadow_enabled`

### SpotLight3D
Cone-shaped light.
- **Key properties**: `spot_range`, `spot_angle`, `spot_attenuation`, `shadow_enabled`

### LightmapGI
Baked global illumination. Static only.

### VoxelGI
Real-time voxel-based GI. Dynamic but limited range.

### ReflectionProbe
Captures environment for reflections. Static or real-time update.

## Camera

### Camera3D
3D camera.
- **Key properties**: `fov`, `near`, `far`, `projection` (Perspective, Orthogonal, Frustum), `current`
- **Key methods**: `project_ray_origin(screen_point)`, `project_ray_normal(screen_point)`, `unproject_position(world_pos)`, `project_position(screen_point, depth)`

### XRCamera3D
Camera for VR/AR. Managed by XRServer.

## Environment

### WorldEnvironment
Holds an Environment resource for the scene.
- **Environment properties**: Background (sky, color, canvas), ambient light, tonemap, SSAO, SSR, SDFGI, glow, fog, volumetric fog, adjustments

### Sky
Procedural or HDRI sky. Used by WorldEnvironment.

## Audio

### AudioStreamPlayer3D
Positional 3D audio with distance attenuation and Doppler.
- **Key properties**: `stream`, `volume_db`, `unit_size`, `max_distance`, `attenuation_model`, `bus`, `doppler_tracking`

### AudioListener3D
Overrides Camera3D as the audio listener position.

## Navigation

### NavigationAgent3D
3D pathfinding agent.
- **Key methods**: `set_target_position(pos)`, `get_next_path_position()`, `is_navigation_finished()`

### NavigationRegion3D
Defines walkable area via NavigationMesh.

### NavigationObstacle3D
Dynamic obstacle for avoidance.

## Animation

### Skeleton3D
Bone hierarchy for skeletal animation.
- **Key methods**: `get_bone_pose(idx)`, `set_bone_pose_position(idx, pos)`, `find_bone(name)`, `get_bone_count()`

### BoneAttachment3D
Attaches a Node3D to a skeleton bone (weapons, hats).

### IKModifier3D (4.6+)
Inverse kinematics modifier for Skeleton3D. Subclasses include TwoBoneIK3D, FABRIK3D, CCDIK3D, JacobianIK3D, SplineIK3D.

## Joints

### HingeJoint3D, SliderJoint3D, ConeTwistJoint3D, Generic6DOFJoint3D, PinJoint3D
Physics joints constraining two bodies.
- **Note**: Some joint properties (e.g., damp on HingeJoint3D) only work with Godot Physics, not Jolt.

## Occlusion

### OccluderInstance3D
Defines occlusion geometry for culling hidden objects. Use on large solid walls/floors.

## GridMap

### GridMap
3D tilemap equivalent. Places MeshLibrary items on a 3D grid.
- **Key methods**: `set_cell_item(position, item, orientation)`, `get_cell_item(position)`, `get_used_cells()`
- **4.6**: Bresenham algorithm for gap-free line drawing

## XR

### XRController3D / XRNode3D / XROrigin3D
VR/AR controller tracking, node positioning, and origin setup.
- **4.5**: OpenXR render models — `OpenXRRenderModels` node (child of XROrigin3D) provides animated controller models for Quest 3S, Pico 4 Ultra, etc.
- **4.5**: D3D12 support in OpenXR
- **4.6**: Native OpenXR 1.1 support, Android XR device support

## Stencil Buffer (4.5+)

Not a node class — a rendering feature. Meshes can write arbitrary values to a stencil buffer for later comparison.

Enable via material render priority and shader stencil operations. Available in Forward+, Mobile, and Compatibility (Vulkan) renderers.

Use cases: see-through-wall portals, masking, outlines, selective geometry rendering.
