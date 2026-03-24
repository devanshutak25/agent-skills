# GDScript Syntax Reference

## Script Structure

Every GDScript file is implicitly a class. The basic structure:

```gdscript
@tool                          # Optional: runs in editor
@icon("res://icon.svg")        # Optional: custom editor icon
class_name MyClass             # Optional: registers as global class
extends Node2D                 # Required (or implicit RefCounted)

## Constants, enums, signals at top
const MAX_SPEED: float = 500.0
enum State { IDLE, RUN, JUMP, FALL }
signal health_changed(new_value: int)

## Exported variables
@export var speed: float = 200.0

## Public variables
var velocity: Vector2 = Vector2.ZERO

## Private convention (underscore prefix)
var _health: int = 100

## @onready variables
@onready var sprite: Sprite2D = $Sprite2D

## Built-in virtual methods
func _ready() -> void:
    pass

func _process(delta: float) -> void:
    pass

func _physics_process(delta: float) -> void:
    pass

## Custom methods
func take_damage(amount: int) -> void:
    _health -= amount
    health_changed.emit(_health)
```

If `extends` is omitted, the script implicitly extends `RefCounted`.

## Variables

```gdscript
# Untyped (avoid in production)
var x = 10

# Explicit type
var x: int = 10

# Inferred type (uses :=)
var x := 10              # int
var pos := Vector2.ZERO  # Vector2

# Constants
const GRAVITY: float = 980.0
const TILE_SIZE := 16

# Static variables (shared across all instances)
static var instance_count: int = 0
```

**Pitfall**: `:=` inference from `get_node()` infers `Node`, not the actual type. Always use explicit types for node references:
```gdscript
# Bad — inferred as Node
@onready var health_bar := get_node("UI/HealthBar")

# Good — explicit type
@onready var health_bar: ProgressBar = get_node("UI/HealthBar")
```

## Data Types

### Built-in Value Types
`bool`, `int` (64-bit), `float` (64-bit), `String`, `StringName`, `NodePath`, `Vector2`, `Vector2i`, `Vector3`, `Vector3i`, `Vector4`, `Vector4i`, `Rect2`, `Rect2i`, `Transform2D`, `Transform3D`, `Basis`, `Quaternion`, `AABB`, `Plane`, `Projection`, `Color`, `RID`, `Callable`, `Signal`

### Container Types
`Array`, `Dictionary`, `PackedByteArray`, `PackedInt32Array`, `PackedInt64Array`, `PackedFloat32Array`, `PackedFloat64Array`, `PackedStringArray`, `PackedVector2Array`, `PackedVector3Array`, `PackedVector4Array`, `PackedColorArray`

### StringName
Use `&"string"` syntax. Interned and faster to compare — preferred for signal names, input actions, animation names:
```gdscript
Input.is_action_pressed(&"jump")
animation_player.play(&"walk")
```

## Functions

```gdscript
# With return type
func greet(name: String) -> String:
    return "Hello, " + name

# Void
func die() -> void:
    queue_free()

# Default arguments
func heal(amount: int = 10) -> void:
    _health = mini(_health + amount, max_health)

# Static function
static func create_at(pos: Vector2) -> MyClass:
    var instance := MyClass.new()
    instance.position = pos
    return instance
```

### Lambdas

Lambdas create `Callable` objects. Must be invoked with `.call()`:

```gdscript
var double := func(x: int) -> int: return x * 2
print(double.call(5))  # 10

# Multi-line
var complex := func(x: int) -> int:
    var result := x * 2
    result += 10
    return result

# Common use: sort_custom
var sorted := arr.duplicate()
sorted.sort_custom(func(a, b): return a.score > b.score)
```

**Pitfall**: Lambdas capture variables by reference, not by value. In loops, all lambdas share the same loop variable. Fix with `.bind()`:
```gdscript
# Bug — all print the final value of i
for i in 5:
    callbacks.append(func(): print(i))

# Fix — bind captures the value
for i in 5:
    callbacks.append(func(val: int): print(val).bind(i))
```

## Control Flow

### Conditionals
```gdscript
if health <= 0:
    die()
elif health < 30:
    show_warning()
else:
    hide_warning()

# Ternary
var label := "dead" if health <= 0 else "alive"
```

