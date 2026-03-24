# Compositor Nodes

Blender 5.0 compositor uses node groups as standalone data-blocks, no longer embedded in the scene. The compositor underwent major structural changes in 5.0. For shader nodes see [shader-nodes](shader-nodes.md). For node tree interface (group sockets/panels) see [node-tree-interface](node-tree-interface.md). For materials see [materials-api](materials-api.md).

## Compositor Setup

In 5.0, compositor node trees are standalone `CompositorNodeTree` data-blocks assigned to the scene via `scene.compositing_node_group`:

```python
import bpy

scene = bpy.context.scene

# Create a compositor node tree
tree = bpy.data.node_groups.new("MyComp", "CompositorNodeTree")
scene.compositing_node_group = tree

# Add nodes
rlayers = tree.nodes.new('CompositorNodeRLayers')
rlayers.location = (-300, 0)

group_output = tree.nodes.new('NodeGroupOutput')
group_output.location = (300, 0)

# Define the output socket on the tree interface
# First output must be a Color socket for the final render
tree.interface.new_socket("Image", in_out='OUTPUT', socket_type='NodeSocketColor')

# Link render result to output
tree.links.new(rlayers.outputs["Image"], group_output.inputs["Image"])
```

### Key Structural Changes from 4.x

| Aspect | 4.x | 5.0 |
|---|---|---|
| Node tree location | `scene.node_tree` (embedded) | `scene.compositing_node_group` (data-block) |
| Enable compositing | `scene.use_nodes = True` | Assign a node group (deprecated, always True) |
| Final output node | `CompositorNodeComposite` | `NodeGroupOutput` (first Color input = render output) |
| Node tree creation | Automatic on scene | `bpy.data.node_groups.new(name, "CompositorNodeTree")` |
| File Output slots | `file_slots[i].path` | `file_output_items[i].name` |

**`scene.use_nodes`** is deprecated — it always returns `True` and setting it has no effect. It will be removed in 6.0. Compositing is disabled by unchecking "Compositing" under Post Processing in Output properties, or by setting `scene.compositing_node_group = None`.

## GroupOutput Replaces Composite

The `CompositorNodeComposite` node was removed. Use `NodeGroupOutput` instead. The first input socket must be a Color socket — this becomes the final composited render output:

```python
import bpy

tree = bpy.data.node_groups.new("Comp", "CompositorNodeTree")
bpy.context.scene.compositing_node_group = tree

# Define outputs via tree interface
tree.interface.new_socket("Image", in_out='OUTPUT', socket_type='NodeSocketColor')
tree.interface.new_socket("Alpha", in_out='OUTPUT', socket_type='NodeSocketFloat')

# Add nodes
rlayers = tree.nodes.new('CompositorNodeRLayers')
output = tree.nodes.new('NodeGroupOutput')

rlayers.location = (-200, 0)
output.location = (200, 0)

tree.links.new(rlayers.outputs["Image"], output.inputs["Image"])
tree.links.new(rlayers.outputs["Alpha"], output.inputs["Alpha"])
```

## Removed Nodes — Shader Node Replacements

These compositor-specific nodes were deprecated in 4.5 and removed in 5.0. Use the shared ShaderNode equivalents instead:

