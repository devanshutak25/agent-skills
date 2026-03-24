# Node Closures & Bundles

Closures and bundles are advanced node system features for packaging and passing node sub-graphs between node groups. Closures enable injecting shader logic from one group into another at runtime. Bundles group multiple data connections into a single link. For node tree interfaces see [node-tree-interface](node-tree-interface.md). For shader nodes see [shader-nodes](shader-nodes.md).

## Closures

A closure captures a node sub-graph (a "recipe" for computation) and passes it as a single connection to another node group. The receiving group can execute the closure with its own inputs, enabling modular shader composition without duplicating node trees.

### Concept

Closures solve a key limitation: normally, node groups are evaluated eagerly — inputs are computed before the group runs. With closures, a sub-graph is passed unevaluated and invoked on demand by the consumer. This is analogous to passing a function as an argument in programming.

**Use cases:**
- Passing a surface shader to a utility group that applies it conditionally
- Creating shader libraries where the shading logic is pluggable
- Render engines accessing expanded shader trees for export

### Shader Closure Sockets

Shader sockets (`NodeSocketShader`) carry closure data in shader node trees. When you connect a BSDF output to a group input of type Shader, you are passing a closure:

```python
import bpy

# Create a group that accepts a shader closure
group = bpy.data.node_groups.new("ShaderWrapper", 'ShaderNodeTree')

# Shader input — receives a closure
group.interface.new_socket(
    name="Surface Shader",
    in_out='INPUT',
    socket_type='NodeSocketShader'
)

# Shader output
group.interface.new_socket(
    name="Shader",
    in_out='OUTPUT',
    socket_type='NodeSocketShader'
)

# Inside the group, the shader input can be connected
# to Mix Shader or directly to the output
input_node = group.nodes.new('NodeGroupInput')
output_node = group.nodes.new('NodeGroupOutput')

mix = group.nodes.new('ShaderNodeMixShader')
transparent = group.nodes.new('ShaderNodeBsdfTransparent')

input_node.location = (-300, 0)
mix.location = (0, 0)
transparent.location = (-200, -100)
output_node.location = (200, 0)

group.links.new(input_node.outputs["Surface Shader"], mix.inputs[1])
group.links.new(transparent.outputs["BSDF"], mix.inputs[2])
group.links.new(mix.outputs["Shader"], output_node.inputs["Shader"])
```

## Bundles

Bundles package multiple values into a single connection, reducing visual clutter in complex node trees.

### Combine Bundle / Separate Bundle

The **Combine Bundle** node takes multiple inputs and outputs a single bundle connection. The **Separate Bundle** node unpacks a bundle back into individual values:

```python
import bpy

tree = bpy.data.node_groups.new("BundleDemo", 'GeometryNodeTree')

tree.interface.new_socket("Geometry", in_out='INPUT', socket_type='NodeSocketGeometry')
tree.interface.new_socket("Geometry", in_out='OUTPUT', socket_type='NodeSocketGeometry')

# Create Combine Bundle node
# Bundle nodes are available in geometry node trees
combine = tree.nodes.new('GeometryNodeCombineBundle')
combine.location = (-100, 0)

# Create Separate Bundle node
separate = tree.nodes.new('GeometryNodeSeparateBundle')
separate.location = (200, 0)
```

Bundle sockets carry structured data. The bundle's schema (what fields it contains) is defined by the connections made to the Combine Bundle node.

## Repeat Zones

Repeat zones execute a portion of a node tree multiple times. They consist of a **Repeat Input** and **Repeat Output** node pair that define the loop body:

