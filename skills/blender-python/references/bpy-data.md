# Data Access (bpy.data)

Central access point for all data-blocks in the current blend file. `bpy.data` is an instance of `bpy.types.BlendData` and exposes typed collections for every data-block category.

## Data-Block Collections

All collections on `bpy.data`:

| Collection | Data-Block Type | Description |
|---|---|---|
| `objects` | Object | Scene objects |
| `meshes` | Mesh | Mesh geometry data |
| `curves` | Curve | Legacy curve data (NURBS/Bezier/Font) |
| `hair_curves` | Curves | Hair curve data-blocks |
| `materials` | Material | Materials |
| `textures` | Texture | Textures |
| `images` | Image | Image data-blocks |
| `node_trees` | NodeTree | Node groups (also accessible as `node_groups`) |
| `cameras` | Camera | Camera data |
| `lights` | Light | Light data |
| `armatures` | Armature | Armature data |
| `actions` | Action | Animation actions |
| `collections` | Collection | Scene collections |
| `scenes` | Scene | Scenes |
| `worlds` | World | World environments |
| `libraries` | Library | Linked library references |
| `fonts` | VectorFont | Font data-blocks |
| `sounds` | Sound | Sound data-blocks |
| `texts` | Text | Text data-blocks (scripts) |
| `screens` | Screen | Screen layouts |
| `workspaces` | WorkSpace | UI workspaces |
| `lattices` | Lattice | Lattice data |
| `metaballs` | MetaBall | MetaBall data |
| `speakers` | Speaker | Speaker data |
| `grease_pencils_v3` | GreasePencilv3 | Grease Pencil v3 data |
| `annotations` | AnnotationData | Annotation data |
| `brushes` | Brush | Brush data-blocks |
| `particles` | ParticleSettings | Particle settings |
| `palettes` | Palette | Color palettes |
| `paint_curves` | PaintCurve | Paint curves |
| `cache_files` | CacheFile | Alembic/USD cache files |
| `movieclips` | MovieClip | Movie clips |
| `masks` | Mask | Compositing masks |
| `linestyles` | FreestyleLineStyle | Freestyle line styles |
| `volumes` | Volume | OpenVDB volume data |
| `pointclouds` | PointCloud | Point cloud data |
| `probes` | LightProbe | Light probe data |
| `window_managers` | WindowManager | Window manager instances |

### Accessing Data-Blocks

```python
import bpy

# By name (KeyError if not found)
cube = bpy.data.objects["Cube"]

# Safe access with .get() (returns None if missing)
cube = bpy.data.objects.get("Cube")

# By index (fragile — order can change)
first = bpy.data.objects[0]

# Iteration
for obj in bpy.data.objects:
    print(obj.name)

# Length
count = len(bpy.data.objects)

# Check existence
if "Cube" in bpy.data.objects:
    pass
```

### Non-Collection Properties

`bpy.data` also exposes:
- `filepath` (str, read-only) — Path to the current .blend file
- `is_saved` (bool, read-only) — Whether the file has been saved
- `is_dirty` (bool, read-only) — Whether UI edits have been made since last save (script changes do not set this flag)
- `use_autopack` (bool) — Auto-pack external data into .blend
- `version` (int[3], read-only) — Blender version the .blend was saved with

## Creating Data-Blocks

### Name-Only Pattern

```python
import bpy

mesh = bpy.data.meshes.new("MyMesh")
mat = bpy.data.materials.new("MyMaterial")
coll = bpy.data.collections.new("MyCollection")
cam = bpy.data.cameras.new("MyCamera")
arm = bpy.data.armatures.new("MyArmature")
world = bpy.data.worlds.new("MyWorld")
action = bpy.data.actions.new("MyAction")
text = bpy.data.texts.new("MyScript")
lattice = bpy.data.lattices.new("MyLattice")
mball = bpy.data.metaballs.new("MyMetaBall")
speaker = bpy.data.speakers.new("MySpeaker")
palette = bpy.data.palettes.new("MyPalette")
scene = bpy.data.scenes.new("MyScene")
```

### Name + Type Pattern

```python
import bpy

# Objects: data can be Mesh, Curve, Camera, Light, Armature, Lattice, etc., or None for empty
obj = bpy.data.objects.new("MyObject", mesh)
empty = bpy.data.objects.new("MyEmpty", None)

# Lights: type is 'POINT', 'SUN', 'SPOT', or 'AREA'
light = bpy.data.lights.new("MyLight", type='POINT')

# Legacy curves: type is 'CURVE', 'SURFACE', or 'FONT'
curve = bpy.data.curves.new("MyCurve", type='CURVE')

# Node trees: type is 'ShaderNodeTree', 'CompositorNodeTree', 'GeometryNodeTree', 'TextureNodeTree'
tree = bpy.data.node_trees.new("MyGroup", type='ShaderNodeTree')

# Textures: type is 'NONE', 'BLEND', 'CLOUDS', 'IMAGE', 'NOISE', 'VORONOI', etc.
tex = bpy.data.textures.new("MyTexture", type='IMAGE')
```

