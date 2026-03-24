# GDScript Patterns & Best Practices

## Composition Over Inheritance

Godot's node system is designed for composition. Prefer attaching behavior via child nodes or components rather than deep inheritance hierarchies.

```gdscript
# BAD — deep inheritance
# BaseEnemy → MeleeEnemy → OrcMelee → OrcMeleeShielded

# GOOD — composition via child nodes
# CharacterBody2D (enemy)
#   ├── HealthComponent
#   ├── MeleeAttackComponent
#   ├── ShieldComponent
#   └── AIComponent

# HealthComponent.gd
class_name HealthComponent
extends Node

signal died
signal health_changed(new_health: int)

@export var max_health: int = 100
var current_health: int

func _ready() -> void:
    current_health = max_health

func take_damage(amount: int) -> void:
    current_health = maxi(current_health - amount, 0)
    health_changed.emit(current_health)
    if current_health == 0:
        died.emit()

func heal(amount: int) -> void:
    current_health = mini(current_health + amount, max_health)
    health_changed.emit(current_health)
```

## State Machine Pattern

The most common pattern for game entities. Keep it simple — avoid over-engineering.

### Inline State Machine (Simple)
```gdscript
enum State { IDLE, RUN, JUMP, FALL, ATTACK }
var state: State = State.IDLE

func _physics_process(delta: float) -> void:
    match state:
        State.IDLE:
            _state_idle(delta)
        State.RUN:
            _state_run(delta)
        State.JUMP:
            _state_jump(delta)
        State.FALL:
            _state_fall(delta)
        State.ATTACK:
            _state_attack(delta)

func _change_state(new_state: State) -> void:
    if state == new_state:
        return
    # Exit logic
    match state:
        State.ATTACK:
            $Hitbox.monitoring = false
    
    state = new_state
    
    # Enter logic
    match new_state:
        State.JUMP:
            velocity.y = jump_force
        State.ATTACK:
            $AnimationPlayer.play(&"attack")
            $Hitbox.monitoring = true
```

### Node-Based State Machine (Complex)
```gdscript
# StateMachine.gd
class_name StateMachine
extends Node

@export var initial_state: State
var current_state: State

func _ready() -> void:
    for child in get_children():
        if child is State:
            child.state_machine = self
    if initial_state:
        current_state = initial_state
        current_state.enter()

func _process(delta: float) -> void:
    if current_state:
        current_state.update(delta)

func _physics_process(delta: float) -> void:
    if current_state:
        current_state.physics_update(delta)

func transition_to(target_state: State) -> void:
    if current_state:
        current_state.exit()
    current_state = target_state
    current_state.enter()

# State.gd (base)
class_name State
extends Node

var state_machine: StateMachine

func enter() -> void:
    pass

func exit() -> void:
    pass

func update(_delta: float) -> void:
    pass

func physics_update(_delta: float) -> void:
    pass
```

## Signal Patterns

### Decoupled Communication
Signals let nodes communicate without knowing about each other:
```gdscript
# Player.gd
signal coin_collected(value: int)

func _on_area_entered(area: Area2D) -> void:
    if area is Coin:
        coin_collected.emit(area.value)
        area.queue_free()

# HUD.gd — connected via editor or code
func _on_player_coin_collected(value: int) -> void:
    score += value
    update_score_label()
```

### Event Bus (Global Signal Hub)
For game-wide events, use an autoload as an event bus:
```gdscript
# EventBus.gd (autoload)
extends Node

signal player_died
signal level_completed(level_id: int)
signal score_changed(new_score: int)
signal settings_changed

# Emitter (any script)
EventBus.player_died.emit()

# Listener (any script)
func _ready() -> void:
    EventBus.player_died.connect(_on_player_died)
```

**Pitfall**: Clean up connections when nodes are freed to avoid errors:
```gdscript
func _exit_tree() -> void:
    if EventBus.player_died.is_connected(_on_player_died):
        EventBus.player_died.disconnect(_on_player_died)

# Or connect with CONNECT_ONE_SHOT for one-time listeners
EventBus.level_completed.connect(_on_level_completed, CONNECT_ONE_SHOT)
```

### Signal-Forward Pattern
When a child's signal needs to bubble up:
```gdscript
# Parent wraps child signal
signal health_changed(value: int)

func _ready() -> void:
    $HealthComponent.health_changed.connect(
        func(v: int): health_changed.emit(v)
    )
    # Or simply forward:
    $HealthComponent.health_changed.connect(health_changed.emit)
```

## Resource Pattern

Custom resources for data-driven design:
```gdscript
# weapon_data.gd
class_name WeaponData
extends Resource

@export var name: String = ""
@export var damage: int = 10
@export var attack_speed: float = 1.0
@export var icon: Texture2D
@export var projectile_scene: PackedScene
```

Create instances in the editor as `.tres` files and assign them via `@export`:
```gdscript
# Weapon.gd
@export var data: WeaponData

func attack() -> void:
    deal_damage(data.damage)
    $CooldownTimer.wait_time = 1.0 / data.attack_speed
    $CooldownTimer.start()
```

