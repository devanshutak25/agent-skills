# C# / GDScript Interop Reference

## Overview

Godot allows mixing C# and GDScript freely within a single project. Communication happens through Godot's Variant system, which bridges both languages via the engine's object model. Both languages can call methods, access properties, and connect signals on each other's nodes.

**Key rule**: C# ↔ GDScript interop always passes through Variant marshalling. This adds slight overhead compared to staying within one language but is negligible for most game logic.

## Calling GDScript from C#

GDScript members are not visible to the C# type system. Use `Call()`, `Get()`, `Set()`:

```csharp
// Get a node with a GDScript attached
var gdNode = GetNode("GDScriptEnemy");

// Call a method (use snake_case — GDScript convention)
gdNode.Call("take_damage", 25);

// Call with return value
Variant result = gdNode.Call("get_health");
int health = result.AsInt32();

// Get a property
float speed = gdNode.Get("speed").AsSingle();
string name = gdNode.Get("enemy_name").AsString();

// Set a property
gdNode.Set("speed", 300.0f);
gdNode.Set("enemy_name", "Orc");
```

### Type Conversions (Variant → C#)

```csharp
Variant v = gdNode.Call("some_method");

// Numeric
int i = v.AsInt32();
float f = v.AsSingle();
double d = v.AsDouble();

// Strings
string s = v.AsString();
StringName sn = v.AsStringName();

// Vectors
Vector2 v2 = v.AsVector2();
Vector3 v3 = v.AsVector3();

// Objects
Node node = v.As<Node>();
GodotObject obj = v.AsGodotObject();

// Collections
Godot.Collections.Array arr = v.AsGodotArray();
Godot.Collections.Dictionary dict = v.AsGodotDictionary();

// Boolean
bool b = v.AsBool();
```

### Checking GDScript Members

```csharp
// Check if method exists
if (gdNode.HasMethod("take_damage"))
{
    gdNode.Call("take_damage", 10);
}

// Check if signal exists
if (gdNode.HasSignal("died"))
{
    gdNode.Connect("died", new Callable(this, MethodName.OnEnemyDied));
}

// Check if property exists
if (gdNode.Get("health") is not null)
{
    // property exists
}
```

## Calling C# from GDScript

GDScript can call public C# methods and access public properties directly — no `Call()`/`Get()` needed — thanks to duck typing:

```gdscript
# Direct method call (Godot auto-converts PascalCase to snake_case)
var csharp_node = $CSharpPlayer
csharp_node.TakeDamage(25)        # Calls C# TakeDamage method
csharp_node.take_damage(25)       # ALSO works — Godot resolves both cases

# Direct property access
var health: int = csharp_node.MaxHealth
csharp_node.Speed = 300.0

# Signals
csharp_node.HealthChanged.connect(_on_health_changed)
csharp_node.connect("HealthChanged", _on_health_changed)
```

### What's Visible from GDScript

| C# Element | Visible in GDScript? | Notes |
|---|---|---|
| `public` methods | Yes | Auto snake_case conversion |
| `public` properties with `[Export]` | Yes | In Inspector + script |
| `public` properties without `[Export]` | Yes (via script) | Not in Inspector |
| `private` / `internal` | No | Not exposed to engine |
| `[Signal]` delegates | Yes | Appear in Signals panel |
| `static` methods | No | GDScript can't call C# static methods |
| `[GlobalClass]` | Yes | Appears in node/resource creation |

**Pitfall**: GDScript cannot see C# classes as types for `is` checks or type hints unless they use `[GlobalClass]`. Without it, GDScript treats them as their base engine type.

## Signal Interop

### C# Signal → GDScript Listener
```csharp
// C# declaration
[Signal] public delegate void DamageTakenEventHandler(int amount);

// C# emission
EmitSignal(SignalName.DamageTaken, 25);
```

```gdscript
# GDScript connection
func _ready() -> void:
    $CSharpNode.DamageTaken.connect(_on_damage_taken)
    # or: $CSharpNode.connect("DamageTaken", _on_damage_taken)

func _on_damage_taken(amount: int) -> void:
    print("Took ", amount, " damage")
```

### GDScript Signal → C# Listener
```gdscript
# GDScript declaration
signal health_changed(new_health: int)

# GDScript emission
health_changed.emit(current_health)
```

```csharp
// C# connection (use snake_case string — GDScript convention)
var gdNode = GetNode("GDScriptNode");
gdNode.Connect("health_changed", new Callable(this, MethodName.OnHealthChanged));

private void OnHealthChanged(int newHealth)
{
    GD.Print($"Health: {newHealth}");
}

// Or with Callable.From
gdNode.Connect("health_changed", Callable.From<int>((health) =>
{
    GD.Print($"Health: {health}");
}));
```

### Awaiting GDScript Signals from C#
```csharp
var gdNode = GetNode("GDScriptNode");
await ToSignal(gdNode, "animation_done");  // snake_case string
```

## Variant Marshalling

