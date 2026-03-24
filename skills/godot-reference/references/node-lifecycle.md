# Node Lifecycle Reference

## Lifecycle Order (Single Node)

For a single node entering the scene tree, callbacks fire in this order:

1. **`_init()`** — Object created in memory. No name, no parent, not in tree. Use for pure data initialization only.
2. Variable initializers run (class-level `var x = ...`)
3. Exported variable values loaded from scene file
4. **`NOTIFICATION_ENTER_TREE`**
5. **`_enter_tree()`** — Node added to tree. Parent is accessible. Children may not be ready yet.
6. `tree_entered` signal emitted
7. **`NOTIFICATION_POST_ENTER_TREE`**
8. `@onready` variables initialized
9. **`NOTIFICATION_READY`**
10. **`_ready()`** — Node and all children are in the tree and ready. Safe to access everything.
11. `ready` signal emitted

Then per frame:
- **`_input(InputEvent)`** / **`_unhandled_input(InputEvent)`**
- **`_physics_process(delta)`** — Fixed timestep (default 60/s)
- **`_process(delta)`** — Every rendered frame (variable rate)

On removal:
1. **`_exit_tree()`** — About to leave tree
2. `tree_exiting` signal emitted
3. `tree_exited` signal emitted

## Tree Order for Multiple Nodes

Given this tree:
```
Root
├── A
│   ├── A1
│   └── A2
└── B
```

### _enter_tree() — Top-down (parent before children)
```
Root → A → A1 → A2 → B
```

### _ready() — Bottom-up (children before parents)
```
A1 → A2 → A → B → Root
```

This guarantees that when a parent's `_ready()` runs, all its children are already initialized.

### _process() / _physics_process() — Top-down
```
Root → A → A1 → A2 → B
```

Same order as `_enter_tree()`. Can be modified with `process_priority` — lower values process first.

### _input() — Bottom-up
```
B → A2 → A1 → A → Root
```

Later nodes in the tree get first chance to handle input. Call `get_viewport().set_input_as_handled()` to consume it.

### _exit_tree() — Bottom-up (children before parents)
```
A1 → A2 → A → B → Root
```

## Key Lifecycle Methods

### _init()
```gdscript
func _init() -> void:
    # No scene tree access. No name. No parent.
    # Only use for data that doesn't depend on the tree.
    _health = max_health
```

**Pitfall**: `$Node`, `get_node()`, `get_parent()`, `get_tree()` all fail here. The node isn't in the tree yet.

### _enter_tree()
```gdscript
func _enter_tree() -> void:
    # Node is now in the tree. Parent is valid.
    # Children may still be entering.
    # Called EVERY TIME the node enters a tree (re-parenting triggers it again).
    set_physics_process(true)
```

Unlike `_ready()`, this runs every time the node is added to a tree — not just the first time.

### _ready()
```gdscript
func _ready() -> void:
    # All children are ready. @onready vars are initialized.
    # This is where most initialization should happen.
    $AnimationPlayer.play(&"idle")
    health_changed.connect($HUD.update_health_bar)
```

`_ready()` runs **once** by default. To re-trigger it after removing and re-adding a node, call `request_ready()` before adding it back.

### _process(delta)
```gdscript
func _process(delta: float) -> void:
    # Called every rendered frame. Rate varies with FPS.
    # Use for visual updates, UI, non-physics movement.
    sprite.rotation += rotation_speed * delta
```

Toggle with `set_process(true/false)`. Disable when not needed for performance.

### _physics_process(delta)
```gdscript
func _physics_process(delta: float) -> void:
    # Called at fixed interval (default 60/s).
    # Use for physics, movement, collision responses.
    velocity.y += gravity * delta
    move_and_slide()
```

`delta` is constant here (1/60 by default). Toggle with `set_physics_process(true/false)`.

