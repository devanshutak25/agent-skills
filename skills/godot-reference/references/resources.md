# Resources

## What Is a Resource?

A Resource is Godot's base class for serializable data containers. Everything that can be saved to disk — textures, meshes, audio, materials, scripts, scenes — is a Resource. You can create custom resources for game data like items, stats, abilities, and configuration.

Resources are:
- **Serializable**: Save to `.tres` (text) or `.res` (binary) files
- **Shareable**: Multiple nodes can reference the same resource instance
- **Editable**: Exported properties appear in the Inspector
- **Lightweight**: No scene tree overhead (unlike nodes)

## Custom Resources

### Definition
```gdscript
# item_data.gd
class_name ItemData
extends Resource

@export var name: String = ""
@export var description: String = ""
@export var icon: Texture2D
@export var max_stack: int = 1
@export var value: int = 0
@export_enum("Common", "Rare", "Epic", "Legendary") var rarity: int = 0

func get_sell_price() -> int:
    return value / 2
```

### Creating Instances

**In editor**: Right-click in FileSystem → New Resource → search for `ItemData` → save as `.tres`.

**In code**:
```gdscript
var item := ItemData.new()
item.name = "Health Potion"
item.value = 50
```

### Using in Other Scripts
```gdscript
# inventory_slot.gd
extends Control

@export var item: ItemData  # Drag .tres file in Inspector

func _ready() -> void:
    if item:
        $Icon.texture = item.icon
        $Label.text = item.name
```

## Sub-Resources

Resources can contain other resources:

```gdscript
# weapon_data.gd
class_name WeaponData
extends Resource

@export var name: String = ""
@export var damage: int = 10
@export var projectile: ProjectileData  # Another custom resource
@export var effects: Array[StatusEffect] = []
```

When saved as `.tres`, sub-resources can be either:
- **Inline** (embedded in the parent `.tres` file)
- **External** (separate `.tres` files, referenced by path)

External sub-resources are reusable across multiple parent resources. Create them as separate files and assign them via the Inspector.

## Shared vs Unique Resources

**Resources are shared by default**. When you `load()` or `preload()` a resource, Godot returns the cached instance. Multiple nodes referencing the same `.tres` file share the same object in memory.

```gdscript
# These return the SAME instance:
var a: ItemData = load("res://items/sword.tres")
var b: ItemData = load("res://items/sword.tres")
# a == b → true (same object)
```

### When Sharing Causes Bugs

If one node modifies a shared resource at runtime, all nodes see the change:

```gdscript
# BUG: All enemies share the same stats resource
@export var stats: EnemyStats

func take_damage(amount: int) -> void:
    stats.health -= amount  # Modifies the shared instance!
```

### Fix: Duplicate at Runtime
```gdscript
func _ready() -> void:
    stats = stats.duplicate()  # Now this node has its own copy
```

### Fix: Load Without Cache
```gdscript
var unique_stats: EnemyStats = ResourceLoader.load(
    "res://data/enemy_stats.tres", "", ResourceLoader.CACHE_MODE_IGNORE
)
```

## Saving and Loading Resources

### Save
```gdscript
var save_data := PlayerSaveData.new()
save_data.level = player.level
save_data.position = player.global_position

# Save to user:// (writable at runtime)
ResourceSaver.save(save_data, "user://savegame.tres")

# Binary format (smaller, faster, not human-readable)
ResourceSaver.save(save_data, "user://savegame.res")
```

### Load
```gdscript
func load_game() -> void:
    var path := "user://savegame.tres"
    if not ResourceLoader.exists(path):
        push_warning("No save file found")
        return

    var save_data: PlayerSaveData = load(path)
    player.level = save_data.level
    player.global_position = save_data.position
```

**Important**: `res://` is read-only in exported builds. Always save user data to `user://`.

## Resource UID

Godot assigns a UID (Unique Identifier) to every resource file. UIDs survive file renames/moves — references stay valid even if the path changes.

```gdscript
# Get UID for a resource path
var uid: int = ResourceLoader.get_resource_uid("res://items/sword.tres")

# Load by UID
var item: Resource = load("uid://abc123def456")
```

UIDs are stored in `.uid` cache files. They're managed automatically. Don't rely on UIDs at runtime in exported builds — there have been historical bugs with `get_resource_uid()` returning -1 in exports.

## Resource Formats

| Extension | Format | Use Case |
|---|---|---|
| `.tres` | Text | Version control friendly, human-readable |
| `.res` | Binary | Smaller, faster load, not diffable |
| `.tscn` | Text scene | Scene resource (text) |
| `.scn` | Binary scene | Scene resource (binary) |

Use `.tres` during development (diffable in git). Use `.res` for shipped user data or large datasets where load speed matters.

## Threaded Resource Loading

For large resources, load in the background to avoid frame drops:

```gdscript
func load_level_async(path: String) -> void:
    ResourceLoader.load_threaded_request(path)

func _process(_delta: float) -> void:
    var status: ResourceLoader.ThreadLoadStatus = ResourceLoader.load_threaded_get_status(_loading_path)

    match status:
        ResourceLoader.THREAD_LOAD_IN_PROGRESS:
            # Optional: check progress
            var progress: Array = []
            ResourceLoader.load_threaded_get_status(_loading_path, progress)
            loading_bar.value = progress[0]  # 0.0 to 1.0

        ResourceLoader.THREAD_LOAD_LOADED:
            var resource: Resource = ResourceLoader.load_threaded_get(_loading_path)
            _on_level_loaded(resource)

        ResourceLoader.THREAD_LOAD_FAILED:
            push_error("Failed to load: ", _loading_path)
```

## preload vs load

| | `preload()` | `load()` |
|---|---|---|
| When | Compile time | Runtime |
| Blocking | No (already loaded) | Yes (loads immediately) |
| Path | Must be string literal | Can be variable |
| Best for | Small, always-needed resources | Optional, large, or dynamic resources |

```gdscript
# preload — resolved at parse time, always available
const BULLET_SCENE: PackedScene = preload("res://scenes/bullet.tscn")

# load — resolved at runtime
var level: PackedScene = load("res://levels/level_%d.tscn" % level_number)
```

## Security Warning

Resource files (`.tres`, `.tscn`) can contain embedded scripts. Loading a resource from an untrusted source can execute arbitrary code. For user-generated content or modding:

- Use `FileAccess.store_var()` / `get_var()` (safe binary serialization, no code execution)
- Use JSON for data exchange
- Use a safe resource loader addon that strips scripts before loading
