# Lighting 3D Reference

## Light Types

### DirectionalLight3D

Infinite-distance parallel light (sun, moon). Affects entire scene.

```gdscript
var light := DirectionalLight3D.new()
light.light_color = Color(1.0, 0.95, 0.9)
light.light_energy = 1.0              # Intensity
light.rotation_degrees = Vector3(-45, 30, 0)  # Angle determines direction

# Shadows
light.shadow_enabled = true
light.directional_shadow_mode = DirectionalLight3D.SHADOW_PARALLEL_4_SPLITS
# SHADOW_ORTHOGONAL         # Single shadow map
# SHADOW_PARALLEL_2_SPLITS  # 2 cascaded splits
# SHADOW_PARALLEL_4_SPLITS  # 4 cascaded splits (best quality)
light.directional_shadow_max_distance = 100.0
light.shadow_bias = 0.1
light.shadow_normal_bias = 2.0

# Sky contribution
light.light_angular_size = 0.5    # Sun disk size (affects soft shadows)
```

### OmniLight3D

Point light radiating in all directions.

```gdscript
var light := OmniLight3D.new()
light.light_color = Color(1.0, 0.8, 0.5)
light.light_energy = 2.0
light.omni_range = 10.0                # Falloff distance
light.omni_attenuation = 1.0           # Falloff curve (1=linear, 2=quadratic)

light.shadow_enabled = true
light.omni_shadow_mode = OmniLight3D.SHADOW_DUAL_PARABOLOID
# SHADOW_CUBE  # Higher quality, more expensive
```

### SpotLight3D

Cone-shaped light.

```gdscript
var light := SpotLight3D.new()
light.light_color = Color.WHITE
light.light_energy = 3.0
light.spot_range = 15.0                # Max distance
light.spot_angle = 30.0                # Cone half-angle (degrees)
light.spot_angle_attenuation = 1.0     # Edge softness
light.spot_attenuation = 1.0           # Distance falloff

light.shadow_enabled = true
light.shadow_bias = 0.05
```

## Common Light Properties

All lights share:

```gdscript
# Intensity and color
light.light_energy = 1.0          # Multiplier
light.light_indirect_energy = 1.0  # Indirect/bounce contribution
light.light_volumetric_fog_energy = 1.0
light.light_color = Color.WHITE
light.light_temperature = 6500     # Kelvin (only when using physical light units)

# Culling
light.light_cull_mask = 0xFFFFFFFF  # Which layers this light affects

# Specular
light.light_specular = 0.5        # Specular contribution (0 = diffuse only)

# Bake mode
light.light_bake_mode = Light3D.BAKE_DYNAMIC   # Real-time
# BAKE_STATIC     # Baked into lightmaps
# BAKE_DISABLED   # Not baked

# Negative light (subtracts light)
light.light_negative = false

# Projector texture
light.light_projector = preload("res://textures/spotlight_cookie.png")
```

## Shadows

```gdscript
light.shadow_enabled = true
light.shadow_bias = 0.1            # Prevents shadow acne (too high = peter panning)
light.shadow_normal_bias = 2.0     # Offsets shadow along surface normal
light.shadow_opacity = 1.0         # 0 = transparent shadows
light.shadow_blur = 1.0            # Soft shadow edges (Forward+ only)
```

**Shadow troubleshooting**:
- Shadow acne (striped artifacts) → increase `shadow_bias`
- Peter panning (shadows detach from objects) → reduce `shadow_bias`, increase `shadow_normal_bias`
- Shadow popping → increase directional shadow max distance, add more cascade splits

## Global Illumination

### VoxelGI

Real-time GI using voxelized scene. Medium quality, medium performance.

```gdscript
# Add VoxelGI node, set extents to cover scene
var vgi := VoxelGI.new()
vgi.size = Vector3(40, 10, 40)
# In editor: select VoxelGI → "Bake GI" button
# Or in code: vgi.bake()

# Properties
vgi.subdiv = VoxelGI.SUBDIV_128  # Resolution (64, 128, 256, 512)
```

Meshes must have `gi_mode = GI_MODE_STATIC` to contribute to VoxelGI.

### LightmapGI

Baked GI — best quality, zero runtime cost, but static only.

```gdscript
# Add LightmapGI node
# Meshes need lightmap UV2 (enable in import settings or generate)
# In editor: select LightmapGI → "Bake Lightmaps" button
```

### SDFGI (Signed Distance Field GI)

Semi-dynamic GI for large open worlds. Enable in Environment resource:
```gdscript
env.sdfgi_enabled = true
env.sdfgi_use_occlusion = true
env.sdfgi_cascades = 4
```

### ReflectionProbe

Captures environment for local reflections:
```gdscript
var probe := ReflectionProbe.new()
probe.size = Vector3(10, 5, 10)        # Influence area
probe.interior = false                  # true = enclosed room (no sky fallback)
probe.update_mode = ReflectionProbe.UPDATE_ONCE  # or UPDATE_ALWAYS
probe.ambient_mode = ReflectionProbe.AMBIENT_ENVIRONMENT  # or AMBIENT_COLOR
```

## 2D Lighting (CanvasItem)

For 2D scenes using Light2D and shadows:

### PointLight2D / DirectionalLight2D
```gdscript
var light := PointLight2D.new()
light.texture = preload("res://light_texture.png")
light.energy = 1.5
light.color = Color.WARM_YELLOW
light.texture_scale = 2.0
light.shadow_enabled = true
light.shadow_filter = PointLight2D.SHADOW_FILTER_PCF13
light.blend_mode = Light2D.BLEND_MODE_ADD  # or MIX, SUB

# Light mask (which CanvasItems are lit)
light.range_item_cull_mask = 1   # Layer bitmask
```

### LightOccluder2D
```gdscript
# Add as child of obstacle/wall
var occluder := LightOccluder2D.new()
var polygon := OccluderPolygon2D.new()
polygon.polygon = PackedVector2Array([
    Vector2(-20, -20), Vector2(20, -20),
    Vector2(20, 20), Vector2(-20, 20)
])
polygon.cull_mode = OccluderPolygon2D.CULL_CLOCKWISE
occluder.occluder = polygon
add_child(occluder)
```

### CanvasModulate

Changes the ambient light color for all 2D rendering:
```gdscript
var canvas_mod := CanvasModulate.new()
canvas_mod.color = Color(0.1, 0.1, 0.2)  # Dark blue ambient (night)
```

## C# Equivalents

```csharp
var light = new DirectionalLight3D();
light.LightColor = new Color(1, 0.95f, 0.9f);
light.LightEnergy = 1.0f;
light.ShadowEnabled = true;

var omni = new OmniLight3D();
omni.OmniRange = 10.0f;

var spot = new SpotLight3D();
spot.SpotRange = 15.0f;
spot.SpotAngle = 30.0f;
```