**Pitfall**: Resources loaded with `load()`/`preload()` are shared by default. If you modify properties at runtime, all references see the change. Use `.duplicate()` for per-instance copies:
```gdscript
func _ready() -> void:
    data = data.duplicate()  # Now safe to modify per-instance
```

## Dependency Injection via @export

Prefer exporting dependencies over hardcoded `get_node()` paths:
```gdscript
# BAD — fragile path coupling
@onready var health_bar := $"../../UI/HealthBar"

# GOOD — export the dependency
@export var health_bar: ProgressBar
# Assign in the editor — survives scene restructuring
```

For same-scene child nodes, `@onready` with `$` is fine. For cross-scene references, use exports or signals.

## Object Pool Pattern

Avoid frequent `instantiate()` / `queue_free()` for performance-critical objects like bullets:
```gdscript
class_name ObjectPool
extends Node

@export var scene: PackedScene
@export var pool_size: int = 50

var _pool: Array[Node] = []

func _ready() -> void:
    for i in pool_size:
        var obj := scene.instantiate()
        obj.set_process(false)
        obj.hide()
        add_child(obj)
        _pool.append(obj)

func acquire() -> Node:
    for obj in _pool:
        if not obj.visible:
            obj.show()
            obj.set_process(true)
            return obj
    # Pool exhausted — optionally grow
    push_warning("Pool exhausted")
    return null

func release(obj: Node) -> void:
    obj.set_process(false)
    obj.hide()
```

## Service Locator via Autoloads

Use autoloads sparingly for truly global services:
```gdscript
# AudioManager.gd (autoload)
extends Node

var _music_bus := AudioServer.get_bus_index(&"Music")

func play_sfx(stream: AudioStream, volume_db: float = 0.0) -> void:
    var player := AudioStreamPlayer.new()
    player.stream = stream
    player.volume_db = volume_db
    add_child(player)
    player.play()
    player.finished.connect(player.queue_free)

func set_music_volume(linear: float) -> void:
    AudioServer.set_bus_volume_db(_music_bus, linear_to_db(linear))
```

**Guideline**: If more than 3-4 autoloads exist, some are probably better as components or injected resources.

## Common Anti-Patterns

### Spaghetti get_node Calls
```gdscript
# BAD — deep path coupling, breaks on restructure
var label = get_node("../../../UI/Panel/VBox/ScoreLabel")

# GOOD — use groups, signals, or exports
func _ready() -> void:
    for label in get_tree().get_nodes_in_group(&"score_labels"):
        score_changed.connect(label.update_score)
```

### God Object
```gdscript
# BAD — one script handles everything
extends Node
var health; var score; var inventory; var quests; var settings
func move(); func attack(); func open_menu(); func save_game()

# GOOD — split into focused components/autoloads
# Player handles movement + combat
# InventoryManager autoload handles items
# QuestManager autoload handles quests
# SaveManager autoload handles persistence
```

### Process Polling Instead of Signals
```gdscript
# BAD — checking every frame
func _process(_delta: float) -> void:
    if health_component.current_health <= 0:
        die()

# GOOD — react to signal
func _ready() -> void:
    health_component.died.connect(die)
```

### Circular Dependencies
```gdscript
# BAD — Player.gd and Enemy.gd reference each other's class_name
# This causes cyclic dependency errors

# FIX 1 — use duck typing or base class
func attack(target: Node2D) -> void:
    if target.has_method("take_damage"):
        target.take_damage(damage)

# FIX 2 — use an interface pattern via groups
func attack(target: Node2D) -> void:
    if target.is_in_group(&"damageable"):
        target.take_damage(damage)
```

## Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Files/folders | snake_case | `player_controller.gd` |
| Classes | PascalCase | `class_name PlayerController` |
| Functions | snake_case | `func take_damage()` |
| Variables | snake_case | `var max_health: int` |
| Constants | SCREAMING_SNAKE | `const MAX_SPEED: float` |
| Enums (name) | PascalCase | `enum PlayerState` |
| Enum values | SCREAMING_SNAKE | `IDLE, RUNNING` |
| Signals | snake_case (past tense) | `signal health_changed` |
| Private members | _prefix | `var _internal_timer` |
| Node refs | snake_case | `@onready var sprite: Sprite2D` |
| Bool variables | is_/has_/can_ prefix | `var is_alive: bool` |

## Performance Tips

- Use `StringName` (`&"name"`) for signals, input actions, and animation names
- Prefer typed code everywhere — enables optimized opcodes
- Use `PackedFloat32Array`/`PackedVector2Array` etc. over `Array` for large numeric datasets
- Cache node references with `@onready` instead of calling `get_node()` repeatedly
- Use `is_processing()` / `set_process(false)` to disable unnecessary `_process` callbacks
- For many entities, consider using `_physics_process` at a lower tick rate instead of `_process`
- Use `call_deferred()` to batch operations that modify the scene tree
- Profile with the built-in Profiler and Monitor before optimizing