Every C# ↔ engine call passes through Variant. The marshalling layer handles type conversion automatically:

| C# Type | Variant Type | Notes |
|---|---|---|
| `bool` | Bool | |
| `int`, `long` | Int | |
| `float`, `double` | Float | |
| `string` | String | |
| `StringName` | StringName | |
| `Vector2/3/4` | Vector2/3/4 | Structs, copied |
| `Color` | Color | |
| `Node`, `Resource`, etc. | Object | Reference to engine object |
| `Godot.Collections.Array` | Array | |
| `Godot.Collections.Dictionary` | Dictionary | |
| `byte[]` | PackedByteArray | |
| `int[]` | PackedInt32Array | |
| `float[]` | PackedFloat32Array | |
| C# enum | Int | Marshalled as integer |

### MustBeVariant Constraint
Generic Godot collections require types that can be marshalled to Variant:
```csharp
// Works — int is Variant-compatible
Godot.Collections.Array<int> scores;

// Compile error — custom C# class not Variant-compatible
// Godot.Collections.Array<MyPureCSharpClass> items;

// Works — Godot classes are Variant-compatible
Godot.Collections.Array<Node2D> nodes;
```

## Async Interop Limitations

C# `Task` and GDScript `await` are **not interoperable**:
- GDScript cannot `await` a C# `Task`
- C# cannot `await` a GDScript coroutine directly

**Bridge pattern**: Use signals as the async boundary:
```csharp
// C# — does async work, then emits signal
[Signal] public delegate void WorkCompletedEventHandler(string result);

public async void DoAsyncWork()
{
    var result = await Task.Run(() => HeavyComputation());
    // Marshal back to main thread
    CallDeferred(MethodName.EmitWorkCompleted, result);
}

private void EmitWorkCompleted(string result)
{
    EmitSignal(SignalName.WorkCompleted, result);
}
```

```gdscript
# GDScript awaits the signal
var result: String = await csharp_node.WorkCompleted
```

## GDExtension Limitation

C# **cannot** directly call GDExtension methods — Godot does not generate C# bindings for GDExtensions. Workaround:

1. Create a GDScript wrapper that calls the GDExtension
2. Call the wrapper from C# via `Call()`:

```gdscript
# gd_extension_wrapper.gd
extends Node

func call_extension_method(args):
    return $GDExtensionNode.some_extension_method(args)
```

```csharp
var wrapper = GetNode("GDExtensionWrapper");
var result = wrapper.Call("call_extension_method", myArgs);
```

## Mixed Project Best Practices

1. **One language per node**: Don't attach both a C# and GDScript to the same node. Pick one.

2. **Call down, signal up**: Children call parent methods directly; parents listen to children via signals. This applies across languages.

3. **C# for systems, GDScript for glue**: Common pattern — heavy systems (inventory, networking, AI) in C#, quick prototyping and scene-specific logic in GDScript.

4. **Use [GlobalClass] on C# classes that GDScript needs to reference**: Otherwise GDScript sees them as their base engine type.

5. **Naming at the boundary**: When C# calls GDScript, use `snake_case` strings. When GDScript calls C#, both `PascalCase` and `snake_case` work (Godot auto-resolves).

6. **Build before testing**: C# changes require a Build. GDScript changes are hot-reloaded.

7. **Keep interop surfaces thin**: Minimize the number of cross-language calls in hot paths. Each call involves Variant marshalling overhead.

## Quick Reference: GDScript → C# Equivalents

| GDScript | C# |
|---|---|
| `extends Node2D` | `: Node2D` |
| `class_name Foo` | `[GlobalClass] public partial class Foo` |
| `@tool` | `[Tool]` |
| `@export var x: int` | `[Export] public int X { get; set; }` |
| `@onready var n = $Node` | `private Node _n; // in _Ready()` |
| `signal my_sig(x: int)` | `[Signal] public delegate void MySigEventHandler(int x);` |
| `my_sig.emit(42)` | `EmitSignal(SignalName.MySig, 42);` |
| `sig.connect(func)` | `sig += Method;` or `Connect(...)` |
| `await signal` | `await ToSignal(obj, SignalName.Sig);` |
| `await get_tree().create_timer(1.0).timeout` | `await ToSignal(GetTree().CreateTimer(1.0), SceneTreeTimer.SignalName.Timeout);` |
| `var x := $Node as Player` | `var x = GetNodeOrNull<Player>("Node");` |
| `if node is Player:` | `if (node is Player p) { }` |
| `queue_free()` | `QueueFree();` |
| `preload("res://x.tscn")` | `GD.Load<PackedScene>("res://x.tscn");` (runtime, no preload) |
| `print(x)` | `GD.Print(x);` |
| `push_warning(x)` | `GD.PushWarning(x);` |
| `Engine.is_editor_hint()` | `Engine.IsEditorHint()` |
| `Input.is_action_pressed(&"jump")` | `Input.IsActionPressed("jump")` |
