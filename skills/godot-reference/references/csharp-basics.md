# C# Basics in Godot

## Prerequisites

- Download the **.NET-enabled** Godot editor (separate download from standard editor)
- Install .NET SDK 6.0+ (Godot bundles the runtime, but not the build tools)
- External IDE recommended: Visual Studio 2022, Rider, or VS Code with C# extension

## Project Setup

When you first attach a C# script to a node, Godot generates:
- `*.csproj` — the C# project file (NuGet refs, SDK version)
- `*.sln` — the Visual Studio solution file

Both are auto-managed. Manual edits needed only for NuGet packages or multi-project setups.

### Adding NuGet Packages
Edit the `.csproj`:
```xml
<ItemGroup>
    <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
</ItemGroup>
```
Godot downloads packages on next build.

## Script Structure

```csharp
using Godot;

// partial is MANDATORY — source generators inject code for exports, signals
public partial class Player : CharacterBody2D
{
    // Exports (visible in Inspector)
    [Export] public float Speed { get; set; } = 200.0f;
    [Export] public int MaxHealth { get; set; } = 100;

    // Signals
    [Signal] public delegate void HealthChangedEventHandler(int newHealth);

    // Private fields
    private int _health;
    private AnimationPlayer _animPlayer;

    // Lifecycle
    public override void _Ready()
    {
        _health = MaxHealth;
        _animPlayer = GetNode<AnimationPlayer>("AnimationPlayer");
    }

    public override void _PhysicsProcess(double delta)
    {
        var velocity = Velocity;
        // ... movement logic
        Velocity = velocity;
        MoveAndSlide();
    }

    // Custom methods
    public void TakeDamage(int amount)
    {
        _health = Mathf.Max(_health - amount, 0);
        EmitSignal(SignalName.HealthChanged, _health);
    }
}
```

### Why `partial`?
Godot's source generators emit a companion partial class containing marshalling code for `[Export]`, `[Signal]`, property registration, and other engine interop. Without `partial`, none of these work.

## Naming Conventions

Godot's C# API translates GDScript's `snake_case` to C#'s `PascalCase` automatically:

| GDScript | C# |
|---|---|
| `position` | `Position` |
| `global_position` | `GlobalPosition` |
| `move_and_slide()` | `MoveAndSlide()` |
| `is_on_floor()` | `IsOnFloor()` |
| `queue_free()` | `QueueFree()` |
| `_ready()` | `_Ready()` |
| `_process(delta)` | `_Process(double delta)` |
| `_physics_process(delta)` | `_PhysicsProcess(double delta)` |

**Exception**: String-based methods like `Call()`, `Connect()`, `EmitSignal()` still require the original snake_case name when passing method/signal names as strings.

## Lifecycle Methods

All are `public override void`:

```csharp
public override void _EnterTree() { }     // Added to scene tree
public override void _Ready() { }          // Node + children ready
public override void _Process(double delta) { }         // Every frame
public override void _PhysicsProcess(double delta) { }  // Fixed timestep
public override void _Input(InputEvent @event) { }      // Input events
public override void _UnhandledInput(InputEvent @event) { }
public override void _ExitTree() { }       // Removed from scene tree
```

**Note**: `delta` is `double` in C# (not `float`). Cast when needed:
```csharp
Position += velocity * (float)delta;
```

## Exports

### Basic Exports
```csharp
[Export] public float Speed { get; set; } = 200.0f;
[Export] public string PlayerName { get; set; } = "Hero";
[Export] public Color Tint { get; set; } = Colors.White;
[Export] public PackedScene BulletScene { get; set; }
[Export] public Texture2D Icon { get; set; }
[Export] public Node2D Target { get; set; }
```

### Range
```csharp
[Export(PropertyHint.Range, "0,100,1")]
public int Health { get; set; } = 100;

[Export(PropertyHint.Range, "0,1,0.01")]
public float Volume { get; set; } = 0.5f;

[Export(PropertyHint.Range, "0,1000,10,or_greater")]
public float Damage { get; set; } = 50.0f;

[Export(PropertyHint.Range, "0,100,1,suffix:m/s")]
public float MaxSpeed { get; set; } = 50;
```

