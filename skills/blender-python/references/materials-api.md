# Materials API

Creating, assigning, and configuring materials in Blender's Python API. For building shader node trees see [shader-nodes](shader-nodes.md). For compositor nodes see [compositor-nodes](compositor-nodes.md). For node group interfaces see [node-tree-interface](node-tree-interface.md).

## Creating Materials

```python
import bpy

# Create a new material
mat = bpy.data.materials.new(name="MyMaterial")

# Enable node-based shading
mat.use_nodes = True
tree = mat.node_tree

# Default nodes: Principled BSDF + Material Output, already linked
principled = tree.nodes.get("Principled BSDF")
output = tree.nodes.get("Material Output")
```

## Principled BSDF Input Names

The Principled BSDF (`ShaderNodeBsdfPrincipled`) is the primary surface shader. Input socket names (5.0):

| Input Name | Type | Default | Description |
|---|---|---|---|
| `Base Color` | RGBA | (0.8, 0.8, 0.8, 1.0) | Surface albedo |
| `Metallic` | Float | 0.0 | Metal vs dielectric (0–1) |
| `Roughness` | Float | 0.5 | Microsurface roughness (0–1) |
| `IOR` | Float | 1.5 | Index of refraction |
| `Alpha` | Float | 1.0 | Surface transparency |
| `Normal` | Vector | — | Normal map input |
| `Weight` | Float | 0.0 | Shader mixing weight |
| `Subsurface Weight` | Float | 0.0 | Subsurface scattering amount |
| `Subsurface Radius` | Vector | (1, 0.2, 0.1) | SSS per-channel radius |
| `Subsurface Scale` | Float | 0.05 | SSS scale |
| `Subsurface IOR` | Float | 1.4 | SSS index of refraction |
| `Subsurface Anisotropy` | Float | 0.0 | SSS direction bias |
| `Specular IOR Level` | Float | 0.5 | Specular reflection level |
| `Specular Tint` | RGBA | (1, 1, 1, 1) | Specular color tint |
| `Anisotropic` | Float | 0.0 | Anisotropic reflection |
| `Anisotropic Rotation` | Float | 0.0 | Anisotropy angle |
| `Tangent` | Vector | — | Anisotropy direction |
| `Transmission Weight` | Float | 0.0 | Glass transmission amount |
| `Coat Weight` | Float | 0.0 | Clearcoat layer amount |
| `Coat Roughness` | Float | 0.03 | Clearcoat roughness |
| `Coat IOR` | Float | 1.5 | Clearcoat index of refraction |
| `Coat Tint` | RGBA | (1, 1, 1, 1) | Clearcoat color |
| `Coat Normal` | Vector | — | Clearcoat normal |
| `Sheen Weight` | Float | 0.0 | Sheen layer amount |
| `Sheen Roughness` | Float | 0.5 | Sheen roughness |
| `Sheen Tint` | RGBA | (1, 1, 1, 1) | Sheen color |
| `Emission Color` | RGBA | (1, 1, 1, 1) | Emission color |
| `Emission Strength` | Float | 0.0 | Emission intensity |
| `Thin Film Thickness` | Float | 0.0 | Thin film thickness (nm) |
| `Thin Film IOR` | Float | 1.3 | Thin film IOR |

```python
import bpy

mat = bpy.data.materials.new("Gold")
mat.use_nodes = True
principled = mat.node_tree.nodes.get("Principled BSDF")

principled.inputs["Base Color"].default_value = (1.0, 0.766, 0.336, 1.0)
principled.inputs["Metallic"].default_value = 1.0
principled.inputs["Roughness"].default_value = 0.3
principled.inputs["Coat Weight"].default_value = 0.2
principled.inputs["Coat Roughness"].default_value = 0.1
```

## Finding the Principled BSDF

