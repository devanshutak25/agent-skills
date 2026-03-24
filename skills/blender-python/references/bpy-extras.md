# bpy_extras

Utility modules for common operations: viewport math, import/export helpers, object creation, mesh utilities, image loading, and animation helpers. For math types see [mathutils](mathutils.md). For spatial queries see [mathutils-spatial](mathutils-spatial.md).

## view3d_utils — Viewport Math

Convert between 2D screen coordinates and 3D world coordinates.

```python
from bpy_extras.view3d_utils import (
    region_2d_to_vector_3d,
    region_2d_to_origin_3d,
    region_2d_to_location_3d,
    location_3d_to_region_2d,
)
```

### Screen to World

```python
from bpy_extras.view3d_utils import (
    region_2d_to_vector_3d,
    region_2d_to_origin_3d,
    region_2d_to_location_3d,
)

region = context.region
rv3d = context.region_data
coord = (event.mouse_region_x, event.mouse_region_y)

# Ray direction from screen point
direction = region_2d_to_vector_3d(region, rv3d, coord)

# Ray origin from screen point
origin = region_2d_to_origin_3d(region, rv3d, coord, clamp=None)

# 3D location at a specific depth
# depth_location defines the depth plane
location = region_2d_to_location_3d(region, rv3d, coord, depth_location)
```

### World to Screen

```python
from bpy_extras.view3d_utils import location_3d_to_region_2d
from mathutils import Vector

region = context.region
rv3d = context.region_data

# Project 3D point to 2D screen coordinates
screen_co = location_3d_to_region_2d(region, rv3d, Vector((1, 2, 3)), default=None)
# Returns Vector((x, y)) or default if behind camera
```

### Function Reference

| Function | Signature | Returns |
|---|---|---|
| `region_2d_to_vector_3d` | `(region, rv3d, coord)` | `Vector` (direction) |
| `region_2d_to_origin_3d` | `(region, rv3d, coord, clamp=None)` | `Vector` (origin) |
| `region_2d_to_location_3d` | `(region, rv3d, coord, depth_location)` | `Vector` (3D point) |
| `location_3d_to_region_2d` | `(region, rv3d, coord, default=None)` | `Vector` (2D) or default |

## io_utils — Import/Export Helpers

### ImportHelper / ExportHelper

Mixin classes for file browser operators:

```python
import bpy
from bpy_extras.io_utils import ImportHelper, ExportHelper

class MyImporter(bpy.types.Operator, ImportHelper):
    bl_idname = "import_scene.my_format"
    bl_label = "Import My Format"

    filename_ext = ".myf"
    filter_glob: bpy.props.StringProperty(
        default="*.myf",
        options={'HIDDEN'},
    )

    def execute(self, context):
        # self.filepath is set by ImportHelper
        print(f"Importing: {self.filepath}")
        return {'FINISHED'}


class MyExporter(bpy.types.Operator, ExportHelper):
    bl_idname = "export_scene.my_format"
    bl_label = "Export My Format"

    filename_ext = ".myf"
    filter_glob: bpy.props.StringProperty(
        default="*.myf",
        options={'HIDDEN'},
    )

    def execute(self, context):
        print(f"Exporting: {self.filepath}")
        return {'FINISHED'}
```

### axis_conversion

```python
from bpy_extras.io_utils import axis_conversion

# Get a conversion matrix between coordinate systems
# Default Blender: Y-forward, Z-up
# Common alternatives: -Z forward, Y up (glTF/OpenGL)
matrix = axis_conversion(
    from_forward='Y', from_up='Z',
    to_forward='-Z', to_up='Y'
)
# Returns a 3×3 Matrix

# Apply to objects during export
converted = matrix @ obj.matrix_world
```

Valid axis values: `'X'`, `'Y'`, `'Z'`, `'-X'`, `'-Y'`, `'-Z'`

### path_reference

```python
from bpy_extras.io_utils import path_reference

# Resolve path for export with different reference modes
resolved = path_reference(
    filepath,           # source path
    base_src,           # source base directory
    base_dst,           # destination base directory
    mode='AUTO',        # 'AUTO', 'ABSOLUTE', 'RELATIVE', 'MATCH', 'STRIP', 'COPY'
    copy_subdir="",     # subdirectory for copied files
    copy_set=None,      # set to track copied files
    library=None        # library reference
)
```

## object_utils — Object Creation

### AddObjectHelper

```python
import bpy
from bpy_extras.object_utils import AddObjectHelper, object_data_add

class AddMyObject(bpy.types.Operator, AddObjectHelper):
    bl_idname = "mesh.add_my_object"
    bl_label = "Add My Object"

    def execute(self, context):
        mesh = bpy.data.meshes.new("MyMesh")
        # ... build mesh data ...

        # Creates object, links to scene, applies operator transform
        object_data_add(context, mesh, operator=self, name="MyObject")
        return {'FINISHED'}
```

`AddObjectHelper` provides `align`, `location`, and `rotation` properties for the operator UI.

