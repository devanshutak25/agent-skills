# GDScript Annotations Reference

Annotations start with `@` and modify how a script, class, variable, or function is treated by the editor, compiler, or runtime.

## Script-Level Annotations

### @tool
Makes the script execute in the editor. Required for editor plugins, custom inspector tools, and preview logic:
```gdscript
@tool
extends Node2D

func _process(delta: float) -> void:
    # Runs in editor too — be careful with side effects
    queue_redraw()

func _draw() -> void:
    draw_circle(Vector2.ZERO, 50.0, Color.RED)
```

**Pitfall**: `_ready()`, `_process()`, and all lifecycle callbacks run in the editor. Guard game-only logic:
```gdscript
func _ready() -> void:
    if Engine.is_editor_hint():
        return
    # Game-only initialization
    connect_to_server()
```

### @icon
Sets a custom icon for the class in the editor:
```gdscript
@icon("res://assets/icons/player.svg")
class_name Player
extends CharacterBody2D
```

Path must be a constant string. SVG recommended for resolution independence.

### @static_unload
Allows the script to be unloaded from memory when no instances exist, even if it has static variables. Without this, scripts with static vars persist indefinitely:
```gdscript
@static_unload
class_name BulletPool
extends RefCounted

static var pool: Array[Bullet] = []
```

Must be placed before `class_name` and `extends`.

### @abstract (4.5+)
Marks a class or function as abstract:
```gdscript
@abstract
class_name BaseWeapon
extends Node2D

@abstract
func get_damage() -> int:
    return 0

@abstract
func get_range() -> float:
    return 0.0

func attack(target: Node2D) -> void:
    # Concrete method — not abstract
    var dmg := get_damage()
    target.take_damage(dmg)
```

- Abstract classes cannot be instantiated with `.new()`
- Abstract classes are hidden from the "Create New Node" dialog
- Abstract functions must be overridden by non-abstract subclasses
- You can provide a default body in abstract functions (it serves as documentation / fallback)

## Variable Annotations

### @onready
Defers variable initialization to `_ready()` time, when the scene tree is available:
```gdscript
@onready var sprite: Sprite2D = $Sprite2D
@onready var health_bar: ProgressBar = $UI/HealthBar
@onready var anim: AnimationPlayer = $AnimationPlayer

# Equivalent to:
var sprite: Sprite2D
func _ready() -> void:
    sprite = $Sprite2D
```

**Pitfall**: Never combine `@onready` with `@export`. The `@onready` initializer runs at `_ready()` and overwrites the exported value loaded from the scene file. This triggers the `ONREADY_WITH_EXPORT` warning (error by default).

### @export
Exposes a variable in the Inspector. The basic form infers editor hints from the type:
```gdscript
@export var speed: float = 200.0
@export var player_name: String = "Hero"
@export var color: Color = Color.WHITE
@export var target: Node2D
@export var texture: Texture2D
```

### @export with Enums
```gdscript
enum Element { FIRE, WATER, EARTH, WIND }
@export var element: Element = Element.FIRE
# Creates a dropdown in the Inspector
```

### @export_range
Numeric ranges with optional step and hints:
```gdscript
@export_range(0.0, 100.0) var health: float = 100.0
@export_range(0, 10, 1) var level: int = 1
@export_range(0.0, 1.0, 0.01) var volume: float = 0.5
@export_range(0.0, 100.0, 0.1, "or_greater") var damage: float = 10.0
@export_range(0.0, 1.0, 0.01, "or_less", "or_greater") var scale_factor: float = 1.0

# Suffix hint
@export_range(0, 360, 1, "degrees") var rotation_deg: int = 0
@export_range(0.0, 100.0, 0.1, "suffix:m/s") var max_speed: float = 50.0
```

### @export_enum
Creates a dropdown from string values (result is int index or String):
```gdscript
# Result is int (index)
@export_enum("Sword", "Bow", "Staff") var weapon: int = 0

# Result is String
@export_enum("Easy", "Normal", "Hard") var difficulty: String = "Normal"
```

### @export_file / @export_dir
File and directory pickers:
```gdscript
@export_file var save_path: String
@export_file("*.png", "*.jpg") var texture_path: String
@export_dir var data_directory: String
@export_global_file("*.json") var config_path: String  # Absolute path
@export_global_dir var output_dir: String               # Absolute path
```

### @export_multiline
Large text editor:
```gdscript
@export_multiline var description: String = ""
@export_multiline var dialogue: String = ""
```