### Match (Pattern Matching)
```gdscript
match state:
    State.IDLE:
        play_idle()
    State.RUN:
        play_run()
    State.JUMP, State.FALL:  # Multiple values
        play_airborne()
    _:                        # Wildcard
        push_warning("Unknown state")
```

Binding and structural patterns:
```gdscript
match command:
    ["move", var direction]:
        move(direction)
    ["attack", var target, var damage]:
        attack(target, damage)
    {"type": "heal", "amount": var amount}:
        heal(amount)
```

### Loops
```gdscript
for i in range(10):       # 0..9
for i in range(2, 8):     # 2..7
for i in range(0, 20, 5): # 0, 5, 10, 15
for i in 10:              # shorthand for range(10)

for item in inventory:
    print(item.name)

# Typed loop variable (4.2+)
for name: String in player_names:
    print(name.to_upper())

# Dictionary iteration (iterates keys)
for key in stats:
    print(key, ": ", stats[key])

while not is_on_floor():
    velocity.y += gravity * delta
    move_and_slide()
```

## Enums

```gdscript
# Named enum
enum Direction { UP, DOWN, LEFT, RIGHT }
# Direction.UP == 0, Direction.DOWN == 1, etc.

# Custom values
enum Priority { LOW = 1, MEDIUM = 5, HIGH = 10, CRITICAL = 100 }

# Use as type hint
var facing: Direction = Direction.RIGHT

# Bitflag pattern
enum Abilities {
    NONE      = 0,
    CAN_FLY   = 1 << 0,
    CAN_SWIM  = 1 << 1,
    CAN_DIG   = 1 << 2,
}
var skills: int = Abilities.CAN_FLY | Abilities.CAN_SWIM

# Reverse lookup
var name: String = Direction.keys()[Direction.RIGHT]  # "RIGHT"
```

**Pitfall**: Enum types are just ints internally. No runtime guarantee a variable holds a valid enum value — only compile-time warnings.

## Classes and Inheritance

```gdscript
# Call parent method
func _ready() -> void:
    super()                    # calls parent _ready()
    super.some_method(args)    # call specific parent method

# Inner classes
class Weapon:
    var damage: int = 10
    var name: String = "Sword"
    func attack() -> int:
        return damage

var weapon := Weapon.new()
```

### class_name
Registers the script as a global type visible everywhere and in editor dialogs:
```gdscript
class_name Player
extends CharacterBody2D
```

### Abstract Classes (4.5+)

```gdscript
@abstract
class_name BaseEnemy
extends CharacterBody2D

@abstract
func get_attack_damage() -> int:
    return 0

func take_damage(amount: int) -> void:
    health -= amount
```

`@abstract` on a class prevents `.new()` and hides from "Create New Node" dialog. On a function, marks it as requiring override in subclasses.

### is and as

```gdscript
if node is CharacterBody2D:
    node.velocity = Vector2.ZERO

# Safe cast — returns null on failure
var player := node as Player
if player:
    player.take_damage(10)
```

## Properties (Getters / Setters)

```gdscript
var health: int = 100:
    set(value):
        health = clampi(value, 0, max_health)
        health_changed.emit(health)
    get:
        return health

# Or via named functions
var score: int = 0:
    set = _set_score,
    get = _get_score
```

**Pitfall**: Within the setter body, assigning to the variable name is direct (does not recurse). Outside the setter, assignment always calls the setter.

## Assertions

```gdscript
assert(health >= 0, "Health cannot be negative")
```

Stripped in release builds — never use for production validation.

## Preload vs Load

```gdscript
# preload — compile time, constant path only
const BulletScene: PackedScene = preload("res://scenes/bullet.tscn")

# load — runtime, supports variable paths
var scene: PackedScene = load("res://scenes/" + scene_name + ".tscn")
```

For heavy resources, use `ResourceLoader.load_threaded_request()` for async loading.

## Common Utility Functions

```gdscript
# Math
clampf(value, 0.0, 1.0)
lerpf(a, b, 0.5)
remap(value, 0.0, 100.0, 0.0, 1.0)
snappedf(value, 0.25)

# Type conversion
str(42)           # "42"
int("42")         # 42
float("3.14")     # 3.14

# Instance checks
typeof(value)                    # Variant.Type enum
is_instance_valid(node)          # Check if object was freed

# Output
print("debug")                   # stdout
printerr("error")                # stderr
push_warning("careful")          # editor warning
push_error("bad")                # editor error (non-fatal)
```
