# Particles 3D Reference

## GPUParticles3D vs CPUParticles3D

Same trade-offs as 2D: GPUParticles3D for performance/features, CPUParticles3D for compatibility/data access. GPUParticles3D supports trails, sub-emitters, and collision.

## GPUParticles3D Setup

```gdscript
extends GPUParticles3D

func _ready() -> void:
    emitting = true
    amount = 100
    lifetime = 2.0
    one_shot = false
    preprocess = 0.0
    explosiveness = 0.0
    randomness = 0.0
    speed_scale = 1.0
    local_coords = false
    
    # 3D-specific
    transform_align = TRANSFORM_ALIGN_DISABLED
    # TRANSFORM_ALIGN_Z_BILLBOARD     # Face camera
    # TRANSFORM_ALIGN_Y_TO_VELOCITY   # Align Y to movement
    # TRANSFORM_ALIGN_Z_BILLBOARD_Y_TO_VELOCITY
    
    # Draw pass (mesh used for each particle)
    draw_pass_1 = QuadMesh.new()    # Flat quad (billboard)
    # draw_pass_1 = SphereMesh.new()  # 3D sphere particles
    # draw_pass_1 = preload("res://particle_mesh.mesh")
    
    # Up to 4 draw passes for LOD
    draw_passes = 1
    
    # Visibility AABB (for culling — auto-calculate or set manually)
    visibility_aabb = AABB(Vector3(-5,-5,-5), Vector3(10,10,10))
    
    # Process material
    process_material = ParticleProcessMaterial.new()
```

## ParticleProcessMaterial (3D)

Same material as 2D, but with full 3D emission and movement.

### 3D Emission Shapes
```gdscript
var mat := ParticleProcessMaterial.new()

mat.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_SPHERE
mat.emission_sphere_radius = 2.0

# Box
mat.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_BOX
mat.emission_box_extents = Vector3(5, 1, 5)

# Ring (torus-like)
mat.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_RING
mat.emission_ring_radius = 3.0
mat.emission_ring_inner_radius = 2.0
mat.emission_ring_height = 0.5
mat.emission_ring_axis = Vector3(0, 1, 0)

# Points from mesh surface
mat.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_POINTS
# Set emission_point_texture, emission_normal_texture, emission_point_count
```

### 3D Direction and Gravity
```gdscript
mat.direction = Vector3(0, 1, 0)     # Base emission direction
mat.spread = 30.0                     # Cone spread (degrees)
mat.flatness = 0.0                    # 0 = 3D cone, 1 = flat disk

mat.initial_velocity_min = 2.0
mat.initial_velocity_max = 5.0

mat.gravity = Vector3(0, -9.8, 0)    # World gravity

# Attractor (pull toward a point)
mat.attractor_interaction_enabled = true
```

### Billboard Mode

For quad particles that face the camera:
```gdscript
# On the material used by the draw_pass mesh:
var draw_mat := StandardMaterial3D.new()
draw_mat.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
draw_mat.billboard_keep_scale = true
# BILLBOARD_DISABLED
# BILLBOARD_ENABLED          # Always face camera
# BILLBOARD_FIXED_Y          # Face camera but stay upright
# BILLBOARD_PARTICLES        # Optimized for particle systems

# Apply to draw pass mesh
var quad := QuadMesh.new()
quad.material = draw_mat
$GPUParticles3D.draw_pass_1 = quad
```

### Particle Material (Appearance)

The draw pass mesh's material controls appearance. Often use StandardMaterial3D with:
```gdscript
var draw_mat := StandardMaterial3D.new()
draw_mat.billboard_mode = BaseMaterial3D.BILLBOARD_PARTICLES
draw_mat.albedo_texture = preload("res://spark.png")
draw_mat.emission_enabled = true
draw_mat.emission = Color.WHITE
draw_mat.emission_energy_multiplier = 3.0
draw_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
draw_mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD    # Additive blending (glow)
draw_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
draw_mat.no_depth_test = true    # Always visible (for glow effects)
draw_mat.vertex_color_use_as_albedo = true  # Use particle color
```

## Particle Collision (GPU Only)

Add collision nodes as children or siblings:

```gdscript
# Height field (floor collision)
var col := GPUParticlesCollisionHeightField3D.new()
col.size = Vector3(20, 10, 20)
col.resolution = GPUParticlesCollisionHeightField3D.RESOLUTION_512
col.update_mode = GPUParticlesCollisionHeightField3D.UPDATE_MODE_WHEN_MOVED

# Sphere collision
var col := GPUParticlesCollisionSphere3D.new()
col.radius = 2.0

# Box collision
var col := GPUParticlesCollisionBox3D.new()
col.size = Vector3(4, 4, 4)

# SDF (complex static geometry)
var col := GPUParticlesCollisionSDF3D.new()
col.size = Vector3(20, 10, 20)
# Must bake in editor: select → "Bake SDF"
```

### Particle Attractors

Pull particles toward a point:

```gdscript
var attractor := GPUParticlesAttractorSphere3D.new()
attractor.radius = 5.0
attractor.strength = 3.0
attractor.attenuation = 1.0
attractor.directionality = 0.0  # 0 = toward center, 1 = along attractor's -Z
```

## Particle Trails (GPU Only)

```gdscript
$GPUParticles3D.trail_enabled = true
$GPUParticles3D.trail_lifetime = 0.3   # Trail duration (fraction of lifetime)

# Trail draw pass uses RibbonTrailMesh or TubeTrailMesh
var trail_mesh := RibbonTrailMesh.new()
trail_mesh.size = 0.2
trail_mesh.sections = 4
trail_mesh.section_length = 0.2
trail_mesh.section_segments = 3
$GPUParticles3D.draw_pass_1 = trail_mesh
```

## Common 3D Particle Recipes

### Campfire
```gdscript
# Emitter: low box at ground level
# Direction: up, spread ~20°, velocity 1-3
# Gravity: Vector3(0, -2, 0)  (slight upward = negative effective gravity)
# Color ramp: yellow → orange → red → transparent
# Scale curve: start 0.5, peak at 0.3 life, shrink to 0 at end
# Amount: 40, Lifetime: 1.2
# Billboard + additive blending + emission energy 3.0
```

### Rain
```gdscript
# Emitter: large box above camera (move with player)
# Direction: Vector3(0, -1, 0), spread 5°
# Velocity: 15-25
# Gravity: Vector3(0, -30, 0)
# No color ramp, semi-transparent white
# Draw pass: stretched quad (transform_align Y_TO_VELOCITY)
# Amount: 500-2000, Lifetime: 1.0
# local_coords = false
```

### Magic Sparkle
```gdscript
# Emitter: sphere surface, radius 0.5
# Direction: outward, spread 180°
# Velocity: 0.5-2.0
# Orbit velocity: 0.5-1.0
# Gravity: Vector3(0, -1, 0)
# Color ramp: cyan → purple → transparent
# Scale: start 0.3, end 0.0
# Amount: 30, Lifetime: 1.5
# Additive blending, emission energy 2.0
```

## C# Equivalents

```csharp
var particles = new GpuParticles3D();
particles.Amount = 100;
particles.Lifetime = 2.0f;
particles.DrawPass1 = new QuadMesh();

var mat = new ParticleProcessMaterial();
mat.Direction = new Vector3(0, 1, 0);
mat.Spread = 30.0f;
mat.Gravity = new Vector3(0, -9.8f, 0);
particles.ProcessMaterial = mat;
particles.Emitting = true;
```
