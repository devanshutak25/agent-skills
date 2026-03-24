# Geometry Nodes API

Python interface for interacting with Geometry Nodes modifiers — accessing modifier inputs/outputs, reading computed attributes, baking simulations, and scripting node tools. For the node tree interface API (sockets, panels) see [node-tree-interface](node-tree-interface.md). For mesh data access see [mesh-data](mesh-data.md).

## Modifier Basics

A Geometry Nodes modifier references a node group and exposes its Group Input sockets as modifier properties:

```python
import bpy

obj = bpy.context.object

# Add a Geometry Nodes modifier
mod = obj.modifiers.new(name="GeoNodes", type='NODES')

# Assign a node group
node_group = bpy.data.node_groups.get("MyNodeGroup")
mod.node_group = node_group

# Access modifier properties
print(mod.node_group.name)
print(mod.show_viewport)
print(mod.show_render)
```

## Accessing Modifier Inputs

Group Input sockets are exposed as IDProperties on the modifier. Access them using the socket identifier (not the display name):

```python
import bpy

obj = bpy.context.object
mod = obj.modifiers["GeoNodes"]

# Socket identifiers follow the pattern "Socket_N" or the name set in the interface
# Find socket identifiers by inspecting the node group interface
for item in mod.node_group.interface.items_tree:
    if item.item_type == 'SOCKET' and item.in_out == 'INPUT':
        print(f"{item.name}: {item.identifier}")

# Read/write modifier inputs via identifier
mod["Socket_2"] = 5.0          # float input
mod["Socket_3"] = 10           # integer input
mod["Socket_4"] = True         # boolean input
mod["Socket_5"] = (1, 0, 0)    # vector input

# For object/collection/material inputs, assign the data-block
mod["Socket_6"] = bpy.data.objects["Cube"]
mod["Socket_7"] = bpy.data.collections["MyCollection"]
mod["Socket_8"] = bpy.data.materials["MyMaterial"]

# Force depsgraph update after changing inputs
bpy.context.view_layer.update()
```

### Input Types and Values

| Socket Type | Python Type | Example |
|---|---|---|
| `NodeSocketFloat` | `float` | `mod["Socket_2"] = 1.5` |
| `NodeSocketInt` | `int` | `mod["Socket_2"] = 10` |
| `NodeSocketBool` | `bool` or `int` | `mod["Socket_2"] = True` |
| `NodeSocketVector` | `tuple(3)` | `mod["Socket_2"] = (1.0, 0.0, 0.0)` |
| `NodeSocketColor` | `tuple(4)` | `mod["Socket_2"] = (1, 0, 0, 1)` |
| `NodeSocketString` | `str` | `mod["Socket_2"] = "text"` |
| `NodeSocketObject` | `Object` or `None` | `mod["Socket_2"] = bpy.data.objects["Cube"]` |
| `NodeSocketCollection` | `Collection` or `None` | `mod["Socket_2"] = bpy.data.collections["C"]` |
| `NodeSocketMaterial` | `Material` or `None` | `mod["Socket_2"] = bpy.data.materials["M"]` |
| `NodeSocketImage` | `Image` or `None` | `mod["Socket_2"] = bpy.data.images["I"]` |

## Reading Output Attributes

Geometry Nodes can output named attributes on the resulting geometry. Read them from the evaluated mesh:

```python
import bpy

obj = bpy.context.object
depsgraph = bpy.context.evaluated_depsgraph_get()
obj_eval = obj.evaluated_get(depsgraph)
mesh_eval = obj_eval.data

# Read an output attribute
attr = mesh_eval.attributes.get("my_output_attr")
if attr is not None:
    import numpy as np
    n = len(attr.data)
    if attr.data_type == 'FLOAT':
        values = np.empty(n, dtype=np.float32)
        attr.data.foreach_get("value", values)
    elif attr.data_type == 'FLOAT_VECTOR':
        values = np.empty(n * 3, dtype=np.float32)
        attr.data.foreach_get("vector", values)
        values = values.reshape((n, 3))
    elif attr.data_type == 'BOOLEAN':
        values = np.empty(n, dtype=bool)
        attr.data.foreach_get("value", values)
```