```python
import bpy

tree = bpy.data.node_groups.new("RepeatDemo", 'GeometryNodeTree')

tree.interface.new_socket("Geometry", in_out='INPUT', socket_type='NodeSocketGeometry')
tree.interface.new_socket("Geometry", in_out='OUTPUT', socket_type='NodeSocketGeometry')

# Create repeat zone nodes
repeat_input = tree.nodes.new('GeometryNodeRepeatInput')
repeat_input.location = (-200, 0)

repeat_output = tree.nodes.new('GeometryNodeRepeatOutput')
repeat_output.location = (200, 0)

# Set iteration count
repeat_input.pair_with_output(repeat_output)

# The repeat zone passes data through each iteration
# Add sockets to the repeat zone for loop-carried state
repeat_output.repeat_items.new('NodeSocketGeometry', "Geometry")
repeat_output.repeat_items.new('NodeSocketFloat', "Value")

# Connect loop body
input_node = tree.nodes.new('NodeGroupInput')
output_node = tree.nodes.new('NodeGroupOutput')

input_node.location = (-400, 0)
output_node.location = (400, 0)

# Wire up: input → repeat_input → (loop body) → repeat_output → output
tree.links.new(input_node.outputs["Geometry"], repeat_input.inputs["Geometry"])
tree.links.new(repeat_output.outputs["Geometry"], output_node.inputs["Geometry"])
```

### Repeat Zone Properties

```python
import bpy

tree = bpy.data.node_groups["RepeatDemo"]

# Find repeat output node
repeat_output = None
for node in tree.nodes:
    if node.type == 'REPEAT_OUTPUT':
        repeat_output = node
        break

if repeat_output:
    # Access repeat items (loop-carried state sockets)
    for item in repeat_output.repeat_items:
        print(f"{item.name}: {item.socket_type}")

    # Add/remove loop state items
    repeat_output.repeat_items.new('NodeSocketInt', "Counter")
    # repeat_output.repeat_items.remove(item)
```

## Inline Shader Nodes API

The `inline_shader_nodes()` method on `Material`, `Light`, and `World` returns a flattened, simplified version of their node tree. This is critical for render engines that need to export shader graphs to external formats.

### `material.inline_shader_nodes()`

Called on the owner data-block (not the node tree). Returns an inlined `ShaderNodeTree` where:
- Node groups are expanded (flattened into the parent tree)
- Repeat zones are inlined
- Closures and bundles are resolved
- Reroute nodes are eliminated
- Muted nodes are removed

```python
import bpy

mat = bpy.data.materials["MyMaterial"]

# Get the inlined shader tree — called on the Material, not node_tree
inlined = mat.inline_shader_nodes()

if inlined:
    print(f"Inlined tree has {len(inlined.nodes)} nodes")
    for node in inlined.nodes:
        print(f"  {node.bl_idname}: {node.name}")
        for inp in node.inputs:
            if inp.is_linked:
                print(f"    ← {inp.name}")
            elif hasattr(inp, 'default_value'):
                print(f"    {inp.name} = {inp.default_value}")

    # The inlined tree is temporary — do not store persistent references
```

Also available on `Light` and `World`:
```python
light = bpy.data.lights["Light"]
inlined_light = light.inline_shader_nodes()

world = bpy.data.worlds["World"]
inlined_world = world.inline_shader_nodes()
```

### Render Engine Use Case

Render engines use `inline_shader_nodes()` to traverse materials without manually handling group recursion, closures, or repeat zones:

```python
import bpy

class MyRenderEngine(bpy.types.RenderEngine):
    bl_idname = "MY_RENDERER"
    bl_label = "My Renderer"
    bl_use_shading_nodes_custom = False

    def export_material(self, material):
        inlined = material.inline_shader_nodes()
        if inlined is None:
            return

        # Walk the inlined tree — no group recursion needed
        output_node = None
        for node in inlined.nodes:
            if node.type == 'OUTPUT_MATERIAL' and node.is_active_output:
                output_node = node
                break

        if output_node:
            surface_input = output_node.inputs.get("Surface")
            if surface_input and surface_input.is_linked:
                shader_node = surface_input.links[0].from_node
                self.export_shader_recursive(shader_node, inlined)

    def export_shader_recursive(self, node, tree):
        # Process node — all groups are already expanded
        print(f"Exporting: {node.bl_idname}")
        for inp in node.inputs:
            if inp.is_linked:
                upstream = inp.links[0].from_node
                self.export_shader_recursive(upstream, tree)
```

