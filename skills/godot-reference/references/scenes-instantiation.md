# Scenes & Instantiation Reference

## Scene Fundamentals

A scene is a reusable tree of nodes saved as a `.tscn` (text) or `.scn` (binary) file. Every `.tscn` file is a `PackedScene` resource.

Core concepts:
- **Scene = reusable template** — a saved node tree that can be instantiated multiple times
- **Instance = live copy** — a runtime clone of a scene in the active tree
- **Scene composition** — scenes can contain instances of other scenes, forming nested hierarchies

## Creating Nodes from Code

```gdscript
# Create individual nodes
var sprite := Sprite2D.new()
sprite.texture = preload("res://icon.svg")
sprite.position = Vector2(100, 100)
add_child(sprite)

# Create with a name
var timer := Timer.new()
timer.name = "CooldownTimer"
timer.wait_time = 2.0
timer.one_shot = true
add_child(timer)
timer.timeout.connect(_on_cooldown_finished)
timer.start()
```

## Instantiating Scenes

### preload (Compile-time)
```gdscript
# Resolved at compile time — must be a constant string literal
const BulletScene: PackedScene = preload("res://scenes/bullet.tscn")
const EnemyScene: PackedScene = preload("res://scenes/enemy.tscn")

func shoot() -> void:
    var bullet: Bullet = BulletScene.instantiate()
    bullet.position = muzzle.global_position
    bullet.rotation = muzzle.global_rotation
    # Add to scene tree — NOT as child of the gun (or it moves with gun)
    get_tree().current_scene.add_child(bullet)
```

### load (Runtime)
```gdscript
# Resolved at runtime — can use variable paths
func spawn_enemy(type: String) -> void:
    var scene: PackedScene = load("res://scenes/enemies/" + type + ".tscn")
    var enemy := scene.instantiate()
    add_child(enemy)
```

### Typed Instantiation
```gdscript
# Untyped — returns Node
var node: Node = scene.instantiate()

# Typed — returns the expected type (errors if wrong)
var enemy: Enemy = scene.instantiate() as Enemy

# GDScript shorthand — if root node has class_name
var bullet: Bullet = BulletScene.instantiate()
```

### C# Instantiation
```csharp
// No preload in C# — always runtime load
private PackedScene _bulletScene = GD.Load<PackedScene>("res://scenes/bullet.tscn");

public void Shoot()
{
    var bullet = _bulletScene.Instantiate<Bullet>();
    bullet.Position = _muzzle.GlobalPosition;
    bullet.Rotation = _muzzle.GlobalRotation;
    GetTree().CurrentScene.AddChild(bullet);
}
```

## Adding Children

```gdscript
# Basic add
parent.add_child(child)

# Add at specific index (0 = first child)
parent.add_child(child)
parent.move_child(child, 0)

# Add with legible name (deduplicates if name exists)
parent.add_child(child, true)  # force_readable_name

# Deferred add (safe during processing)
parent.add_child.call_deferred(child)
```

### Where to Add

A common question: where in the tree should spawned nodes go?

```gdscript
# As child of current node — moves/transforms with parent
add_child(bullet)

# As child of scene root — independent of parent transform
get_tree().current_scene.add_child(bullet)

# As sibling of current node
get_parent().add_child(bullet)

# Under a dedicated container node
$ProjectileContainer.add_child(bullet)
# Keeps tree organized, easy to clear all: 
# for c in $ProjectileContainer.get_children(): c.queue_free()
```

**Pitfall**: Adding a projectile as child of a rotating gun makes the projectile rotate with the gun. Add to scene root or a container for independent movement.

## Removing and Freeing Nodes

```gdscript
# Remove from tree but keep in memory (can re-add later)
parent.remove_child(child)

# Remove and schedule for deletion at end of frame (SAFE)
child.queue_free()

# Immediate deletion (DANGEROUS — can crash if referenced later this frame)
child.free()

# Check if an object reference is still valid
if is_instance_valid(node):
    node.do_something()
```

**Rule**: Always use `queue_free()` unless you have a specific reason for `free()`. It's safe to call `queue_free()` on a node that's already queued.

## Scene Transitions

### Simple Scene Change
```gdscript
# Replace entire scene tree (current scene freed)
get_tree().change_scene_to_file("res://scenes/main_menu.tscn")

# With a preloaded/loaded PackedScene
get_tree().change_scene_to_packed(next_scene)
```

**Pitfall**: `change_scene_to_file` happens at end of frame. Any code after the call still executes in the current frame.

