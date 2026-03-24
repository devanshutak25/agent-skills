# Shader Nodes

Programmatic creation and manipulation of shader node trees. A material's node tree (`material.node_tree`) contains shader nodes that define surface, volume, and displacement shading. For material-level operations see [materials-api](materials-api.md). For node tree interface (group sockets) see [node-tree-interface](node-tree-interface.md). For compositor nodes see [compositor-nodes](compositor-nodes.md).

## Enabling Nodes

```python
import bpy

mat = bpy.data.materials.new("MyMaterial")
mat.use_nodes = True
tree = mat.node_tree

# New materials start with a Principled BSDF and Material Output node
```

## Creating Nodes

```python
import bpy

mat = bpy.data.materials["MyMaterial"]
tree = mat.node_tree

# Create a node by type string
tex_node = tree.nodes.new(type='ShaderNodeTexImage')
tex_node.location = (-400, 300)
tex_node.label = "Base Color Texture"
tex_node.name = "BaseColorTex"  # internal name for lookup

# Remove a node
tree.nodes.remove(tex_node)
```

### Common Node Type Strings

**Shader nodes:**

| Type String | Node |
|---|---|
| `ShaderNodeBsdfPrincipled` | Principled BSDF |
| `ShaderNodeBsdfDiffuse` | Diffuse BSDF |
| `ShaderNodeBsdfGlossy` | Glossy BSDF |
| `ShaderNodeBsdfGlass` | Glass BSDF |
| `ShaderNodeBsdfTransparent` | Transparent BSDF |
| `ShaderNodeBsdfTranslucent` | Translucent BSDF |
| `ShaderNodeBsdfRefraction` | Refraction BSDF |
| `ShaderNodeEmission` | Emission |
| `ShaderNodeMixShader` | Mix Shader |
| `ShaderNodeAddShader` | Add Shader |
| `ShaderNodeOutputMaterial` | Material Output |
| `ShaderNodeVolumePrincipled` | Principled Volume |
| `ShaderNodeVolumeAbsorption` | Volume Absorption |
| `ShaderNodeVolumeScatter` | Volume Scatter |
| `ShaderNodeBsdfHair` | Hair BSDF |
| `ShaderNodeBsdfHairPrincipled` | Principled Hair BSDF |
| `ShaderNodeBackground` | Background (World) |

**Texture nodes:**

| Type String | Node |
|---|---|
| `ShaderNodeTexImage` | Image Texture |
| `ShaderNodeTexEnvironment` | Environment Texture |
| `ShaderNodeTexNoise` | Noise Texture |
| `ShaderNodeTexVoronoi` | Voronoi Texture |
| `ShaderNodeTexWave` | Wave Texture |
| `ShaderNodeTexMusgrave` | Musgrave Texture |
| `ShaderNodeTexGradient` | Gradient Texture |
| `ShaderNodeTexMagic` | Magic Texture |
| `ShaderNodeTexChecker` | Checker Texture |
| `ShaderNodeTexBrick` | Brick Texture |
| `ShaderNodeTexSky` | Sky Texture |
| `ShaderNodeTexWhiteNoise` | White Noise Texture |
| `ShaderNodeTexIES` | IES Texture |
| `ShaderNodeTexPointDensity` | Point Density |

**Input nodes:**

| Type String | Node |
|---|---|
| `ShaderNodeTexCoord` | Texture Coordinate |
| `ShaderNodeUVMap` | UV Map |
| `ShaderNodeAttribute` | Attribute |
| `ShaderNodeObjectInfo` | Object Info |
| `ShaderNodeCameraData` | Camera Data |
| `ShaderNodeVertexColor` | Color Attribute |
| `ShaderNodeValue` | Value |
| `ShaderNodeRGB` | RGB |
| `ShaderNodeFresnel` | Fresnel |
| `ShaderNodeLayerWeight` | Layer Weight |
| `ShaderNodeLightPath` | Light Path |
| `ShaderNodeGeometry` | Geometry |
| `ShaderNodeTangent` | Tangent |
| `ShaderNodeNewGeometry` | Geometry (alias) |
| `ShaderNodeAmbientOcclusion` | Ambient Occlusion |
| `ShaderNodeBevel` | Bevel |
| `ShaderNodeWireframe` | Wireframe |

**Color/Math/Vector nodes:**