```python
import bpy

mat = bpy.data.materials["MyMaterial"]
tree = mat.node_tree

# Method 1: By default name (works for fresh materials)
principled = tree.nodes.get("Principled BSDF")

# Method 2: By type (works even if renamed)
principled = None
for node in tree.nodes:
    if node.type == 'BSDF_PRINCIPLED':
        principled = node
        break

# Method 3: By bl_idname
principled = next(
    (n for n in tree.nodes if n.bl_idname == 'ShaderNodeBsdfPrincipled'),
    None
)
```

## Image Textures

```python
import bpy

mat = bpy.data.materials["MyMaterial"]
tree = mat.node_tree
principled = tree.nodes.get("Principled BSDF")

# Create image texture node
tex = tree.nodes.new('ShaderNodeTexImage')
tex.location = (-400, 300)

# Load an image
tex.image = bpy.data.images.load("//textures/diffuse.png")

# Set colorspace for non-color data
# tex.image.colorspace_settings.name = 'Non-Color'  # for roughness, normal, etc.

# Link to Principled BSDF
tree.links.new(tex.outputs["Color"], principled.inputs["Base Color"])

# Image texture properties
tex.interpolation = 'Linear'       # 'Linear', 'Closest', 'Cubic', 'Smart'
tex.projection = 'FLAT'            # 'FLAT', 'BOX', 'SPHERE', 'TUBE'
tex.extension = 'REPEAT'           # 'REPEAT', 'EXTEND', 'CLIP'

# For box projection
tex.projection_blend = 0.5
```

## Material Slots

Materials are assigned to objects via material slots:

```python
import bpy

obj = bpy.context.object
mat = bpy.data.materials["MyMaterial"]

# Append material to object (adds a new slot)
obj.data.materials.append(mat)

# Access material slots
for i, slot in enumerate(obj.material_slots):
    print(f"Slot {i}: {slot.name}, link={slot.link}")
    # slot.material — the material data-block
    # slot.link — 'DATA' or 'OBJECT'

# Set active material
obj.active_material_index = 0
obj.active_material = mat

# Remove a material slot (requires operator)
obj.active_material_index = 1
bpy.ops.object.material_slot_remove()

# Assign material to specific faces (edit mode / via material_index attribute)
mesh = obj.data
for poly in mesh.polygons:
    poly.material_index = 0  # assign to first material slot

# Clear all material slots
obj.data.materials.clear()
```

### Material Slot Link Modes

```python
import bpy

obj = bpy.context.object

# 'DATA' — material linked to mesh data (shared across instances)
obj.material_slots[0].link = 'DATA'

# 'OBJECT' — material linked to object (unique per object)
obj.material_slots[0].link = 'OBJECT'
obj.material_slots[0].material = bpy.data.materials["Override"]
```

## World Material

The World node tree controls environment lighting and background:

```python
import bpy

# Create or access world
world = bpy.data.worlds.new("MyWorld")
bpy.context.scene.world = world

world.use_nodes = True
tree = world.node_tree

# Default nodes: Background + World Output
background = tree.nodes.get("Background")
background.inputs["Color"].default_value = (0.05, 0.05, 0.1, 1.0)
background.inputs["Strength"].default_value = 1.0

# Add environment texture (HDRI)
env_tex = tree.nodes.new('ShaderNodeTexEnvironment')
env_tex.location = (-300, 0)
env_tex.image = bpy.data.images.load("//hdri/studio.exr")

tree.links.new(env_tex.outputs["Color"], background.inputs["Color"])
```

## Material Properties

```python
import bpy

mat = bpy.data.materials["MyMaterial"]

# Blend mode (EEVEE)
mat.surface_render_method = 'DITHERED'  # 'DITHERED', 'BLENDED'
mat.use_transparent_shadow = True

# Backface culling
mat.use_backface_culling = True

# Pass index (for compositor ID Mask)
mat.pass_index = 1

# Viewport display color
mat.diffuse_color = (0.8, 0.2, 0.1, 1.0)

# Shadow mode
mat.shadow_method = 'OPAQUE'  # 'NONE', 'OPAQUE', 'CLIP', 'HASHED'

# Alpha threshold for clip mode
mat.alpha_threshold = 0.5

# Displacement method
mat.displacement_method = 'DISPLACEMENT'  # 'BUMP', 'DISPLACEMENT', 'BOTH'
```