### Manual Scene Change (More Control)
```gdscript
func goto_scene(path: String) -> void:
    # Defer to avoid issues with current scene code still running
    _change_scene.call_deferred(path)

func _change_scene(path: String) -> void:
    # Free current scene
    get_tree().current_scene.free()
    
    # Load and instance new scene
    var new_scene: PackedScene = load(path)
    var instance := new_scene.instantiate()
    
    # Add to tree
    get_tree().root.add_child(instance)
    get_tree().current_scene = instance
```

### Async Scene Loading
```gdscript
func load_scene_async(path: String) -> void:
    # Start background loading
    ResourceLoader.load_threaded_request(path)
    
    # Poll until done (show loading screen)
    while true:
        var progress: Array = []
        var status := ResourceLoader.load_threaded_get_status(path, progress)
        
        match status:
            ResourceLoader.THREAD_LOAD_IN_PROGRESS:
                loading_bar.value = progress[0] * 100.0
                await get_tree().process_frame
            ResourceLoader.THREAD_LOAD_LOADED:
                var scene: PackedScene = ResourceLoader.load_threaded_get(path)
                get_tree().change_scene_to_packed(scene)
                return
            _:
                push_error("Failed to load: " + path)
                return
```

## Node References

### $ Shorthand (NodePath)
```gdscript
# These are equivalent:
$Sprite2D
get_node("Sprite2D")

# Nested paths
$UI/HealthBar/Label

# Parent
$".."
get_parent()

# Unique nodes (% prefix) — scene-unique, survives restructuring
%HealthBar                    # Searches anywhere in the owner's tree
get_node("%HealthBar")
```

### Unique Nodes (%)
Mark a node as "unique in scene" (right-click node → "Access as Unique Name" in editor). Then reference with `%`:

```gdscript
@onready var health_bar: ProgressBar = %HealthBar
```

Advantages over `$` paths:
- Path-independent — moving the node in the hierarchy doesn't break the reference
- Searches within the scene owner's tree
- Clear intent that this is a "well-known" node

### Finding Nodes

```gdscript
# By group
var enemies: Array[Node] = get_tree().get_nodes_in_group(&"enemies")

# First in group
var player := get_tree().get_first_node_in_group(&"player")

# By type (searches children recursively)
func find_child_of_type(parent: Node, type: String) -> Node:
    for child in parent.get_children():
        if child.is_class(type):
            return child
    return null

# find_child (searches by name pattern)
var label := find_child("ScoreLabel")         # Exact name
var label := find_child("Score*")             # Wildcard
var label := find_child("*Label", true, false) # Recursive, not owned
```

## Owner Property

`owner` tracks which node "owns" a subtree for scene serialization:
- When saving a `.tscn`, only nodes whose `owner` is the scene root are saved
- Nodes added via code have `owner = null` by default — they won't be saved
- To persist dynamically added nodes, set their owner:

```gdscript
var child := Node2D.new()
add_child(child)
child.owner = get_tree().edited_scene_root  # For @tool scripts
child.owner = owner                          # For runtime persistence
```

## PackedScene.pack() — Saving Scenes from Code

```gdscript
func save_level() -> void:
    var scene := PackedScene.new()
    var result := scene.pack(level_root)
    if result == OK:
        ResourceSaver.save(scene, "user://saved_level.tscn")
```

Only nodes with `owner` set to the packed node (or itself) are included.

## Common Patterns

### Factory Function
```gdscript
const BulletScene: PackedScene = preload("res://scenes/bullet.tscn")

static func create_bullet(pos: Vector2, dir: Vector2, speed: float) -> Bullet:
    var bullet: Bullet = BulletScene.instantiate()
    bullet.position = pos
    bullet.direction = dir
    bullet.speed = speed
    return bullet
    # Caller is responsible for add_child()
```

### Scene as Configuration
Use exported PackedScene references to make spawning data-driven:
```gdscript
@export var projectile_scene: PackedScene  # Assign in Inspector
@export var spawn_count: int = 5

func spawn_wave() -> void:
    for i in spawn_count:
        var instance := projectile_scene.instantiate()
        instance.position = get_spawn_position(i)
        add_child(instance)
```

### Reparenting Nodes
```gdscript
func reparent_node(node: Node, new_parent: Node) -> void:
    # Godot 4 built-in:
    node.reparent(new_parent)
    # Preserves global transform by default
    # Pass false to keep local transform: node.reparent(new_parent, false)
```

## C# Equivalents

```csharp
// Instantiation
var scene = GD.Load<PackedScene>("res://scene.tscn");
var instance = scene.Instantiate<MyNode>();
AddChild(instance);

// Scene change
GetTree().ChangeSceneToFile("res://main.tscn");
GetTree().ChangeSceneToPacked(packedScene);

// Node references
var sprite = GetNode<Sprite2D>("Sprite2D");
var healthBar = GetNode<ProgressBar>("%HealthBar");

// Removing
child.QueueFree();
RemoveChild(child);
```
