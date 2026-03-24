# Import & Export

Standard format import/export operators for glTF, FBX, OBJ, and STL. For USD see [usd-pipeline](usd-pipeline.md). For file I/O see [file-io](file-io.md). For axis conversion see [bpy-extras](bpy-extras.md).

## glTF

### Export

```python
import bpy

bpy.ops.export_scene.gltf(
    filepath="/path/to/output.glb",
    export_format='GLB',           # 'GLB', 'GLTF_SEPARATE', 'GLTF_EMBEDDED'
    use_selection=False,           # export selected only
    export_apply=False,            # apply modifiers
    export_animations=True,
    export_materials='EXPORT',     # 'EXPORT', 'PLACEHOLDER', 'NONE'
    export_cameras=False,
    export_lights=False,
    export_yup=True,               # convert Z-up to Y-up
)
```

### Import

```python
import bpy

bpy.ops.import_scene.gltf(
    filepath="/path/to/model.glb",
)
```

## FBX

### Export

```python
import bpy

bpy.ops.export_scene.fbx(
    filepath="/path/to/output.fbx",
    use_selection=False,
    apply_unit_scale=True,
    apply_scale_options='FBX_SCALE_NONE',  # FBX_SCALE_NONE, FBX_SCALE_UNITS, etc.
    bake_anim=True,
    bake_anim_use_all_bones=True,
    bake_anim_simplify_factor=1.0,
    path_mode='AUTO',              # AUTO, ABSOLUTE, RELATIVE, STRIP, COPY
    embed_textures=False,
    axis_forward='-Z',
    axis_up='Y',
    use_mesh_modifiers=True,
)
```

### Import

```python
import bpy

bpy.ops.import_scene.fbx(
    filepath="/path/to/model.fbx",
    use_manual_orientation=False,
    axis_forward='-Z',
    axis_up='Y',
)
```

## OBJ

### Export

```python
import bpy

bpy.ops.wm.obj_export(
    filepath="/path/to/output.obj",
    export_selected_objects=False,
    apply_modifiers=True,
    export_uv=True,
    export_normals=True,
    export_materials=True,
    forward_axis='NEGATIVE_Z',
    up_axis='Y',
    export_triangulated_mesh=False,
)
```

### Import

```python
import bpy

bpy.ops.wm.obj_import(
    filepath="/path/to/model.obj",
    forward_axis='NEGATIVE_Z',
    up_axis='Y',
)
```

## STL

### Export

```python
import bpy

bpy.ops.wm.stl_export(
    filepath="/path/to/output.stl",
    export_selected_objects=False,
    apply_modifiers=True,
    ascii_format=False,           # True for ASCII, False for binary
    forward_axis='Y',
    up_axis='Z',
)
```

### Import

```python
import bpy

bpy.ops.wm.stl_import(
    filepath="/path/to/model.stl",
    forward_axis='Y',
    up_axis='Z',
)
```

## Axis Conversion

Different formats use different coordinate systems. Use `axis_conversion` to build a correction matrix:

```python
from bpy_extras.io_utils import axis_conversion

# Blender default: Y-forward, Z-up
# glTF/OpenGL: -Z forward, Y up
matrix = axis_conversion(
    from_forward='Y', from_up='Z',
    to_forward='-Z', to_up='Y'
).to_4x4()
```

## Common Patterns

### Batch Export Selected Objects

```python
import bpy
import os

output_dir = bpy.path.abspath("//exports/")
os.makedirs(output_dir, exist_ok=True)

for obj in bpy.context.selected_objects:
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)

    filepath = os.path.join(output_dir, f"{obj.name}.glb")
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        use_selection=True,
        export_format='GLB',
    )

# Restore selection
for obj in bpy.context.selected_objects:
    obj.select_set(True)
```

### Export with Custom Settings

```python
import bpy

def export_for_game_engine(filepath):
    """Export with game-engine-friendly settings."""
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        export_apply=True,         # bake modifiers
        export_animations=True,
        export_yup=True,           # Y-up for most engines
        export_materials='EXPORT',
    )
```

## Gotchas

1. **OBJ/STL use `wm.*` operators.** OBJ and STL use `bpy.ops.wm.obj_export` / `bpy.ops.wm.stl_export`, not `bpy.ops.export_scene.*`. glTF and FBX use `bpy.ops.export_scene.*`.

2. **Axis parameters differ per format.** glTF uses `export_yup` (bool). FBX uses `axis_forward`/`axis_up` (string). OBJ/STL use `forward_axis`/`up_axis` (enum strings like `'NEGATIVE_Z'`). Check each format's parameters.

3. **`apply_modifiers` vs `export_apply`.** glTF uses `export_apply`. FBX uses `use_mesh_modifiers`. OBJ/STL use `apply_modifiers`. Names are not consistent across formats.

4. **File path must include extension.** The export operators don't auto-add extensions. Always include `.glb`, `.fbx`, `.obj`, or `.stl` in the filepath.

5. **Context requirements.** Export operators need a valid 3D viewport context. When running from background mode, use `context.temp_override` if needed. See [bpy-context](bpy-context.md).
