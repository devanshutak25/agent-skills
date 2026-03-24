# Depsgraph (Dependency Graph)

Blender's dependency graph manages evaluation order and caches evaluated data. Use it to read final object state (with modifiers, constraints, etc.) and detect scene changes. For objects see [objects-transforms](objects-transforms.md). For handlers see [handlers-timers](handlers-timers.md).

## Getting the Depsgraph

```python
import bpy

# From context (most common)
depsgraph = bpy.context.evaluated_depsgraph_get()

# Force a full update first
depsgraph.update()
```

## Evaluated vs Original

Blender maintains two copies of data: **original** (editable) and **evaluated** (read-only, post-modifiers/constraints).

```python
import bpy

depsgraph = bpy.context.evaluated_depsgraph_get()
obj = bpy.data.objects["Cube"]  # original

# Get evaluated copy
obj_eval = obj.evaluated_get(depsgraph)

# Read evaluated transform (includes constraints)
print(obj_eval.matrix_world)

# Read evaluated mesh (includes modifiers)
mesh_eval = obj_eval.data  # evaluated mesh, read-only

# Alternative: id_eval_get works on any ID type
obj_eval = depsgraph.id_eval_get(obj)
```

**Rule:** Read from evaluated, write to original. Changes to evaluated objects have no effect.

## Depsgraph Properties

```python
import bpy

depsgraph = bpy.context.evaluated_depsgraph_get()

# Evaluated copies of scene and view layer
scene_eval = depsgraph.scene_eval
view_layer_eval = depsgraph.view_layer_eval

# Evaluation mode
print(depsgraph.mode)  # 'VIEWPORT' or 'RENDER'
```

## Iterating Evaluated Objects

### depsgraph.objects

Yields evaluated objects (excludes instanced geometry like particles/geometry nodes instances):

```python
import bpy

depsgraph = bpy.context.evaluated_depsgraph_get()

for obj in depsgraph.objects:
    print(obj.name, obj.matrix_world.to_translation())
```

### depsgraph.ids

All evaluated IDs (objects, meshes, materials, etc.):

```python
import bpy

depsgraph = bpy.context.evaluated_depsgraph_get()

for id_data in depsgraph.ids:
    print(type(id_data).__name__, id_data.name)
```

### depsgraph.object_instances

Includes all instances (particles, geometry nodes, dupli-objects). Each yields a `DepsgraphObjectInstance`:

```python
import bpy

depsgraph = bpy.context.evaluated_depsgraph_get()

for instance in depsgraph.object_instances:
    obj = instance.object           # the evaluated object
    mat = instance.matrix_world     # world transform of this instance

    if instance.is_instance:
        parent = instance.parent            # instancer object
        inst_obj = instance.instance_object # original object being instanced
        pid = instance.persistent_id        # stable ID across frames
        rid = instance.random_id            # random value for variation
    else:
        # Regular (non-instanced) object
        pass
```

### DepsgraphObjectInstance Attributes

| Attribute | Type | Description |
|---|---|---|
| `object` | Object | Evaluated object |
| `matrix_world` | Matrix | World transform of this instance |
| `is_instance` | bool | True if this is an instanced copy |
| `parent` | Object | Instancer object (if instance) |
| `instance_object` | Object | Original instanced object |
| `persistent_id` | tuple | Stable ID for tracking across frames |
| `random_id` | int | Random value for per-instance variation |
| `particle_system` | ParticleSystem | Particle system (if particle instance) |
| `orco` | Vector | Original coordinates |
| `uv` | Vector | UV coordinates |
| `show_self` | bool | Object geometry visible in render |
| `show_particles` | bool | Particles visible in render |

## Detecting Updates

`depsgraph.updates` yields `DepsgraphUpdate` objects describing what changed:

```python
import bpy

def on_depsgraph_update(scene, depsgraph):
    for update in depsgraph.updates:
        print(f"ID: {update.id.name}")
        print(f"  Geometry: {update.is_updated_geometry}")
        print(f"  Transform: {update.is_updated_transform}")
        print(f"  Shading: {update.is_updated_shading}")

bpy.app.handlers.depsgraph_update_post.append(on_depsgraph_update)
```

### DepsgraphUpdate Attributes

| Attribute | Type | Description |
|---|---|---|
| `id` | ID | The updated data-block |
| `is_updated_geometry` | bool | Mesh/curve data changed |
| `is_updated_transform` | bool | Location/rotation/scale changed |
| `is_updated_shading` | bool | Material/shading changed |

## Common Patterns

### Export All Instances

```python
import bpy

depsgraph = bpy.context.evaluated_depsgraph_get()

for instance in depsgraph.object_instances:
    if instance.object.type != 'MESH':
        continue

    obj_eval = instance.object
    mesh = obj_eval.to_mesh()
    matrix = instance.matrix_world

    # Export mesh with instance transform
    for v in mesh.vertices:
        world_co = matrix @ v.co
        # ... write vertex ...

    obj_eval.to_mesh_clear()
```

### Count Visible Instances

```python
import bpy

depsgraph = bpy.context.evaluated_depsgraph_get()

total_instances = 0
unique_objects = set()

for instance in depsgraph.object_instances:
    total_instances += 1
    unique_objects.add(instance.object.original.name)

print(f"Total instances: {total_instances}")
print(f"Unique objects: {len(unique_objects)}")
```

### React to Geometry Changes

```python
import bpy
from bpy.app.handlers import persistent

@persistent
def track_changes(scene, depsgraph):
    for update in depsgraph.updates:
        if update.is_updated_geometry:
            obj = update.id
            if hasattr(obj, 'type') and obj.type == 'MESH':
                print(f"Mesh changed: {obj.name}")

bpy.app.handlers.depsgraph_update_post.append(track_changes)
```

## Gotchas

1. **Evaluated data is read-only.** Never modify objects, meshes, or materials obtained through `evaluated_get` or `depsgraph.objects`. Always modify the original and let the depsgraph re-evaluate.

2. **`object_instances` includes non-instanced objects.** Regular objects appear with `is_instance = False`. Filter with `if instance.is_instance:` to get only instanced copies.

3. **`depsgraph.updates` only in handlers.** The `updates` iterable is only meaningful inside `depsgraph_update_post` or `frame_change_post` handlers. Outside handlers it may be empty.

4. **`to_mesh` on evaluated objects.** Call `to_mesh()` on the evaluated object, not the original. Call `to_mesh_clear()` when done. The mesh is temporary and must not be stored.

5. **Performance in update handlers.** `depsgraph_update_post` fires on every scene change including selection, view changes, and property edits. Check `update.is_updated_geometry` or similar flags before doing expensive work.

6. **`instance.object.original`** returns the original (non-evaluated) version of the instanced object. Use this to map back to the original data-block for modification.
