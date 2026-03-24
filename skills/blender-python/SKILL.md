---
name: blender-python
description: >
  Comprehensive Blender Python API reference for Blender 5.0 and 5.1, covering bpy,
  bmesh, mathutils, gpu, freestyle, and all standalone modules. Use this skill whenever
  the user mentions Blender scripting, bpy, Blender Python, Blender addons/extensions,
  Blender operators, or references any Blender Python API types (bpy.types.Object,
  bpy.data.meshes, bpy.ops.mesh, etc.). Also trigger when the user asks about 3D
  scripting tasks and their project context indicates Blender — even if they don't
  say "Blender" explicitly. Covers addon development, extension packaging, GPU drawing,
  modal operators, geometry node scripting, compositor scripting, and porting code from
  Blender 4.x. Even if the user just says "write me a Blender script" or "I need a
  Blender addon", use this skill.
---

# Blender Python API Reference

Targets **Blender 5.0** and **Blender 5.1**. Python 3.11 (5.0) and 3.13 (5.1).

## General Principles

**Module structure.** The top-level `bpy` module exposes sub-modules: `bpy.context` (read-only
state), `bpy.data` (all data-blocks), `bpy.ops` (operators), `bpy.types` (RNA type definitions),
`bpy.props` (property declarations), `bpy.app` (version/paths/handlers/timers), `bpy.utils`
(registration helpers), `bpy.msgbus` (message bus subscriptions), `bpy.path` (Blender path
utilities). Standalone modules include `bmesh`, `mathutils`, `gpu`, `gpu_extras`, `freestyle`,
`aud`, `imbuf`, `bl_math`, `bpy_extras`, `idprop`, and `blf`.

**Data-block model.** All persistent data lives as data-blocks in `bpy.data` collections
(`objects`, `meshes`, `materials`, etc.). Data-blocks inherit from `bpy.types.ID`. Maximum name
length is 255 bytes. Loading a new blend file replaces all data-blocks — never hold long-lived
Python references across file loads. Data-blocks are reference-counted; use `orphans_purge()` to
remove unused ones.

**RNA and IDProperty distinction.** RNA is Blender's runtime type system — it auto-generates
the Python API (`bpy.types`). Properties declared via `bpy.props` are RNA properties with type
safety and UI integration. IDProperties are arbitrary key/value storage accessed dict-style
(`obj["key"]`). In 5.0, RNA property storage is fully separated from IDProperty storage —
`bpy.props` definitions no longer write to IDProperty dicts. Code that relied on reading
`bpy.props` values via dict access must be updated. See [bpy-props](references/bpy-props.md)
and [idprop](references/idprop.md).

**Operator context requirements.** Operators (`bpy.ops`) act on `bpy.context`. Calling an
operator in the wrong context raises `RuntimeError`. Always check
`bpy.ops.<cat>.<op>.poll()` first or handle the exception. Use `context.temp_override()` to
provide the correct context programmatically. Execution context can be specified as the first
argument: `'EXEC_DEFAULT'` (skip invoke, just execute) or `'INVOKE_DEFAULT'` (call invoke first).
Prefer direct data API over operators when possible.

**Registered class lifecycle.** Custom types (Operator, Panel, Menu, PropertyGroup) must
inherit from the correct `bpy.types` base and be registered via `bpy.utils.register_class()`.
Registration must happen inside `register()` functions, not at module level. Unregistration must
reverse the exact order. Failing to unregister causes "already registered as a subclass" errors
on re-enable. If a class defines a `register` classmethod, it is called automatically during
registration.

**Undo system caveats.** Undo invalidates all `bpy.types.ID` references — Python objects
pointing to Blender data become stale. Never cache data-block references long-term. Re-query
from `bpy.data` by name or use session UIDs. Re-allocation (adding items to collections) can
also invalidate existing references. Modal operators that store references to Blender data must
re-acquire them after any operation that triggers undo.

**IDProperty storage separation (5.0).** Properties defined via `bpy.props` are no longer
accessible through dict-like syntax on data-blocks. Custom properties and RNA properties occupy
separate storage. Use `get_transform`/`set_transform` callbacks instead of `get`/`set` when you
only need value mapping — they are several times faster. Blend files from 4.5 and earlier get
custom data IDProperties duplicated into system ones during versioning.