### Attribute Domain Sizes

Query how many elements exist per domain on the evaluated geometry:

```python
import bpy

obj = bpy.context.object
depsgraph = bpy.context.evaluated_depsgraph_get()
mesh_eval = obj.evaluated_get(depsgraph).data

# domain_size returns element count for a domain
print("Vertices:", mesh_eval.attributes.domain_size('POINT'))
print("Edges:", mesh_eval.attributes.domain_size('EDGE'))
print("Faces:", mesh_eval.attributes.domain_size('FACE'))
print("Corners:", mesh_eval.attributes.domain_size('CORNER'))
```

## Viewer Node Data

The Viewer node in a geometry nodes tree stores its data for inspection. Access it from the evaluated object's geometry:

```python
import bpy

# The Viewer node stores data as a temporary geometry on the object
# Access it through the spreadsheet editor or via evaluated data
obj = bpy.context.object
depsgraph = bpy.context.evaluated_depsgraph_get()
obj_eval = obj.evaluated_get(depsgraph)

# Viewer data appears as attributes on the evaluated geometry
# The viewer stores its result as ".viewer" attribute
mesh = obj_eval.data
viewer_attr = mesh.attributes.get(".viewer")
if viewer_attr is not None:
    import numpy as np
    n = len(viewer_attr.data)
    values = np.empty(n, dtype=np.float32)
    viewer_attr.data.foreach_get("value", values)
```

## Baking

Geometry Nodes simulations and physics baking:

```python
import bpy

obj = bpy.context.object

# Bake all geometry node simulations on the active object
bpy.ops.object.simulation_nodes_cache_bake_all()

# Bake a specific modifier's simulation
# Select the object and set the modifier as active
bpy.ops.object.simulation_nodes_cache_bake(
    selected=False,
    modifier_name="GeoNodes"
)

# Delete bake cache
bpy.ops.object.simulation_nodes_cache_delete_all()
```

## Node Tools

Node tools are geometry node groups that act as operators in the 3D viewport. They appear in the Active Tool menu.

```python
import bpy

# Create a node tool
tool_group = bpy.data.node_groups.new("MyTool", 'GeometryNodeTree')
tool_group.is_tool = True
tool_group.is_type_mesh = True  # works on mesh objects

# Tool properties
tool_group.is_type_curve = False
tool_group.is_type_point_cloud = False
```

> **5.1:** Node tools require a globally unique `bl_idname`. In 5.1, Blender automatically assigns a unique idname on file save if one is not set. You can also set it manually in the node editor header. This ensures node tools can be reliably referenced across files and by keymaps. If your tool has a duplicate or missing idname, Blender will warn and auto-fix on save.

## Scripting Node Groups

### Creating a Node Group

```python
import bpy

# Create a new geometry node group
group = bpy.data.node_groups.new("ProcScatter", 'GeometryNodeTree')

# Add interface sockets
group.interface.new_socket("Geometry", in_out='INPUT', socket_type='NodeSocketGeometry')
group.interface.new_socket("Geometry", in_out='OUTPUT', socket_type='NodeSocketGeometry')
group.interface.new_socket("Density", in_out='INPUT', socket_type='NodeSocketFloat')

# Set default value on the density input
density_socket = None
for item in group.interface.items_tree:
    if item.item_type == 'SOCKET' and item.name == "Density" and item.in_out == 'INPUT':
        density_socket = item
        break
if density_socket:
    density_socket.default_value = 10.0
    density_socket.min_value = 0.0
    density_socket.max_value = 1000.0

# Add nodes
group_input = group.nodes.new('NodeGroupInput')
group_output = group.nodes.new('NodeGroupOutput')
distribute = group.nodes.new('GeometryNodeDistributePointsOnFaces')

group_input.location = (-300, 0)
distribute.location = (0, 0)
group_output.location = (300, 0)

# Link nodes
group.links.new(group_input.outputs["Geometry"], distribute.inputs["Mesh"])
group.links.new(group_input.outputs["Density"], distribute.inputs["Density"])
group.links.new(distribute.outputs["Points"], group_output.inputs["Geometry"])
```

