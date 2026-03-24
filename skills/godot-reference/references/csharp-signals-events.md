# C# Signals & Events in Godot

## Signal Declaration

Declare signals with `[Signal]` on a `delegate`. The delegate name **must** end with `EventHandler`:

```csharp
[Signal] public delegate void HealthChangedEventHandler(int newHealth);
[Signal] public delegate void DiedEventHandler();
[Signal] public delegate void ItemPickedUpEventHandler(string itemName, int quantity);
```

Godot source generators create:
- An event named without the `EventHandler` suffix (e.g. `HealthChanged`)
- A `SignalName.HealthChanged` constant for type-safe string references
- Marshalling code for engine interop

**Requirement**: Build the project after adding/changing signals. The editor won't see them until built.

## Emitting Signals

Always use `EmitSignal()` — never use C# event `Invoke()`:

```csharp
public void TakeDamage(int amount)
{
    _health -= amount;
    EmitSignal(SignalName.HealthChanged, _health);

    if (_health <= 0)
    {
        EmitSignal(SignalName.Died);
    }
}
```

**Why not Invoke?** `EmitSignal()` notifies both C# and GDScript listeners, plus the engine itself. `Invoke()` only calls C# delegates — GDScript connections and engine-side listeners are skipped.

## Connecting Signals

### Method 1: C# Events (`+=` / `-=`)

Most idiomatic for C#. Works with lambdas and method groups:

```csharp
public override void _Ready()
{
    // Lambda
    var timer = GetNode<Timer>("Timer");
    timer.Timeout += () => GD.Print("Timeout!");

    // Method group
    var button = GetNode<Button>("Button");
    button.Pressed += OnButtonPressed;

    // Custom signal on another node
    var player = GetNode<Player>("Player");
    player.HealthChanged += OnPlayerHealthChanged;
}

private void OnButtonPressed()
{
    GD.Print("Button pressed");
}

private void OnPlayerHealthChanged(int newHealth)
{
    _healthLabel.Text = $"HP: {newHealth}";
}
```

**Disconnecting**:
```csharp
button.Pressed -= OnButtonPressed;
player.HealthChanged -= OnPlayerHealthChanged;
```

### Method 2: Connect() with Callable

More verbose, but auto-disconnects when the receiving node is freed:

```csharp
public override void _Ready()
{
    var button = GetNode<Button>("Button");
    button.Connect(Button.SignalName.Pressed, new Callable(this, MethodName.OnButtonPressed));

    // One-shot connection
    button.Connect(
        Button.SignalName.Pressed,
        new Callable(this, MethodName.OnButtonPressed),
        (uint)ConnectFlags.OneShot
    );
}
```

### Method 3: Connect() with Callable.From

Bridges lambdas into the engine's Callable system:

```csharp
var button = GetNode<Button>("Button");
button.Connect(Button.SignalName.Pressed, Callable.From(() =>
{
    GD.Print("Pressed via Callable.From");
}));

// With arguments
var player = GetNode<Player>("Player");
player.Connect(Player.SignalName.HealthChanged, Callable.From<int>((health) =>
{
    GD.Print($"Health is now {health}");
}));
```

## Connection Cleanup Rules

| Method | Auto-disconnect on node free? | Notes |
|---|---|---|
| `+=` with method group | Yes (if no capture) | Godot tracks via `Delegate.Target` |
| `+=` with lambda (no capture) | Yes | Target is the creating instance |
| `+=` with lambda (captures vars) | **No** | Target becomes a compiler-generated closure |
| `Connect()` with Callable | Yes | Engine manages lifecycle |

### The Lambda Capture Problem

When a lambda captures a variable, the C# compiler generates a closure class. Godot can no longer determine the original instance, breaking auto-cleanup:

```csharp
// DANGEROUS — captures `x`, won't auto-disconnect
int x = 0;
timer.Timeout += () =>
{
    x++;
    GD.Print($"Tick {x}, name: {Name}");
    if (x >= 3)
        QueueFree();  // After free, next tick crashes
};
```

After `QueueFree()`, the lambda still fires on tick 4, accessing a disposed node.

**Fix**: Store the delegate reference and manually disconnect:
```csharp
private Action _timerCallback;

public override void _Ready()
{
    int x = 0;
    _timerCallback = () =>
    {
        x++;
        GD.Print($"Tick {x}");
    };
    timer.Timeout += _timerCallback;
}

public override void _ExitTree()
{
    timer.Timeout -= _timerCallback;
}
```

**Or**: Use `Connect()` with `Callable.From()` for engine-managed lifetime. But note: `Callable.From` with a capturing lambda has the same fundamental issue.

