# Tweens

## Overview

Tweens are lightweight, code-only animation objects for interpolating properties over time. In Godot 4, tweens are no longer nodes. Create them with `create_tween()` and they auto-cleanup when finished.

## Creating Tweens

```gdscript
# Bound to this node (pauses/frees with node)
var tween: Tween = create_tween()

# Bound to SceneTree (survives node removal — use for scene transitions)
var tween: Tween = get_tree().create_tween()
```

**Pitfall**: `Tween.new()` does not work in Godot 4. Always use `create_tween()`.

## Tweener Types

### tween_property
Animate any node property from current value to target:
```gdscript
var tween := create_tween()
tween.tween_property($Sprite2D, "position", Vector2(400, 300), 1.0)
tween.tween_property($Sprite2D, "modulate:a", 0.0, 0.5)  # Sub-property
tween.tween_property($Sprite2D, "rotation", TAU, 2.0)     # Full rotation
```

#### from()
Override the starting value:
```gdscript
tween.tween_property($Sprite2D, "position", Vector2(400, 300), 1.0) \
    .from(Vector2(0, 0))
```

#### from_current()
Explicitly capture the current value at tween start (default behavior, but useful after `set_parallel`):
```gdscript
tween.tween_property($Sprite2D, "scale", Vector2(2, 2), 0.5).from_current()
```

#### as_relative()
Target value is relative to current:
```gdscript
# Move 100px right from wherever it currently is
tween.tween_property($Sprite2D, "position:x", 100.0, 0.5).as_relative()
```

### tween_interval
Wait for a duration:
```gdscript
tween.tween_property($Sprite2D, "modulate", Color.RED, 0.2)
tween.tween_interval(0.5)  # Wait 0.5 seconds
tween.tween_property($Sprite2D, "modulate", Color.WHITE, 0.2)
```

### tween_callback
Call a function at a specific point:
```gdscript
tween.tween_callback($Sprite2D.queue_free)
tween.tween_callback(func() -> void: print("done"))
tween.tween_callback(spawn_enemy.bind(position))
```

### tween_method
Call a method repeatedly with an interpolated value:
```gdscript
# Animate a custom method
tween.tween_method(_set_health_bar, 1.0, 0.0, 2.0)

func _set_health_bar(value: float) -> void:
    $HealthBar.value = value * 100

# Animate a shader parameter
tween.tween_method(
    func(v: float) -> void: material.set_shader_parameter("dissolve", v),
    0.0, 1.0, 1.5
)
```

## Sequencing

By default, tweeners run **sequentially** (one after another):

```gdscript
var tween := create_tween()
tween.tween_property($Sprite2D, "position:x", 400.0, 0.5)  # Step 1
tween.tween_property($Sprite2D, "position:y", 300.0, 0.5)  # Step 2 (after 1)
tween.tween_callback(queue_free)                              # Step 3 (after 2)
```

### Parallel Execution

#### parallel() — make one tweener parallel with the previous
```gdscript
var tween := create_tween()
tween.tween_property($Sprite2D, "position:x", 400.0, 0.5)
tween.parallel().tween_property($Sprite2D, "modulate:a", 0.0, 0.5)  # Runs with above
tween.tween_callback(queue_free)  # Runs after both finish
```

#### set_parallel(true) — all tweeners run in parallel by default
```gdscript
var tween := create_tween().set_parallel(true)
tween.tween_property($Sprite2D, "position:x", 400.0, 0.5)
tween.tween_property($Sprite2D, "modulate:a", 0.0, 0.5)
# Both run simultaneously

# Switch back to sequential with chain()
tween.chain().tween_callback(queue_free)  # After both parallel tweens
```

## Easing & Transitions

Control the animation curve:

```gdscript
# Per-tweener
tween.tween_property($Node, "position:y", 0.0, 0.5) \
    .set_ease(Tween.EASE_OUT) \
    .set_trans(Tween.TRANS_BOUNCE)

# Default for entire tween
var tween := create_tween() \
    .set_ease(Tween.EASE_IN_OUT) \
    .set_trans(Tween.TRANS_CUBIC)
```

