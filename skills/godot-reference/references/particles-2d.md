# Particles 2D Reference

## GPU vs CPU Particles

| Feature | GPUParticles2D | CPUParticles2D |
|---|---|---|
| Processing | GPU (compute shader) | CPU |
| Performance | Better for many particles (10k+) | Better for few particles |
| Compatibility | Requires Vulkan/GL3.3+ | Works everywhere |
| Particle access | Cannot read particle data | Can read positions in code |
| Sub-emitters | Supported | Not supported |
| Trails | Supported | Not supported |
| Material | ParticleProcessMaterial or ShaderMaterial | Built-in properties |

Choose **GPUParticles2D** for most cases. Use **CPUParticles2D** for compatibility mode or when you need per-particle data access.

Convert between them: select GPUParticles2D → menu → "Convert to CPUParticles2D" (or vice versa).

## GPUParticles2D Setup

```gdscript
extends GPUParticles2D

func _ready() -> void:
    # Emitter settings
    emitting = true              # Start emitting
    amount = 50                  # Max particles alive at once
    lifetime = 1.0               # Seconds each particle lives
    one_shot = false             # Single burst then stop
    preprocess = 0.0             # Pre-simulate seconds (warm start)
    explosiveness = 0.0          # 0 = steady stream, 1 = all at once
    randomness = 0.0             # Randomize emission timing
    fixed_fps = 0                # 0 = use game FPS, else fixed rate
    interpolate = true           # Smooth at low fixed_fps
    speed_scale = 1.0            # Time scale for particles
    
    # Visibility
    visibility_rect = Rect2(-100, -100, 200, 200)  # Culling rect (AABB)
    local_coords = false         # false = world space, true = move with node
    
    # Draw order
    draw_order = DRAW_ORDER_INDEX      # Emission order
    # DRAW_ORDER_LIFETIME              # Oldest first
    # DRAW_ORDER_REVERSE_LIFETIME      # Newest first
    
    # Texture
    texture = preload("res://particle.png")
    
    # Process material (controls particle behavior)
    process_material = ParticleProcessMaterial.new()
```

## ParticleProcessMaterial

Controls all particle behavior — emission, movement, appearance over lifetime.

### Emission
```gdscript
var mat := ParticleProcessMaterial.new()

# Emission shape
mat.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_POINT
# EMISSION_SHAPE_SPHERE          — radius
# EMISSION_SHAPE_SPHERE_SURFACE  — sphere surface only
# EMISSION_SHAPE_BOX             — box extents
# EMISSION_SHAPE_RING            — ring (radius, inner_radius, height)
# EMISSION_SHAPE_POINTS          — custom point cloud
# EMISSION_SHAPE_DIRECTED_POINTS — points with normals

mat.emission_sphere_radius = 20.0
# mat.emission_box_extents = Vector3(50, 10, 0)  # Z ignored in 2D
# mat.emission_ring_radius = 50.0
# mat.emission_ring_inner_radius = 40.0

# Direction
mat.direction = Vector3(0, -1, 0)    # Base emission direction (use X,Y for 2D)
mat.spread = 45.0                     # Cone spread in degrees (180 = hemisphere)
mat.flatness = 0.0                    # 2D spread (0 = 3D cone, 1 = flat fan)
```

### Velocity and Movement
```gdscript
# Initial velocity
mat.initial_velocity_min = 50.0
mat.initial_velocity_max = 100.0

# Gravity
mat.gravity = Vector3(0, 98, 0)      # X,Y for 2D (positive Y = down)

# Acceleration
mat.linear_accel_min = 0.0
mat.linear_accel_max = 0.0
mat.radial_accel_min = 0.0           # Toward/away from emitter center
mat.radial_accel_max = 0.0
mat.tangential_accel_min = 0.0       # Perpendicular to radial
mat.tangential_accel_max = 0.0

# Damping (air resistance)
mat.damping_min = 0.0
mat.damping_max = 5.0

# Orbit velocity (circle around emitter)
mat.orbit_velocity_min = 0.0
mat.orbit_velocity_max = 0.0
```

### Scale, Rotation, Color
```gdscript
# Scale over lifetime
mat.scale_min = 1.0
mat.scale_max = 1.5
mat.scale_curve = Curve.new()        # Optional: scale over normalized lifetime

# Rotation (degrees)
mat.angle_min = 0.0
mat.angle_max = 360.0
mat.angular_velocity_min = -90.0
mat.angular_velocity_max = 90.0

# Color
mat.color = Color.WHITE
mat.color_ramp = Gradient.new()      # Color over lifetime
mat.color_initial_ramp = Gradient.new()  # Random start color

# Hue variation
mat.hue_variation_min = 0.0
mat.hue_variation_max = 0.1
```

### Animation (Sprite Sheet)
```gdscript
# For sprite sheet particles (set hframes/vframes on GPUParticles2D or use CanvasItemMaterial)
mat.anim_speed_min = 1.0
mat.anim_speed_max = 1.0
mat.anim_offset_min = 0.0
mat.anim_offset_max = 0.0
```

