# Autoloads & Groups Reference

## Autoloads (Singletons)

Autoloads are nodes or scripts automatically loaded at the root of the scene tree before any other scene. They persist across scene changes and are globally accessible.

### Setup

Project → Project Settings → Globals → Autoload tab:
1. Select a script (`.gd`) or scene (`.tscn`)
2. Give it a name (e.g. `GameManager`)
3. Check "Enable"

The autoload is added as a child of `/root/`, above the current scene:
```
root
├── GameManager       ← autoload
├── AudioManager      ← autoload
├── EventBus          ← autoload
└── CurrentScene      ← the active scene
```

### Accessing Autoloads

```gdscript
# GDScript — direct name access (if autoload name is registered)
GameManager.score += 10
AudioManager.play_sfx(&"explosion")
EventBus.player_died.emit()

# Explicit path (always works)
get_node("/root/GameManager")

# From anywhere, including non-Node classes
Engine.get_singleton(&"GameManager")  # Only for engine singletons
# For autoloads, use the global name directly
```

### C# Autoload Access

```csharp
// Get by path
var gameManager = GetNode<GameManager>("/root/GameManager");

// Cache reference
private GameManager _gameManager;
public override void _Ready()
{
    _gameManager = GetNode<GameManager>("/root/GameManager");
}

// Static instance pattern (common in C#)
public partial class GameManager : Node
{
    public static GameManager Instance { get; private set; }

    public override void _EnterTree()
    {
        Instance = this;
    }
}
// Usage: GameManager.Instance.Score += 10;
```

### Common Autoload Types

#### Game Manager
```gdscript
# game_manager.gd
extends Node

var score: int = 0
var current_level: int = 1
var player_data: Dictionary = {}

func reset() -> void:
    score = 0
    current_level = 1
    player_data.clear()
```

#### Scene Transition Manager
```gdscript
# scene_manager.gd
extends Node

var current_scene: Node

func _ready() -> void:
    current_scene = get_tree().current_scene

func change_scene(path: String) -> void:
    _deferred_change.call_deferred(path)

func _deferred_change(path: String) -> void:
    current_scene.free()
    var packed: PackedScene = load(path)
    current_scene = packed.instantiate()
    get_tree().root.add_child(current_scene)
    get_tree().current_scene = current_scene
```

#### Event Bus
```gdscript
# event_bus.gd
extends Node

signal player_died
signal score_changed(new_score: int)
signal level_completed(level_id: int)
signal item_picked_up(item_id: String, count: int)
signal dialog_started(dialog_id: String)
signal dialog_ended
```

Usage:
```gdscript
# Emitter (player.gd)
func die() -> void:
    EventBus.player_died.emit()

# Listener (hud.gd)
func _ready() -> void:
    EventBus.player_died.connect(_on_player_died)

func _exit_tree() -> void:
    EventBus.player_died.disconnect(_on_player_died)
```

#### Audio Manager
```gdscript
# audio_manager.gd
extends Node

@onready var sfx_player: AudioStreamPlayer = $SFXPlayer
@onready var music_player: AudioStreamPlayer = $MusicPlayer

var sfx_library: Dictionary = {}

func _ready() -> void:
    sfx_library = {
        &"jump": preload("res://audio/sfx/jump.ogg"),
        &"hit": preload("res://audio/sfx/hit.ogg"),
        &"coin": preload("res://audio/sfx/coin.ogg"),
    }

func play_sfx(name: StringName) -> void:
    if name in sfx_library:
        sfx_player.stream = sfx_library[name]
        sfx_player.play()

func play_music(stream: AudioStream, fade_in: float = 0.5) -> void:
    music_player.stream = stream
    music_player.play()
```

### Autoload Ordering

Autoloads initialize top-to-bottom in the order listed in Project Settings. If `EventBus` depends on `GameManager`, put `GameManager` first.

Reorder by dragging in the Autoload tab.

### Autoload as Scene vs Script

| Script-only (.gd) | Scene (.tscn) |
|---|---|
| No children, no visual nodes | Can contain child nodes (AudioStreamPlayers, Timers, etc.) |
| Lighter weight | Full scene tree capability |
| Pure logic / data storage | Needs child nodes for functionality |

Use a scene when the autoload needs child nodes (audio players, timers). Use a script when it's pure data or logic.

### When to Use Autoloads

**Good uses**:
- Persistent game state (score, inventory, save data)
- Scene transition management
- Audio management (music crossfade, SFX pooling)
- Event bus for decoupled communication
- Settings / configuration

**Avoid for**:
- Data that's specific to one scene (put it on a node in that scene)
- Systems that only a few nodes use (inject via `@export` instead)
- Everything (autoload overuse creates hidden global state — hard to debug)

**Rule of thumb**: If removing the autoload would break more than half your scenes, it's probably a good autoload. If only one scene uses it, it shouldn't be an autoload.

## Groups

Groups are tags applied to nodes. A node can belong to any number of groups. Groups are useful for batch operations and finding nodes by role rather than path.