| Type String | Node |
|---|---|
| `ShaderNodeMix` | Mix (color, float, or vector) |
| `ShaderNodeMath` | Math |
| `ShaderNodeVectorMath` | Vector Math |
| `ShaderNodeMapRange` | Map Range |
| `ShaderNodeClamp` | Clamp |
| `ShaderNodeRGBCurve` | RGB Curves |
| `ShaderNodeValToRGB` | Color Ramp |
| `ShaderNodeInvert` | Invert Color |
| `ShaderNodeHueSaturation` | Hue/Saturation/Value |
| `ShaderNodeBrightContrast` | Brightness/Contrast |
| `ShaderNodeGamma` | Gamma |
| `ShaderNodeSeparateColor` | Separate Color |
| `ShaderNodeCombineColor` | Combine Color |
| `ShaderNodeSeparateXYZ` | Separate XYZ |
| `ShaderNodeCombineXYZ` | Combine XYZ |
| `ShaderNodeMapping` | Mapping |
| `ShaderNodeVectorRotate` | Vector Rotate |
| `ShaderNodeVectorCurve` | Vector Curves |
| `ShaderNodeNormalMap` | Normal Map |
| `ShaderNodeBump` | Bump |
| `ShaderNodeDisplacement` | Displacement |
| `ShaderNodeVectorDisplacement` | Vector Displacement |

**Utility nodes:**

| Type String | Node |
|---|---|
| `ShaderNodeGroup` | Group (node group instance) |
| `ShaderNodeFrame` | Frame |
| `ShaderNodeReroute` | Reroute |
| `ShaderNodeScript` | Script (OSL) |

## Accessing Inputs and Outputs

Node sockets are accessed by name or index:

```python
import bpy

tree = bpy.data.materials["MyMaterial"].node_tree
principled = tree.nodes.get("Principled BSDF")

# By name
base_color_input = principled.inputs["Base Color"]
bsdf_output = principled.outputs["BSDF"]

# By index
first_input = principled.inputs[0]  # Base Color
first_output = principled.outputs[0]  # BSDF

# List all inputs
for inp in principled.inputs:
    print(f"{inp.name}: {inp.type} = {inp.default_value}")
```

## Setting Default Values

Each unconnected input has a `default_value` that controls the parameter:

```python
import bpy

tree = bpy.data.materials["MyMaterial"].node_tree
principled = tree.nodes.get("Principled BSDF")

# Color (RGBA tuple)
principled.inputs["Base Color"].default_value = (0.8, 0.2, 0.1, 1.0)

# Float
principled.inputs["Metallic"].default_value = 1.0
principled.inputs["Roughness"].default_value = 0.3

# Vector
mapping = tree.nodes.get("Mapping")
if mapping:
    mapping.inputs["Location"].default_value = (0.5, 0.5, 0.0)
    mapping.inputs["Rotation"].default_value = (0, 0, 0.785)  # radians
    mapping.inputs["Scale"].default_value = (2.0, 2.0, 1.0)
```

## Creating Links

Connect node outputs to inputs:

```python
import bpy

tree = bpy.data.materials["MyMaterial"].node_tree

tex = tree.nodes.new('ShaderNodeTexImage')
principled = tree.nodes.get("Principled BSDF")

# Link texture color output to Principled Base Color input
tree.links.new(tex.outputs["Color"], principled.inputs["Base Color"])
tree.links.new(tex.outputs["Alpha"], principled.inputs["Alpha"])

# Remove a specific link
for link in tree.links:
    if link.from_node == tex and link.to_socket == principled.inputs["Alpha"]:
        tree.links.remove(link)
        break

# Clear all links
tree.links.clear()
```

## Node Properties

```python
import bpy

tree = bpy.data.materials["MyMaterial"].node_tree
node = tree.nodes.new('ShaderNodeMath')

# Position and size
node.location = (200, 100)
node.width = 150

# Display
node.label = "My Math Node"
node.use_custom_color = True
node.color = (0.2, 0.5, 0.8)
node.mute = False
node.hide = False
node.select = True

# Math node operation
node.operation = 'MULTIPLY'  # ADD, SUBTRACT, MULTIPLY, DIVIDE, POWER, etc.

# Mix node settings
mix = tree.nodes.new('ShaderNodeMix')
mix.data_type = 'RGBA'        # FLOAT, VECTOR, RGBA, ROTATION
mix.blend_type = 'MIX'        # MIX, ADD, MULTIPLY, SCREEN, OVERLAY, etc.
mix.clamp_result = True
mix.clamp_factor = True
```

## Group Nodes

Use a node group inside another tree:

```python
import bpy

# Create or get a node group
group = bpy.data.node_groups.get("MyShaderGroup")

# Instance it inside a material
tree = bpy.data.materials["MyMaterial"].node_tree
group_node = tree.nodes.new('ShaderNodeGroup')
group_node.node_tree = group
group_node.location = (0, 0)

# Access group node inputs/outputs (matches group interface)
group_node.inputs["Factor"].default_value = 0.5
tree.links.new(group_node.outputs["Color"], principled.inputs["Base Color"])
```

## Common Patterns

### Build a Simple PBR Material

