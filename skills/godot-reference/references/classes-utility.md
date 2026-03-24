# Utility Classes Quick Reference

## Timer

Fires a signal after a delay. Attach as a child node or create in code.

```gdscript
# As node
@onready var _timer: Timer = $Timer
_timer.timeout.connect(_on_timeout)
_timer.start(2.0)

# Inline (one-shot)
await get_tree().create_timer(1.5).timeout
```

**Key properties**: `wait_time`, `one_shot`, `autostart`, `paused`, `time_left`
**Signal**: `timeout`

## Tween

Animates properties over time. Not a node — created via `create_tween()`.

```gdscript
var tween: Tween = create_tween()
tween.tween_property($Sprite, "modulate:a", 0.0, 1.0)
tween.tween_callback(queue_free)
```

**Key methods**:
- `tween_property(object, property, final_val, duration)` — animate a property
- `tween_interval(time)` — pause between steps
- `tween_callback(callable)` — call a function
- `tween_method(callable, from, to, duration)` — animate a value via callback
- `set_ease(ease_type)` / `set_trans(trans_type)` — easing/transition
- `set_parallel()` — next tweener runs simultaneously
- `set_loops(count)` — repeat (0 = infinite)
- `chain()` — switch back to sequential after parallel
- `stop()` / `kill()` / `pause()` / `play()`

**Signals**: `finished`, `step_finished(idx)`

**Pitfall**: Tweens created with `create_tween()` are bound to the node. If the node is freed, the tween stops. Use `get_tree().create_tween()` for unbound tweens.

## HTTPRequest

High-level HTTP client node.

```gdscript
var http: HTTPRequest = HTTPRequest.new()
add_child(http)
http.request_completed.connect(_on_request_completed)
http.request("https://api.example.com/data")

func _on_request_completed(result: int, code: int, headers: PackedStringArray, body: PackedByteArray) -> void:
    var json: Dictionary = JSON.parse_string(body.get_string_from_utf8())
```

**Signal**: `request_completed(result, response_code, headers, body)`

## HTTPClient

Low-level HTTP client. Supports persistent connections, streaming. More complex than HTTPRequest.

## OS

Static class for OS-level operations.

- `OS.get_name()` — "Windows", "Linux", "macOS", "Android", "iOS", "Web"
- `OS.has_feature(tag)` — check feature tags
- `OS.get_user_data_dir()` — `user://` resolved path
- `OS.get_executable_path()`
- `OS.shell_open(uri)` — open URL in browser, file in OS
- `OS.execute(path, args)` — run external process
- `OS.get_cmdline_args()` — command-line arguments
- `OS.get_environment(key)` — environment variable
- `OS.delay_msec(ms)` / `OS.delay_usec(us)` — block thread (avoid in main thread)
- `OS.is_debug_build()`
- `OS.clipboard` — get/set clipboard text

## Engine

Static class for engine state.

- `Engine.get_frames_per_second()` — current FPS
- `Engine.time_scale` — global time scale (0.5 = half speed)
- `Engine.physics_ticks_per_second` — default 60
- `Engine.max_fps` — cap FPS (0 = uncapped)
- `Engine.is_editor_hint()` — true if running as `@tool` in editor
- `Engine.get_version_info()` — dictionary with major, minor, patch, status
- `Engine.get_singleton(name)` — access engine singletons

## Input

Static class for input queries.

- `Input.is_action_pressed(action)` / `is_action_just_pressed(action)` / `is_action_just_released(action)`
- `Input.get_action_strength(action)` — analog value 0.0-1.0
- `Input.get_axis(neg_action, pos_action)` — returns -1.0 to 1.0
- `Input.get_vector(left, right, up, down)` — returns normalized Vector2
- `Input.mouse_mode` — VISIBLE, HIDDEN, CAPTURED, CONFINED
- `Input.get_mouse_position()` — viewport-space mouse position
- `Input.warp_mouse(position)` — move cursor
- `Input.start_joy_vibration(device, weak, strong, duration)`
- `Input.action_press(action)` / `action_release(action)` — simulate input

## DisplayServer

Low-level display/window management.

- `DisplayServer.window_set_title(title)`
- `DisplayServer.window_get_size()` / `window_set_size(size)`
- `DisplayServer.window_set_mode(mode)` — windowed, fullscreen, borderless
- `DisplayServer.screen_get_size(screen)` — monitor resolution
- `DisplayServer.clipboard_get()` / `clipboard_set(text)`

## ProjectSettings

Access project settings at runtime.