### Special Creation

```python
import bpy

# Images: name, width, height, plus keyword options
img = bpy.data.images.new("MyImage", width=1024, height=1024, alpha=True, float_buffer=False)

# Load from file (images, fonts, sounds)
img = bpy.data.images.load("/path/to/image.png", check_existing=True)
font = bpy.data.fonts.load("/path/to/font.ttf", check_existing=True)
sound = bpy.data.sounds.load("/path/to/sound.wav", check_existing=True)

# Mesh from evaluated object (with modifiers applied)
depsgraph = bpy.context.evaluated_depsgraph_get()
obj_eval = bpy.data.objects["Cube"].evaluated_get(depsgraph)
mesh = bpy.data.meshes.new_from_object(obj_eval, preserve_all_data_layers=True, depsgraph=depsgraph)
```

## Removing Data-Blocks

### Single Removal

```python
collection.remove(datablock, *, do_unlink=True, do_id_user=True, do_ui_user=True)
```

- `datablock` — The data-block to remove
- `do_unlink` (bool, default True) — Unlink all usages before deleting
- `do_id_user` (bool, default True) — Decrement user counts of referenced data
- `do_ui_user` (bool, default True) — Ensure UI does not reference this data-block

Exception: `bpy.data.scenes.remove(scene, do_unlink=True)` only accepts `do_unlink`.

```python
import bpy

mesh = bpy.data.meshes.get("MyMesh")
if mesh is not None:
    bpy.data.meshes.remove(mesh)
```

### Batch Removal

```python
bpy.data.batch_remove(ids)
```

- `ids` — Iterable of ID data-blocks to remove (types can be mixed)
- Faster than individual `remove()` calls for large deletions
- Experimental API

```python
import bpy

# Remove all mesh objects and their mesh data
to_remove = []
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        to_remove.append(obj)
        to_remove.append(obj.data)
bpy.data.batch_remove(to_remove)
```

### Orphan Purge

```python
bpy.data.orphans_purge(do_local_ids=True, do_linked_ids=True, do_recursive=False) -> int
```

- `do_local_ids` (bool, default True) — Include unused local data-blocks
- `do_linked_ids` (bool, default True) — Include unused linked data-blocks
- `do_recursive` (bool, default False) — Repeat until no orphans remain
- Returns the number of deleted data-blocks

```python
import bpy

# Remove all unused data-blocks recursively
removed = bpy.data.orphans_purge(do_local_ids=True, do_linked_ids=True, do_recursive=True)
print(f"Purged {removed} orphan data-blocks")
```

A data-block is orphaned when `datablock.users == 0` and it has no fake user (`datablock.use_fake_user == False`).

## Library Linking & Appending

### Programmatic Approach

```python
bpy.data.libraries.load(filepath, *, link=False, relative=False, set_fake=False,
                         recursive=False, reuse_local_id=False, assets_only=False,
                         clear_asset_data=False, create_liboverrides=False,
                         reuse_liboverrides=False,
                         create_liboverrides_runtime=False) -> context_manager
```

Used as a context manager yielding `(data_from, data_to)`. `data_from` contains string lists of available data-block names per type. Assign names to `data_to` attributes to import them.

**Key parameters:**
- `link` (bool) — True: link (stays connected to source); False: append (copy, no link)
- `relative` (bool) — Store path relative to the current blend file
- `set_fake` (bool) — Set fake user on appended data-blocks
- `recursive` (bool) — Make indirect dependencies local too (append mode)
- `assets_only` (bool) — Only list data-blocks marked as assets
- `create_liboverrides` (bool) — Create library overrides for linked data

```python
import bpy

filepath = "/path/to/library.blend"

# Append specific objects
with bpy.data.libraries.load(filepath) as (data_from, data_to):
    data_to.objects = ["Cube", "Suzanne"]

# Link them into the active collection
for obj in data_to.objects:
    if obj is not None:
        bpy.context.collection.objects.link(obj)
```

```python
import bpy

filepath = "/path/to/library.blend"

# Link all materials
with bpy.data.libraries.load(filepath, link=True) as (data_from, data_to):
    data_to.materials = data_from.materials
```

After the `with` block, string entries in `data_to` are replaced with actual data-blocks (or None if the name was not found).

### Operator Approach

