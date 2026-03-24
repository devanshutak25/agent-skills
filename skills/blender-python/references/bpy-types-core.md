# Core Types (bpy.types)

Blender's RNA type system exposes all data as Python types under `bpy.types`. Every Blender struct inherits from `bpy_struct`, and all persistent data-blocks inherit from `ID`. This file covers the core type hierarchy and the most commonly used types: Object, Scene, Collection, and ViewLayer.

## Type Hierarchy

```
bpy_struct                    ← root base for ALL RNA types
  ├─ ID                       ← base for all data-blocks
  │    ├─ Object
  │    ├─ Scene
  │    ├─ Collection
  │    ├─ Mesh, Curve, Curves, Camera, Light, Material, World
  │    ├─ Armature, Lattice, MetaBall, Volume, PointCloud
  │    ├─ Image, NodeTree, Action, Text, Sound, Brush
  │    ├─ GreasePencilv3, Annotation
  │    ├─ FreestyleLineStyle, ParticleSettings
  │    ├─ Library, Screen, WorkSpace, WindowManager
  │    └─ ... (every type in bpy.data collections)
  ├─ ViewLayer               ← NOT an ID — accessed via scene.view_layers
  ├─ LayerCollection         ← NOT an ID
  ├─ Modifier, Constraint    ← NOT IDs — owned by Object
  └─ Bone, EditBone, PoseBone ← NOT IDs — owned by Armature/Object
```

## bpy_struct (Root Base)

All RNA types inherit from `bpy_struct`. Key members:

| Property/Method | Description |
|---|---|
| `id_data` | The outermost ID data-block containing this struct (read-only) |
| `bl_rna` | RNA type information for introspection |
| `keys()` | Custom property key names |
| `values()` | Custom property values |
| `items()` | Custom property (key, value) pairs |
| `get(key, default=None)` | Safe custom property access |
| `pop(key, default)` | Remove and return custom property |
| `path_from_id(prop="")` | RNA path from owning ID root |
| `path_resolve(path, coerce=True)` | Resolve an RNA path to data |
| `driver_add(path, index=-1)` | Add a driver, returns FCurve |
| `driver_remove(path, index=-1)` | Remove a driver |
| `keyframe_insert(path, frame, index=-1, group="")` | Insert keyframe |
| `keyframe_delete(path, frame, index=-1)` | Delete keyframe |
| `is_property_set(prop)` | Whether property has been explicitly set |
| `is_property_readonly(prop)` | Whether property is read-only |
| `property_unset(prop)` | Reset property to default value |
| `as_pointer()` | Memory address as integer (for C interop) |
| `type_recast()` | Recast to actual derived type |

## ID (Data-Block Base)

All data-blocks (`bpy.data.objects`, `bpy.data.meshes`, etc.) inherit from `ID`.

### Properties

| Property | Type | RO | Description |
|---|---|---|---|
| `name` | str | no | Unique name (max 255 bytes) |
| `name_full` | str | yes | Full name including library prefix (e.g., `"LIB_name"`) |
| `users` | int | yes | Number of references to this data-block |
| `use_fake_user` | bool | no | Preserve even with zero users |
| `tag` | bool | no | Temporary tag for scripts (not saved) |
| `session_uid` | int | yes | Session-unique ID (stable across renames, not saved to file) |
| `is_evaluated` | bool | yes | True if this is an evaluated copy from depsgraph |
| `is_library_indirect` | bool | yes | Indirectly linked library data-block |
| `is_missing` | bool | yes | Data not found on disk |
| `is_runtime_data` | bool | yes | Runtime-only, not saved in .blend |
| `original` | ID | yes | Original data-block if this is evaluated |
| `library` | Library | yes | Source library (None for local data) |
| `library_weak_reference` | LibraryWeakReference | yes | Weak reference to source library file |
| `override_library` | IDOverrideLibrary | yes | Library override information |
| `asset_data` | AssetMetaData | yes | Asset metadata (None unless marked as asset) |
| `preview` | ImagePreview | yes | Preview image |
| `animation_data` | AnimData | yes | Animation data (actions, drivers, NLA) |

