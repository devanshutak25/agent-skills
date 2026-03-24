# Signals System Reference

## Core Concept

Signals are Godot's implementation of the observer pattern. A node emits a signal when something happens; other nodes connect to that signal to respond. Signals decouple emitter from receiver — the emitter doesn't know or care who's listening.

**Design principle**: "Call down, signal up." Parents call methods on children directly. Children signal events upward. This keeps dependencies one-directional.

## Declaring Signals

```gdscript
# No parameters
signal died

# With typed parameters
signal health_changed(new_health: int)
signal item_collected(item: Item, slot_index: int)
signal damage_dealt(amount: int, target: Node2D, source: Node2D)
```

Parameter names and types are for documentation and editor hints — they're not enforced at emission time (but mismatches produce warnings).

## Emitting Signals

```gdscript
# No arguments
died.emit()

# With arguments
health_changed.emit(current_health)
item_collected.emit(item, 3)
damage_dealt.emit(25, target_node, self)
```

**Timing**: Signals are emitted **synchronously**. All connected callbacks execute immediately in the order they were connected, before the next line after `.emit()` runs. This is not deferred — it happens right now.

```gdscript
func take_damage(amount: int) -> void:
    health -= amount
    print("Before emit")
    health_changed.emit(health)  # All connected callbacks run HERE
    print("After emit")          # Runs after ALL callbacks complete
```

## Connecting Signals

### In Code
```gdscript
func _ready() -> void:
    # Method reference
    $Button.pressed.connect(_on_button_pressed)
    
    # Lambda
    $Button.pressed.connect(func(): print("Pressed!"))
    
    # With bind (add extra arguments)
    $Button.pressed.connect(_on_button_pressed.bind("special"))
    
    # One-shot (auto-disconnects after first emission)
    $Timer.timeout.connect(_on_timeout, CONNECT_ONE_SHOT)
    
    # Deferred (callback runs at end of frame)
    health_changed.connect(_on_health_changed, CONNECT_DEFERRED)

func _on_button_pressed(extra: String = "") -> void:
    print("Button pressed! ", extra)
```

### In the Editor
Connect signals via the Node dock > Signals tab. Double-click a signal to create a connection. The editor generates a method stub named `_on_NodeName_signal_name`.

Editor connections are stored in the `.tscn` file and survive code changes. They're visible in the editor but invisible in code — this can cause confusion. Prefer code connections for logic-heavy projects.

### Connection Flags

```gdscript
signal.connect(callable, flags)
```

| Flag | Value | Effect |
|---|---|---|
| `CONNECT_DEFERRED` | 1 | Callback runs at end of frame |
| `CONNECT_PERSIST` | 2 | Connection saved with scene (editor default) |
| `CONNECT_ONE_SHOT` | 4 | Auto-disconnects after first call |
| `CONNECT_REFERENCE_COUNTED` | 8 | Connection uses reference counting |

Combine with bitwise OR: `CONNECT_DEFERRED | CONNECT_ONE_SHOT`

## Disconnecting Signals

```gdscript
# Disconnect specific callable
$Button.pressed.disconnect(_on_button_pressed)

# Check before disconnecting
if health_changed.is_connected(_on_health_changed):
    health_changed.disconnect(_on_health_changed)
```

**Pitfall**: Lambda connections are hard to disconnect because you don't have a reference to the lambda. Store the callable if you need to disconnect later:

```gdscript
var _callback: Callable

func _ready() -> void:
    _callback = func(): print("tick")
    $Timer.timeout.connect(_callback)

func _exit_tree() -> void:
    $Timer.timeout.disconnect(_callback)
```