**Best practice**: For connections that outlive a single frame, prefer method groups (no captures) or `Connect()` with named methods.

## SignalName and MethodName

Generated nested classes provide compile-time safe string constants:

```csharp
// Signal names
EmitSignal(SignalName.HealthChanged, _health);
button.Connect(Button.SignalName.Pressed, callable);
await ToSignal(timer, Timer.SignalName.Timeout);

// Method names (for Callable)
new Callable(this, MethodName.OnButtonPressed);

// Property names
GetMeta(PropertyName.Speed);
```

Use these instead of raw strings. They catch typos at compile time.

## Awaiting Signals

```csharp
// Wait for a signal
await ToSignal(GetTree().CreateTimer(2.0), SceneTreeTimer.SignalName.Timeout);

// Wait for animation
var anim = GetNode<AnimationPlayer>("AnimationPlayer");
anim.Play("attack");
await ToSignal(anim, AnimationPlayer.SignalName.AnimationFinished);

// Wait for next frame
await ToSignal(GetTree(), SceneTree.SignalName.ProcessFrame);

// Wait for physics frame
await ToSignal(GetTree(), SceneTree.SignalName.PhysicsFrame);
```

`ToSignal()` returns a `SignalAwaiter` — it pauses the current method until the signal fires. Unlike GDScript's `await`, C# `await` integrates with the standard `async`/`await` pattern.

### Capturing Signal Arguments from ToSignal
```csharp
var result = await ToSignal(anim, AnimationPlayer.SignalName.AnimationFinished);
// result is Godot.Collections.Array containing signal arguments
string animName = result[0].AsString();
```

## Common Signal Patterns

### Event Bus (Global Signal Hub)

Create an autoload singleton:

```csharp
// EventBus.cs — register as Autoload in Project Settings
public partial class EventBus : Node
{
    public static EventBus Instance { get; private set; }

    [Signal] public delegate void PlayerDiedEventHandler();
    [Signal] public delegate void ScoreChangedEventHandler(int newScore);
    [Signal] public delegate void LevelCompletedEventHandler(int levelId);

    public override void _EnterTree()
    {
        Instance = this;
    }
}

// Emitter (anywhere)
EventBus.Instance.EmitSignal(EventBus.SignalName.PlayerDied);

// Listener
public override void _Ready()
{
    EventBus.Instance.PlayerDied += OnPlayerDied;
}

public override void _ExitTree()
{
    EventBus.Instance.PlayerDied -= OnPlayerDied;
}
```

### Connecting in Editor

Signals declared with `[Signal]` appear in the Node > Signals panel after a Build. You can connect them visually in the editor just like GDScript signals. The generated method stub uses the naming convention `_on_NodeName_SignalName`.

### One-Shot Connections

```csharp
// C# event style — manual disconnect after first call
void OneShotExample()
{
    Action handler = null;
    handler = () =>
    {
        GD.Print("Fired once");
        button.Pressed -= handler;
    };
    button.Pressed += handler;
}

// Connect style — cleaner
button.Connect(
    Button.SignalName.Pressed,
    Callable.From(OnButtonPressed),
    (uint)ConnectFlags.OneShot
);
```

### Deferred Connections

```csharp
button.Connect(
    Button.SignalName.Pressed,
    Callable.From(OnButtonPressed),
    (uint)ConnectFlags.Deferred  // Callback runs at end of frame
);
```

## GDScript Signal ↔ C# Signal

Cross-language signal connections work transparently:

```csharp
// C# node emits
[Signal] public delegate void DamageTakenEventHandler(int amount);
EmitSignal(SignalName.DamageTaken, 25);
```

```gdscript
# GDScript connects to the C# signal
func _ready() -> void:
    var csharp_node = $CSharpNode
    csharp_node.DamageTaken.connect(_on_damage_taken)

func _on_damage_taken(amount: int) -> void:
    print("Damage: ", amount)
```

And vice versa — C# can connect to GDScript signals using string names:
```csharp
var gdNode = GetNode("GDScriptNode");
gdNode.Connect("health_changed", new Callable(this, MethodName.OnHealthChanged));
```

Note: GDScript signal names remain in `snake_case` when referenced from C#.

## Pure C# Events (Non-Godot)

For communication between C# classes that don't need engine interop (not visible to GDScript, not connectable in editor), use standard C# events:

```csharp
public event Action<int> OnScoreChanged;
public event Action OnGameOver;

// Emit
OnScoreChanged?.Invoke(newScore);
OnGameOver?.Invoke();

// Subscribe
scoreManager.OnScoreChanged += HandleScore;
```

These are faster (no Variant marshalling) but invisible to the Godot engine. Use them for internal C#-only systems.