```python
import bpy

mat = bpy.data.materials.new("PBR_Metal")
mat.use_nodes = True
tree = mat.node_tree

# Get default nodes
principled = tree.nodes.get("Principled BSDF")
output = tree.nodes.get("Material Output")

# Add image textures
tex_color = tree.nodes.new('ShaderNodeTexImage')
tex_color.location = (-600, 300)
tex_color.image = bpy.data.images.load("//textures/base_color.png")

tex_rough = tree.nodes.new('ShaderNodeTexImage')
tex_rough.location = (-600, 0)
tex_rough.image = bpy.data.images.load("//textures/roughness.png")
tex_rough.image.colorspace_settings.name = 'Non-Color'

tex_normal = tree.nodes.new('ShaderNodeTexImage')
tex_normal.location = (-600, -300)
tex_normal.image = bpy.data.images.load("//textures/normal.png")
tex_normal.image.colorspace_settings.name = 'Non-Color'

# Normal map node
normal_map = tree.nodes.new('ShaderNodeNormalMap')
normal_map.location = (-300, -300)

# Connect
tree.links.new(tex_color.outputs["Color"], principled.inputs["Base Color"])
tree.links.new(tex_rough.outputs["Color"], principled.inputs["Roughness"])
tree.links.new(tex_normal.outputs["Color"], normal_map.inputs["Color"])
tree.links.new(normal_map.outputs["Normal"], principled.inputs["Normal"])

# Set metallic
principled.inputs["Metallic"].default_value = 1.0
```

### Programmatically Wire a Chain of Math Nodes

```python
import bpy

mat = bpy.data.materials.new("MathChain")
mat.use_nodes = True
tree = mat.node_tree
principled = tree.nodes.get("Principled BSDF")

# Create a chain: TexCoord → Separate XYZ → Math(Multiply) → Math(Sine) → ColorRamp
coord = tree.nodes.new('ShaderNodeTexCoord')
coord.location = (-800, 0)

sep = tree.nodes.new('ShaderNodeSeparateXYZ')
sep.location = (-600, 0)

multiply = tree.nodes.new('ShaderNodeMath')
multiply.location = (-400, 0)
multiply.operation = 'MULTIPLY'
multiply.inputs[1].default_value = 20.0

sine = tree.nodes.new('ShaderNodeMath')
sine.location = (-200, 0)
sine.operation = 'SINE'

ramp = tree.nodes.new('ShaderNodeValToRGB')
ramp.location = (0, 0)

tree.links.new(coord.outputs["Object"], sep.inputs["Vector"])
tree.links.new(sep.outputs["X"], multiply.inputs[0])
tree.links.new(multiply.outputs["Value"], sine.inputs[0])
tree.links.new(sine.outputs["Value"], ramp.inputs["Fac"])
tree.links.new(ramp.outputs["Color"], principled.inputs["Base Color"])
```

### Iterate All Nodes and Find by Type

```python
import bpy

tree = bpy.data.materials["MyMaterial"].node_tree

# Find all image texture nodes
image_nodes = [n for n in tree.nodes if n.type == 'TEX_IMAGE']
for node in image_nodes:
    if node.image:
        print(f"{node.name}: {node.image.filepath}")
    else:
        print(f"{node.name}: no image assigned")

# Find the output node
output_node = next(
    (n for n in tree.nodes if n.type == 'OUTPUT_MATERIAL' and n.is_active_output),
    None
)
```

## Gotchas

1. **Node `type` vs type string.** `tree.nodes.new(type='ShaderNodeMath')` uses the class name. But `node.type` returns an enum like `'MATH'`, not `'ShaderNodeMath'`. Use `node.bl_idname` to get the class name string.

2. **Input names are case-sensitive.** `principled.inputs["Base Color"]` works but `principled.inputs["base color"]` raises `KeyError`. Always match exact capitalization.

3. **`links.new` argument order.** First argument is the output socket, second is the input socket: `tree.links.new(output_socket, input_socket)`. Swapping them raises an error.

4. **Default materials have two nodes.** A fresh `mat.use_nodes = True` creates a Principled BSDF and Material Output already linked. Clear them with `tree.nodes.clear()` if building from scratch.

5. **Color ramp elements.** `ValToRGB` starts with 2 color stops. Access via `node.color_ramp.elements`. Add with `elements.new(position)`, remove with `elements.remove(element)`. Minimum 2 elements always.

6. **Image colorspace.** When using image textures for non-color data (roughness, normal, displacement), set `image.colorspace_settings.name = 'Non-Color'`. Forgetting this produces incorrect shading with sRGB-to-linear conversion applied.

7. **Group node inputs lag.** After changing a node group's interface, existing `ShaderNodeGroup` instances may need the file to be reloaded or the `node_tree` reassigned to update their sockets.
