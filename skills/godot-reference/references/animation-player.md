# AnimationPlayer

## Overview

AnimationPlayer stores and plays Animation resources. It can animate **any property** of **any node** in the scene — position, color, shader params, script variables, method calls. Since 4.2, AnimationPlayer extends `AnimationMixer`, which manages animation libraries and blending.

## Scene Structure

```
CharacterBody2D
├── Sprite2D
├── CollisionShape2D
└── AnimationPlayer   # Sibling or child, references nodes via relative paths
```

The `root_node` property (inherited from AnimationMixer) determines the base path for animation tracks. Default is `".."` (parent of AnimationPlayer).

## Animation Libraries

Animations are organized into `AnimationLibrary` resources. Each library has a key:

```gdscript
# Default library (key = "")  — animations referenced as "idle", "run"
# Named library (key = "attacks") — animations referenced as "attacks/slash"

# Add programmatically
var lib := AnimationLibrary.new()
lib.add_animation("idle", idle_anim)
$AnimationPlayer.add_animation_library("", lib)  # Default library
```

Most projects use just the default library. Named libraries are useful for organizing large animation sets (e.g., imported from different sources).

## Track Types

| Track Type | What It Does |
|---|---|
| Property | Animates any property (position, modulate, custom vars) |
| Method Call | Calls methods at specific times |
| Bezier | Smooth float curves with handles |
| Audio | Plays audio streams at keyframes |
| Animation | Triggers other animations on other AnimationPlayers |
| Blend Shape | 3D mesh blend shapes |
| Expression | GDScript expressions evaluated at keyframes |

### Property Tracks

The most common track type. Path format: `NodePath:property`:
```
# Examples
Sprite2D:position
Sprite2D:modulate
Sprite2D:modulate:a    # Sub-property (alpha only)
CollisionShape2D:disabled
```

### Update Modes

Each track has an update mode:

| Mode | Behavior |
|---|---|
| Continuous | Interpolates between keyframes (default for float, Vector, Color) |
| Discrete | Snaps to keyframe values (default for bool, enum, string) |
| Capture | Captures current value at play start, interpolates from it to first keyframe |

**Capture mode** is key for smooth transitions when the object's current state doesn't match the animation's starting keyframe.

### Method Call Tracks

Call methods at specific times during an animation:
```
# Track path: Sprite2D
# Key: time=0.5, method="set_flip_h", args=[true]
```

Useful for triggering sound effects, spawning particles, or game logic at precise animation moments.

## Playback

### Basic API
```gdscript
@onready var anim: AnimationPlayer = $AnimationPlayer

func _ready() -> void:
    anim.play("idle")

# Play with options
anim.play("run")                       # Play from start
anim.play("run", -1, 2.0)             # custom_speed = 2x
anim.play("run", -1, -1.0, true)      # Play backwards
anim.play_backwards("run")            # Equivalent to above
anim.play("run", 0.3)                 # 0.3s crossfade from current

# Pause / resume
anim.pause()
anim.play()  # Resumes with same animation

# Stop
anim.stop()  # Resets to frame 0
anim.stop(true)  # keep_state=true, freezes at current frame

# Seek
anim.seek(1.5)       # Jump to 1.5 seconds
anim.advance(0.0)    # Force immediate update (apply current frame)
```

### Queue
```gdscript
anim.play("attack")
anim.queue("idle")  # Plays idle after attack finishes
# Queue only works for the default animation player queue
```

**Pitfall**: `queue()` only fires if the current animation finishes naturally. If you call `play()` with a new animation before the current one ends, the queue is cleared.

### Blend Times
```gdscript
# Set crossfade time between specific animations
anim.set_blend_time("idle", "run", 0.2)
anim.set_blend_time("run", "idle", 0.3)

# Default blend time (used when no specific blend is set)
anim.playback_default_blend_time = 0.1
```

### Speed Scale
```gdscript
anim.speed_scale = 1.5  # All animations play at 1.5x speed
```

## Signals

```gdscript
anim.animation_finished.connect(func(anim_name: StringName) -> void:
    if anim_name == &"death":
        queue_free()
)

anim.animation_changed.connect(func(old_name: StringName, new_name: StringName) -> void:
    pass
)

anim.current_animation_changed.connect(func(name: String) -> void:
    pass
)
```

**Note**: `animation_finished` does NOT emit for looping animations. It only fires when a non-looping animation reaches its end.

## Properties

```gdscript
anim.current_animation          # Currently playing animation name (String)
anim.assigned_animation         # Last played or currently playing
anim.current_animation_position # Playback position in seconds (float)
anim.current_animation_length   # Duration in seconds (float)
anim.is_playing()               # true if animating
anim.autoplay = "idle"          # Animation to play on scene load
```

## Creating Animations via Code

```gdscript
var anim_resource := Animation.new()
anim_resource.length = 1.0
anim_resource.loop_mode = Animation.LOOP_LINEAR  # or LOOP_NONE, LOOP_PINGPONG

# Add a property track
var track_idx: int = anim_resource.add_track(Animation.TYPE_VALUE)
anim_resource.track_set_path(track_idx, "Sprite2D:modulate")
anim_resource.track_insert_key(track_idx, 0.0, Color.WHITE)
anim_resource.track_insert_key(track_idx, 0.5, Color.RED)
anim_resource.track_insert_key(track_idx, 1.0, Color.WHITE)

# Add a method call track
var call_idx: int = anim_resource.add_track(Animation.TYPE_METHOD)
anim_resource.track_set_path(call_idx, ".")
anim_resource.track_insert_key(call_idx, 0.5, {
    "method": "spawn_particles",
    "args": []
})

# Register it
var lib := $AnimationPlayer.get_animation_library("")
lib.add_animation("flash", anim_resource)
```

## AnimationPlayer vs Tween

| Feature | AnimationPlayer | Tween |
|---|---|---|
| Editor visual timeline | Yes | No (code only) |
| Reusable animations | Yes (saved as resources) | No (created per-use) |
| Multiple track types | Yes (property, method, bezier, audio) | Property + callback only |
| Blending between animations | Yes | No |
| Best for | Complex, authored animations | Simple procedural animations |
| Fire-and-forget | No (persistent node) | Yes (auto-cleanup) |

Use AnimationPlayer for things you design visually. Use Tween for dynamic, code-driven animations.

## RESET Animation

A special animation named `RESET` captures default property values. When using AnimationTree, the RESET animation defines the rest pose for blending. Create it in the editor via Animation → Manage Animations → Reset button, or create a 0-length animation named "RESET" with keyframes at time 0 for all animated properties at their default values.