### object_data_add

```python
from bpy_extras.object_utils import object_data_add

# Create and link an object from data block
obj = object_data_add(
    context,
    obdata,         # Mesh, Curve, etc.
    operator=None,  # operator with AddObjectHelper properties
    name=None       # object name (uses data name if None)
)
```

### world_to_camera_view

```python
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

scene = bpy.context.scene
camera = scene.camera
point = Vector((1, 2, 3))

# Returns (x, y, z) in camera frame coordinates
# x, y: [0, 1] range (0,0 = bottom-left, 1,1 = top-right)
# z: distance from camera
co = world_to_camera_view(scene, camera, point)
x, y, depth = co

# Check if point is in camera view
in_frame = (0 <= x <= 1 and 0 <= y <= 1 and depth > 0)
```

## mesh_utils — Mesh Helpers

```python
from bpy_extras.mesh_utils import (
    edge_face_count,
    edge_loops_from_faces,
    ngon_tessellate,
)

# Count faces per edge
counts = edge_face_count(mesh)
# Returns list of ints, one per edge

# Find edge loops from face connectivity
loops = edge_loops_from_faces(mesh)
# Returns list of edge loops

# Tessellate an ngon into triangles
triangles = ngon_tessellate(from_data, indices, fix_quads=True)
# from_data: coordinates, indices: polygon vertex indices
# Returns list of triangle index tuples
```

## image_utils — Image Loading

```python
from bpy_extras.image_utils import load_image

# Load an image with smart path resolution
image = load_image(
    imagepath,              # filename or relative path
    dirname="",             # directory to search in
    place_holder=False,     # create placeholder if file missing
    recursive=False,        # search subdirectories
    check_existing=True     # return existing image if already loaded
)
# Returns bpy.types.Image or None
```

## anim_utils — Animation Helpers

```python
from bpy_extras.anim_utils import (
    action_ensure_channelbag_for_slot,
    bake_action,
    BakeOptions,
)

# Ensure a channelbag exists for a slot (5.0 slotted actions)
channelbag = action_ensure_channelbag_for_slot(action, slot)

# Bake action from constraints/drivers
options = BakeOptions(
    only_selected=False,
    do_pose=True,
    do_object=True,
    do_visual_keying=True,
    do_constraint_clear=False,
    do_parents_clear=False,
    do_clean=False,
    do_location=True,
    do_rotation=True,
    do_scale=True,
    do_bbone=True,
    do_custom_props=True,
)

baked_action = bake_action(
    obj,
    action=None,           # existing action or None to create new
    frames=range(1, 101),  # frames to bake
    bake_options=options,
)
```

## Common Patterns

### Raycast from Mouse Click

```python
import bpy
from bpy_extras.view3d_utils import region_2d_to_origin_3d, region_2d_to_vector_3d

class RaycastOperator(bpy.types.Operator):
    bl_idname = "view3d.raycast_click"
    bl_label = "Raycast Click"

    def invoke(self, context, event):
        region = context.region
        rv3d = context.region_data
        coord = (event.mouse_region_x, event.mouse_region_y)

        origin = region_2d_to_origin_3d(region, rv3d, coord)
        direction = region_2d_to_vector_3d(region, rv3d, coord)

        depsgraph = context.evaluated_depsgraph_get()
        result, location, normal, index, obj, matrix = context.scene.ray_cast(
            depsgraph, origin, direction
        )

        if result:
            print(f"Hit {obj.name} at face {index}")

        return {'FINISHED'}
```

### Check Object Visibility in Camera

```python
import bpy
from bpy_extras.object_utils import world_to_camera_view

scene = bpy.context.scene
camera = scene.camera

visible_objects = []
for obj in scene.objects:
    co = world_to_camera_view(scene, camera, obj.location)
    if 0 <= co.x <= 1 and 0 <= co.y <= 1 and co.z > 0:
        visible_objects.append(obj)
```

## Gotchas

1. **`region_2d_to_location_3d` needs a depth reference.** The `depth_location` parameter defines the depth plane. Without a meaningful reference point, the projected location may be unexpected. Use the 3D cursor or a known object position.

2. **`location_3d_to_region_2d` returns `None` for behind-camera points.** Always check the return value before using it. Pass `default=` to get a fallback value.

3. **`axis_conversion` returns 3×3.** The returned matrix is 3×3, not 4×4. Use `.to_4x4()` if you need to compose with 4×4 transforms.

4. **`ImportHelper`/`ExportHelper` require `filename_ext`.** The class attribute must be set for the file browser to work correctly. Also set `filter_glob` to restrict visible file types.

5. **`world_to_camera_view` coordinate system.** Returns (x, y, z) where x and y are in [0, 1] range for the camera frame, and z is the depth from camera. Points with z < 0 are behind the camera.

6. **`load_image` with `check_existing=True`.** Returns an already-loaded image with the same filepath if one exists, avoiding duplicates. Set to `False` to force a fresh load.
