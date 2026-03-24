# AnimationTree

## Overview

AnimationTree builds on AnimationMixer to provide advanced animation blending, state machines, and blend trees. Since 4.2, AnimationTree can manage its own AnimationLibrary directly (no AnimationPlayer required), though you can still reference an external AnimationPlayer.

## Setup

In the Inspector:
1. Set Tree Root to the desired root node type
2. Assign Anim Player to your AnimationPlayer (or manage libraries directly since 4.2)
3. Set active = true

## Root Node Types

| Type | Use Case |
|---|---|
| AnimationNodeStateMachine | Discrete states with transitions (idle, run, jump) |
| AnimationNodeBlendTree | Graph-based blending (blend spaces, add, mix) |
| AnimationNodeBlendSpace1D | 1D blending axis (walk speed) |
| AnimationNodeBlendSpace2D | 2D blending (directional movement) |

## State Machine

The most common setup for character animation.

### Editor Setup
1. Set Tree Root to New AnimationNodeStateMachine
2. Right-click in the graph and Add Animation
3. Drag connections between states
4. Configure transition properties on each connection

### Transitions

| Property | Values | Meaning |
|---|---|---|
| Advance Mode | Auto, Enabled, Disabled | Auto = immediately; Enabled = requires travel() or condition |
| Switch Mode | Immediate, Sync, AtEnd | When to switch |
| Xfade Time | float (seconds) | Crossfade duration |
| Advance Condition | StringName | Boolean parameter that triggers transition |
| Priority | int | Lower = higher priority |

### Scripting State Machines

```gdscript
@onready var anim_tree: AnimationTree = $AnimationTree
@onready var state_machine: AnimationNodeStateMachinePlayback = anim_tree["parameters/playback"]

func _physics_process(delta: float) -> void:
    if Input.is_action_just_pressed(&"attack"):
        state_machine.travel(&"attack")
    elif velocity.length() > 10.0:
        state_machine.travel(&"run")
    else:
        state_machine.travel(&"idle")

    # Query current state
    var current: StringName = state_machine.get_current_node()
    var playing: bool = state_machine.is_playing()
```

### Advance Conditions

Boolean parameters that control automatic transitions:

```gdscript
anim_tree.set("parameters/conditions/is_running", velocity.length() > 10.0)
anim_tree.set("parameters/conditions/is_jumping", not is_on_floor())
anim_tree.set("parameters/conditions/is_attacking", attacking)
```

In the transition inspector, set Advance Condition to the parameter name.

## Blend Tree

For complex blending of multiple animations.

### Common Blend Nodes

| Node | Function |
|---|---|
| Animation | Plays a single animation |
| Blend2 | Blends two animations by weight (0.0-1.0) |
| Blend3 | Blends three animations (-1.0 to 1.0) |
| Add2 / Add3 | Additive blending |
| OneShot | Plays animation once over base |
| BlendSpace1D | 1D parameter blending |
| BlendSpace2D | 2D parameter blending |
| TimeScale | Adjusts playback speed |
| TimeSeek | Seeks to specific time |
| Transition | Switches between inputs with crossfade |

### BlendSpace2D

Directional animation blending (e.g., 8-directional movement):

```gdscript
# Place animations at blend points:
# (-1, 0) = walk_left, (1, 0) = walk_right
# (0, -1) = walk_up, (0, 1) = walk_down, (0, 0) = idle

var move_dir: Vector2 = Input.get_vector(&"left", &"right", &"up", &"down")
anim_tree.set("parameters/BlendSpace2D/blend_position", move_dir)
```

### OneShot

Plays animation on top of base, then returns:

```gdscript
# Trigger
anim_tree.set("parameters/OneShot/request", AnimationNodeOneShot.ONE_SHOT_REQUEST_FIRE)

# Abort
anim_tree.set("parameters/OneShot/request", AnimationNodeOneShot.ONE_SHOT_REQUEST_ABORT)

# Check if active
var active: bool = anim_tree.get("parameters/OneShot/active")
```

OneShot properties: mix_mode (Blend/Add), fadein_time, fadeout_time, auto_restart, break_loop_at_end.

## Parameters

AnimationTree exposes parameters at `parameters/...` paths:

```gdscript
# Set
anim_tree.set("parameters/Blend2/blend_amount", 0.5)
anim_tree.set("parameters/TimeScale/scale", 2.0)
anim_tree.set("parameters/BlendSpace1D/blend_position", speed)

# Get
var blend: float = anim_tree.get("parameters/Blend2/blend_amount")
```

## Nested State Machines

State machines can contain sub-state machines:

```
Root StateMachine
+-- idle
+-- Locomotion (Sub StateMachine)
|   +-- walk
|   +-- run
|   +-- sprint
+-- attack
+-- death
```

Travel into sub-state: `state_machine.travel(&"Locomotion/run")`

## Deterministic Mode

Default since 4.2. When total blend weight is 0, applies RESET animation value instead of leaving property unchanged. Prevents "stuck" values from partial blends.

## Root Motion

Extract root bone movement as actual node movement:

```gdscript
# Set root_motion_track to root bone path
anim_tree.root_motion_track = NodePath("Skeleton3D:Hips")

func _physics_process(delta: float) -> void:
    var root_pos: Vector3 = anim_tree.get_root_motion_position()
    var root_rot: Quaternion = anim_tree.get_root_motion_rotation()
    velocity = root_pos / delta
    global_transform.basis = Basis(root_rot) * global_transform.basis
    move_and_slide()
```

## Common Pattern: Character Controller

```
StateMachine
+-- idle (Animation)
+-- locomotion (BlendSpace1D: speed 0..walk..run)
+-- jump (Animation)
+-- fall (Animation)
+-- attack (Animation, transition back to idle with Auto)
```

```gdscript
func _physics_process(delta: float) -> void:
    var speed: float = velocity.length()
    anim_tree.set("parameters/locomotion/blend_position", speed / max_speed)

    if is_on_floor():
        if speed > 0.1:
            state_machine.travel(&"locomotion")
        else:
            state_machine.travel(&"idle")
    else:
        state_machine.travel(&"jump" if velocity.y > 0 else &"fall")
```

## Pitfalls

1. **active must be true**: AnimationTree does nothing if false
2. **RESET animation needed**: Without it, properties may not return to defaults during blends
3. **travel() follows connections**: If no path exists, fails silently. Use `start()` for forced jumps
4. **Parameter paths are strings**: Typos fail silently
5. **AnimationPlayer must be assigned**: Unless using direct library management (4.2+)