```gdscript
var gravity: float = ProjectSettings.get_setting("physics/2d/default_gravity")
ProjectSettings.set_setting("custom/my_value", 42)
```

## FileAccess

Read/write files.

```gdscript
# Write
var file: FileAccess = FileAccess.open("user://save.json", FileAccess.WRITE)
file.store_string(JSON.stringify(data))
file.close()

# Read
var file: FileAccess = FileAccess.open("user://save.json", FileAccess.READ)
var text: String = file.get_as_text()
file.close()
var data: Dictionary = JSON.parse_string(text)
```

**Key methods**: `store_string()`, `store_var()`, `store_line()`, `get_as_text()`, `get_var()`, `get_line()`, `eof_reached()`, `get_error()`

**Static**: `FileAccess.file_exists(path)`

## DirAccess

Directory operations.

```gdscript
var dir: DirAccess = DirAccess.open("user://")
dir.make_dir("saves")
dir.list_dir_begin()
var file_name: String = dir.get_next()
while file_name != "":
    if !dir.current_is_dir():
        print(file_name)
    file_name = dir.get_next()
```

**Static**: `DirAccess.dir_exists_absolute(path)`, `DirAccess.make_dir_absolute(path)`

## JSON

```gdscript
# Serialize
var json_string: String = JSON.stringify(my_dict, "\t")  # pretty-print

# Parse
var data: Variant = JSON.parse_string(json_string)
# Returns null on parse error — always check
```

## ConfigFile

INI-style configuration.

```gdscript
var config: ConfigFile = ConfigFile.new()
config.set_value("audio", "volume", 0.8)
config.set_value("video", "fullscreen", true)
config.save("user://settings.cfg")

config.load("user://settings.cfg")
var vol: float = config.get_value("audio", "volume", 1.0)  # default = 1.0
```

## ResourceLoader

Threaded/async resource loading.

```gdscript
# Start async load
ResourceLoader.load_threaded_request("res://levels/big_level.tscn")

# Check progress (call periodically)
var progress: Array = []
var status: ResourceLoader.ThreadLoadStatus = ResourceLoader.load_threaded_get_status("res://levels/big_level.tscn", progress)
# progress[0] is 0.0 to 1.0

# Get result when done
if status == ResourceLoader.THREAD_LOAD_LOADED:
    var scene: PackedScene = ResourceLoader.load_threaded_get("res://levels/big_level.tscn")
```

## Performance (singleton)

```gdscript
# Get performance metrics
var fps: float = Performance.get_monitor(Performance.TIME_FPS)
var objects: int = Performance.get_monitor(Performance.OBJECT_COUNT)
var draw_calls: int = Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME)
```

## RandomNumberGenerator

Seedable RNG independent of global `randf()`/`randi()`.

```gdscript
var rng := RandomNumberGenerator.new()
rng.seed = 12345  # Deterministic
var value: float = rng.randf_range(0.0, 100.0)
var index: int = rng.randi_range(0, 9)
```

## Crypto / HMAC / AES

Built-in encryption and hashing.

```gdscript
var crypto := Crypto.new()
var key := crypto.generate_random_bytes(32)
# Use HashingContext for SHA-256, MD5, etc.
```

## RegEx

Regular expression support.

```gdscript
var regex := RegEx.new()
regex.compile("\\d+")
var result: RegExMatch = regex.search("Level 42")
if result:
    print(result.get_string())  # "42"
```

## Marshalls

Base64 encode/decode, variant serialization.

```gdscript
var encoded: String = Marshalls.variant_to_base64(my_data)
var decoded: Variant = Marshalls.base64_to_variant(encoded)
```

## Custom Loggers (4.5+)

Script backtracing and custom loggers provide deeper error information even in release builds:

```gdscript
class_name CustomLogger extends RefCounted

func log_message(level: int, message: String, file: String, line: int) -> void:
    var entry := "[%s] %s:%d - %s" % [
        Time.get_datetime_string_from_system(), file, line, message
    ]
    match level:
        Logger.LOG_LEVEL_ERROR:
            push_error(entry)
        Logger.LOG_LEVEL_WARNING:
            push_warning(entry)
        _:
            print(entry)
```

Register via `Engine.register_script_language()` or the new logger API. Useful for crash reporting and remote diagnostics in shipped builds.

## GDExtension Main Loop Callbacks (4.5+)

GDExtension plugins can now register main loop callbacks directly (startup, shutdown, frame events) without workarounds. Resolves previous issues with accessing engine singletons during initialization.