### Transition Types
| Constant | Shape |
|---|---|
| TRANS_LINEAR | Constant speed |
| TRANS_SINE | Smooth sine wave |
| TRANS_CUBIC | Cubic curve (common default) |
| TRANS_QUAD | Quadratic |
| TRANS_QUART | Quartic |
| TRANS_QUINT | Quintic |
| TRANS_EXPO | Exponential |
| TRANS_CIRC | Circular |
| TRANS_ELASTIC | Spring overshoot |
| TRANS_BOUNCE | Bouncing |
| TRANS_BACK | Slight overshoot and return |
| TRANS_SPRING | Spring (4.3+) |

### Ease Types
| Constant | Effect |
|---|---|
| EASE_IN | Starts slow, accelerates |
| EASE_OUT | Starts fast, decelerates |
| EASE_IN_OUT | Slow start and end |
| EASE_OUT_IN | Fast start and end |

## Looping

```gdscript
var tween := create_tween().set_loops(3)  # Play 3 times total
var tween := create_tween().set_loops()   # Infinite loop
```

## Delay

```gdscript
# Delay a specific tweener
tween.tween_property($Node, "position:x", 100.0, 0.5).set_delay(0.3)
```

## Process Mode

```gdscript
# Run during physics (default is idle/process)
tween.set_process_mode(Tween.TWEEN_PROCESS_PHYSICS)

# Ignore pause
tween.set_pause_mode(Tween.TWEEN_PAUSE_PROCESS)  # Runs even when tree is paused
```

## Lifecycle

```gdscript
tween.is_running()   # Currently animating
tween.is_valid()     # Not killed/finished
tween.pause()        # Pause
tween.play()         # Resume
tween.stop()         # Stop + invalidate
tween.kill()         # Immediately invalidate

# Signals
tween.finished.connect(func() -> void: print("tween done"))
tween.step_finished.connect(func(idx: int) -> void: print("step ", idx))
tween.loop_finished.connect(func(loop: int) -> void: print("loop ", loop))
```

## Awaiting Tweens

```gdscript
func fade_out() -> void:
    var tween := create_tween()
    tween.tween_property(self, "modulate:a", 0.0, 0.5)
    await tween.finished
    queue_free()
```

## Common Recipes

### Flash/Hit Effect
```gdscript
func flash_hit() -> void:
    var tween := create_tween()
    tween.tween_property($Sprite2D, "modulate", Color.RED, 0.05)
    tween.tween_property($Sprite2D, "modulate", Color.WHITE, 0.1)
```

### Damage Number Float
```gdscript
func spawn_damage(amount: int, pos: Vector2) -> void:
    var label := Label.new()
    label.text = str(amount)
    label.position = pos
    add_child(label)

    var tween := create_tween().set_parallel(true)
    tween.tween_property(label, "position:y", pos.y - 50, 0.6)
    tween.tween_property(label, "modulate:a", 0.0, 0.6) \
        .set_ease(Tween.EASE_IN)
    tween.chain().tween_callback(label.queue_free)
```

### Screen Shake
```gdscript
func screen_shake(intensity: float, duration: float) -> void:
    var camera: Camera2D = get_viewport().get_camera_2d()
    var tween := create_tween()
    tween.set_loops(int(duration / 0.05))
    tween.tween_property(camera, "offset",
        Vector2(randf_range(-1, 1), randf_range(-1, 1)) * intensity, 0.05)
    tween.tween_callback(func() -> void: camera.offset = Vector2.ZERO)
```

### Button Bounce
```gdscript
func _on_button_pressed() -> void:
    var tween := create_tween()
    tween.tween_property($Button, "scale", Vector2(1.2, 1.2), 0.1)
    tween.tween_property($Button, "scale", Vector2(1.0, 1.0), 0.1)
```

## Pitfalls

1. **Stacking tweens**: Multiple tweens on the same property conflict. Kill the old one first:
   ```gdscript
   if active_tween and active_tween.is_running():
       active_tween.kill()
   active_tween = create_tween()
   ```
2. **Tween on freed node**: Bound tweens auto-stop when the node frees. SceneTree tweens do not — they crash if accessing a freed node.
3. **set_parallel affects all subsequent tweeners**: Use `chain()` to return to sequential mode.
4. **finished signal not emitted for infinite loops**: Use `loop_finished` instead.
