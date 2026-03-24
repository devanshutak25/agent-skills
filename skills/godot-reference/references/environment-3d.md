# Camera & Environment 3D Reference

## Camera3D

Only one Camera3D is active per viewport.

```gdscript
extends Camera3D

func _ready() -> void:
    make_current()        # Activate this camera
    # or: current = true
    
    # Projection
    projection = Camera3D.PROJECTION_PERSPECTIVE
    fov = 75.0                    # Field of view (degrees, perspective only)
    near = 0.05                   # Near clip plane
    far = 4000.0                  # Far clip plane
    
    # Orthogonal projection
    # projection = Camera3D.PROJECTION_ORTHOGONAL
    # size = 10.0                 # Orthogonal half-size
    
    # Frustum offset (for oblique projections, VR)
    # projection = Camera3D.PROJECTION_FRUSTUM
    # frustum_offset = Vector2(0.5, 0)
    
    # Culling
    cull_mask = 0xFFFFFFFF        # Which VisualInstance3D layers to render
    
    # Doppler tracking (for audio)
    doppler_tracking = Camera3D.DOPPLER_TRACKING_DISABLED
    
    # Per-camera environment override
    environment = preload("res://camera_env.tres")
```

### Projection Helpers

```gdscript
# Screen → World ray
var origin: Vector3 = project_ray_origin(screen_pos)
var normal: Vector3 = project_ray_normal(screen_pos)
# Ray: origin + normal * distance

# World → Screen
var screen_pos: Vector2 = unproject_position(world_pos)

# Check if point is behind camera
var is_behind: bool = is_position_behind(world_pos)

# Project position to specific depth
var world_at_depth: Vector3 = project_position(screen_pos, depth)

# Get camera frustum planes (for custom culling)
var planes: Array[Plane] = get_frustum()
```

### First-Person Camera
```gdscript
extends Camera3D

@export var mouse_sensitivity: float = 0.002
var _rotation_x: float = 0.0

func _unhandled_input(event: InputEvent) -> void:
    if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
        # Horizontal rotation on parent (CharacterBody3D)
        get_parent().rotate_y(-event.relative.x * mouse_sensitivity)
        # Vertical rotation on camera
        _rotation_x -= event.relative.y * mouse_sensitivity
        _rotation_x = clampf(_rotation_x, -PI / 2.0, PI / 2.0)
        rotation.x = _rotation_x
```

### Third-Person Camera (SpringArm3D)
```gdscript
# Node hierarchy:
# CharacterBody3D
#   └── SpringArm3D (pivot)
#         └── Camera3D

# SpringArm3D prevents camera from clipping through walls
extends SpringArm3D

func _ready() -> void:
    spring_length = 5.0           # Desired distance from target
    collision_mask = 0b00000100   # What pushes camera forward
    margin = 0.2                  # Distance from collision surface
    
    $Camera3D.position = Vector3.ZERO   # Camera at end of arm

func _unhandled_input(event: InputEvent) -> void:
    if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
        rotate_y(-event.relative.x * 0.002)
        rotate_object_local(Vector3.RIGHT, -event.relative.y * 0.002)
        rotation.x = clampf(rotation.x, -PI / 3.0, PI / 3.0)
```

### Smooth Camera Follow
```gdscript
extends Camera3D

@export var target: Node3D
@export var offset: Vector3 = Vector3(0, 5, 10)
@export var smooth_speed: float = 5.0

func _physics_process(delta: float) -> void:
    if target:
        var desired: Vector3 = target.global_position + offset
        global_position = global_position.lerp(desired, smooth_speed * delta)
        look_at(target.global_position)
```

## Environment

Controls sky, ambient light, fog, tonemap, post-processing. Applied via `WorldEnvironment` node or `Camera3D.environment`.

```gdscript
var env := Environment.new()

# Background
env.background_mode = Environment.BG_SKY         # Use sky
# BG_COLOR           # Solid color
# BG_CANVAS          # 2D canvas (for 2D background behind 3D)
# BG_CLEAR_COLOR     # Project settings clear color
# BG_CAMERA_FEED     # Camera feed (AR)
env.background_color = Color(0.3, 0.3, 0.4)
env.background_energy_multiplier = 1.0
```

### Sky
```gdscript
var sky := Sky.new()

# Procedural sky
var sky_mat := ProceduralSkyMaterial.new()
sky_mat.sky_top_color = Color(0.3, 0.5, 0.9)
sky_mat.sky_horizon_color = Color(0.6, 0.7, 0.9)
sky_mat.ground_bottom_color = Color(0.2, 0.15, 0.1)
sky_mat.ground_horizon_color = Color(0.5, 0.45, 0.4)
sky_mat.sun_angle_max = 30.0
sky_mat.sun_curve = 0.15

sky.sky_material = sky_mat
env.sky = sky
env.background_mode = Environment.BG_SKY

# Panorama sky (HDRI)
var pano_mat := PanoramaSkyMaterial.new()
pano_mat.panorama = preload("res://hdri/field.exr")
sky.sky_material = pano_mat

# Physical sky (realistic atmosphere)
var phys_mat := PhysicalSkyMaterial.new()
phys_mat.rayleigh_coefficient = 2.0
phys_mat.mie_coefficient = 0.005
sky.sky_material = phys_mat

# Sky processing (for reflections)
sky.process_mode = Sky.PROCESS_MODE_AUTOMATIC
sky.radiance_size = Sky.RADIANCE_SIZE_256
```

