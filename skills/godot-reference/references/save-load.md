# Save & Load Patterns

## Approach Comparison

| Method | Types | Human-Readable | Security | Effort |
|---|---|---|---|---|
| **Resource save** | All Godot types | `.tres` yes, `.res` no | Can execute code | Lowest |
| **FileAccess.store_var** | All Godot types | No (binary) | Safe (no code exec) | Low |
| **ConfigFile** | Basic types | Yes (INI-like) | Can execute code via str2var | Low |
| **JSON** | Strings, numbers, arrays, dicts | Yes | Safe | Medium (manual type conversion) |
| **var2str / str2var** | All Godot types | Yes (text) | Can execute code | Low |

## Method 1: Resource-Based Save (Recommended for Most Games)

Simplest approach. Define a save resource, use `ResourceSaver` / `ResourceLoader`:

```gdscript
# save_game.gd
class_name SaveGame
extends Resource

@export var player_position := Vector2.ZERO
@export var player_health: int = 100
@export var level: int = 1
@export var inventory: Array[String] = []
@export var play_time: float = 0.0
@export var timestamp: String = ""
```

### Saving
```gdscript
const SAVE_PATH := "user://savegame.tres"

func save_game() -> void:
    var save := SaveGame.new()
    save.player_position = player.global_position
    save.player_health = player.health
    save.level = current_level
    save.inventory = player.inventory.duplicate()
    save.play_time = total_play_time
    save.timestamp = Time.get_datetime_string_from_system()

    var error: Error = ResourceSaver.save(save, SAVE_PATH)
    if error != OK:
        push_error("Failed to save: ", error)
```

### Loading
```gdscript
func load_game() -> bool:
    if not ResourceLoader.exists(SAVE_PATH):
        return false

    var save: SaveGame = load(SAVE_PATH)
    if save == null:
        return false

    player.global_position = save.player_position
    player.health = save.player_health
    change_level(save.level)
    player.inventory = save.inventory
    total_play_time = save.play_time
    return true
```

### Multiple Save Slots
```gdscript
func get_save_path(slot: int) -> String:
    return "user://save_slot_%d.tres" % slot

func has_save(slot: int) -> bool:
    return ResourceLoader.exists(get_save_path(slot))
```

## Method 2: FileAccess.store_var (Safe Binary)

Best when security matters (modding, user content). Cannot execute code.

```gdscript
const SAVE_PATH := "user://savegame.dat"

func save_game() -> void:
    var data := {
        "position": player.global_position,
        "health": player.health,
        "level": current_level,
        "inventory": player.inventory,
    }
    var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
    if file == null:
        push_error("Cannot open save file: ", FileAccess.get_open_error())
        return
    file.store_var(data)
    # file closes automatically when reference is lost

func load_game() -> bool:
    if not FileAccess.file_exists(SAVE_PATH):
        return false
    var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
    if file == null:
        return false
    var data: Dictionary = file.get_var()
    player.global_position = data.get("position", Vector2.ZERO)
    player.health = data.get("health", 100)
    change_level(data.get("level", 1))
    player.inventory = data.get("inventory", [])
    return true
```

`store_var` / `get_var` use Godot's binary serialization. Supports Vector2, Vector3, Color, and all built-in types natively.

**Important**: Pass `false` to `get_var(false)` and `store_var(data, false)` (default) to prevent object serialization. Passing `true` allows objects (including scripts) and is unsafe with untrusted data.

## Method 3: ConfigFile (Settings / Preferences)

INI-style format. Best for user settings, not complex game state:

```gdscript
const SETTINGS_PATH := "user://settings.cfg"

func save_settings() -> void:
    var config := ConfigFile.new()
    config.set_value("video", "fullscreen", is_fullscreen)
    config.set_value("video", "resolution", Vector2i(1920, 1080))
    config.set_value("video", "vsync", true)
    config.set_value("audio", "master_volume", 0.8)
    config.set_value("audio", "music_volume", 0.6)
    config.set_value("controls", "mouse_sensitivity", 2.5)
    config.save(SETTINGS_PATH)

func load_settings() -> void:
    var config := ConfigFile.new()
    var error := config.load(SETTINGS_PATH)
    if error != OK:
        return  # Use defaults

    is_fullscreen = config.get_value("video", "fullscreen", false)
    resolution = config.get_value("video", "resolution", Vector2i(1920, 1080))
    master_volume = config.get_value("audio", "master_volume", 0.8)
```