### @export_placeholder
Greyed-out hint text:
```gdscript
@export_placeholder("Enter player name...") var player_name: String = ""
```

### @export_color_no_alpha
Color picker without alpha channel:
```gdscript
@export_color_no_alpha var tint: Color = Color.WHITE
```

### @export_node_path
Restrict NodePath to specific types:
```gdscript
@export_node_path("CharacterBody2D", "RigidBody2D") var target_path: NodePath
```

### @export_flags
Bitfield checkboxes:
```gdscript
@export_flags("Fire", "Water", "Earth", "Wind") var elements: int = 0
# Fire = 1, Water = 2, Earth = 4, Wind = 8

# Built-in layer flags
@export_flags_2d_physics var collision_mask: int
@export_flags_2d_render var render_layers: int
@export_flags_3d_physics var physics_mask_3d: int
@export_flags_3d_render var render_layers_3d: int
```

### @export_exp_easing
Easing curve editor:
```gdscript
@export_exp_easing var fade_curve: float = 1.0
@export_exp_easing("attenuation") var falloff: float = 1.0
@export_exp_easing("positive_only") var growth: float = 1.0
```

### @export_group / @export_subgroup
Organize exports into collapsible groups:
```gdscript
@export_group("Movement")
@export var speed: float = 200.0
@export var acceleration: float = 500.0
@export var friction: float = 800.0

@export_group("Combat")
@export var max_health: int = 100
@export var attack_damage: int = 10

@export_subgroup("Ranged")
@export var projectile_speed: float = 400.0
@export var range: float = 300.0

@export_group("")  # End grouping
@export var ungrouped_var: int = 0
```

The prefix parameter filters which variables appear in the group:
```gdscript
@export_group("Stats", "stat_")
@export var stat_health: int = 100    # In group
@export var stat_mana: int = 50       # In group
@export var speed: float = 200.0      # NOT in group (no stat_ prefix)
```

### @export_category
Top-level category header (cannot be collapsed):
```gdscript
@export_category("Player Settings")
@export var name: String = ""
@export var team: int = 0
```

### @export_storage
Marks a variable as serialized to disk but hidden from the Inspector:
```gdscript
@export_storage var _internal_state: Dictionary = {}
```

### @export_custom
Full control over property hints:
```gdscript
@export_custom(PROPERTY_HINT_NONE, "") var raw_data: Variant
```

### Typed Resource/Node Exports
```gdscript
# Resource exports show a picker filtered to that type
@export var weapon_stats: WeaponStats         # Custom Resource
@export var noise: FastNoiseLite
@export var gradient: Gradient
@export var mesh: Mesh

# Node exports allow picking nodes from the scene
@export var target: CharacterBody2D
@export var waypoints: Array[Marker2D]

# Array of resources
@export var inventory: Array[Item] = []
```

## Warning Control Annotations

### @warning_ignore
Suppress a specific warning on the next line:
```gdscript
@warning_ignore("unused_variable")
var temp := calculate_something()

@warning_ignore("integer_division")
var half := count / 2
```

### @warning_ignore_start / @warning_ignore_restore (4.5+)
Suppress warnings for a block of code:
```gdscript
@warning_ignore_start("unused_variable")
var a := 1
var b := 2
var c := 3
@warning_ignore_restore("unused_variable")
```

Common warning names: `unused_variable`, `unused_parameter`, `unused_signal`, `shadowed_variable`, `shadowed_variable_base_class`, `integer_division`, `return_value_discarded`, `untyped_declaration`, `unsafe_cast`, `unsafe_call_argument`

## Networking Annotation

### @rpc
Configures remote procedure calls (see `references/rpcs.md` for full details):
```gdscript
@rpc("any_peer", "call_local", "reliable")
func take_damage(amount: int) -> void:
    health -= amount
```

## Declaration Order Convention

Recommended order within a script (per GDScript style guide):

1. `@tool`
2. `@icon`
3. `@static_unload`
4. `class_name`
5. `extends`
6. Doc comment for the class
7. Signals
8. Enums
9. Constants
10. `@export` variables
11. Public variables
12. Private variables (`_prefix`)
13. `@onready` variables
14. `_init()`, `_enter_tree()`, `_ready()`
15. `_process()`, `_physics_process()`
16. Other virtual methods (`_input`, `_unhandled_input`, etc.)
17. Public methods
18. Private methods
19. Inner classes
