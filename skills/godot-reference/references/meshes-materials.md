# Meshes & Materials 3D Reference

## MeshInstance3D

Displays a 3D mesh. Primary node for all 3D visible geometry.

```gdscript
extends MeshInstance3D

func _ready() -> void:
    # Assign mesh
    mesh = BoxMesh.new()
    mesh = SphereMesh.new()
    mesh = CapsuleMesh.new()
    mesh = CylinderMesh.new()
    mesh = PlaneMesh.new()
    mesh = PrismMesh.new()
    mesh = TorusMesh.new()
    mesh = QuadMesh.new()
    mesh = TextMesh.new()
    
    # Or load imported mesh
    mesh = load("res://models/character.mesh")
    
    # Override material (per-surface)
    set_surface_override_material(0, my_material)
    
    # Visibility
    cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON
    # SHADOW_CASTING_SETTING_OFF
    # SHADOW_CASTING_SETTING_DOUBLE_SIDED
    # SHADOW_CASTING_SETTING_SHADOWS_ONLY  (invisible but casts shadow)
    
    gi_mode = GeometryInstance3D.GI_MODE_STATIC    # For baked GI
    # GI_MODE_DYNAMIC
    # GI_MODE_DISABLED
    
    # LOD (Level of Detail) — mesh distance fade
    visibility_range_begin = 0.0
    visibility_range_end = 100.0
    visibility_range_fade_mode = GeometryInstance3D.VISIBILITY_RANGE_FADE_SELF
    
    # Layers (for camera culling)
    layers = 1    # Bitmask — must match Camera3D.cull_mask
```

## Importing 3D Models

Godot imports `.glTF`, `.gltf`, `.glb`, `.fbx`, `.blend` (with Blender installed), `.obj`, `.dae`.

glTF 2.0 is the recommended format. Import settings in the editor (select .glTF → Import dock):
- Meshes: generate lightmap UV2, LOD, shadow meshes
- Materials: import as StandardMaterial3D or convert to ShaderMaterial
- Animation: import, loop, optimize

### Naming Conventions (auto-collision from mesh names)

Append suffixes in your 3D tool:
```
MeshName-col        → Trimesh collision (precise, static only)
MeshName-colonly    → Trimesh collision, mesh hidden
MeshName-convcol    → Convex collision
MeshName-convcolonly → Convex collision, mesh hidden
```

## StandardMaterial3D

PBR material — covers most use cases without custom shaders.

```gdscript
var mat := StandardMaterial3D.new()

# Albedo (base color)
mat.albedo_color = Color(0.8, 0.2, 0.1)
mat.albedo_texture = preload("res://textures/diffuse.png")

# Metallic
mat.metallic = 0.0               # 0 = dielectric, 1 = metal
mat.metallic_specular = 0.5      # Specular intensity for dielectrics
mat.metallic_texture = preload("res://textures/metallic.png")

# Roughness
mat.roughness = 0.8              # 0 = mirror, 1 = fully rough
mat.roughness_texture = preload("res://textures/roughness.png")

# Normal map
mat.normal_enabled = true
mat.normal_scale = 1.0
mat.normal_texture = preload("res://textures/normal.png")

# Emission (glow)
mat.emission_enabled = true
mat.emission = Color(1, 0.5, 0)
mat.emission_energy_multiplier = 2.0
mat.emission_texture = preload("res://textures/emission.png")

# Ambient occlusion
mat.ao_enabled = true
mat.ao_light_affect = 0.5
mat.ao_texture = preload("res://textures/ao.png")

# Height/parallax mapping
mat.heightmap_enabled = true
mat.heightmap_scale = 0.05
mat.heightmap_texture = preload("res://textures/height.png")
mat.heightmap_deep_parallax = true

# Transparency
mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
mat.albedo_color.a = 0.5
# TRANSPARENCY_DISABLED
# TRANSPARENCY_ALPHA
# TRANSPARENCY_ALPHA_SCISSOR     # Hard cutout (faster)
# TRANSPARENCY_ALPHA_HASH        # Dithered (no sorting issues)
# TRANSPARENCY_ALPHA_DEPTH_PRE_PASS  # Sorted + depth

# Culling
mat.cull_mode = BaseMaterial3D.CULL_BACK    # Default
# CULL_FRONT
# CULL_DISABLED     # Double-sided

# Shading
mat.shading_mode = BaseMaterial3D.SHADING_MODE_PER_PIXEL
# SHADING_MODE_PER_VERTEX
# SHADING_MODE_UNSHADED    # No lighting (flat color)

$MeshInstance3D.set_surface_override_material(0, mat)
```