```python
import bpy

# Append an object via operator
bpy.ops.wm.append(
    filepath="/path/to/library.blend/Object/Cube",
    directory="/path/to/library.blend/Object/",
    filename="Cube"
)

# Link an object via operator
bpy.ops.wm.link(
    filepath="/path/to/library.blend/Object/Cube",
    directory="/path/to/library.blend/Object/",
    filename="Cube"
)
```

### Temporary Data for Inspection

```python
import bpy

# Load data temporarily without polluting the current file
with bpy.data.temp_data() as temp:
    with temp.libraries.load(filepath) as (data_from, data_to):
        data_to.objects = data_from.objects
    for obj in data_to.objects:
        if obj is not None:
            print(f"Found: {obj.name}")
    # temp data is freed when leaving this block
```

## Data Tagging

Every `bpy.types.ID` has a `tag` boolean property — a runtime-only flag not saved to disk. Useful for marking data-blocks during batch operations.

```python
import bpy

# Clear all object tags
bpy.data.objects.tag(False)

# Tag objects matching a condition
for obj in bpy.data.objects:
    if obj.type == 'MESH' and len(obj.data.vertices) > 10000:
        obj.tag = True

# Process tagged objects
for obj in bpy.data.objects:
    if obj.tag:
        print(f"High-poly: {obj.name}")
```

Each collection also has a `tag(value)` method that sets the tag on all its data-blocks at once.

## User Map

```python
bpy.data.user_map(subset=None, key_types=set(), value_types=set()) -> dict
```

Returns a dictionary mapping each ID to the set of IDs that use it.

```python
import bpy

# Find all users of a specific material
mat = bpy.data.materials["MyMaterial"]
user_map = bpy.data.user_map(subset={mat})
users = user_map.get(mat, set())
for user in users:
    print(f"{mat.name} is used by: {user.name}")
```

## Common Patterns

### Finding All Objects of a Type

```python
import bpy

mesh_objects = [obj for obj in bpy.data.objects if obj.type == 'MESH']
cameras = [obj for obj in bpy.data.objects if obj.type == 'CAMERA']
empties = [obj for obj in bpy.data.objects if obj.type == 'EMPTY']
```

### Creating a Complete Object

```python
import bpy

# Create mesh data
mesh = bpy.data.meshes.new("PlaneMesh")
mesh.from_pydata(
    vertices=[(-1, -1, 0), (1, -1, 0), (1, 1, 0), (-1, 1, 0)],
    edges=[],
    faces=[(0, 1, 2, 3)]
)
mesh.update()

# Create object and link to scene
obj = bpy.data.objects.new("Plane", mesh)
bpy.context.collection.objects.link(obj)
```

### Duplicating a Data-Block

```python
import bpy

# Copy a material (creates "MyMaterial.001")
original = bpy.data.materials["MyMaterial"]
duplicate = original.copy()
print(f"Duplicate: {duplicate.name}")
```

### Purging Unused Data After Import

```python
import bpy

# Import objects, then clean up any unused data
filepath = "/path/to/library.blend"
with bpy.data.libraries.load(filepath) as (data_from, data_to):
    data_to.objects = data_from.objects

for obj in data_to.objects:
    if obj is not None:
        bpy.context.collection.objects.link(obj)

# Purge anything that came along but isn't used
bpy.data.orphans_purge(do_recursive=True)
```

## Gotchas

- **Names are not unique identifiers.** Data-blocks of the same type can have colliding names — Blender auto-appends `.001`, `.002`, etc. Always use `.get()` for safe access or iterate with explicit checks. When creating a data-block with a name that already exists, the new one gets the suffix — the existing one is never renamed.

- **Name length limit is 255 bytes.** Data-block names are limited to 255 bytes (UTF-8 encoded). If a numeric suffix (`.001`) would exceed this, the root name is truncated.

- **Removing data still in use causes unlinks.** With `do_unlink=True` (default), removing a data-block automatically unlinks it from all users. Without it, removing a data-block that has users causes errors. Always check `datablock.users` if you need to verify dependencies first.

- **Library data is read-only.** Linked data-blocks cannot be edited directly. Use library overrides to create editable local versions. See [file-io](file-io.md) for library override workflow.

- **`is_dirty` ignores script changes.** Only UI edits set `bpy.data.is_dirty`. Modifications made by scripts do not flag the file as dirty — the user may not see the "unsaved changes" prompt.

- **`batch_remove` is experimental.** It can break Blender if misused (e.g., removing all scenes). Prefer individual `remove()` calls for safety.

- **Stale references after operations.** Adding or removing data-blocks can invalidate Python references to other data-blocks in the same collection. Re-query by name after bulk operations. See the "Avoid stale references" section in [SKILL.md](../SKILL.md).
