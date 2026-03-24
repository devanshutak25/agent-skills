# Porting from Blender 4.x to 5.0/5.1

Comprehensive guide to breaking Python API changes when upgrading from Blender 4.x to 5.0 and 5.1. Organized by category matching the reference file structure.

## IDProperty Storage Separation (5.0)

The biggest breaking change. Custom properties (IDProperties) and RNA-defined properties (`bpy.props`) now occupy separate namespaces.

**Before (4.x):**
```python
# Custom property and bpy.props shared the same namespace
obj["my_prop"] = 5                # IDProperty
# bpy.props property with same name would conflict
```

**After (5.0):**
```python
# IDProperties and bpy.props are stored separately
obj["my_prop"] = 5                # IDProperty — in obj.id_properties_*
obj.my_rna_prop                   # bpy.props — in RNA
# No conflict even with same name
```

**Migration:** Code that reads custom properties via `obj["name"]` still works. But code that relied on property name collisions between IDProperties and RNA properties needs review. See [idprop](idprop.md) and [bpy-props](bpy-props.md).

## Compositor Overhaul (5.0)

### scene.node_tree → scene.compositing_node_group

**Before (4.x):**
```python
tree = scene.node_tree
scene.use_nodes = True
```

**After (5.0):**
```python
tree = scene.compositing_node_group
# If None, create one:
if tree is None:
    tree = bpy.data.node_groups.new("Compositing Nodetree", "CompositorNodeTree")
    scene.compositing_node_group = tree
```

### Composite Node → GroupOutput

**Before (4.x):**
```python
comp = tree.nodes.new('CompositorNodeComposite')
```

**After (5.0):**
```python
output = tree.nodes.new('NodeGroupOutput')
```

### CompositorNode → ShaderNode Renames

Many compositor nodes were renamed from `CompositorNode*` to `ShaderNode*`:

| Old Type (4.x) | New Type (5.0) |
|---|---|
| `CompositorNodeGamma` | `ShaderNodeGamma` |
| `CompositorNodeHueSat` | `ShaderNodeHueSaturation` |
| `CompositorNodeBrightContrast` | `ShaderNodeBrightContrast` |
| `CompositorNodeInvert` | `ShaderNodeInvert` |
| `CompositorNodeRGB` | `ShaderNodeRGB` |
| `CompositorNodeRGBToBW` | `ShaderNodeRGBToBW` |
| `CompositorNodeCombineColor` | `ShaderNodeCombineColor` |
| `CompositorNodeSeparateColor` | `ShaderNodeSeparateColor` |
| `CompositorNodeMath` | `ShaderNodeMath` |
| `CompositorNodeValToRGB` | `ShaderNodeValToRGB` |
| `CompositorNodeMixRGB` | `ShaderNodeMix` |
| `CompositorNodeClamp` | `ShaderNodeClamp` |
| `CompositorNodeCurveRGB` | `ShaderNodeRGBCurve` |
| `CompositorNodeNormal` | `ShaderNodeNormal` |
| `CompositorNodeMapRange` | `ShaderNodeMapRange` |
| `CompositorNodeMapValue` | `ShaderNodeMapRange` |
| `CompositorNodeValue` | `ShaderNodeValue` |

See [compositor-nodes](compositor-nodes.md) for the complete table.

### file_output_items Migration

**Before (4.x):**
```python
node.file_slots.new("image")
```

**After (5.0):**
```python
node.file_output_items.new("image")
```

## Render Engine ID Rename (5.0)

**Before (4.x):**
```python
scene.render.engine = 'BLENDER_EEVEE_NEXT'
```

**After (5.0):**
```python
scene.render.engine = 'BLENDER_EEVEE'
```

Code checking for `'BLENDER_EEVEE_NEXT'` will fail silently (no match). See [render-api](render-api.md).

## Render Pass Name Renames (5.0)

Pass names changed from abbreviated to descriptive:

| Old Name (4.x) | New Name (5.0) |
|---|---|
| `"Z"` | `"Depth"` |
| `"IndexOB"` | `"Object Index"` |
| `"IndexMA"` | `"Material Index"` |
| `"Emit"` | `"Emission"` |
| `"Env"` | `"Environment"` |
| `"DiffDir"` | `"Diffuse Direct"` |
| `"DiffInd"` | `"Diffuse Indirect"` |
| `"DiffCol"` | `"Diffuse Color"` |
| `"GlossDir"` | `"Glossy Direct"` |
| `"GlossInd"` | `"Glossy Indirect"` |
| `"GlossCol"` | `"Glossy Color"` |
| `"TransDir"` | `"Transmission Direct"` |
| `"TransInd"` | `"Transmission Indirect"` |
| `"TransCol"` | `"Transmission Color"` |
| `"SubsurfaceDir"` | `"Subsurface Direct"` |
| `"SubsurfaceInd"` | `"Subsurface Indirect"` |
| `"SubsurfaceCol"` | `"Subsurface Color"` |

Code accessing passes by old short names will get `KeyError`. See [render-api](render-api.md).

## Annotation Renames (5.0)

**Before (4.x):**
```python
ann = scene.grease_pencil
stroke = frame.strokes.new()  # GPencilStroke
```

**After (5.0):**
```python
ann = scene.annotation
stroke = frame.strokes.new()  # AnnotationStroke
```

| Old (4.x) | New (5.0) |
|---|---|
| `Scene.grease_pencil` | `Scene.annotation` |
| `Object.grease_pencil` | `Object.annotation` |
| `NodeTree.grease_pencil` | `NodeTree.annotation` |
| `MovieClip.grease_pencil` | `MovieClip.annotation` |
| `bpy.data.grease_pencils` (annotations) | `bpy.data.annotations` |
| `GPencilStroke` | `AnnotationStroke` |
| `GPencilFrame` | `AnnotationFrame` |

See [annotations](annotations.md).

## Bone Select Properties (5.0)

**Before (4.x):**
```python
bone = armature.bones["Spine"]
bone.select = True  # worked on Bone type
```

**After (5.0):**
```python
# select/select_head/select_tail only on EditBone
bpy.ops.object.mode_set(mode='EDIT')
ebone = armature.edit_bones["Spine"]
ebone.select = True
```

Bone groups and 32-layer system replaced by bone collections. See [armatures](armatures.md).

## Material use_nodes (5.0)

**Before (4.x):**
```python
mat.use_nodes = True  # required to enable node tree
```

**After (5.0):**
```python
# use_nodes is deprecated (always True). Materials always have node trees.
# Remove use_nodes assignments — they're no-ops.
```

See [materials-api](materials-api.md).

## Buffer Protocol float32 (5.0)

**Before (4.x):**
```python
import numpy as np
from mathutils import Vector
v = Vector((1, 2, 3))
arr = np.array(v)  # dtype=float64
```

**After (5.0):**
```python
import numpy as np
from mathutils import Vector
v = Vector((1, 2, 3))
arr = np.array(v)  # dtype=float32
```

Code relying on `float64` precision from mathutils types needs explicit conversion: `np.array(v, dtype=np.float64)`. See [mathutils](mathutils.md).

## Private Bundled Modules (5.0)

Bundled Python libraries (OpenUSD `pxr`, `MaterialX`, etc.) are no longer on `sys.path` by default.

**Before (4.x):**
```python
from pxr import Usd  # worked directly
```

**After (5.0):**
```python
import bpy
bpy.utils.expose_bundled_modules()
from pxr import Usd  # now works
```

See [bpy-utils](bpy-utils.md) and [usd-pipeline](usd-pipeline.md).

## Slotted Action System (5.0)

Actions now use slots and channelbags instead of directly containing fcurves:

**Before (4.x):**
```python
action = bpy.data.actions.new("MyAction")
fcurve = action.fcurves.new(data_path="location", index=0)
obj.animation_data.action = action
```

**After (5.0):**
```python
action = bpy.data.actions.new("MyAction")
slot = action.slots.new(id_type='OBJECT', name=obj.name)
obj.animation_data.action = action
obj.animation_data.action_slot = slot

from bpy_extras.anim_utils import action_ensure_channelbag_for_slot
channelbag = action_ensure_channelbag_for_slot(action, slot)
fcurve = channelbag.fcurves.new(data_path="location", index=0)
```

See [animation-actions](animation-actions.md).

## shade_smooth/shade_flat Deprecation (5.0)

**Before (4.x):**
```python
bpy.ops.object.shade_smooth()
```