### Texture Channel Packing

| Property | Channel in ORM | Notes |
|---|---|---|
| Ambient Occlusion | R | |
| Roughness | G | |
| Metallic | B | |

### Material Application Hierarchy

Priority (highest wins):
1. `GeometryInstance3D.material_override` — overrides ALL surfaces
2. `MeshInstance3D.set_surface_override_material()` — per surface
3. `Mesh.surface_get_material()` — material on the mesh resource itself

```gdscript
# Override all surfaces (useful for effects like hit flash)
material_override = flash_material

# Clear override
material_override = null
```

## ORMMaterial3D

Same as StandardMaterial3D but uses a single ORM texture (Occlusion-Roughness-Metallic packed into RGB channels). More efficient — 3 texture lookups instead of 5.

```gdscript
var mat := ORMMaterial3D.new()
mat.albedo_texture = preload("res://textures/albedo.png")
mat.orm_texture = preload("res://textures/orm.png")  # R=AO, G=Roughness, B=Metallic
mat.normal_texture = preload("res://textures/normal.png")
```

Use ORMMaterial3D when your texture pipeline exports packed ORM maps (common in PBR workflows from Substance/Blender).

## ShaderMaterial

For custom rendering. Uses Godot's shading language (GLSL-like):

```gdscript
var mat := ShaderMaterial.new()
mat.shader = preload("res://shaders/dissolve.gdshader")
mat.set_shader_parameter("dissolve_amount", 0.5)
mat.set_shader_parameter("edge_color", Color.ORANGE)
```

### Convert StandardMaterial3D to Shader

In editor: select material → Material menu → "Convert to ShaderMaterial". Generates equivalent shader code you can customize.

## MultiMeshInstance3D

Efficiently renders thousands of identical meshes with different transforms:

```gdscript
var mmi := MultiMeshInstance3D.new()
var mm := MultiMesh.new()
mm.mesh = preload("res://grass_blade.mesh")
mm.transform_format = MultiMesh.TRANSFORM_3D
mm.use_colors = true
mm.instance_count = 10000

for i in mm.instance_count:
    var xform := Transform3D.IDENTITY
    xform.origin = Vector3(randf_range(-50, 50), 0, randf_range(-50, 50))
    xform = xform.rotated(Vector3.UP, randf() * TAU)
    mm.set_instance_transform(i, xform)
    mm.set_instance_color(i, Color(randf(), randf(), randf()))

mmi.multimesh = mm
add_child(mmi)
```

Use for: grass, foliage, rocks, debris, crowds — any repeated geometry.

## Decals

Project textures onto surfaces without modifying geometry:

```gdscript
var decal := Decal.new()
decal.texture_albedo = preload("res://textures/bullet_hole.png")
decal.texture_normal = preload("res://textures/bullet_hole_normal.png")
decal.size = Vector3(0.5, 0.5, 0.5)        # Projection box size
decal.cull_mask = 0xFFFFFFFF                 # Which layers to project onto
decal.upper_fade = 0.3                       # Fade at projection edges
decal.lower_fade = 0.3
decal.modulate = Color(1, 1, 1, 0.9)
add_child(decal)
```

## C# Equivalents

```csharp
// StandardMaterial3D
var mat = new StandardMaterial3D();
mat.AlbedoColor = new Color(0.8f, 0.2f, 0.1f);
mat.Metallic = 0.0f;
mat.Roughness = 0.8f;
mat.NormalEnabled = true;
mat.NormalTexture = GD.Load<Texture2D>("res://normal.png");

meshInstance.SetSurfaceOverrideMaterial(0, mat);
meshInstance.MaterialOverride = flashMat;

// MultiMesh
var mm = new MultiMesh();
mm.Mesh = mesh;
mm.InstanceCount = 1000;
mm.SetInstanceTransform(0, Transform3D.Identity);
```