### Enums
```csharp
public enum Element { Fire, Water, Earth, Wind }

[Export] public Element CurrentElement { get; set; } = Element.Fire;
// Automatically creates a dropdown in Inspector
```

### Flags (Bitfield)
```csharp
[Flags]
public enum Abilities
{
    None    = 0,
    CanFly  = 1 << 0,
    CanSwim = 1 << 1,
    CanDig  = 1 << 2,
}

[Export] public Abilities Skills { get; set; } = Abilities.None;
// Creates checkbox flags in Inspector
```

### File / Dir
```csharp
[Export(PropertyHint.File, "*.png,*.jpg")]
public string TexturePath { get; set; }

[Export(PropertyHint.Dir)]
public string DataDirectory { get; set; }

[Export(PropertyHint.GlobalFile, "*.json")]
public string ConfigPath { get; set; }
```

### Multiline
```csharp
[Export(PropertyHint.MultilineText)]
public string Description { get; set; } = "";
```

### Groups and Categories
```csharp
[ExportGroup("Movement")]
[Export] public float Speed { get; set; } = 200.0f;
[Export] public float Acceleration { get; set; } = 500.0f;

[ExportGroup("Combat")]
[Export] public int AttackDamage { get; set; } = 10;

[ExportSubgroup("Ranged")]
[Export] public float ProjectileSpeed { get; set; } = 400.0f;

[ExportCategory("Player Settings")]
[Export] public string DisplayName { get; set; } = "";
```

### Typed Arrays and Resources
```csharp
[Export] public Godot.Collections.Array<Node2D> Waypoints { get; set; }
[Export] public Godot.Collections.Array<PackedScene> Levels { get; set; }
[Export] public WeaponData WeaponStats { get; set; }  // Custom Resource
```

## Node References

No `@onready` equivalent — use `_Ready()`:
```csharp
private Sprite2D _sprite;
private AnimationPlayer _anim;
private CollisionShape2D _collision;

public override void _Ready()
{
    _sprite = GetNode<Sprite2D>("Sprite2D");
    _anim = GetNode<AnimationPlayer>("AnimationPlayer");
    _collision = GetNode<CollisionShape2D>("CollisionShape2D");
}
```

### Typed GetNode
```csharp
// Generic — throws if node not found or wrong type
var player = GetNode<Player>("Player");

// Nullable — returns null if not found
var player = GetNodeOrNull<Player>("Player");

// TryGetNode — returns bool
if (TryGetNode("Player", out Player player))
{
    player.TakeDamage(10);
}
```

## Godot Utility Classes

### GD (Global Functions)
```csharp
GD.Print("debug");              // stdout
GD.PrintErr("error");           // stderr
GD.PushWarning("warning");      // editor warning
GD.PushError("error");          // editor error
GD.PrintRich("[color=red]colored[/color]");

var scene = GD.Load<PackedScene>("res://scenes/bullet.tscn");
var texture = GD.Load<Texture2D>("res://art/player.png");
```

### Mathf
```csharp
Mathf.Clamp(value, 0.0f, 1.0f);
Mathf.Lerp(a, b, 0.5f);
Mathf.Remap(value, 0, 100, 0, 1);
Mathf.Snapped(value, 0.25f);
Mathf.MoveToward(current, target, step);
Mathf.IsEqualApprox(a, b);
```

### Engine Singletons
Engine singletons are static classes in C#:
```csharp
Input.IsActionPressed("jump");
Input.GetVector("left", "right", "up", "down");

var tween = CreateTween();
GetTree().ChangeSceneToFile("res://scenes/main.tscn");

ResourceLoader.LoadThreadedRequest("res://big_level.tscn");
```

## Collections

### Godot Collections (Variant-compatible, required for engine interop)
```csharp
var arr = new Godot.Collections.Array<int> { 1, 2, 3 };
var dict = new Godot.Collections.Dictionary<string, int>
{
    { "health", 100 },
    { "mana", 50 },
};
```

### System Collections (C#-native, for internal logic)
```csharp
var list = new List<Enemy>();
var map = new Dictionary<string, int>();
```

