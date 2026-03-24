# Collections & Scene

Collection hierarchy, object linking, view layers, layer collections, scene utilities, and the 3D cursor. For objects see [objects-transforms](objects-transforms.md). For depsgraph see [depsgraph](depsgraph.md).

## Collections

### Creating and Organizing

```python
import bpy

# Create a collection
coll = bpy.data.collections.new("MyCollection")

# Link to the scene's root collection
bpy.context.scene.collection.children.link(coll)

# Create child collection
child_coll = bpy.data.collections.new("SubCollection")
coll.children.link(child_coll)

# Remove collection from parent
coll.children.unlink(child_coll)

# Delete collection entirely
bpy.data.collections.remove(coll)
```

### Linking Objects

```python
import bpy

coll = bpy.data.collections["MyCollection"]
obj = bpy.data.objects["Cube"]

# Link object to collection
coll.objects.link(obj)

# Unlink object from collection
coll.objects.unlink(obj)
```

### Collection Properties

```python
import bpy

coll = bpy.data.collections["MyCollection"]

coll.name = "Renamed"
coll.hide_viewport = False      # hide in viewport
coll.hide_render = False        # hide in render
coll.hide_select = False        # make unselectable
coll.color_tag = 'COLOR_01'     # color label (01-08, NONE)

# Iterate objects (direct children only)
for obj in coll.objects:
    print(obj.name)

# Iterate objects (recursive, read-only)
for obj in coll.all_objects:
    print(obj.name)

# Iterate child collections
for child in coll.children:
    print(child.name)
```

## Scene Collection

`scene.collection` is the root collection — all objects must be in at least one collection to appear in the scene:

```python
import bpy

scene = bpy.context.scene

# Root collection (cannot be removed)
root = scene.collection

# Link an object to the scene
root.objects.link(obj)

# All scene objects
for obj in scene.objects:
    print(obj.name)
```

## View Layer

```python
import bpy

view_layer = bpy.context.view_layer

# Active object
active = view_layer.objects.active
view_layer.objects.active = bpy.data.objects["Cube"]

# Selected objects
selected = [o for o in view_layer.objects if o.select_get()]

# All visible objects in this view layer
for obj in view_layer.objects:
    print(obj.name, obj.visible_get())
```

## Layer Collections

Layer collections control per-view-layer visibility. They mirror the collection hierarchy:

```python
import bpy

view_layer = bpy.context.view_layer

# Root layer collection
root_lc = view_layer.layer_collection

def traverse_layer_collections(lc, depth=0):
    print("  " * depth + lc.name)
    print("  " * depth + f"  exclude={lc.exclude}, hide={lc.hide_viewport}")
    for child in lc.children:
        traverse_layer_collections(child, depth + 1)

traverse_layer_collections(root_lc)
```

### LayerCollection Properties

| Property | Type | Description |
|---|---|---|
| `exclude` | bool | Exclude from view layer entirely |
| `hide_viewport` | bool | Temporarily hide in viewport |
| `holdout` | bool | Mask out for compositing |
| `indirect_only` | bool | Only contribute indirect light |
| `is_visible` | bool | Read-only effective visibility |
| `collection` | Collection | The underlying collection |

### Finding a Layer Collection by Name

```python
import bpy

def find_layer_collection(layer_collection, name):
    if layer_collection.name == name:
        return layer_collection
    for child in layer_collection.children:
        result = find_layer_collection(child, name)
        if result:
            return result
    return None

lc = find_layer_collection(
    bpy.context.view_layer.layer_collection,
    "MyCollection"
)
if lc:
    lc.exclude = True  # hide this collection
```

## Scene Ray Cast

```python
import bpy
from mathutils import Vector

scene = bpy.context.scene
depsgraph = bpy.context.evaluated_depsgraph_get()

origin = Vector((0, 0, 10))
direction = Vector((0, 0, -1))

result, location, normal, index, obj, matrix = scene.ray_cast(
    depsgraph,
    origin,
    direction,
    distance=1.70141e+38   # max distance
)
# result: bool — True if hit
# location: Vector — hit point in world space
# normal: Vector — surface normal at hit
# index: int — polygon index
# obj: Object — hit object
# matrix: Matrix — object's world matrix
```

**Edit mode caveat:** `scene.ray_cast` ignores geometry of objects currently in edit mode. Exit edit mode before raycasting if you need to hit those objects.

## 3D Cursor

```python
import bpy

cursor = bpy.context.scene.cursor

# Read/write position
cursor.location = (1, 2, 3)
print(cursor.location)

# Read/write rotation
cursor.rotation_euler = (0, 0, 0)
cursor.rotation_mode = 'XYZ'
# Also supports: rotation_quaternion, rotation_axis_angle
```

## Common Patterns

### Move Object to Collection

```python
import bpy

def move_to_collection(obj, target_collection):
    """Move object from all current collections to target."""
    for coll in obj.users_collection:
        coll.objects.unlink(obj)
    target_collection.objects.link(obj)

obj = bpy.data.objects["Cube"]
coll = bpy.data.collections["MyCollection"]
move_to_collection(obj, coll)
```

### Create Object in New Collection

```python
import bpy

# Create collection
coll = bpy.data.collections.new("Lights")
bpy.context.scene.collection.children.link(coll)

# Create light and add to collection
light_data = bpy.data.lights.new("PointLight", 'POINT')
light_obj = bpy.data.objects.new("PointLight", light_data)
coll.objects.link(light_obj)
```

### Set Active Collection for Adding Objects

```python
import bpy

# Find and set the active collection (where new objects are added)
lc = find_layer_collection(
    bpy.context.view_layer.layer_collection,
    "MyCollection"
)
bpy.context.view_layer.active_layer_collection = lc
```

## Gotchas

1. **Objects must be in a collection.** An object not linked to any collection is orphaned and won't appear in the scene. Always link objects to at least one collection.

2. **`scene.ray_cast` edit mode caveat.** Objects in edit mode are invisible to `scene.ray_cast`. Switch to object mode or use `BVHTree` for those objects. See [mathutils-spatial](mathutils-spatial.md).

3. **`all_objects` is read-only.** `collection.all_objects` includes objects from child collections but cannot be used to link/unlink. Use `collection.objects` on the specific collection.

4. **Layer collections vs collections.** Collections hold objects. Layer collections control per-view-layer visibility of those collections. You must traverse the layer collection tree to toggle visibility.

5. **`exclude` vs `hide_viewport`.** `exclude` fully removes the collection from the view layer (objects won't be evaluated). `hide_viewport` hides objects visually but they still evaluate (e.g., physics simulations still run).

6. **Duplicate linking.** Linking an object to a collection it's already in raises an error. Check `obj.name in coll.objects` first, or catch the `RuntimeError`.
