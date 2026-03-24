# Node Tree Interface

The node tree interface defines the input and output sockets visible on a node group. It controls what parameters are exposed when a group is instanced as a `ShaderNodeGroup`, `CompositorNodeGroup`, or Geometry Nodes modifier. For shader node trees see [shader-nodes](shader-nodes.md). For compositor nodes see [compositor-nodes](compositor-nodes.md). For geometry nodes API see [geometry-nodes-api](geometry-nodes-api.md).

## Accessing the Interface

Every `NodeTree` has an `interface` object:

```python
import bpy

tree = bpy.data.node_groups["MyGroup"]
interface = tree.interface

# List all interface items (sockets and panels)
for item in interface.items_tree:
    print(f"{item.item_type}: {item.name}")
    if item.item_type == 'SOCKET':
        print(f"  in_out={item.in_out}, type={item.socket_type}")
        print(f"  identifier={item.identifier}")
```

## Creating Sockets

`interface.new_socket(name, *, description='', in_out='INPUT', socket_type='DEFAULT', parent=None)` adds an input or output socket. All parameters except `name` are keyword-only:

```python
import bpy

tree = bpy.data.node_groups.new("MyGroup", 'ShaderNodeTree')

# Add input sockets
tree.interface.new_socket(
    name="Factor",
    in_out='INPUT',
    socket_type='NodeSocketFloat'
)

tree.interface.new_socket(
    name="Color",
    in_out='INPUT',
    socket_type='NodeSocketColor'
)

tree.interface.new_socket(
    name="Position",
    in_out='INPUT',
    socket_type='NodeSocketVector'
)

# Add output sockets
tree.interface.new_socket(
    name="Result",
    in_out='OUTPUT',
    socket_type='NodeSocketColor'
)

tree.interface.new_socket(
    name="Mask",
    in_out='OUTPUT',
    socket_type='NodeSocketFloat'
)
```

### Socket Type Enum

All valid `socket_type` values:

| Socket Type | Data Type | Default Value Type |
|---|---|---|
| `NodeSocketFloat` | Float | `float` |
| `NodeSocketFloatFactor` | Float (0–1 clamped) | `float` |
| `NodeSocketFloatAngle` | Float (radians) | `float` |
| `NodeSocketFloatDistance` | Float (distance) | `float` |
| `NodeSocketFloatPercentage` | Float (percentage) | `float` |
| `NodeSocketFloatTime` | Float (time) | `float` |
| `NodeSocketFloatTimeAbsolute` | Float (absolute time) | `float` |
| `NodeSocketFloatUnsigned` | Float (unsigned) | `float` |
| `NodeSocketInt` | Integer | `int` |
| `NodeSocketIntFactor` | Integer (0–1) | `int` |
| `NodeSocketIntPercentage` | Integer (percentage) | `int` |
| `NodeSocketIntUnsigned` | Integer (unsigned) | `int` |
| `NodeSocketBool` | Boolean | `bool` |
| `NodeSocketVector` | Vector (3D) | `tuple(3)` |
| `NodeSocketVectorEuler` | Euler rotation | `tuple(3)` |
| `NodeSocketVectorTranslation` | Translation | `tuple(3)` |
| `NodeSocketVectorDirection` | Direction | `tuple(3)` |
| `NodeSocketVectorVelocity` | Velocity | `tuple(3)` |
| `NodeSocketVectorAcceleration` | Acceleration | `tuple(3)` |
| `NodeSocketVectorXYZ` | XYZ vector | `tuple(3)` |
| `NodeSocketColor` | Color (RGBA) | `tuple(4)` |
| `NodeSocketString` | String | `str` |
| `NodeSocketShader` | Shader/Closure | — (no default) |
| `NodeSocketObject` | Object reference | `Object` or `None` |
| `NodeSocketCollection` | Collection reference | `Collection` or `None` |
| `NodeSocketImage` | Image reference | `Image` or `None` |
| `NodeSocketMaterial` | Material reference | `Material` or `None` |
| `NodeSocketGeometry` | Geometry | — (no default) |
| `NodeSocketRotation` | Rotation (quaternion) | `tuple(4)` |
| `NodeSocketMatrix` | 4×4 Matrix | — |
| `NodeSocketMenu` | Enum menu | `int` |
| `NodeSocketBundle` | Bundle (5.0+) | — (no default) |
| `NodeSocketClosure` | Closure (5.0+) | — (no default) |

## Socket Properties

After creating a socket, configure its properties:

```python
import bpy

tree = bpy.data.node_groups["MyGroup"]

# Find socket by name and direction
socket = None
for item in tree.interface.items_tree:
    if (item.item_type == 'SOCKET' and
        item.name == "Factor" and
        item.in_out == 'INPUT'):
        socket = item
        break

if socket:
    # Set default value
    socket.default_value = 0.5

    # Set min/max range (numeric sockets only)
    socket.min_value = 0.0
    socket.max_value = 1.0

    # Description (tooltip)
    socket.description = "Blend factor between inputs"

    # Hide the value slider in the node UI
    socket.hide_value = False

    # Hide the socket entirely in the node UI
    socket.hide_in_modifier = False  # for geometry nodes modifier panel
```

### Default Values by Socket Type

```python
import bpy

tree = bpy.data.node_groups["MyGroup"]

for item in tree.interface.items_tree:
    if item.item_type != 'SOCKET' or item.in_out != 'INPUT':
        continue

    if item.socket_type == 'NodeSocketFloat':
        item.default_value = 1.0
        item.min_value = 0.0
        item.max_value = 10.0

    elif item.socket_type == 'NodeSocketColor':
        item.default_value = (0.8, 0.2, 0.1, 1.0)  # RGBA

    elif item.socket_type == 'NodeSocketVector':
        item.default_value = (0.0, 0.0, 1.0)  # XYZ

    elif item.socket_type == 'NodeSocketBool':
        item.default_value = True

    elif item.socket_type == 'NodeSocketInt':
        item.default_value = 5
        item.min_value = 0
        item.max_value = 100

    elif item.socket_type == 'NodeSocketString':
        item.default_value = "default"
```

## Creating Panels

Panels group sockets visually in the node's UI:

```python
import bpy

tree = bpy.data.node_groups.new("GroupedInputs", 'GeometryNodeTree')

# Create a panel
# Signature: new_panel(name, *, description='', default_closed=False)
panel = tree.interface.new_panel(
    name="Advanced Settings",
    default_closed=True
)

# Add sockets inside the panel
tree.interface.new_socket(
    name="Geometry",
    in_out='INPUT',
    socket_type='NodeSocketGeometry'
)

tree.interface.new_socket(
    name="Detail Level",
    in_out='INPUT',
    socket_type='NodeSocketInt',
    parent=panel  # place inside the panel
)

tree.interface.new_socket(
    name="Smoothing",
    in_out='INPUT',
    socket_type='NodeSocketFloat',
    parent=panel
)

# Output
tree.interface.new_socket(
    name="Geometry",
    in_out='OUTPUT',
    socket_type='NodeSocketGeometry'
)
```

## Iterating Interface Items

`interface.items_tree` returns all items in a flat list (sockets and panels):

```python
import bpy

tree = bpy.data.node_groups["MyGroup"]

for item in tree.interface.items_tree:
    if item.item_type == 'SOCKET':
        print(f"Socket: {item.name}")
        print(f"  Direction: {item.in_out}")      # 'INPUT' or 'OUTPUT'
        print(f"  Type: {item.socket_type}")
        print(f"  Identifier: {item.identifier}")  # stable ID like "Socket_2"
        if hasattr(item, 'parent') and item.parent:
            print(f"  Panel: {item.parent.name}")
    elif item.item_type == 'PANEL':
        print(f"Panel: {item.name}")
        print(f"  Closed by default: {item.default_closed}")
```

## Moving and Removing Items

```python
import bpy

tree = bpy.data.node_groups["MyGroup"]
interface = tree.interface

# Remove a socket by reference
for item in list(interface.items_tree):
    if item.item_type == 'SOCKET' and item.name == "Unused":
        interface.remove(item)
        break

# Move a socket to a different position
# interface.move(item, to_position)
# Position is the index in items_tree
items = list(interface.items_tree)
if len(items) >= 2:
    interface.move(items[0], 1)  # move first item to position 1
```

## Relationship to Group Input/Output Nodes

Interface sockets map directly to the `NodeGroupInput` and `NodeGroupOutput` nodes inside the group:

```python
import bpy

tree = bpy.data.node_groups["MyGroup"]

# The Group Input node's outputs correspond to INPUT interface sockets
group_input = None
for node in tree.nodes:
    if node.type == 'GROUP_INPUT':
        group_input = node
        break

if group_input:
    for output in group_input.outputs:
        if output.name:  # skip the empty "virtual" socket
            print(f"Group Input → {output.name}: {output.type}")

# The Group Output node's inputs correspond to OUTPUT interface sockets
group_output = None
for node in tree.nodes:
    if node.type == 'GROUP_OUTPUT':
        group_output = node
        break

if group_output:
    for inp in group_output.inputs:
        if inp.name:
            print(f"Group Output ← {inp.name}: {inp.type}")
```