**Rule**: Use `Godot.Collections` when passing data to/from the engine (exports, signals, Variant). Use `System.Collections.Generic` for internal logic.

## Custom Resources

```csharp
using Godot;

[GlobalClass]  // Makes it visible in editor's Create Resource dialog
public partial class WeaponData : Resource
{
    [Export] public string Name { get; set; } = "";
    [Export] public int Damage { get; set; } = 10;
    [Export] public float AttackSpeed { get; set; } = 1.0f;
    [Export] public Texture2D Icon { get; set; }
    [Export] public PackedScene ProjectileScene { get; set; }
}
```

Save as `.tres` files in the editor. Assign via `[Export]` on other scripts.

**Pitfall**: Resources are shared by default. Modify at runtime only after `Duplicate()`:
```csharp
public override void _Ready()
{
    WeaponStats = (WeaponData)WeaponStats.Duplicate();
}
```

## GlobalClass

`[GlobalClass]` registers a C# class so it appears in editor dialogs (Create New Node, Create Resource) — equivalent to GDScript's `class_name`:
```csharp
[GlobalClass]
public partial class EnemySpawner : Node2D { }
```

**Requirement**: Class name must match filename. `EnemySpawner` must be in `EnemySpawner.cs`. You must **Build** the project (top-right button) before the class appears in the editor.

## Tool Scripts

```csharp
[Tool]  // Equivalent to GDScript's @tool
public partial class EditorGizmo : Node2D
{
    [Export] public float Radius { get; set; } = 50.0f;

    public override void _Process(double delta)
    {
        if (Engine.IsEditorHint())
        {
            QueueRedraw();
            return;
        }
        // Game-only logic
    }

    public override void _Draw()
    {
        DrawCircle(Vector2.Zero, Radius, Colors.Red);
    }
}
```

## Async / Await

C# uses `async`/`await` with `ToSignal()` instead of GDScript's `await`:

```csharp
public async void PlayCutscene()
{
    var animPlayer = GetNode<AnimationPlayer>("AnimationPlayer");

    animPlayer.Play("intro");
    await ToSignal(animPlayer, AnimationPlayer.SignalName.AnimationFinished);

    animPlayer.Play("dialogue");
    await ToSignal(animPlayer, AnimationPlayer.SignalName.AnimationFinished);

    GD.Print("Cutscene done");
}

// Timer delay
public async void SpawnAfterDelay(float seconds)
{
    await ToSignal(GetTree().CreateTimer(seconds), SceneTreeTimer.SignalName.Timeout);
    SpawnEnemy();
}
```

`ToSignal()` returns a `SignalAwaiter` that works with C#'s `await`. You can also `await` standard `Task` objects, but they run on the thread pool — not the main thread. Use `ToSignal` for Godot signals.

**Pitfall**: `async void` methods swallow exceptions silently. Wrap in try/catch or use `async Task` where possible.

## Struct Gotcha

Godot math types (`Vector2`, `Vector3`, `Transform2D`, etc.) are C# structs — copied on assignment. You cannot modify a struct property in-place:

```csharp
// WRONG — modifies a copy, does nothing
Position.X = 100;

// RIGHT — assign the whole struct
var pos = Position;
pos.X = 100;
Position = pos;

// Or one-liner
Position = new Vector2(100, Position.Y);
Position += new Vector2(10, 0);
```

## Common Pitfalls

1. **Forgetting `partial`**: Exports and signals silently fail
2. **Forgetting to Build**: Editor doesn't see new exports/signals/GlobalClass until you click Build
3. **Class name ≠ filename**: Must match exactly for `[GlobalClass]` and editor registration
4. **`delta` is `double`**: Cast to `float` when multiplying with `Vector2`/`Vector3`
5. **Struct copy semantics**: Can't modify `Position.X` directly
6. **`Invoke` doesn't emit signals**: Use `EmitSignal()`, not C# event invoke
7. **No `@onready`**: Initialize node references in `_Ready()`
8. **Godot vs System collections**: Engine methods need `Godot.Collections` types
