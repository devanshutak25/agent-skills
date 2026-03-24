# Performance & Optimization

## Profiling First

Never optimize without profiling. Godot provides built-in tools:

### Built-in Profiler (Debugger > Profiler)
- **CPU time per function**: Identifies slow scripts
- **Physics time**: Shows if physics is the bottleneck
- **Idle vs Physics**: Separates `_process` from `_physics_process` costs
- Click **Start** before running, frames are recorded in real-time

### Monitors (Debugger > Monitors)
Key metrics to watch:
- **FPS / Frame Time**: Target 16.6ms for 60fps
- **Objects in Frame**: Draw call count indicator
- **Vertices in Frame**: GPU geometry load
- **Physics Objects**: Active collision shapes
- **Memory**: Static + dynamic allocation

### External Tools (4.6+)
Godot 4.6 integrates tracing profiler support for Tracy, Perfetto, and Apple Instruments signposts.

## Rendering Optimization

### Culling

**Frustum culling**: Automatic. Objects outside camera view are skipped.

**Occlusion culling**: Prevents rendering objects hidden behind other geometry.
- Add OccluderInstance3D nodes with OccluderPolygon3D shapes on large solid objects (walls, floors)
- Enable in Project Settings > Rendering > Occlusion Culling > Use Occlusion Culling
- Best for indoor/urban scenes. Less effective in open worlds.

**Distance culling / Visibility ranges (HLOD)**:
- Set `visibility_range_begin` and `visibility_range_end` on any VisualInstance3D
- Use `visibility_range_begin_margin` for hysteresis to prevent popping
- Use for particles, small props, distant detail. Combine with mesh LOD.

### Mesh LOD
Godot auto-generates LOD on mesh import. Control in import settings:
- **LOD Bias**: Lower = more aggressive LOD (better perf, less quality)
- Works with `.glb`, `.gltf`, `.obj` imports
- `MeshInstance3D.lod_bias` overrides per-instance at runtime

### Draw Calls
Reduce draw calls:
- **MultiMeshInstance3D**: Thousands of identical meshes in 1 draw call (grass, trees, debris)
- **Material reuse**: Share materials across meshes (same material = same batch)
- **Texture atlases**: Combine textures to reduce material switches
- **Merge static geometry**: Combine meshes where possible

### Transparency
Transparent objects cannot be batched the same way:
- Minimize transparent surfaces
- Separate transparent parts into their own mesh surface
- Use alpha scissor (cutout) instead of alpha blend where possible

### Shadows
Shadows are expensive:
- Reduce `DirectionalLight3D.shadow_max_distance`
- Use fewer shadow-casting lights (max 1-2 real-time)
- Disable shadows on small/distant lights
- Bake static lighting with `LightmapGI` for static scenes

### Post-Processing
- Disable unused effects (SSAO, SSR, SDFGI, volumetric fog)
- SSR in half-resolution mode (4.6+) for cheaper reflections
- Reduce glow iterations if using glow

## Physics Optimization

### Collision Layers
Use layers to limit what collides with what. Fewer collision checks = better performance.

### Shape Complexity (cheapest to most expensive)
1. SphereShape3D
2. BoxShape3D
3. CapsuleShape3D
4. CylinderShape3D
5. ConvexPolygonShape3D (keep vertex count low)
6. ConcavePolygonShape3D (static geometry only, never on moving bodies)
7. HeightMapShape3D (good for terrain)

### General Physics Tips
- `set_physics_process(false)` on inactive objects
- Area3D instead of RigidBody3D for triggers (cheaper)
- Jolt Physics (4.6 default) is generally faster than Godot Physics for 3D
- Reduce `physics_ticks_per_second` from 60 to 30 if your game allows

## Script Optimization

### Cache Node References
```gdscript
# BAD: get_node every frame
func _process(delta: float) -> void:
    $Sprite2D.position.x += 1

# GOOD: cached
@onready var _sprite: Sprite2D = $Sprite2D
func _process(delta: float) -> void:
    _sprite.position.x += 1
```

### Static Typing Is Faster
```gdscript
var speed: float = 200.0  # Faster than untyped
```
Enable project-wide: Project Settings > Debug > GDScript > Warnings > Untyped Declaration = Error

### Signals Over Polling
```gdscript
# BAD: checking every frame
func _process(delta: float) -> void:
    if health <= 0:
        die()

# GOOD: react to change
func take_damage(amount: int) -> void:
    health -= amount
    if health <= 0:
        die()
```

### Disable Processing When Idle
```gdscript
set_process(false)    # Disable _process
set_physics_process(false)  # Disable _physics_process
```

### PackedArrays for Bulk Data
```gdscript
# Faster than Array — no Variant overhead
var positions := PackedVector2Array()
var indices := PackedInt32Array()
```

### StringName for Comparisons
```gdscript
if action == &"jump":  # Faster than string comparison
```

## Memory Optimization

- **Compress textures**: VRAM compression (BPTC/S3TC desktop, ETC2 mobile)
- **Audio**: OGG Vorbis for music (streaming), WAV for short SFX
- **Mesh compression**: Enable in import settings
- **Resource sharing**: Shared by default. `duplicate()` only when needed.
- **Unload unused scenes**: `queue_free()` removed nodes
- **Threaded loading**: `ResourceLoader.load_threaded_request()` for async loading

## 2D-Specific Tips

- CanvasGroup for batching multiple CanvasItems
- Limit particle `amount` on GPUParticles2D
- TileMapLayer is more efficient than individual Sprite2D nodes
- SubViewport for rendering complex effects once as a texture

## 3D-Specific Tips

- MultiMeshInstance3D for repeated geometry
- LOD + visibility ranges together
- Bake lighting with LightmapGI for static scenes
- ReflectionProbe instead of SSR where possible (cheaper)
- OccluderInstance3D on large walls/terrain
- Reduce SDFGI cascade count or disable if performance is tight

## Build-Time Optimization

### Smaller Templates
Compile with disabled modules:
```python
# custom.py
module_3d_enabled = "no"         # 2D-only game
module_navigation_enabled = "no" # No navigation
```

### Production Builds
```bash
scons target=template_release production=yes lto=full
```

### Shader Baking (4.5+)
Pre-compiles shader variants at export time into the target platform's driver format. Eliminates shader compilation stutter at runtime — no warm-up scene needed.

Enable in export preset settings. Impact: 20s → <1s startup on medium projects (especially Apple and D3D12). This is the single highest-impact optimization for perceived first-run performance.

### Stencil Buffer (4.5+)
Allows meshes to write arbitrary values to a stencil buffer for later comparison. Enables:
- See-through-wall effects (portal masking)
- Outline rendering
- Selective cutouts and geometry masking

Available in Forward+, Mobile, and Compatibility renderers with Vulkan backends. More flexible than depth buffer — you control comparison logic and write values.

Reported ~15% rendering performance improvement in complex masked scenes vs previous workarounds.

### SMAA (4.5+)
Subpixel Morphological Anti-Aliasing added as an option alongside FXAA and MSAA. Better edge quality than FXAA with lower cost than MSAA.

### Tilemap Collision Merging (4.5+)
TileMapLayer collision shapes are automatically merged where possible, reducing physics overhead in 2D tile-based games.