### _input(event) vs _unhandled_input(event)
```gdscript
func _input(event: InputEvent) -> void:
    # Receives ALL input events (before UI processes them)
    if event is InputEventKey and event.pressed:
        if event.keycode == KEY_ESCAPE:
            get_tree().quit()

func _unhandled_input(event: InputEvent) -> void:
    # Only receives input NOT consumed by UI or _input()
    # Preferred for gameplay input
    if event.is_action_pressed(&"attack"):
        attack()
```

Order: `_input()` → UI nodes → `_shortcut_input()` → `_unhandled_key_input()` → `_unhandled_input()`

For gameplay input, prefer `_unhandled_input()` so UI buttons don't trigger game actions.

### _exit_tree()
```gdscript
func _exit_tree() -> void:
    # Clean up: disconnect signals, release resources
    # Children's _exit_tree() runs BEFORE parent's
    EventBus.player_died.disconnect(_on_player_died)
```

## Processing Control

```gdscript
# Disable/enable per-frame callbacks
set_process(false)              # _process
set_physics_process(false)      # _physics_process
set_process_input(false)        # _input
set_process_unhandled_input(false)  # _unhandled_input

# Check state
is_processing()
is_physics_processing()

# Process priority (lower = earlier)
process_priority = -1   # Process before siblings
process_priority = 100  # Process after siblings

# Process mode (pause behavior)
process_mode = Node.PROCESS_MODE_PAUSABLE   # Default — pauses when tree paused
process_mode = Node.PROCESS_MODE_ALWAYS     # Runs even when paused (menus, HUD)
process_mode = Node.PROCESS_MODE_DISABLED   # Never processes
process_mode = Node.PROCESS_MODE_WHEN_PAUSED  # Only processes when paused
process_mode = Node.PROCESS_MODE_INHERIT    # Inherits from parent
```

## Node Notifications

For advanced cases, override `_notification()` to handle all lifecycle events in one method:

```gdscript
func _notification(what: int) -> void:
    match what:
        NOTIFICATION_ENTER_TREE:
            pass
        NOTIFICATION_READY:
            pass
        NOTIFICATION_PROCESS:
            pass
        NOTIFICATION_PHYSICS_PROCESS:
            pass
        NOTIFICATION_EXIT_TREE:
            pass
        NOTIFICATION_PREDELETE:
            # Object is about to be freed from memory
            pass
        NOTIFICATION_PAUSED:
            pass
        NOTIFICATION_UNPAUSED:
            pass
        NOTIFICATION_WM_CLOSE_REQUEST:
            # Window close button pressed
            pass
```

Use virtual methods (`_ready`, `_process`, etc.) for typical work. Use `_notification()` when you need to respond to rarer notifications like `NOTIFICATION_WM_CLOSE_REQUEST` or `NOTIFICATION_PREDELETE`.

## Deferred Calls

`call_deferred()` schedules a method to run at the end of the current frame, after all processing:

```gdscript
# Scene tree modifications are safer when deferred
func spawn_enemy() -> void:
    var enemy := enemy_scene.instantiate()
    add_child.call_deferred(enemy)  # Deferred add

func die() -> void:
    queue_free()  # Already deferred — removes at frame end
```

**When to defer**:
- Adding/removing children during `_process` or signal callbacks
- Modifying properties that trigger re-layout (UI) or re-rendering
- Any operation that modifies the tree structure during iteration

`queue_free()` is already deferred. `free()` is immediate — use with caution (crashes if anything references the node later in the same frame).

## C# Equivalents

```csharp
public override void _EnterTree() { }
public override void _Ready() { }
public override void _Process(double delta) { }
public override void _PhysicsProcess(double delta) { }
public override void _Input(InputEvent @event) { }
public override void _UnhandledInput(InputEvent @event) { }
public override void _ExitTree() { }

// Processing control
SetProcess(false);
SetPhysicsProcess(false);
ProcessPriority = -1;
ProcessMode = ProcessModeEnum.Always;
```