When you add a socket via the interface, a corresponding socket appears on the Group Input or Group Output node. The socket `identifier` on the interface item matches the socket name used in `node.inputs[identifier]` and `node.outputs[identifier]` on instances of the group.

## Common Patterns

### Build a Complete Node Group with Interface

```python
import bpy

# Create the group
group = bpy.data.node_groups.new("ColorMixer", 'ShaderNodeTree')

# Define interface
group.interface.new_socket("Color A", in_out='INPUT', socket_type='NodeSocketColor')
group.interface.new_socket("Color B", in_out='INPUT', socket_type='NodeSocketColor')
fac = group.interface.new_socket("Factor", in_out='INPUT', socket_type='NodeSocketFloat')
fac.default_value = 0.5
fac.min_value = 0.0
fac.max_value = 1.0
group.interface.new_socket("Result", in_out='OUTPUT', socket_type='NodeSocketColor')

# Create internal nodes
input_node = group.nodes.new('NodeGroupInput')
input_node.location = (-200, 0)

mix = group.nodes.new('ShaderNodeMix')
mix.data_type = 'RGBA'
mix.location = (0, 0)

output_node = group.nodes.new('NodeGroupOutput')
output_node.location = (200, 0)

# Link
group.links.new(input_node.outputs["Color A"], mix.inputs["A"])
group.links.new(input_node.outputs["Color B"], mix.inputs["B"])
group.links.new(input_node.outputs["Factor"], mix.inputs["Factor"])
group.links.new(mix.outputs["Result"], output_node.inputs["Result"])
```

### Clone Interface from One Group to Another

```python
import bpy

src = bpy.data.node_groups["SourceGroup"]
dst = bpy.data.node_groups.new("ClonedGroup", src.bl_idname)

for item in src.interface.items_tree:
    if item.item_type == 'SOCKET':
        new_socket = dst.interface.new_socket(
            name=item.name,
            in_out=item.in_out,
            socket_type=item.socket_type
        )
        if hasattr(item, 'default_value') and hasattr(new_socket, 'default_value'):
            try:
                new_socket.default_value = item.default_value
            except (TypeError, AttributeError):
                pass
        if hasattr(item, 'min_value'):
            new_socket.min_value = item.min_value
            new_socket.max_value = item.max_value
    elif item.item_type == 'PANEL':
        dst.interface.new_panel(
            name=item.name,
            default_closed=item.default_closed
        )
```

### Inspect Geometry Nodes Modifier Interface

```python
import bpy

obj = bpy.context.object
for mod in obj.modifiers:
    if mod.type != 'NODES' or mod.node_group is None:
        continue

    print(f"Modifier: {mod.name}")
    for item in mod.node_group.interface.items_tree:
        if item.item_type != 'SOCKET' or item.in_out != 'INPUT':
            continue
        if item.socket_type == 'NodeSocketGeometry':
            continue  # skip geometry socket

        value = mod.get(item.identifier, "unset")
        print(f"  {item.name} [{item.identifier}] = {value}")
```

## Gotchas

1. **`identifier` vs `name`.** Socket `name` is the display label and can be changed. `identifier` (e.g., `"Socket_2"`) is the stable key used by modifiers and group instances. Always use `identifier` when accessing modifier inputs: `mod[item.identifier]`.

2. **`items_tree` is flat.** Panels and sockets are mixed in `items_tree`. Filter by `item.item_type == 'SOCKET'` or `item.item_type == 'PANEL'`. Sockets inside panels have `item.parent` set to the panel.

3. **Socket order matters.** The order of sockets in the interface determines their order on Group Input/Output nodes and in the modifier panel. Use `interface.move()` to reorder.

4. **No `default_value` on Shader/Geometry sockets.** Sockets of type `NodeSocketShader`, `NodeSocketGeometry`, and `NodeSocketMatrix` do not have a `default_value` property. Attempting to set it raises `AttributeError`.

5. **`new_socket` returns the item.** The return value of `interface.new_socket()` is the `NodeTreeInterfaceSocket` item, which you can immediately configure with `default_value`, `min_value`, etc.

6. **Removing sockets invalidates references.** After `interface.remove(item)`, existing references to items may be stale. Re-fetch from `items_tree` if you need to continue manipulating the interface.

7. **Panel `parent` parameter.** To place a socket inside a panel, pass `parent=panel` to `new_socket()`. You cannot move a socket into or out of a panel after creation — you must remove and re-create it.
