# USD Pipeline

Universal Scene Description import/export and Python access. For other formats see [import-export](import-export.md). For file I/O see [file-io](file-io.md).

## USD Export

```python
import bpy

bpy.ops.wm.usd_export(
    filepath="/path/to/output.usdc",
    selected_objects_only=False,
    export_animation=False,
    export_hair=True,
    export_uvmaps=True,
    export_normals=True,
    export_materials=True,
    generate_preview_surface=True,
    root_prim_path="",             # e.g. '/World' to add root transform prim
    allow_unicode=True,            # allow non-ASCII prim names
)
```

### Export File Formats

| Extension | Description |
|---|---|
| `.usdc` | Binary crate format (default, fastest) |
| `.usda` | ASCII text format (human-readable) |
| `.usdz` | Zipped package (for Apple AR, etc.) |

## USD Import

```python
import bpy

bpy.ops.wm.usd_import(
    filepath="/path/to/scene.usdc",
    import_cameras=True,
    import_curves=True,
    import_lights=True,
    import_materials=True,
    import_meshes=True,
    import_volumes=True,
    read_mesh_attributes=True,
)
```

## OpenUSD Python Access

Access the bundled OpenUSD Python modules via `bpy.utils.expose_bundled_modules()`:

```python
import bpy

# Expose bundled libraries (pxr, MaterialX, etc.)
bpy.utils.expose_bundled_modules()

# Now import OpenUSD Python modules
from pxr import Usd, UsdGeom, Sdf

# Open a USD stage
stage = Usd.Stage.Open("/path/to/scene.usdc")
for prim in stage.Traverse():
    print(prim.GetPath(), prim.GetTypeName())
```

Available modules after `expose_bundled_modules()`:
- `pxr.Usd`, `pxr.UsdGeom`, `pxr.UsdShade`, `pxr.Sdf`, `pxr.Gf`, etc.
- `MaterialX` (MaterialX library)

## USD Hooks

Custom export/import hooks via `bpy.types.USDHook`:

```python
import bpy

class MyUSDHook(bpy.types.USDHook):
    bl_idname = "my_usd_hook"
    bl_label = "My USD Hook"

    def on_export(self, export_context):
        stage = export_context.get_stage()
        depsgraph = export_context.get_depsgraph()
        # Manipulate the USD stage before writing
        return True

    def on_material_export(self, export_context, bl_material, usd_material):
        stage = export_context.get_stage()
        # Customize material export
        return True

    def on_import(self, import_context):
        # Post-process after USD import
        return True

bpy.utils.register_class(MyUSDHook)
```

> **5.1:** `export_context.get_prim_map()` returns a `dict` mapping Blender objects to their generated USD prims, enabling precise post-export customization.

## Common Patterns

### Round-Trip Export/Import

```python
import bpy
import tempfile
import os

# Export
tmp = os.path.join(tempfile.gettempdir(), "test.usdc")
bpy.ops.wm.usd_export(filepath=tmp, export_materials=True)

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Re-import
bpy.ops.wm.usd_import(filepath=tmp, import_materials=True)
```

### Inspect USD Stage

```python
import bpy
bpy.utils.expose_bundled_modules()
from pxr import Usd, UsdGeom

stage = Usd.Stage.Open("/path/to/scene.usdc")
root = stage.GetPseudoRoot()

for prim in stage.Traverse():
    if prim.IsA(UsdGeom.Mesh):
        mesh = UsdGeom.Mesh(prim)
        points = mesh.GetPointsAttr().Get()
        print(f"{prim.GetPath()}: {len(points)} vertices")
```

## Gotchas

1. **`expose_bundled_modules()` must be called first.** The `pxr` module is not on `sys.path` by default. Call `bpy.utils.expose_bundled_modules()` before importing `pxr`.

2. **Bundled modules are private.** The bundled OpenUSD and MaterialX libraries are specific to Blender's build. They may not match system-installed versions and should not be relied on outside Blender.

3. **USDZ is export-only.** Blender exports `.usdz` packages but imports from `.usdc`/`.usda` files directly.

4. **Material round-tripping.** USD export converts Blender materials to UsdPreviewSurface. Complex node setups may lose fidelity. Use `generate_preview_surface=True` for broad compatibility.

5. **Hydra viewport.** Blender's USD integration uses Hydra for viewport rendering with some render delegates, but the Python API for Hydra configuration is limited.