### Ambient Light
```gdscript
env.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
# AMBIENT_SOURCE_COLOR      # Flat color
# AMBIENT_SOURCE_SKY        # From sky (recommended)
# AMBIENT_SOURCE_DISABLED
env.ambient_light_color = Color(0.3, 0.3, 0.4)
env.ambient_light_energy = 0.5
env.ambient_light_sky_contribution = 1.0
```

### Reflected Light
```gdscript
env.reflected_light_source = Environment.REFLECTION_SOURCE_SKY
# REFLECTION_SOURCE_SKY
# REFLECTION_SOURCE_BG
# REFLECTION_SOURCE_DISABLED
```

### Tonemap
```gdscript
env.tonemap_mode = Environment.TONE_MAP_FILMIC
# TONE_MAP_LINEAR     # No tonemapping
# TONE_MAP_REINHARDT
# TONE_MAP_FILMIC     # Good default
# TONE_MAP_ACES       # Industry standard
env.tonemap_exposure = 1.0
env.tonemap_white = 1.0
```

### Fog
```gdscript
# Depth fog
env.fog_enabled = true
env.fog_light_color = Color(0.5, 0.5, 0.6)
env.fog_light_energy = 1.0
env.fog_density = 0.01
env.fog_sun_scatter = 0.2         # Sun-colored fog near sun direction

# Height fog
env.fog_height = 0.0
env.fog_height_density = 0.1

# Volumetric fog (Forward+ only)
env.volumetric_fog_enabled = true
env.volumetric_fog_density = 0.05
env.volumetric_fog_albedo = Color(1, 1, 1)
env.volumetric_fog_emission = Color.BLACK
env.volumetric_fog_length = 64.0
```

### Glow / Bloom
```gdscript
env.glow_enabled = true
env.glow_intensity = 0.8
env.glow_strength = 1.0
env.glow_bloom = 0.0              # 0 = threshold-based, >0 = soft bloom
env.glow_hdr_threshold = 1.0      # Brightness threshold
env.glow_blend_mode = Environment.GLOW_BLEND_MODE_ADDITIVE
# GLOW_BLEND_MODE_SCREEN
# GLOW_BLEND_MODE_SOFTLIGHT
# GLOW_BLEND_MODE_REPLACE
# GLOW_BLEND_MODE_MIX

# Per-level intensity (7 mip levels)
env.set_glow_level(0, 0.0)
env.set_glow_level(1, 0.5)
env.set_glow_level(2, 1.0)
env.set_glow_level(3, 0.5)
```

### Screen-Space Effects
```gdscript
# SSAO (Ambient Occlusion)
env.ssao_enabled = true
env.ssao_radius = 1.0
env.ssao_intensity = 2.0
env.ssao_power = 1.5
env.ssao_detail = 0.5
env.ssao_light_affect = 0.0

# SSIL (Screen-Space Indirect Lighting)
env.ssil_enabled = true
env.ssil_radius = 5.0
env.ssil_intensity = 1.0

# SSR (Screen-Space Reflections)
env.ssr_enabled = true
env.ssr_max_steps = 64
env.ssr_fade_in = 0.15
env.ssr_fade_out = 2.0
env.ssr_depth_tolerance = 0.2
```

### Adjustments
```gdscript
env.adjustment_enabled = true
env.adjustment_brightness = 1.0
env.adjustment_contrast = 1.0
env.adjustment_saturation = 1.0
env.adjustment_color_correction = preload("res://lut.png")  # Color LUT
```

## WorldEnvironment Node

Holds the Environment resource. One per scene.

```gdscript
var we := WorldEnvironment.new()
we.environment = env
add_child(we)

# Camera environment overrides WorldEnvironment
# Priority: Camera3D.environment > WorldEnvironment.environment
```

## Rendering Pipelines

Project Settings → Rendering → Renderer:

| Renderer | Features | Target |
|---|---|---|
| **Forward+** | Full features (volumetric fog, SSR, SSIL, SDFGI) | Desktop, high-end |
| **Mobile** | Reduced features, optimized for GPUs with tile-based rendering | Mobile, mid-range |
| **Compatibility** | OpenGL 3.3 / WebGL 2, most limited | Low-end, Web |

Switch per-project in Project Settings. Some Environment features are Forward+ only.

## Post-Processing (Custom)

For custom post-processing, use a fullscreen quad with a shader:

```gdscript
# MeshInstance3D with QuadMesh, size (2, 2)
# Material: ShaderMaterial with custom shader
# Set extra_cull_margin very high or use GeometryInstance3D layers

# Or use Compositor (4.3+) for render pipeline customization
# Or SubViewport render-to-texture approach
```

## C# Equivalents

```csharp
// Camera3D
camera.MakeCurrent();
camera.Fov = 75.0f;
Vector3 origin = camera.ProjectRayOrigin(screenPos);
Vector3 normal = camera.ProjectRayNormal(screenPos);
Vector2 screen = camera.UnprojectPosition(worldPos);

// Environment
var env = new Environment();
env.BackgroundMode = Environment.BGMode.Sky;
env.TonemapMode = Environment.ToneMapMode.Filmic;
env.FogEnabled = true;
env.GlowEnabled = true;
env.SsaoEnabled = true;

var we = new WorldEnvironment();
we.Environment = env;
```