## Common Patterns

### Create a Parameterized Repeat Zone

```python
import bpy

tree = bpy.data.node_groups.new("SubdivideRepeat", 'GeometryNodeTree')

tree.interface.new_socket("Mesh", in_out='INPUT', socket_type='NodeSocketGeometry')
tree.interface.new_socket("Mesh", in_out='OUTPUT', socket_type='NodeSocketGeometry')
iterations = tree.interface.new_socket("Iterations", in_out='INPUT', socket_type='NodeSocketInt')
iterations.default_value = 3
iterations.min_value = 0
iterations.max_value = 10

# Build the repeat zone
repeat_in = tree.nodes.new('GeometryNodeRepeatInput')
repeat_out = tree.nodes.new('GeometryNodeRepeatOutput')
repeat_in.pair_with_output(repeat_out)

repeat_out.repeat_items.new('NodeSocketGeometry', "Geometry")

input_node = tree.nodes.new('NodeGroupInput')
output_node = tree.nodes.new('NodeGroupOutput')

# Add a subdivide node inside the loop
subdivide = tree.nodes.new('GeometryNodeSubdivideMesh')

# Layout
input_node.location = (-600, 0)
repeat_in.location = (-300, 0)
subdivide.location = (0, 0)
repeat_out.location = (300, 0)
output_node.location = (600, 0)

# Connect
tree.links.new(input_node.outputs["Mesh"], repeat_in.inputs["Geometry"])
tree.links.new(input_node.outputs["Iterations"], repeat_in.inputs["Iterations"])
tree.links.new(repeat_in.outputs["Geometry"], subdivide.inputs["Mesh"])
tree.links.new(subdivide.outputs["Mesh"], repeat_out.inputs["Geometry"])
tree.links.new(repeat_out.outputs["Geometry"], output_node.inputs["Mesh"])
```

### Inspect All Groups in a Material Tree

```python
import bpy

mat = bpy.data.materials["MyMaterial"]
tree = mat.node_tree

def list_groups_recursive(node_tree, depth=0):
    prefix = "  " * depth
    for node in node_tree.nodes:
        if node.type == 'GROUP' and node.node_tree:
            print(f"{prefix}Group: {node.node_tree.name}")
            # List interface
            for item in node.node_tree.interface.items_tree:
                if item.item_type == 'SOCKET':
                    print(f"{prefix}  {item.in_out}: {item.name} ({item.socket_type})")
            # Recurse into nested groups
            list_groups_recursive(node.node_tree, depth + 1)

list_groups_recursive(tree)
```

## Gotchas

1. **`inline_shader_nodes()` returns a temporary tree.** The returned tree is valid only for immediate traversal. Do not store references to its nodes across frames or operations — they may become invalid. Called on `Material`/`Light`/`World`, not on `node_tree`.

2. **Repeat zones require pairing.** `repeat_input.pair_with_output(repeat_output)` must be called to establish the zone. Without pairing, the nodes are disconnected and non-functional.

3. **Repeat zone state items.** Loop-carried state is defined on the `repeat_output` node via `repeat_items`. Both the input and output nodes automatically get matching sockets. The data flows: input → loop body → output → (next iteration) input.

4. **Bundle schema is implicit.** A bundle's fields are determined by what connections are made to the Combine Bundle node. There is no explicit schema definition — the structure is inferred from the graph.

5. **Closures have limited introspection.** You cannot inspect the contents of a closure from Python. The sub-graph is opaque — it is compiled and executed internally by the node system.

6. **Repeat zone iteration count.** The iteration count is set via the "Iterations" input on the Repeat Input node. It must be a non-negative integer. Very high iteration counts can cause long evaluation times.