### Methods

| Method | Returns | Description |
|---|---|---|
| `copy()` | ID | Create a full copy (added to bpy.data) |
| `evaluated_get(depsgraph)` | ID | Get evaluated version from dependency graph |
| `user_of_id(id)` | int | Count references from this ID to given ID |
| `user_clear()` | None | Set user count to zero (use with caution) |
| `user_remap(new_id)` | None | Replace all usage of this ID with new_id |
| `animation_data_create()` | AnimData | Create animation data on this ID |
| `animation_data_clear()` | None | Remove animation data |
| `update_tag(refresh=set())` | None | Tag for update; refresh: `{'OBJECT', 'DATA', 'TIME'}` |
| `preview_ensure()` | ImagePreview | Ensure preview exists |
| `asset_mark()` | None | Mark as asset |
| `asset_clear()` | None | Remove asset metadata |
| `override_create(remap_local_usages=False)` | ID | Create local override of linked data-block |
| `override_hierarchy_create(scene, view_layer, reference=None)` | ID | Override hierarchy for Collections/Objects |

## Object

Objects are containers linking data-blocks (Mesh, Camera, etc.) to the scene with transforms, modifiers, and constraints.

### Type Enum

`object.type` (read-only) — one of:

`'MESH'`, `'CURVE'`, `'SURFACE'`, `'META'`, `'FONT'`, `'CURVES'`, `'POINTCLOUD'`, `'VOLUME'`, `'GREASEPENCIL'`, `'ARMATURE'`, `'LATTICE'`, `'EMPTY'`, `'LIGHT'`, `'LIGHT_PROBE'`, `'CAMERA'`, `'SPEAKER'`

### Core Properties

| Property | Type | RO | Description |
|---|---|---|---|
| `data` | ID | no | Underlying data-block (Mesh, Camera, etc.) — None for Empty |
| `type` | str | yes | Object type enum (see above) |
| `mode` | str | yes | Current interaction mode |
| `matrix_world` | Matrix 4×4 | no | World-space transformation |
| `matrix_local` | Matrix 4×4 | no | Parent-relative transformation |
| `matrix_basis` | Matrix 4×4 | no | Base transform (without constraints/parenting) |
| `matrix_parent_inverse` | Matrix 4×4 | no | Inverse of parent's transform at parenting time |
| `location` | float[3] | no | Object location |
| `rotation_euler` | float[3] | no | Euler rotation |
| `rotation_quaternion` | float[4] | no | Quaternion rotation |
| `rotation_axis_angle` | float[4] | no | Axis-angle rotation (W, X, Y, Z) |
| `rotation_mode` | str | no | `'QUATERNION'`, `'XYZ'`, `'XZY'`, `'YXZ'`, `'YZX'`, `'ZXY'`, `'ZYX'`, `'AXIS_ANGLE'` |
| `scale` | float[3] | no | Object scale |
| `dimensions` | float[3] | no | Bounding box dimensions (setting adjusts scale) |
| `bound_box` | float[8][3] | yes | 8 corner points in local space |
| `delta_location` | float[3] | no | Extra location offset |
| `delta_rotation_euler` | float[3] | no | Extra rotation offset |
| `delta_scale` | float[3] | no | Extra scale offset |
| `parent` | Object | no | Parent object |
| `parent_type` | str | no | `'OBJECT'`, `'ARMATURE'`, `'LATTICE'`, `'VERTEX'`, `'VERTEX_3'`, `'BONE'` |
| `parent_bone` | str | no | Armature bone name for bone parenting |
| `modifiers` | ObjectModifiers | yes | Modifier stack |
| `constraints` | ObjectConstraints | yes | Constraint stack |
| `vertex_groups` | VertexGroups | yes | Vertex groups |
| `hide_viewport` | bool | no | Globally disable in viewports |
| `hide_render` | bool | no | Globally disable in renders |
| `display_type` | str | no | `'BOUNDS'`, `'WIRE'`, `'SOLID'`, `'TEXTURED'` |
| `color` | float[4] | no | Object color (RGBA) |
| `active_material` | Material | no | Active material |
| `active_material_index` | int | no | Active material slot index |
| `material_slots` | MaterialSlot[] | yes | Material slots |
| `particle_systems` | ParticleSystems | yes | Particle systems |
| `pose` | Pose | yes | Armature pose data |
| `instance_type` | str | no | `'NONE'`, `'VERTS'`, `'FACES'`, `'COLLECTION'` |
| `instance_collection` | Collection | no | Collection to instance |
| `empty_display_type` | str | no | Display shape for empties |
| `empty_display_size` | float | no | Size of empty display |