| Removed (4.x) | Replacement (5.0) | Notes |
|---|---|---|
| `CompositorNodeValue` | `ShaderNodeValue` | Single float value |
| `CompositorNodeValToRGB` | `ShaderNodeValToRGB` | Color Ramp |
| `CompositorNodeMixRGB` | `ShaderNodeMix` | Mix node (set `data_type='RGBA'`) |
| `CompositorNodeMapRange` | `ShaderNodeMapRange` | Map Range |
| `CompositorNodeMath` | `ShaderNodeMath` | Math operations |
| `CompositorNodeCombineXYZ` | `ShaderNodeCombineXYZ` | Combine XYZ |
| `CompositorNodeSeparateXYZ` | `ShaderNodeSeparateXYZ` | Separate XYZ |
| `CompositorNodeVectorCurve` | `ShaderNodeVectorCurve` | Vector Curves |
| `CompositorNodeGamma` | `ShaderNodeGamma` | Gamma correction |
| `CompositorNodeHueSat` | `ShaderNodeHueSaturation` | Hue/Saturation/Value |
| `CompositorNodeBrightContrast` | `ShaderNodeBrightContrast` | Brightness/Contrast |
| `CompositorNodeInvert` | `ShaderNodeInvert` | Invert Color |
| `CompositorNodeRGB` | `ShaderNodeRGB` | RGB color constant |
| `CompositorNodeRGBToBW` | `ShaderNodeRGBToBW` | RGB to BW converter |
| `CompositorNodeCombineColor` | `ShaderNodeCombineColor` | Combine Color |
| `CompositorNodeSeparateColor` | `ShaderNodeSeparateColor` | Separate Color |
| `CompositorNodeClamp` | `ShaderNodeClamp` | Clamp value |
| `CompositorNodeCurveRGB` | `ShaderNodeCurveRGB` | RGB Curves |
| `CompositorNodeNormal` | `ShaderNodeNormal` | Normal |
| `CompositorNodeCombineHSVA` | `ShaderNodeCombineColor` | Set mode to `'HSV'` |
| `CompositorNodeSeparateHSVA` | `ShaderNodeSeparateColor` | Set mode to `'HSV'` |
| `CompositorNodeCombineRGBA` | `ShaderNodeCombineColor` | Set mode to `'RGB'` |
| `CompositorNodeSeparateRGBA` | `ShaderNodeSeparateColor` | Set mode to `'RGB'` |
| `CompositorNodeCombineYCCA` | `ShaderNodeCombineColor` | Set mode to `'YCC'` |
| `CompositorNodeSeparateYCCA` | `ShaderNodeSeparateColor` | Set mode to `'YCC'` |

```python
import bpy

tree = bpy.data.node_groups.new("Comp", "CompositorNodeTree")

# Old (4.x): tree.nodes.new('CompositorNodeMath')
# New (5.0): use shared ShaderNode
math_node = tree.nodes.new('ShaderNodeMath')
math_node.operation = 'ADD'

# Old: CompositorNodeMixRGB
# New: ShaderNodeMix with RGBA mode
mix = tree.nodes.new('ShaderNodeMix')
mix.data_type = 'RGBA'
mix.blend_type = 'MULTIPLY'
```

## Other Removed Nodes

| Removed Node | Replacement |
|---|---|
| `CompositorNodeComposite` | `NodeGroupOutput` |
| `CompositorNodeMapValue` | `ShaderNodeMapRange` + `ShaderNodeClamp` |
| `CompositorNodeSunBeams` | `CompositorNodeGlare` (type = `'SUN_BEAMS'`) |
| `CompositorNodeTexture` | Procedural texture nodes (Noise, Voronoi, Wave, etc.) |
| Point Density Texture | Removed, no direct replacement |

## Existing Compositor Nodes

These CompositorNode types remain in 5.0 — they are NOT renamed:

**Input nodes:**
- `CompositorNodeRLayers` — Render Layers
- `CompositorNodeImage` — Image
- `CompositorNodeMovieClip` — Movie Clip
- `CompositorNodeMask` — Mask
- `CompositorNodeBokehImage` — Bokeh Image
- `CompositorNodeTime` — Time Curve
- `CompositorNodeSceneTime` — Scene Time
- `CompositorNodeTrackPos` — Track Position
- `CompositorNodeImageCoordinates` — Image Coordinates

**Color nodes:**
- `CompositorNodeExposure` — Exposure
- `CompositorNodeColorBalance` — Color Balance
- `CompositorNodeColorCorrection` — Color Correction
- `CompositorNodeHueCorrect` — Hue Correct
- `CompositorNodeTonemap` — Tonemap
- `CompositorNodePosterize` — Posterize
- `CompositorNodeAlphaOver` — Alpha Over

**Filter nodes:**
- `CompositorNodeBlur` — Blur
- `CompositorNodeBilateralblur` — Bilateral Blur
- `CompositorNodeBokehBlur` — Bokeh Blur
- `CompositorNodeDBlur` — Directional Blur
- `CompositorNodeVecBlur` — Vector Blur
- `CompositorNodeDefocus` — Defocus
- `CompositorNodeGlare` — Glare
- `CompositorNodeDespeckle` — Despeckle
- `CompositorNodeFilter` — Filter
- `CompositorNodeDilateErode` — Dilate/Erode
- `CompositorNodeInpaint` — Inpaint
- `CompositorNodeDenoise` — Denoise
- `CompositorNodeAntiAliasing` — Anti-Aliasing
- `CompositorNodeKuwahara` — Kuwahara
- `CompositorNodePixelate` — Pixelate
- `CompositorNodeConvolve` — Convolve (5.0+)