The third argument to `get_value()` is the default if the key doesn't exist.

### File Format
```ini
[video]
fullscreen=false
resolution=Vector2i(1920, 1080)
vsync=true

[audio]
master_volume=0.8
```

## Method 4: JSON (External Interop)

Use when exchanging data with web APIs, external tools, or when human-editability matters more than type safety.

### Saving
```gdscript
func save_json(path: String, data: Dictionary) -> void:
    var json_string: String = JSON.stringify(data, "\t")  # Pretty-print
    var file := FileAccess.open(path, FileAccess.WRITE)
    if file:
        file.store_string(json_string)

# Convert Godot types manually:
var save_data := {
    "position": {"x": player.global_position.x, "y": player.global_position.y},
    "health": player.health,
    "items": player.inventory,
}
save_json("user://save.json", save_data)
```

### Loading
```gdscript
func load_json(path: String) -> Variant:
    if not FileAccess.file_exists(path):
        return null
    var file := FileAccess.open(path, FileAccess.READ)
    if file == null:
        return null
    var content: String = file.get_as_text()
    var json := JSON.new()
    var error: Error = json.parse(content)
    if error != OK:
        push_error("JSON parse error at line %d: %s" % [json.get_error_line(), json.get_error_message()])
        return null
    return json.data
```

### JSON Limitations
- No native `Vector2`, `Color`, etc. — manual conversion required
- Numbers are always `float` (JavaScript spec) — cast to `int` when needed
- No comments
- No binary data

## Group-Based Save (Complex Scenes)

For games with many saveable objects, use the "Persist" group pattern:

```gdscript
# Any node that needs saving adds itself to "persist" group
# and implements save_data() and load_data()

func save_all() -> void:
    var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
    var persist_nodes: Array[Node] = get_tree().get_nodes_in_group(&"persist")
    for node: Node in persist_nodes:
        if not node.has_method("save_data"):
            continue
        var data: Dictionary = node.save_data()
        data["_scene_path"] = node.scene_file_path
        data["_parent_path"] = node.get_parent().get_path()
        data["_node_name"] = node.name
        file.store_line(JSON.stringify(data))

func load_all() -> void:
    if not FileAccess.file_exists(SAVE_PATH):
        return

    # Remove existing persist nodes
    for node: Node in get_tree().get_nodes_in_group(&"persist"):
        node.queue_free()

    var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
    while not file.eof_reached():
        var line: String = file.get_line().strip_edges()
        if line.is_empty():
            continue
        var data: Dictionary = JSON.parse_string(line)
        if data == null:
            continue

        var scene: PackedScene = load(data["_scene_path"])
        var node: Node = scene.instantiate()
        get_node(data["_parent_path"]).add_child(node)
        node.name = data["_node_name"]
        if node.has_method("load_data"):
            node.load_data(data)
```

```gdscript
# On a saveable node:
func _ready() -> void:
    add_to_group(&"persist")

func save_data() -> Dictionary:
    return {
        "position_x": global_position.x,
        "position_y": global_position.y,
        "health": health,
    }

func load_data(data: Dictionary) -> void:
    global_position = Vector2(data["position_x"], data["position_y"])
    health = data["health"]
```

## Encrypted Saves

```gdscript
# Save encrypted
var file := FileAccess.open_encrypted_with_pass(SAVE_PATH, FileAccess.WRITE, "my_secret_key")
file.store_var(save_data)

# Load encrypted
var file := FileAccess.open_encrypted_with_pass(SAVE_PATH, FileAccess.READ, "my_secret_key")
var data := file.get_var()
```

**Note**: Hardcoded keys in GDScript can be extracted from exports. This deters casual tampering but is not cryptographically secure against determined reverse engineering.

## Best Practice Summary

- **Simple game state** → Resource save (`.tres`)
- **User settings** → ConfigFile (`.cfg`)
- **Security-sensitive** → `FileAccess.store_var` (binary, no code exec)
- **External interop** → JSON
- **Complex scenes** → Group-based pattern with JSON lines