### Key Methods

| Method | Returns | Description |
|---|---|---|
| `visible_get(view_layer=None, viewport=None)` | bool | Test visibility (accounts for collections) |
| `select_get(view_layer=None)` | bool | Test selection state |
| `select_set(state, view_layer=None)` | None | Set selection state |
| `hide_get(view_layer=None)` | bool | Test temporary hide state |
| `hide_set(state, view_layer=None)` | None | Set temporary hide state |
| `to_mesh(preserve_all_data_layers=False, depsgraph=None)` | Mesh | Create mesh from object (applies modifiers if depsgraph given) |
| `to_mesh_clear()` | None | Free mesh created by to_mesh() |
| `to_curve(depsgraph, apply_modifiers=False)` | Curve | Convert to curve data |
| `to_curve_clear()` | None | Free curve created by to_curve() |
| `closest_point_on_mesh(origin, distance=1.84e+19, depsgraph=None)` | (bool, Vector, Vector, int) | Find closest point — returns (result, location, normal, face_index) |
| `ray_cast(origin, direction, distance=1.7e+38, depsgraph=None)` | (bool, Vector, Vector, int) | Cast ray in local space — returns (result, location, normal, face_index) |
| `shape_key_add(name="Key", from_mix=True)` | ShapeKey | Add a shape key |
| `convert_space(pose_bone=None, matrix=Matrix(), from_space='WORLD', to_space='WORLD')` | Matrix | Convert transform between spaces |
| `update_from_editmode()` | bool | Sync edit mode changes to object data |
| `calc_matrix_camera(depsgraph, x=1, y=1, scale_x=1.0, scale_y=1.0)` | Matrix | Camera projection matrix |

### Mode Enum

`object.mode` values: `'OBJECT'`, `'EDIT'`, `'POSE'`, `'SCULPT'`, `'VERTEX_PAINT'`, `'WEIGHT_PAINT'`, `'TEXTURE_PAINT'`, `'PARTICLE_EDIT'`, `'EDIT_GPENCIL'`, `'SCULPT_GREASE_PENCIL'`, `'PAINT_GREASE_PENCIL'`, `'WEIGHT_GREASE_PENCIL'`, `'VERTEX_GREASE_PENCIL'`

## Scene

The scene is the top-level container for objects, render settings, animation range, and compositor.

### Properties