**Evaluated vs original data.** Original data (`bpy.data.objects[...]`) is user-editable with
no modifiers applied. Evaluated data (via `depsgraph.id_eval_get()` or
`obj.evaluated_get(depsgraph)`) has all modifiers, constraints, and drivers applied. For mesh
objects, `obj_eval.data` gives the fully modified mesh. Edits must target original data — changes
to evaluated copies are discarded. Use `depsgraph.update()` to force re-evaluation after changes.

**Script execution environments.** Scripts run in the Text Editor (Run Script), the Python
Console (interactive REPL), startup scripts (`scripts/startup/`), registered addons/extensions,
or background mode (`blender --background`). Background mode does not build ViewLayer dependency
graphs by default and has no UI areas — `context.area` is None. The console provides
autocompletion; the text editor supports templates. CLI flags `--python`, `--python-expr`, and
`--python-console` allow running scripts from the command line.

**Compositor migration (5.0).** The compositor uses standalone node groups:
`scene.compositing_node_group` replaces the removed `scene.node_tree`. Compositor node types are
renamed from `CompositorNode*` to `ShaderNode*` equivalents. The Composite output node is
replaced by GroupOutput. See [compositor-nodes](references/compositor-nodes.md).

**Slotted actions (5.0).** The animation system uses slotted Actions. An Action contains Slots
(animation targets), Layers, and Strips with Channelbags that hold FCurves. The legacy
`action.fcurves` and `action.groups` properties are removed. `keyframe_insert()` still works
unchanged. See [animation-actions](references/animation-actions.md).

**BGL removed (5.0).** The `bgl` module (OpenGL wrappers) is fully removed. All GPU drawing
must use the `gpu` module. `Image.bindcode` is removed — use `gpu.texture.from_image()`.
EEVEE's engine identifier is `'BLENDER_EEVEE'` (was `'BLENDER_EEVEE_NEXT'`).

## Routing Table

### Core API

| Query is about... | Read |
|---|---|
| `bpy.context`, active object, selected objects, mode, `temp_override`, evaluated depsgraph access | [bpy-context](references/bpy-context.md) |
| `bpy.data`, data-block collections, creating/removing data-blocks, `batch_remove`, `orphans_purge`, library linking/appending | [bpy-data](references/bpy-data.md) |
| `bpy.types` hierarchy, Object/Scene/Collection/ViewLayer types, ID base class, `compositing_node_group` | [bpy-types-core](references/bpy-types-core.md) |
| `bpy.props`, property types, PropertyGroup, property options, `READ_ONLY`, `get_transform`/`set_transform`, update callbacks | [bpy-props](references/bpy-props.md) |
| IDProperties, dict-like access on data-blocks, `id_properties_ui`, custom properties, type mapping, 5.0 storage separation | [idprop](references/idprop.md) |
| `bpy.ops`, calling operators, return values, `execution_context`, poll, operator search | [bpy-ops](references/bpy-ops.md) |
| `bpy.app`, version info, paths, `cachedir`, `is_job_running`, handlers list, build info | [bpy-app](references/bpy-app.md) |
| `bpy.utils`, class registration, previews, script paths, `expose_bundled_modules`, VFX library access | [bpy-utils](references/bpy-utils.md) |
| `bpy.msgbus`, `subscribe_rna`, `publish_rna`, message bus subscriptions, `path_resolve` for keys | [bpy-msgbus](references/bpy-msgbus.md) |

### Operators & UI

| Query is about... | Read |
|---|---|
| Writing custom operators, `bl_idname`, `bl_options`, execute/invoke/check, operator properties, menu/keymap registration | [operators-custom](references/operators-custom.md) |
| Modal operators, `modal()` method, event types/values, mouse coords, timers, draw callbacks, `header_text_set` | [operators-modal](references/operators-modal.md) |
| Panels, `bl_space_type`/`bl_region_type`/`bl_category`, sub-panels, `draw`/`poll`, UILayout basics (row, column, box, split, prop, operator) | [panels-ui](references/panels-ui.md) |
| Advanced UI: `prop_search`, `template_ID`, `template_list`, UIList subclass, `filter_items`, icon previews, dynamic enums, popover, `menu_pie` | [ui-layout-advanced](references/ui-layout-advanced.md) |
| Gizmos, GizmoGroup, built-in gizmo types (arrow, dial, move, cage, primitive), `target_set_prop`/`handler`, `matrix_basis` | [gizmos](references/gizmos.md) |