**Matte nodes:**
- `CompositorNodeKeying` — Keying
- `CompositorNodeKeyingScreen` — Keying Screen
- `CompositorNodeChannelMatte` — Channel Key
- `CompositorNodeColorMatte` — Color Key
- `CompositorNodeChromaMatte` — Chroma Key
- `CompositorNodeLumaMatte` — Luminance Key
- `CompositorNodeDiffMatte` — Difference Key
- `CompositorNodeDistanceMatte` — Distance Key
- `CompositorNodeColorSpill` — Color Spill
- `CompositorNodeBoxMask` — Box Mask
- `CompositorNodeEllipseMask` — Ellipse Mask
- `CompositorNodeDoubleEdgeMask` — Double Edge Mask
- `CompositorNodeIDMask` — ID Mask
- `CompositorNodeCryptomatte` — Cryptomatte (legacy)
- `CompositorNodeCryptomatteV2` — Cryptomatte

**Transform/Distort nodes:**
- `CompositorNodeRotate` — Rotate
- `CompositorNodeScale` — Scale
- `CompositorNodeFlip` — Flip
- `CompositorNodeTranslate` — Translate
- `CompositorNodeTransform` — Transform
- `CompositorNodeCrop` — Crop
- `CompositorNodeDisplace` — Displace
- `CompositorNodeMapUV` — Map UV
- `CompositorNodeLensdist` — Lens Distortion
- `CompositorNodeMovieDistortion` — Movie Distortion
- `CompositorNodeCornerPin` — Corner Pin
- `CompositorNodePlaneTrackDeform` — Plane Track Deform
- `CompositorNodeStabilize` — Stabilize 2D

**Converter nodes:**
- `CompositorNodeSetAlpha` — Set Alpha
- `CompositorNodePremulKey` — Alpha Convert
- `CompositorNodeConvertColorSpace` — Color Space
- `CompositorNodeConvertToDisplay` — Convert to Display
- `CompositorNodeNormalize` — Normalize
- `CompositorNodeLevels` — Levels
- `CompositorNodeRelativeToPixel` — Relative to Pixel (5.0+)
- `CompositorNodeImageInfo` — Image Info (5.0+)

**Output nodes:**
- `CompositorNodeViewer` — Viewer
- `CompositorNodeOutputFile` — File Output
- `CompositorNodeSplit` — Split (was Split Viewer)

**Layout/Utility:**
- `CompositorNodeGroup` — Group
- `CompositorNodeSwitch` — Switch
- `CompositorNodeSwitchView` — Switch View

## File Output Node

The File Output node was restructured in 5.0:

```python
import bpy

tree = bpy.data.node_groups.new("Comp", "CompositorNodeTree")
bpy.context.scene.compositing_node_group = tree

rlayers = tree.nodes.new('CompositorNodeRLayers')
file_output = tree.nodes.new('CompositorNodeOutputFile')
file_output.location = (300, 0)

# Set output directory and base filename
file_output.directory = "//render_output/"
file_output.file_name = "render_"
file_output.format.file_format = 'OPEN_EXR'

# Access output items (replaces file_slots)
# First item exists by default
file_output.file_output_items[0].name = "beauty"

# Add additional outputs
file_output.file_output_items.new("depth")
file_output.file_output_items.new("normal")

# Link render passes
tree.links.new(rlayers.outputs["Image"], file_output.inputs["beauty"])
tree.links.new(rlayers.outputs["Depth"], file_output.inputs["depth"])
tree.links.new(rlayers.outputs["Normal"], file_output.inputs["normal"])
```

## Node Input/Output Changes in 5.0

Several existing compositor nodes had input or output renames:

| Node | Old Name | New Name |
|---|---|---|
| Alpha Over | (unnamed inputs) | `"Background"`, `"Foreground"` |
| Color Correction | Lift inputs | Offset inputs |
| Color (RGB) | `"RGBA"` output | `"Color"` output |
| Normal | Dot output | Removed (use Vector Math Dot Product) |

## Common Patterns

### Basic Color Grading Setup