## Removing Materials

```python
import bpy

# Remove a material data-block
mat = bpy.data.materials.get("OldMaterial")
if mat:
    bpy.data.materials.remove(mat)

# Remove unused materials
bpy.data.orphans_purge()

# Batch remove
mats_to_remove = [m for m in bpy.data.materials if m.name.startswith("Temp_")]
for mat in mats_to_remove:
    bpy.data.materials.remove(mat)
```

## Common Patterns

### Create and Assign a Material to an Object

```python
import bpy

obj = bpy.context.object

# Create material
mat = bpy.data.materials.new("AutoMat")
mat.use_nodes = True
principled = mat.node_tree.nodes.get("Principled BSDF")
principled.inputs["Base Color"].default_value = (0.1, 0.4, 0.8, 1.0)
principled.inputs["Metallic"].default_value = 0.0
principled.inputs["Roughness"].default_value = 0.7

# Assign to object
if obj.data.materials:
    obj.data.materials[0] = mat  # replace first slot
else:
    obj.data.materials.append(mat)  # add new slot
```

### Duplicate a Material with Variations

```python
import bpy

base_mat = bpy.data.materials["BaseMaterial"]
colors = [
    ("Red", (0.8, 0.1, 0.1, 1.0)),
    ("Green", (0.1, 0.8, 0.1, 1.0)),
    ("Blue", (0.1, 0.1, 0.8, 1.0)),
]

for name, color in colors:
    mat = base_mat.copy()
    mat.name = f"Material_{name}"
    principled = mat.node_tree.nodes.get("Principled BSDF")
    if principled:
        principled.inputs["Base Color"].default_value = color
```

### Batch Set Material on Selected Objects

```python
import bpy

mat = bpy.data.materials["SharedMaterial"]

for obj in bpy.context.selected_objects:
    if obj.type != 'MESH':
        continue
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)
```

### Glass Material Setup

```python
import bpy

mat = bpy.data.materials.new("Glass")
mat.use_nodes = True
principled = mat.node_tree.nodes.get("Principled BSDF")

principled.inputs["Base Color"].default_value = (0.9, 0.95, 1.0, 1.0)
principled.inputs["Transmission Weight"].default_value = 1.0
principled.inputs["Roughness"].default_value = 0.0
principled.inputs["IOR"].default_value = 1.45

# EEVEE transparency settings
mat.surface_render_method = 'BLENDED'
```

## Gotchas

1. **`material_slots` vs `materials`.** `obj.material_slots` is read-only slot info. `obj.data.materials` is the actual material list on the mesh — use it to append, remove, or replace materials.

2. **Principled BSDF input names changed in 4.0.** Input names like `Subsurface` became `Subsurface Weight`, `Clearcoat` became `Coat Weight`, `Specular` became `Specular IOR Level`. Code written for 3.x will fail with `KeyError`.

3. **`use_nodes` is deprecated.** In 5.0, `material.use_nodes` always returns `True` and `mat.node_tree` is never `None`. Setting `use_nodes` has no effect. It will be removed in 6.0. Legacy code calling `mat.use_nodes = True` is harmless but unnecessary.

4. **Material assignment is per-mesh, not per-object (by default).** Multiple objects sharing the same mesh share the same material slots when `link='DATA'`. Use `link='OBJECT'` for per-object material overrides.

5. **Face material_index is a polygon attribute.** In 5.0, `material_index` is stored as a face-domain attribute. For bulk operations, use `mesh.attributes["material_index"]` with `foreach_get/set` instead of iterating polygons.

6. **Image paths with `//`.** Image paths starting with `//` are relative to the blend file. Use `bpy.path.abspath()` to resolve to an absolute path. Loading images before saving the blend file means `//` has no reference directory.

7. **World vs Material nodes.** World node trees use `ShaderNodeBackground` as the surface shader, not `ShaderNodeBsdfPrincipled`. The output node is `ShaderNodeOutputWorld`, not `ShaderNodeOutputMaterial`.