### Addon / Extension Development

| Query is about... | Read |
|---|---|
| Addon structure, `bl_info`, register/unregister, multi-file addons, `importlib.reload`, class registration order | [addon-structure](references/addon-structure.md) |
| Extensions system, `blender_manifest.toml` schema, local/remote repos, CLI build/install, permissions, publishing | [extensions-system](references/extensions-system.md) |
| Addon preferences, `AddonPreferences`, `bl_idname = __package__`, accessing prefs, `bl_system_properties_get`, keymap registration | [addon-preferences](references/addon-preferences.md) |
| Porting from 4.x to 5.0/5.1, breaking changes, before/after code, migration patterns | [porting-from-4x](references/porting-from-4x.md) |

### Mesh & Geometry

| Query is about... | Read |
|---|---|
| Mesh data: vertices, edges, polygons, loops, `corner_verts`/`corner_edges`, attribute API, `foreach_get`/`set`, UVs, vertex groups, shape keys | [mesh-data](references/mesh-data.md) |
| Mesh advanced: `calc_smooth_groups`, `validate`, `calc_normals_split`, `from_pydata`, `calc_loop_triangles`, `domain_size` | [mesh-advanced](references/mesh-advanced.md) |
| BMesh: `bmesh.new`, `from_edit_mesh`/`from_mesh`/`to_mesh`/`free`, verts/edges/faces/loops, layers, `ensure_lookup_table`, `bmesh.ops` | [bmesh](references/bmesh.md) |
| Curves data: Curves type, curve types (POLY/BEZIER/NURBS/CATMULL_ROM), `resize_curves`/`remove_curves`/`set_types`, point attributes | [curves-data](references/curves-data.md) |
| Geometry Nodes API: modifier socket access, output attributes, GeometrySet, baking, viewer node, node tool `idname` | [geometry-nodes-api](references/geometry-nodes-api.md) |

### Materials & Nodes

| Query is about... | Read |
|---|---|
| Shader nodes: `use_nodes`, `node_tree`, `nodes.new()`, type strings, input/output access, `default_value`, `links.new`, group nodes | [shader-nodes](references/shader-nodes.md) |
| Compositor nodes: `compositing_node_group`, CompositorNode→ShaderNode rename table, GroupOutput replaces Composite, `file_output_items` | [compositor-nodes](references/compositor-nodes.md) |
| Materials API: creating materials, `use_nodes`, Principled BSDF inputs, image textures, material slots, World material | [materials-api](references/materials-api.md) |
| Node tree interface: `new_socket`, `new_panel`, `socket_type` enum, `items_tree`, Group Input/Output nodes | [node-tree-interface](references/node-tree-interface.md) |
| Node closures and bundles: Combine/Separate Bundle, repeat zones, `inline_shader_nodes` API for render engines | [node-closures-bundles](references/node-closures-bundles.md) |

### Animation

| Query is about... | Read |
|---|---|
| Actions (slotted system): `action.slots`, ActionSlot, layers, strips, channelbags, `fcurves.new`/`ensure`, `fcurve_ensure_for_datablock` | [animation-actions](references/animation-actions.md) |
| Keyframes, FCurves, drivers: `keyframe_insert`/`delete`, keyframe_points, handle types, FCurve modifiers, driver expressions, variables | [keyframes-drivers](references/keyframes-drivers.md) |
| NLA: `nla_tracks`, strips, blend types, extrapolation, influence, `push_down`, baking | [nla](references/nla.md) |
| Handlers and timers: `frame_change_pre`/`post`, `depsgraph_update`, `load_pre`/`post`, `@persistent`, `bpy.app.timers` | [handlers-timers](references/handlers-timers.md) |