## Common Particle Recipes

### Fire
```gdscript
func create_fire() -> GPUParticles2D:
    var p := GPUParticles2D.new()
    p.amount = 40
    p.lifetime = 0.8
    p.texture = preload("res://soft_circle.png")
    
    var mat := ParticleProcessMaterial.new()
    mat.direction = Vector3(0, -1, 0)
    mat.spread = 15.0
    mat.initial_velocity_min = 30.0
    mat.initial_velocity_max = 60.0
    mat.gravity = Vector3(0, -20, 0)  # Rise upward
    mat.scale_min = 0.5
    mat.scale_max = 1.0
    
    var gradient := Gradient.new()
    gradient.set_color(0, Color(1, 0.8, 0.2, 1))
    gradient.add_point(0.5, Color(1, 0.3, 0.0, 0.8))
    gradient.add_point(1.0, Color(0.3, 0.1, 0.0, 0.0))
    mat.color_ramp = gradient
    
    p.process_material = mat
    return p
```

### Explosion (One-Shot)
```gdscript
func create_explosion() -> GPUParticles2D:
    var p := GPUParticles2D.new()
    p.amount = 64
    p.lifetime = 0.6
    p.one_shot = true
    p.explosiveness = 1.0     # All particles emit at once
    p.texture = preload("res://spark.png")
    
    var mat := ParticleProcessMaterial.new()
    mat.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_SPHERE
    mat.emission_sphere_radius = 5.0
    mat.direction = Vector3(0, 0, 0)
    mat.spread = 180.0
    mat.initial_velocity_min = 100.0
    mat.initial_velocity_max = 300.0
    mat.gravity = Vector3(0, 200, 0)
    mat.damping_min = 2.0
    mat.damping_max = 5.0
    mat.scale_min = 0.3
    mat.scale_max = 1.0
    
    p.process_material = mat
    return p
```

### Dust Trail
```gdscript
func create_dust() -> GPUParticles2D:
    var p := GPUParticles2D.new()
    p.amount = 20
    p.lifetime = 0.5
    p.local_coords = false   # Stay in world space (trail behind)
    
    var mat := ParticleProcessMaterial.new()
    mat.direction = Vector3(0, -1, 0)
    mat.spread = 30.0
    mat.initial_velocity_min = 10.0
    mat.initial_velocity_max = 30.0
    mat.gravity = Vector3(0, -10, 0)
    mat.damping_min = 5.0
    mat.damping_max = 10.0
    mat.color = Color(0.6, 0.5, 0.4, 0.6)
    
    p.process_material = mat
    return p
```

## Triggering Particles

```gdscript
# One-shot burst
func emit_burst() -> void:
    $Particles.one_shot = true
    $Particles.emitting = true

# Restart
$Particles.restart()

# Auto-free after one-shot
func emit_and_free() -> void:
    $Particles.one_shot = true
    $Particles.emitting = true
    $Particles.finished.connect(queue_free)
```

## CPUParticles2D

Same concepts, properties set directly (no separate material resource):

```gdscript
var cpu := CPUParticles2D.new()
cpu.amount = 30
cpu.lifetime = 1.0
cpu.emission_shape = CPUParticles2D.EMISSION_SHAPE_SPHERE
cpu.emission_sphere_radius = 10.0
cpu.direction = Vector2(0, -1)       # 2D vector (not Vector3)
cpu.spread = 45.0
cpu.initial_velocity_min = 50.0
cpu.initial_velocity_max = 100.0
cpu.gravity = Vector2(0, 98)         # 2D gravity
cpu.color_ramp = gradient
```

## Sub-Emitters (GPU Only)

Particles that spawn other particles on birth, collision, or death:

```gdscript
# On the parent ParticleProcessMaterial:
mat.sub_emitter_mode = ParticleProcessMaterial.SUB_EMITTER_AT_END  # On death
# SUB_EMITTER_AT_COLLISION  # On collision
# SUB_EMITTER_CONSTANT      # Continuous
mat.sub_emitter_frequency = 4.0   # For CONSTANT mode
mat.sub_emitter_amount_at_end = 8  # Particles spawned per event
mat.sub_emitter_keep_velocity = true

# Assign sub-emitter node path on the GPUParticles2D:
$GPUParticles2D.sub_emitter = $SubParticles.get_path()
```

## C# Equivalents

```csharp
var particles = new GpuParticles2D();
particles.Amount = 50;
particles.Lifetime = 1.0f;
particles.OneShot = true;
particles.Explosiveness = 1.0f;

var mat = new ParticleProcessMaterial();
mat.Direction = new Vector3(0, -1, 0);
mat.Spread = 45.0f;
mat.InitialVelocityMin = 50.0f;
mat.InitialVelocityMax = 100.0f;
particles.ProcessMaterial = mat;
particles.Emitting = true;
```