| Property | Type | RO | Description |
|---|---|---|---|
| `frame_current` | int | no | Current frame |
| `frame_start` | int | no | First frame of playback/render range |
| `frame_end` | int | no | Last frame |
| `frame_step` | int | no | Frame increment |
| `frame_float` | float | no | Precise frame with subframe |
| `frame_subframe` | float | no | Fractional part of current frame |
| `render` | RenderSettings | yes | Render settings |
| `compositing_node_group` | NodeTree | no | Compositor node group |
| `collection` | Collection | yes | Scene master collection (root of hierarchy) |
| `view_layers` | ViewLayers | yes | View layers |
| `cursor` | View3DCursor | no | 3D cursor |
| `world` | World | no | World environment |
| `camera` | Object | no | Active camera |
| `annotation` | Annotation | no | Annotation data |
| `sequence_editor` | SequenceEditor | yes | Video sequence editor |
| `timeline_markers` | TimelineMarkers | yes | Timeline markers |
| `tool_settings` | ToolSettings | yes | Tool settings |
| `eevee` | SceneEEVEE | yes | EEVEE settings |
| `unit_settings` | UnitSettings | yes | Unit system |
| `gravity` | float[3] | no | Gravity vector |
| `use_gravity` | bool | no | Enable gravity |
| `rigidbody_world` | RigidBodyWorld | yes | Rigid body simulation |
| `use_preview_range` | bool | no | Use preview range for playback |
| `frame_preview_start` | int | no | Preview range start |
| `frame_preview_end` | int | no | Preview range end |
| `use_nodes` | bool | no | **Deprecated** — always True, no effect. Use `render.use_compositing` instead |

The compositor uses standalone node groups. Create a compositor tree with `bpy.data.node_groups.new("name", "CompositorNodeTree")` and assign to `scene.compositing_node_group`. See [compositor-nodes](compositor-nodes.md).

`scene.annotation` provides access to annotation data. This was renamed from `scene.grease_pencil`. See [annotations](annotations.md).

### Key Methods

| Method | Returns | Description |
|---|---|---|
| `ray_cast(view_layer, origin, direction, distance=1.7e+38)` | (bool, Vector, Vector, int, Object, Matrix) | Cast ray in world space — returns (result, location, normal, index, object, matrix) |
| `frame_set(frame, subframe=0.0)` | None | Set frame with immediate depsgraph update |

## Collection

Collections organize objects into groups and form a hierarchy under `scene.collection`.

### Properties

| Property | Type | RO | Description |
|---|---|---|---|
| `objects` | CollectionObjects | yes | Objects directly in this collection |
| `all_objects` | CollectionObjects | yes | All objects recursively (read-only view) |
| `children` | CollectionChildren | yes | Child collections |
| `hide_viewport` | bool | no | Globally disable in viewports |
| `hide_render` | bool | no | Globally disable in renders |
| `hide_select` | bool | no | Disable selection |
| `color_tag` | str | no | Color tag for UI |
| `instance_offset` | float[3] | no | Offset for collection instances |

### Linking and Unlinking

```python
import bpy

# Link object to collection
col = bpy.data.collections.new("MyCollection")
bpy.context.scene.collection.children.link(col)
obj = bpy.data.objects.new("Empty", None)
col.objects.link(obj)

# Unlink
col.objects.unlink(obj)

# Link child collection
child = bpy.data.collections.new("Child")
col.children.link(child)
col.children.unlink(child)
```

## ViewLayer

View layers control object visibility and render passes. They are NOT data-blocks (not in `bpy.data`). Access via `scene.view_layers` or `context.view_layer`.

### Properties

| Property | Type | RO | Description |
|---|---|---|---|
| `name` | str | no | View layer name |
| `objects` | LayerObjects | yes | All objects in this view layer |
| `depsgraph` | Depsgraph | yes | Dependency graph |
| `layer_collection` | LayerCollection | yes | Root layer collection (mirrors scene.collection) |
| `active_layer_collection` | LayerCollection | no | Active layer collection |
| `use` | bool | no | Enable for rendering |
| `use_freestyle` | bool | no | Enable Freestyle rendering |
| `material_override` | Material | no | Override material for all objects |
| `samples` | int | no | Render sample count |
| `freestyle_settings` | FreestyleSettings | yes | Freestyle configuration |
| `aovs` | AOVs | yes | Arbitrary output variables |
| `lightgroups` | Lightgroups | yes | Light groups |

Active object: `view_layer.objects.active` (read/write).

### Render Pass Toggles

All boolean, all read/write:

`use_pass_combined`, `use_pass_z`, `use_pass_mist`, `use_pass_normal`, `use_pass_position`, `use_pass_diffuse_direct`, `use_pass_diffuse_indirect`, `use_pass_diffuse_color`, `use_pass_glossy_direct`, `use_pass_glossy_indirect`, `use_pass_glossy_color`, `use_pass_emit`, `use_pass_environment`, `use_pass_shadow`, `use_pass_ambient_occlusion`, `use_pass_transmission_direct`, `use_pass_transmission_indirect`, `use_pass_transmission_color`, `use_pass_volume_direct`, `use_pass_volume_indirect`

### Methods

| Method | Returns | Description |
|---|---|---|
| `update()` | None | Update depsgraph for pending changes |
| `update_render_passes()` | None | Requery enabled render passes from engine |

## Common Patterns

### Safe Object Access with Type Check

```python
import bpy

obj = bpy.context.active_object
if obj is not None and obj.type == 'MESH':
    mesh = obj.data
    print(f"Mesh '{mesh.name}' has {len(mesh.vertices)} vertices")
```

### Iterating All Scene Objects

```python
import bpy

scene = bpy.context.scene

# All objects in scene (recursive through collections)
for obj in scene.collection.all_objects:
    print(obj.name, obj.type)

# Only visible objects in active view layer
for obj in bpy.context.view_layer.objects:
    if obj.visible_get():
        print(obj.name)
```

### Setting Active Object and Selection

```python
import bpy

vl = bpy.context.view_layer
obj = bpy.data.objects.get("Cube")
if obj is not None:
    # Deselect all
    for o in vl.objects:
        o.select_set(False)
    # Select and activate
    obj.select_set(True)
    vl.objects.active = obj
```

### Creating a Collection Hierarchy

```python
import bpy

scene = bpy.context.scene
parent = bpy.data.collections.new("Environment")
child = bpy.data.collections.new("Trees")
scene.collection.children.link(parent)
parent.children.link(child)

# Add object to child collection
tree = bpy.data.objects.new("Tree", bpy.data.meshes.new("TreeMesh"))
child.objects.link(tree)
```

### Getting Evaluated Object Data

```python
import bpy

depsgraph = bpy.context.evaluated_depsgraph_get()
obj = bpy.context.active_object
obj_eval = obj.evaluated_get(depsgraph)
mesh_eval = obj_eval.data  # fully modified mesh
print(f"Evaluated mesh has {len(mesh_eval.vertices)} vertices")
```

## Gotchas

- **`object.data` can be None.** Empty objects have no data-block. Always check `obj.data is not None` or verify `obj.type` before accessing.
- **`object.data` is shared.** Multiple objects can reference the same Mesh/Curve/etc. Modifying `obj.data` affects all objects using it. Use `obj.data.copy()` to create an independent copy.
- **`scene.node_tree` is removed.** Use `scene.compositing_node_group` for compositor access. See [compositor-nodes](compositor-nodes.md).
- **`scene.use_nodes` is deprecated.** It always returns True and has no effect. Use `scene.render.use_compositing` to toggle compositing on/off.
- **`scene.grease_pencil` is renamed.** Use `scene.annotation` instead.
- **`scene.ray_cast()` ignores edit-mode geometry.** Objects in edit mode are excluded from the ray cast. Switch to object mode first or use `object.update_from_editmode()`.
- **ViewLayer active object.** Access via `view_layer.objects.active`, not `view_layer.active_object`.
- **Undo invalidates ID references.** Any `bpy.types.ID` Python reference becomes stale after undo. Re-query from `bpy.data` by name.
- **`all_objects` is read-only.** You cannot link/unlink through `collection.all_objects`. Use `collection.objects.link()` on the specific collection.
- **EEVEE engine ID changed.** Use `'BLENDER_EEVEE'` (was `'BLENDER_EEVEE_NEXT'`).