### Rendering & GPU

| Query is about... | Read |
|---|---|
| Render API: `RenderEngine` subclass, render/view_update/view_draw, RenderResult/Layer/Pass, engine ID renames, pass name renames | [render-api](references/render-api.md) |
| GPU module: `gpu.shader.from_builtin`, `create_from_info`, GPUShader/GPUTexture/GPUBatch/GPUVertBuf, `gpu.state`, `gpu.matrix`, POLYLINE/POINT variants | [gpu-module](references/gpu-module.md) |
| GPU extras: `batch_for_shader`, `draw_texture_2d`, `draw_circle_2d`, batch creation workflow | [gpu-extras](references/gpu-extras.md) |
| GPU offscreen: GPUOffScreen creation, bind/unbind, `draw_view3d`, depth format deprecations, render-to-texture | [gpu-offscreen](references/gpu-offscreen.md) |
| GPU drawing: `draw_handler_add`, handler removal, 3D/2D drawing workflows, color space handling | [gpu-drawing](references/gpu-drawing.md) |
| Text drawing: `blf` module, font loading, size/position/draw/color, shadow, rotation, clipping, word wrap, `bind_imbuf` | [blf](references/blf.md) |

### Math & Utilities

| Query is about... | Read |
|---|---|
| `mathutils`: Vector, Matrix, Quaternion, Euler, Color, arithmetic, `freeze()`, buffer protocol (float32) | [mathutils](references/mathutils.md) |
| `mathutils.geometry`: `intersect_*`, `barycentric_transform`, `tessellate_polygon`, `convex_hull_2d`, `distance_point_to_plane` | [mathutils-geometry](references/mathutils-geometry.md) |
| KDTree, BVHTree, noise: spatial queries, `find`/`find_n`/`find_range`, `ray_cast`, `find_nearest`, `overlap`, noise functions | [mathutils-spatial](references/mathutils-spatial.md) |
| `bl_math`: `clamp`, `lerp`, `smoothstep`, `pingpong`, `round_to_even` | [bl-math](references/bl-math.md) |
| `bpy.path`: `abspath` (// resolution), `relpath`, `clean_name`, `ensure_ext`, `native_pathsep` | [bpy-path](references/bpy-path.md) |
| `bpy_extras`: `view3d_utils`, `io_utils` (ImportHelper/ExportHelper), `mesh_utils`, `object_utils`, `anim_utils` | [bpy-extras](references/bpy-extras.md) |

### Scene & Objects

| Query is about... | Read |
|---|---|
| Object transforms: `matrix_world`/`local`/`basis`/`parent_inverse`, decompose, delta transforms, constraints, parenting, `to_mesh` | [objects-transforms](references/objects-transforms.md) |
| Collections, scene management: Collection hierarchy, `objects.link`/`unlink`, `all_objects`, `layer_collection`, `scene.ray_cast`, cursor | [collections-scene](references/collections-scene.md) |
| Dependency graph: `evaluated_depsgraph_get`, `id_eval_get`, `object_instances`, `DepsgraphObjectInstance`, updates, original vs evaluated | [depsgraph](references/depsgraph.md) |
| Armatures: bones, edit_bones, PoseBone, BoneCollection API, select properties, Geometry Attribute constraint, mode switching | [armatures](references/armatures.md) |

### I/O & Pipeline

| Query is about... | Read |
|---|---|
| Import/export operators: glTF, FBX, OBJ, STL, Alembic — key parameters, batch export, format selection | [import-export](references/import-export.md) |
| USD pipeline: USD import/export, Python export hooks, `pxr` module access, stage traversal | [usd-pipeline](references/usd-pipeline.md) |
| File I/O: `bpy.ops.wm.open_mainfile`/`save_mainfile`, library overrides, asset system, `bpy.data.libraries`, forward compatibility | [file-io](references/file-io.md) |

### Image & Audio

| Query is about... | Read |
|---|---|
| `imbuf` module: ImBuf creation, pixel access, load/save, format conversion, `gpu.texture.from_image()` | [imbuf](references/imbuf.md) |
| `aud` module: Device, Sound, Handle, playback, filters, sequencing | [aud](references/aud.md) |

### Grease Pencil & Annotations

| Query is about... | Read |
|---|---|
| Grease Pencil v3: layers, frames, drawings, `add_strokes`, attribute-based point access, stroke materials | [grease-pencil](references/grease-pencil.md) |
| Annotations: annotation layers/frames/strokes, rename table from legacy GP types | [annotations](references/annotations.md) |

### Freestyle

| Query is about... | Read |
|---|---|
| Freestyle types: type hierarchy, Nature constants, iterators, Interface0D/1D, ViewEdge, StrokeVertex | [freestyle-types](references/freestyle-types.md) |
| Freestyle scripting: pipeline (Selection→Chaining→Splitting→Sorting→Creation), predicates, shaders, style modules | [freestyle-scripting](references/freestyle-scripting.md) |

### Video Sequence Editor

| Query is about... | Read |
|---|---|
| VSE strips: strip types, `sequences.new_*` methods, strip properties, channels, transform, proxy | [sequencer-strips](references/sequencer-strips.md) |
| VSE effects and retiming: effect strips, speed control, retiming keys, time property renames | [sequencer-effects-retiming](references/sequencer-effects-retiming.md) |

### Scripting Environment

| Query is about... | Read |
|---|---|
| Text editor scripting: Text data-block API, console operators, script templates, CLI flags, `--python`, `--python-expr` | [text-editor-scripting](references/text-editor-scripting.md) |

## Multi-File Loading Rules

Load the minimum files needed to answer the query accurately:

- **1 file** — Simple, single-topic queries (e.g., "how do I add a keyframe" →
  `keyframes-drivers.md`)
- **2–3 files** — Cross-topic queries (e.g., "build an addon with a modal operator" →
  `addon-structure.md` + `operators-modal.md`)
- **Maximum 5 files** — Complex queries spanning multiple systems (e.g., "GPU-accelerated
  viewport overlay addon with custom gizmos" → `addon-structure.md` + `operators-modal.md` +
  `gpu-module.md` + `gpu-drawing.md` + `gizmos.md`)

Common multi-file combinations:
- Addon with UI panel: `addon-structure.md` + `panels-ui.md`
- Addon with custom properties: `addon-structure.md` + `bpy-props.md`
- Mesh processing script: `mesh-data.md` + `bmesh.md`
- Material setup script: `materials-api.md` + `shader-nodes.md`
- Animation script: `animation-actions.md` + `keyframes-drivers.md`
- Geometry Nodes modifier setup: `geometry-nodes-api.md` + `bpy-props.md`
- Render engine addon: `render-api.md` + `gpu-module.md` + `gpu-drawing.md`

When a reference file cross-references another file with `See [topic](file.md)`, load that file
only if the user's query directly involves that topic. Do not preemptively load all
cross-referenced files.

For porting questions, always load `porting-from-4x.md` plus the specific topic file(s) involved.

If uncertain which file covers a topic, consult this routing table first — every Blender Python
API topic maps to exactly one primary file.

## Code Conventions

**Imports.** Always import `bpy` explicitly. For standalone modules, import directly:

```python
import bpy
import bmesh
from mathutils import Vector, Matrix, Quaternion, Euler
import gpu
from gpu_extras.batch import batch_for_shader
import blf
```

Do not use `from bpy import *`. Do not import private bundled modules directly — access VFX
platform libraries through `bpy.utils.expose_bundled_modules()`.

**Naming.** Follow Blender conventions: `UPPER_CASE` for operator `bl_idname` category,
`snake_case` for operator name suffix, `CamelCase` for class names. Operator idnames use dot
notation: `"object.my_operator"`. Class names include a standardized prefix:

- `CATEGORY_OT_name` for operators (e.g., `OBJECT_OT_my_operator`)
- `CATEGORY_PT_name` for panels (e.g., `VIEW3D_PT_my_panel`)
- `CATEGORY_MT_name` for menus (e.g., `VIEW3D_MT_my_menu`)
- `CATEGORY_UL_name` for UI lists (e.g., `OBJECT_UL_my_list`)
- `CATEGORY_HT_name` for headers

**Error handling.** Check `poll()` before calling operators, or wrap in try/except for
`RuntimeError`. Never silently swallow exceptions from Blender API calls. Use
`self.report({'ERROR'}, msg)` inside operators to surface errors to users. Check return values
from operators — they return a set: `{'FINISHED'}`, `{'CANCELLED'}`, or `{'RUNNING_MODAL'}`.

**Type annotations.** Use type annotations for operator properties via `bpy.props`, not Python
type hints. PropertyGroup fields must use `bpy.props` descriptors — plain Python attributes are
ignored by RNA. Correct pattern:

```python
class MySettings(bpy.types.PropertyGroup):
    scale: bpy.props.FloatProperty(name="Scale", default=1.0)  # correct
    # scale = 1.0  # WRONG — ignored by RNA
```

**Context managers.** Use `context.temp_override()` for operator context:

```python
with context.temp_override(active_object=obj, selected_objects=[obj]):
    bpy.ops.object.duplicate()
```

Use `bmesh.new()` with explicit `free()` calls (BMesh is not a context manager). Use
`offscreen.bind()` / `offscreen.unbind()` for GPU offscreen rendering.

**Performance: foreach_get/set.** For bulk data access (mesh vertices, pixels, attributes),
always prefer `foreach_get`/`foreach_set` over Python loops. These methods operate on flat
arrays and are orders of magnitude faster:

```python
import numpy as np
coords = np.empty(len(mesh.vertices) * 3, dtype=np.float32)
mesh.vertices.foreach_get("co", coords)
coords = coords.reshape(-1, 3)
```

Use matching numpy dtypes for best performance (`np.float32` for coordinates, `np.int32` for
indices, `np.bool_` for selections). The sequence must be uni-dimensional — multi-component
attributes like 3D vectors are flattened to `[x0, y0, z0, x1, y1, z1, ...]`.

**Avoid stale references.** Never store `bpy.types.ID` references (Object, Mesh, etc.) across
undo, file load, or operations that may re-allocate data. Re-query from `bpy.data` by name:

```python
# WRONG — obj may become stale after undo
obj = bpy.data.objects["Cube"]
# ... undo happens ...
obj.location  # crash or undefined behavior

# CORRECT — re-query when needed
name = "Cube"
obj = bpy.data.objects.get(name)
if obj is not None:
    obj.location = (1, 2, 3)
```

**Operator vs data API.** Prefer the data API (`bpy.data`, direct attribute access) over
operators when you need predictable, context-independent behavior. Operators are designed for
interactive use and require specific context. For example, prefer `mesh.vertices.add(n)` over
`bpy.ops.mesh.primitive_cube_add()` when building geometry programmatically.

**Registration order.** Register PropertyGroups before classes that reference them. Unregister
in reverse order. A typical pattern:

```python
classes = (MyPropertyGroup, MY_OT_operator, MY_PT_panel)

def register():
    for cls in classes:
        bpy.utils.register_class(cls)
    bpy.types.Scene.my_settings = bpy.props.PointerProperty(type=MyPropertyGroup)

def unregister():
    del bpy.types.Scene.my_settings
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)
```

**Depsgraph updates.** After modifying data programmatically, call `depsgraph.update()` or
`view_layer.update()` if you need the evaluation to reflect your changes immediately. Without
this, the viewport may not refresh until the next redraw cycle.

**Mode awareness.** Many operations require a specific mode. Check `context.mode` before
operating. Mesh editing requires `EDIT_MESH` mode for bmesh from_edit_mesh, while `OBJECT` mode
is needed for most `bpy.ops.object.*` operators. Use `bpy.ops.object.mode_set(mode='EDIT')` to
switch modes when necessary.

## 5.1 Convention

Items specific to Blender 5.1 appear as blockquote callouts at the relevant location in each reference file:

> **5.1:** Example callout — `bpy.app.cachedir` returns the platform cache directory.

The 5.1 label indicates the feature requires Blender 5.1 or later. These are not tagged as beta or experimental — 5.1 is treated as a stable target alongside 5.0.