```python
import bpy

tree = bpy.data.node_groups.new("ColorGrade", "CompositorNodeTree")
bpy.context.scene.compositing_node_group = tree

tree.interface.new_socket("Image", in_out='OUTPUT', socket_type='NodeSocketColor')

# Nodes
rlayers = tree.nodes.new('CompositorNodeRLayers')
rlayers.location = (-400, 0)

exposure = tree.nodes.new('CompositorNodeExposure')
exposure.location = (-100, 0)

color_bal = tree.nodes.new('CompositorNodeColorBalance')
color_bal.location = (200, 0)
color_bal.correction_method = 'OFFSET_POWER_SLOPE'

output = tree.nodes.new('NodeGroupOutput')
output.location = (500, 0)

# Links
tree.links.new(rlayers.outputs["Image"], exposure.inputs["Image"])
tree.links.new(exposure.outputs["Image"], color_bal.inputs["Image"])
tree.links.new(color_bal.outputs["Image"], output.inputs["Image"])
```

### Multi-Pass File Output

```python
import bpy

tree = bpy.data.node_groups.new("MultiPass", "CompositorNodeTree")
bpy.context.scene.compositing_node_group = tree

tree.interface.new_socket("Image", in_out='OUTPUT', socket_type='NodeSocketColor')

rlayers = tree.nodes.new('CompositorNodeRLayers')
rlayers.location = (-300, 0)

# File output for EXR multi-layer
file_out = tree.nodes.new('CompositorNodeOutputFile')
file_out.location = (300, -200)
file_out.directory = "//output/"
file_out.format.file_format = 'OPEN_EXR_MULTILAYER'

# Add outputs for each pass
file_out.file_output_items[0].name = "Image"
file_out.file_output_items.new("Depth")
file_out.file_output_items.new("Normal")
file_out.file_output_items.new("DiffCol")

# Group output for composite
output = tree.nodes.new('NodeGroupOutput')
output.location = (300, 100)

# Link passes
tree.links.new(rlayers.outputs["Image"], output.inputs["Image"])
tree.links.new(rlayers.outputs["Image"], file_out.inputs["Image"])
tree.links.new(rlayers.outputs["Depth"], file_out.inputs["Depth"])
tree.links.new(rlayers.outputs["Normal"], file_out.inputs["Normal"])
tree.links.new(rlayers.outputs["DiffCol"], file_out.inputs["DiffCol"])
```

### Reuse a Compositor Tree Across Scenes

```python
import bpy

# Create shared compositor tree
shared_tree = bpy.data.node_groups.new("SharedComp", "CompositorNodeTree")
shared_tree.interface.new_socket("Image", in_out='OUTPUT', socket_type='NodeSocketColor')

rlayers = shared_tree.nodes.new('CompositorNodeRLayers')
output = shared_tree.nodes.new('NodeGroupOutput')
shared_tree.links.new(rlayers.outputs["Image"], output.inputs["Image"])

# Assign to multiple scenes
for scene in bpy.data.scenes:
    scene.compositing_node_group = shared_tree
```

## Gotchas

1. **`scene.node_tree` is removed.** All code using `scene.node_tree` must be updated to use `scene.compositing_node_group`. This is a data-block reference — the node tree is a standalone `CompositorNodeTree` in `bpy.data.node_groups`.

2. **`scene.use_nodes` is deprecated.** It always returns `True`. To disable compositing, set `scene.compositing_node_group = None` or uncheck Post Processing > Compositing in the UI.

3. **GroupOutput replaces Composite.** The first Color input on `NodeGroupOutput` becomes the render output. Additional inputs are ignored for rendering. There is no `CompositorNodeComposite` anymore.

4. **Scene copies do not copy the node group.** In 5.0, duplicating a scene does not automatically duplicate the compositor node group. You must manually copy it: `new_tree = tree.copy()` and assign to the new scene.

5. **Removed nodes raise errors.** Using removed type strings like `'CompositorNodeMath'` in `nodes.new()` raises `RuntimeError`. Use the ShaderNode equivalents from the rename table above.

6. **File output migration.** `file_slots` no longer exists. Code accessing `node.file_slots[0].path` must change to `node.file_output_items[0].name`. The `base_path` property is replaced by separate `directory` and `file_name` properties.

7. **Alpha Over input names changed.** The inputs were renamed to `"Background"` and `"Foreground"`. Code accessing by old names or expecting a different order will break.
