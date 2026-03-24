# Core Classes Quick Reference

## Object

Base class for all non-RefCounted Godot objects. Provides signal system, metadata, property access.

**Key methods**:
- `set(property, value)` / `get(property)` — dynamic property access
- `call(method, ...)` / `call_deferred(method, ...)` — dynamic method calls
- `connect(signal, callable)` / `disconnect(signal, callable)` — signal management
- `emit_signal(signal, ...)` — emit signals
- `set_meta(key, value)` / `get_meta(key)` — arbitrary metadata storage
- `is_class(name)` — runtime type check by string
- `get_class()` — returns class name as String
- `has_method(name)` / `has_signal(name)` — introspection
- `notification(what)` — send notification to object
- `free()` — immediate destruction (dangerous, prefer `queue_free()` on Nodes)

**Pitfall**: `free()` is immediate — any references become invalid instantly. Use `is_instance_valid(obj)` to check.

## RefCounted

Base class for reference-counted objects. Automatically freed when no references remain.

**Subclasses**: Resource, all custom `extends RefCounted` classes.

**Key difference from Object**: Cannot use `free()` — lifecycle managed by reference counting. Don't store circular references (causes leaks).

## Node

Base class for all scene tree objects. Inherits Object.

**Key properties**:
- `name: StringName` — node name in tree
- `owner: Node` — scene owner (for serialization)
- `unique_name_in_owner: bool` — enables `%NodeName` access
- `process_mode: ProcessMode` — INHERIT, PAUSABLE, WHEN_PAUSED, ALWAYS, DISABLED
- `process_priority: int` — lower = processed first
- `editor_description: String` — documentation comment visible in editor

**Lifecycle methods** (override these):
- `_init()` — constructor
- `_enter_tree()` — added to scene tree
- `_ready()` — node and all children are ready
- `_process(delta)` — every frame
- `_physics_process(delta)` — every physics tick
- `_input(event)` — input events
- `_unhandled_input(event)` — unhandled input
- `_unhandled_key_input(event)` — unhandled key input
- `_exit_tree()` — removed from scene tree
- `_notification(what)` — engine notifications

**Key methods**:
- `get_node(path)` / `get_node_or_null(path)` — find child by path
- `$NodeName` — shorthand for `get_node("NodeName")`
- `%UniqueName` — shorthand for unique-named node lookup
- `find_child(pattern, recursive, owned)` — search children by name pattern
- `add_child(node)` / `remove_child(node)` — tree manipulation
- `queue_free()` — safe deferred destruction
- `reparent(new_parent)` — move to different parent
- `get_parent()` / `get_children()` — tree navigation
- `get_tree()` — access SceneTree
- `is_in_group(name)` / `add_to_group(name)` — group membership
- `set_process(enabled)` / `set_physics_process(enabled)` — toggle processing
- `propagate_call(method, args)` — call method on all descendants
- `create_tween()` — create a Tween bound to this node

**Unique Node IDs (4.6+)**: Nodes now have internal IDs. References survive renames and hierarchy changes.

## Node2D

Extends CanvasItem. Base for all 2D game objects.

**Key properties**: `position`, `rotation`, `scale`, `global_position`, `global_rotation`, `global_scale`, `transform`, `global_transform`, `z_index`, `z_as_relative`

**Key methods**: `look_at(point)`, `to_local(global_point)`, `to_global(local_point)`, `get_relative_transform_to_parent(parent)`

## Node3D

Extends Node. Base for all 3D game objects.

**Key properties**: `position`, `rotation`, `rotation_degrees`, `scale`, `global_position`, `global_rotation`, `basis`, `transform`, `global_transform`, `visible`, `top_level`

**Key methods**: `look_at(target, up)`, `to_local(global_point)`, `to_global(local_point)`, `rotate(axis, angle)`, `rotate_y(angle)`, `translate(offset)`

## SceneTree

Manages the tree of nodes. Accessed via `get_tree()`.

**Key properties**:
- `root: Window` — root viewport
- `current_scene: Node` — active main scene
- `paused: bool` — pause state
- `debug_collisions_hint: bool` — collision debug draw

**Key methods**:
- `change_scene_to_file(path)` — switch scene by path
- `change_scene_to_packed(scene)` — switch scene by PackedScene
- `reload_current_scene()` — restart current scene
- `create_timer(seconds)` — returns SceneTreeTimer (await its `timeout`)
- `get_nodes_in_group(name)` — all nodes in a group
- `call_group(name, method, ...)` — call method on all group members
- `set_group(name, property, value)` — set property on all group members
- `quit(exit_code)` — exit the application

**Signals**: `process_frame`, `physics_frame`, `node_added`, `node_removed`, `tree_changed`

## Resource

Base class for all data objects that can be saved/loaded.

**Key properties**:
- `resource_path: String` — file path (empty for sub-resources)
- `resource_name: String` — optional display name

**Key methods**:
- `duplicate(subresources)` — create a copy
- `duplicate_deep()` — **(4.5+)** deep clone including nested sub-resources (more reliable than `duplicate(true)`)
- `emit_changed()` — notify dependents of modification

**Usage**: Extend for custom data types (weapon stats, inventory items, config).
Resources are shared by default — `load("res://data.tres")` returns the same instance.
Use `duplicate()` for runtime modification.

## PackedScene

Serialized scene that can be instantiated.

```gdscript
var scene: PackedScene = preload("res://scenes/enemy.tscn")
var instance: Node = scene.instantiate()
get_parent().add_child(instance)
```

**Key methods**: `instantiate()`, `can_instantiate()`, `get_state()`

## Viewport / Window

Viewport is the base rendering target. Window extends Viewport for OS windows.

**Key properties**: `size`, `canvas_transform`, `world_2d`, `world_3d`, `transparent_bg`, `msaa_2d`, `msaa_3d`

**SubViewport**: Off-screen rendering target. Use for render-to-texture, minimaps, portals.

## MainLoop

Rarely used directly — SceneTree is the default MainLoop. Can be replaced for custom game loops without the scene system.

## Callable

Represents a method reference. Created from method references or lambdas.

```gdscript
var cb: Callable = my_method         # Method reference
var cb2: Callable = func(): print("lambda")  # Lambda
cb.call()                            # Invoke
cb.bind(arg1, arg2)                 # Partial application
cb.unbind(count)                    # Remove trailing args
```

## Signal (as first-class object)

```gdscript
signal health_changed(new_health: int)

# As object
health_changed.connect(callback)
health_changed.disconnect(callback)
health_changed.emit(50)
health_changed.is_connected(callback)
var connections: Array = health_changed.get_connections()
```

## StringName

Interned string — faster comparison than String. Use for identifiers:
```gdscript
var action: StringName = &"jump"
Input.is_action_pressed(&"jump")
```

## NodePath

Path to a node or property:
```gdscript
var path: NodePath = ^"Player/Sprite2D"
var prop_path: NodePath = ^"position:x"
get_node(path)
```