**After (5.0):**
```python
# Use per-face smooth attribute or auto_smooth_angle
mesh.shade_smooth()  # method on Mesh type
# Or set per-face: mesh.attributes["sharp_face"]
```

See [mesh-advanced](mesh-advanced.md).

## scene.ray_cast Edit Mode Caveat (5.0)

`scene.ray_cast()` now ignores geometry of objects in edit mode. Exit edit mode before raycasting, or use `BVHTree.FromObject()` instead. See [collections-scene](collections-scene.md).

## BGL Module Removed (5.0)

The `bgl` module (OpenGL wrapper) has been completely removed. All GPU drawing must use the `gpu` module.

**Before (4.x):**
```python
import bgl
bgl.glEnable(bgl.GL_BLEND)
```

**After (5.0):**
```python
import gpu
gpu.state.blend_set('ALPHA')
```

Also removed: `Image.bindcode`. Use `gpu.texture.from_image(image)` instead. See [gpu-module](gpu-module.md).

## bpy.props get_transform/set_transform (5.0)

New callback pair for property value transformation:

```python
my_prop: bpy.props.FloatProperty(
    get_transform=lambda self, value: value * 2,
    set_transform=lambda self, value: value / 2,
)
```

See [bpy-props](bpy-props.md).

## bpy.props READ_ONLY Option (5.0)

New property option:

```python
my_prop: bpy.props.StringProperty(options={'READ_ONLY'})
```

## bl_system_properties_get (5.0)

New method for accessing system-level addon properties:

```python
prefs = context.preferences.addons[__package__].preferences
# Or for system properties:
# bpy.types.AddonPreferences.bl_system_properties_get()
```

See [addon-preferences](addon-preferences.md).

---

## 5.1 Changes

### VSE Strip Time Property Renames

| Old (pre-5.1) | New (5.1) |
|---|---|
| `frame_start` | `content_start` |
| `frame_final_start` | `left_handle` |
| `frame_final_end` | `right_handle` |
| `frame_final_duration` | `duration` |
| `frame_offset_start` | `left_handle_offset` |
| `frame_offset_end` | `right_handle_offset` |
| `frame_duration` | `content_duration` |
| `animation_offset_start` | `content_trim_start` |
| `animation_offset_end` | `content_trim_end` |
| — | `content_end` (new, read-only) |

Old names deprecated, removal in 6.0. See [sequencer-effects-retiming](sequencer-effects-retiming.md).

### Retiming keep_retiming Removed

`retiming_segment_speed_set` no longer accepts the `keep_retiming` parameter.

### Node Tool idname Requirement

Node tools require explicit `idname` property in 5.1. See [geometry-nodes-api](geometry-nodes-api.md).

### template_list columns Deprecated

`UILayout.template_list` `columns` parameter deprecated. See [ui-layout-advanced](ui-layout-advanced.md).

### exit_pre Handler

New handler `bpy.app.handlers.exit_pre` — fires before Blender exits. See [handlers-timers](handlers-timers.md).

### bpy.app.cachedir

New path property for cache directory. See `bpy.app`.

---

## Quick Migration Checklist

1. **Search for `scene.node_tree`** → Replace with `scene.compositing_node_group`
2. **Search for `CompositorNode`** → Check rename table above
3. **Search for `BLENDER_EEVEE_NEXT`** → Replace with `BLENDER_EEVEE`
4. **Search for `grease_pencil`** (annotation context) → Replace with `annotation`
5. **Search for `use_nodes`** on materials → Remove (deprecated)
6. **Search for render pass names** (`DiffDir`, `GlossDir`, etc.) → Use new full names
7. **Search for `bone.select`** on Bone type → Move to EditBone in edit mode
8. **Search for `from pxr`** → Add `bpy.utils.expose_bundled_modules()` before
9. **Search for `action.fcurves.new`** → Use slotted action system
10. **Search for `frame_final_start`/`frame_offset_start`** (5.1) → Use new strip time names
11. **Search for numpy dtype assumptions** on mathutils → Verify float32 compatibility
12. **Search for `file_slots`** on file output nodes → Use `file_output_items`
13. **Search for `bgl`** → Replace with `gpu` module equivalents
14. **Search for `Image.bindcode`** → Use `gpu.texture.from_image()`

## Blend File Compatibility

Files saved in Blender 5.0+ can only be opened in Blender 4.5 or newer. There is no way to save in an older format.