### Auto-disconnection
When a node is freed (`queue_free()`), Godot automatically disconnects signals **where that node is the receiver** (connected via its methods). However:
- Lambda connections with captured variables may not auto-disconnect (see C# reference for details — GDScript is generally safe here)
- Connections where the freed node is the **emitter** are cleaned up automatically

## Built-in Signals

Every engine class has predefined signals. Common ones:

### Node
```gdscript
ready                          # Node finished _ready()
tree_entered                   # Node entered the tree
tree_exiting                   # Node about to exit tree
tree_exited                    # Node exited the tree
child_entered_tree(node)       # A child was added
child_exiting_tree(node)       # A child is being removed
```

### Timer
```gdscript
timeout                        # Timer expired
```

### Button / BaseButton
```gdscript
pressed                        # Button clicked/activated
toggled(pressed: bool)         # Toggle state changed
button_down                    # Press started
button_up                      # Press released
```

### Area2D / Area3D
```gdscript
body_entered(body: Node2D)     # PhysicsBody entered
body_exited(body: Node2D)      # PhysicsBody exited
area_entered(area: Area2D)     # Another Area entered
area_exited(area: Area2D)      # Another Area exited
```

### AnimationPlayer
```gdscript
animation_finished(anim_name: StringName)
animation_started(anim_name: StringName)
animation_changed(old_name: StringName, new_name: StringName)
```

### Tween
```gdscript
finished                       # All tweeners completed
step_finished(idx: int)        # A tweener step completed
loop_finished(loop_count: int) # A loop completed
```

### HTTPRequest
```gdscript
request_completed(result: int, response_code: int, headers: PackedStringArray, body: PackedByteArray)
```

## Signal Patterns

### Signal Forwarding
Bubble a child's signal up through the parent:
```gdscript
# Parent re-emits child signal
signal health_changed(value: int)

func _ready() -> void:
    $HealthComponent.health_changed.connect(health_changed.emit)
```

### Signal Relay / Event Bus
Autoload for game-wide events (see `references/gdscript-patterns.md` for full pattern):
```gdscript
# EventBus.gd (autoload)
signal player_died
signal score_changed(new_score: int)
signal level_completed(level_id: int)
```

### Awaiting Signals
```gdscript
# Pause execution until signal fires
await $AnimationPlayer.animation_finished

# With timeout fallback
func wait_with_timeout(sig: Signal, timeout: float) -> Variant:
    var timer := get_tree().create_timer(timeout)
    var result = await [sig, timer.timeout]  # Doesn't work directly
    # Instead use the racing pattern:
    
func wait_with_timeout(sig: Signal, timeout_sec: float) -> bool:
    var timed_out := false
    var timer := get_tree().create_timer(timeout_sec)
    timer.timeout.connect(func(): timed_out = true, CONNECT_ONE_SHOT)
    await sig
    return not timed_out
```

### Signals with Callable.bind()
Add extra context to callbacks:
```gdscript
# Pass extra data to the callback
for i in buttons.size():
    buttons[i].pressed.connect(_on_button_pressed.bind(i))

func _on_button_pressed(index: int) -> void:
    print("Button ", index, " pressed")
```

`bind()` appends arguments after the signal's own arguments:
```gdscript
signal hit(damage: int)

# Connected with bind("fire")
hit.connect(_on_hit.bind("fire"))

func _on_hit(damage: int, element: String) -> void:
    # damage comes from the signal, element comes from bind
    print(damage, " ", element)

hit.emit(25)  # Calls _on_hit(25, "fire")
```

### Callable.unbind()
Strip signal arguments you don't need:
```gdscript
# AnimationPlayer.animation_finished passes anim_name, but we don't need it
$AnimationPlayer.animation_finished.connect(_on_animation_done.unbind(1))

func _on_animation_done() -> void:
    # No parameters — the anim_name was stripped
    pass
```

## Signal Inspection

```gdscript
# List all signals on a node
for sig in node.get_signal_list():
    print(sig.name, " — ", sig.args)

# List connections for a specific signal
for conn in node.get_signal_connection_list(&"pressed"):
    print(conn.callable)

# Check if signal exists
node.has_signal(&"my_signal")

# Check if connected
my_signal.is_connected(some_callable)
```

## Custom Signal vs Direct Call

| Use Signal When | Use Direct Call When |
|---|---|
| Emitter shouldn't know about receivers | Parent controlling a child |
| Multiple receivers need to react | One specific target |
| Communication flows upward/sideways | Communication flows downward |
| Loose coupling desired | Tight coupling is fine |
| Event may have zero listeners | Receiver must exist |

## Performance Notes

- Signal emission is fast but not free — each connected callback involves a `Callable` dispatch
- For extremely hot paths (thousands of emissions per frame), direct method calls are faster
- `CONNECT_DEFERRED` adds overhead (defers to frame end) but prevents mid-frame side effects
- Signals with many connections (100+) can measurably impact performance — consider batching

## C# Signal Equivalents

See `references/csharp-signals-events.md` for full C# signal documentation. Quick reference:

```csharp
// Declare
[Signal] public delegate void HealthChangedEventHandler(int newHealth);

// Emit
EmitSignal(SignalName.HealthChanged, _health);

// Connect (C# event)
player.HealthChanged += OnHealthChanged;

// Connect (Godot Callable)
player.Connect(Player.SignalName.HealthChanged, new Callable(this, MethodName.OnHealthChanged));

// Await
await ToSignal(timer, Timer.SignalName.Timeout);
```
