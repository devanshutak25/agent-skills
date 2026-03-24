# GDScript Typing Reference

## Overview

GDScript supports gradual typing — you can mix typed and untyped code freely. Static typing provides compile-time error detection, better autocompletion, and runtime performance improvements via optimized opcodes.

## Type Hints

### Variable Type Hints
```gdscript
# Explicit type
var health: int = 100
var name: String = "Player"
var pos: Vector2 = Vector2.ZERO

# Inferred type (walrus operator :=)
var health := 100          # int
var name := "Player"       # String
var pos := Vector2.ZERO    # Vector2

# Nullable object types
var target: Node2D = null  # Valid — object types can be null
```

### Function Signatures
```gdscript
func calculate_damage(base: int, multiplier: float = 1.0) -> int:
    return int(base * multiplier)

func die() -> void:
    queue_free()

# Variant return (explicitly typed)
func get_data() -> Variant:
    return some_dictionary.get("key")
```

### What Can Be Used as Type Hints
- `Variant` — any type (explicit about it being intentionally untyped)
- `void` — return type only, function returns nothing
- Built-in types: `int`, `float`, `bool`, `String`, `Vector2`, `Color`, etc.
- Native engine classes: `Node`, `Node2D`, `CharacterBody2D`, `Resource`, etc.
- Global classes (registered via `class_name`)
- Inner classes
- Named enums (global, native, or custom)

**Note**: Enum type hints are informational — they're just `int` under the hood. No runtime enforcement that the value is a valid enum member.

## Typed Arrays

```gdscript
var scores: Array[int] = [10, 20, 30]
var enemies: Array[Node2D] = []
var items: Array[Item] = [Item.new(), Item.new()]
var directions: Array[Vector2] = [Vector2.UP, Vector2.DOWN]

# Typed arrays enforce element types at runtime
scores.append(42)      # OK
scores.append("text")  # Runtime error

# Empty typed array
var names: Array[String] = []

# Inference with typed arrays
var inferred := [1.0, 2.0, 3.0]  # Inferred as Array[float]
```

**Limitation**: Nested typed arrays are not supported:
```gdscript
# NOT ALLOWED
var grid: Array[Array[int]]

# Workaround — inner arrays are untyped
var grid: Array[Array] = [[1, 2], [3, 4]]
```

### Typed Array Methods
Most array methods like `front()`, `back()`, `pop_front()`, `pop_back()` still return `Variant`, not the typed element. You may need casts:
```gdscript
var enemies: Array[Enemy] = [enemy1, enemy2]
var first: Enemy = enemies.front()  # Works with type inference
# But some methods return Variant — be explicit if needed
```

### Typed Arrays and For Loops
A typed array's element type propagates to the loop variable:
```gdscript
var names: Array[String] = ["Alice", "Bob"]
for name in names:
    print(name.to_upper())  # Autocompletion works — name is String
```

For untyped arrays, you can explicitly type the loop variable (4.2+):
```gdscript
var data = ["Alice", "Bob", "Charlie"]
for name: String in data:
    print(name.to_upper())  # name is typed as String
```

## Typed Dictionaries (4.4+)

```gdscript
var costs: Dictionary[String, int] = {
    "apple": 5,
    "orange": 10,
}

var tiles: Dictionary[Vector2i, TileData] = {}

var entities: Dictionary[StringName, Node2D] = {
    &"player": $Player,
    &"enemy": $Enemy,
}
```

Type enforcement:
- Key and value types are checked on `[]=` assignment
- `[]` access returns the typed value
- For-loop variables inherit the key type
- Dictionary methods like `.values()`, `.keys()` remain untyped

**Limitation**: Nested typed dictionaries are not supported:
```gdscript
# NOT ALLOWED
var data: Dictionary[String, Dictionary[String, int]]

# Workaround
var data: Dictionary[String, Dictionary] = {}
```

## Type Inference Pitfalls

### get_node / $ Returns Node
```gdscript
# BAD — inferred as Node
@onready var health_bar := $UI/HealthBar

# GOOD — explicit type
@onready var health_bar: ProgressBar = $UI/HealthBar

# ALSO GOOD — cast
@onready var health_bar := $UI/HealthBar as ProgressBar
```

The `as` cast returns `null` if the node isn't the expected type — use explicit types when you want a hard error instead.

### Numeric Literals
```gdscript
var x := 10      # int
var y := 10.0    # float
var z := 10 / 3  # int division = 3 (not 3.333)
var w := 10.0 / 3  # float division = 3.333...
```

### Variant Containers
Even with typed arrays/dictionaries, some operations return `Variant`:
```gdscript
var arr: Array[int] = [1, 2, 3]
var val = arr.reduce(func(a, b): return a + b)  # val is Variant
var typed_val: int = arr.reduce(func(a, b): return a + b)  # explicit
```

## Typed Signals (4.2+)

Signal declarations can include parameter types:
```gdscript
signal health_changed(new_health: int)
signal item_picked_up(item: Item, slot: int)
signal game_over()
```

When connecting, the callable's signature is checked against the signal's types at connection time. Mismatches produce warnings.

## Safe vs Unsafe Lines

The script editor marks lines with colored gutters:
- **Green** — type-safe, all types verified at compile time
- **Grey/no color** — unsafe, relies on runtime type checking

To maximize type safety, enable these project settings under `Debug > GDScript`:
- `UNTYPED_DECLARATION` — warns on any untyped variable/parameter/return
- `INFERRED_DECLARATION` — warns when using `:=` instead of explicit types
- `UNSAFE_CAST` — warns on `as` casts
- `UNSAFE_CALL_ARGUMENT` — warns when argument types don't match

## Casting

### as Operator (Safe Cast)
```gdscript
var player := body as Player
if player:          # null if cast failed
    player.heal(10)
```

### Type Narrowing with is
```gdscript
if body is Player:
    # body is now narrowed to Player type
    body.heal(10)   # Autocompletion works
```

### Explicit Conversion
```gdscript
var f: float = 3.7
var i: int = int(f)        # 3 (truncated)
var s: String = str(f)     # "3.7"
var v: Vector2 = Vector2(Vector2i(1, 2))  # Convert Vector2i -> Vector2
```

## Performance Impact

Typed code uses optimized opcodes at runtime. Most significant gains:
- Typed arithmetic (`int` + `int`, `float` * `float`) avoids Variant dispatch
- Typed array access avoids per-element type checking overhead
- Typed function calls with matching signatures use direct dispatch

The performance difference is most notable in tight loops and math-heavy code. For general game logic with infrequent calls, the difference is negligible.

## Enforcing Static Typing Project-Wide

Recommended editor settings for strict typing:

```
Project Settings > Debug > GDScript:
  UNTYPED_DECLARATION = Error (or Warning)
  INFERRED_DECLARATION = Warning (optional, for verbose style)
  UNSAFE_CAST = Warning
  UNSAFE_CALL_ARGUMENT = Warning
  UNSAFE_METHOD_ACCESS = Warning
  UNSAFE_PROPERTY_ACCESS = Warning

Editor Settings > Text Editor > Completion:
  Add Type Hints = Enabled
```

This turns GDScript into a practically statically-typed language while retaining the option to opt out per-line with `@warning_ignore`.