### Applying a Node Group as Modifier

```python
import bpy

obj = bpy.context.object
group = bpy.data.node_groups["ProcScatter"]

mod = obj.modifiers.new("Scatter", 'NODES')
mod.node_group = group

# Set modifier input
# Find the density socket identifier
for item in group.interface.items_tree:
    if item.item_type == 'SOCKET' and item.name == "Density" and item.in_out == 'INPUT':
        mod[item.identifier] = 50.0
        break

bpy.context.view_layer.update()
```

## Common Patterns

### Batch Process Modifier Inputs Across Objects

```python
import bpy

group = bpy.data.node_groups["ProcScatter"]

# Find the socket identifier for "Density"
density_id = None
for item in group.interface.items_tree:
    if item.item_type == 'SOCKET' and item.name == "Density" and item.in_out == 'INPUT':
        density_id = item.identifier
        break

# Set density on all objects using this node group
for obj in bpy.data.objects:
    for mod in obj.modifiers:
        if mod.type == 'NODES' and mod.node_group == group:
            mod[density_id] = 100.0

bpy.context.view_layer.update()
```

### Read Geometry Nodes Output for Analysis

```python
import bpy
import numpy as np

obj = bpy.context.object
depsgraph = bpy.context.evaluated_depsgraph_get()
obj_eval = obj.evaluated_get(depsgraph)
mesh_eval = obj_eval.data

# Read all output attributes
for attr in mesh_eval.attributes:
    if attr.is_internal:
        continue
    print(f"{attr.name}: type={attr.data_type}, domain={attr.domain}, "
          f"count={len(attr.data)}")

# Read positions of generated points (e.g., from Distribute Points on Faces)
n = len(mesh_eval.vertices)
if n > 0:
    positions = np.empty(n * 3, dtype=np.float32)
    mesh_eval.vertices.foreach_get("co", positions)
    positions = positions.reshape((n, 3))
    print(f"Generated {n} points, bounding box: "
          f"{positions.min(axis=0)} to {positions.max(axis=0)}")
```

### Iterate Instances from Geometry Nodes

```python
import bpy

depsgraph = bpy.context.evaluated_depsgraph_get()

for instance in depsgraph.object_instances:
    if instance.is_instance:
        obj = instance.object
        matrix = instance.matrix_world
        print(f"Instance of {obj.name} at {matrix.translation}")
```

## Gotchas

1. **Socket identifiers vs display names.** Modifier inputs are keyed by socket identifier (`"Socket_2"`), not the human-readable name (`"Density"`). Always inspect `interface.items_tree` to find the correct identifier. Identifiers are stable; display names can change.

2. **Evaluated vs original data.** Reading output attributes requires the evaluated object (`obj.evaluated_get(depsgraph)`). The original object's mesh does not contain geometry nodes output data. Always get a fresh depsgraph evaluation first.

3. **Object/collection inputs are data-block references.** Setting `mod["Socket_6"] = bpy.data.objects["Cube"]` stores a reference. If the referenced object is deleted, the input becomes `None`. These are not copied — they are live references.

4. **Bake operators need context.** Bake operators require the object to be selected and usually active. Use `context.temp_override()` or select the object before calling bake operators.

5. **Simulation zones need baking.** Simulation Zone nodes cache results per frame. Without baking, results depend on playback history and may differ between runs. Always bake simulations for deterministic results.

6. **Node group changes invalidate modifier inputs.** Removing or reordering sockets in a node group can shift socket identifiers, breaking existing modifier input assignments. When modifying node group interfaces programmatically, update all modifier references afterward.