### Adding to Groups

**In Editor**: Node dock → Groups tab → type name → Add

**In Code**:
```gdscript
func _ready() -> void:
    add_to_group(&"enemies")
    add_to_group(&"damageable")
    add_to_group(&"save_target")
```

### Querying Groups

```gdscript
# Get all nodes in group
var enemies: Array[Node] = get_tree().get_nodes_in_group(&"enemies")

# Get first node in group (useful for unique nodes like player)
var player: CharacterBody2D = get_tree().get_first_node_in_group(&"player")

# Check membership
if node.is_in_group(&"enemies"):
    node.take_damage(10)

# Count
var count: int = get_tree().get_nodes_in_group(&"enemies").size()
```

### Calling Methods on Groups

```gdscript
# Call a method on all nodes in group
get_tree().call_group(&"enemies", &"alert", player.position)

# Call with flags
get_tree().call_group_flags(
    SceneTree.GROUP_CALL_DEFERRED,  # Deferred call
    &"enemies",
    &"retreat"
)

# Notify all in group
get_tree().notify_group(&"enemies", NOTIFICATION_PAUSED)

# Set property on all in group
get_tree().set_group(&"enemies", &"speed", 0.0)
```

### Group Call Flags

```gdscript
SceneTree.GROUP_CALL_DEFAULT  # 0 — Normal call
SceneTree.GROUP_CALL_DEFERRED # 1 — Call at end of frame
SceneTree.GROUP_CALL_REVERSE  # 2 — Reverse order
# Combine: GROUP_CALL_DEFERRED | GROUP_CALL_REVERSE
```

### Removing from Groups

```gdscript
remove_from_group(&"enemies")
```

### Common Group Patterns

#### Damage System
```gdscript
# Apply damage to everything in an area
func explode(radius: float) -> void:
    for body in $ExplosionArea.get_overlapping_bodies():
        if body.is_in_group(&"damageable"):
            var distance: float = global_position.distance_to(body.global_position)
            var falloff: float = 1.0 - clampf(distance / radius, 0.0, 1.0)
            body.take_damage(max_damage * falloff)
```

#### Save System
```gdscript
# Collect save data from all saveable nodes
func collect_save_data() -> Array[Dictionary]:
    var data: Array[Dictionary] = []
    for node in get_tree().get_nodes_in_group(&"save_target"):
        data.append(node.get_save_data())
    return data

func apply_save_data(data: Array[Dictionary]) -> void:
    for entry in data:
        # Nodes register themselves in group with unique ID
        pass
```

#### Pause System
```gdscript
# Freeze all enemies
func freeze_enemies() -> void:
    get_tree().call_group(&"enemies", &"set_frozen", true)

func unfreeze_enemies() -> void:
    get_tree().call_group(&"enemies", &"set_frozen", false)
```

#### Player Reference
```gdscript
# Player adds itself to "player" group in _ready()
# Enemies find the player:
func _physics_process(delta: float) -> void:
    var player := get_tree().get_first_node_in_group(&"player")
    if player:
        var direction := global_position.direction_to(player.global_position)
        velocity = direction * speed
```

### Groups vs Signals vs Direct References

| Mechanism | When to Use |
|---|---|
| **Groups** | Batch operations on many similar nodes ("damage all enemies", "save all") |
| **Signals** | One-to-many notifications where receivers self-subscribe |
| **Direct reference** (`@export`, `$`, `%`) | Known, specific node that must exist |
| **Event bus** | Decoupled game-wide events across unrelated systems |

## Unique Nodes (%)

An alternative to groups for single well-known nodes in a scene. Mark a node as unique in the editor (right-click → "Access as Unique Name"), then reference with `%`:

```gdscript
# Works regardless of where HealthBar is in the tree hierarchy
@onready var health_bar: ProgressBar = %HealthBar
```

Unique nodes are scoped to the scene they're defined in — they don't leak across scene boundaries. Use them for nodes you'd otherwise put in a one-member group or access via a brittle long path.

## Persistent Nodes Across Scenes

Besides autoloads, you can manually persist nodes across scene changes:

```gdscript
# In an autoload scene manager:
func change_scene_keep_node(path: String, node_to_keep: Node) -> void:
    # Reparent to root before scene change
    node_to_keep.get_parent().remove_child(node_to_keep)
    get_tree().root.add_child(node_to_keep)
    
    # Change scene
    get_tree().change_scene_to_file(path)
    
    # After scene loads, reparent back
    # (must be deferred)
    _reparent_after_load.call_deferred(node_to_keep, path)
```

This is fragile. Prefer autoloads for truly persistent state.

## C# Equivalents

```csharp
// Groups
AddToGroup("enemies");
RemoveFromGroup("enemies");
IsInGroup("enemies");
GetTree().GetNodesInGroup("enemies");
GetTree().GetFirstNodeInGroup("player");
GetTree().CallGroup("enemies", "Alert", position);

// Autoload access
var manager = GetNode<GameManager>("/root/GameManager");
```
