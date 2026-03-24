# NLA (Non-Linear Animation)

The NLA (Non-Linear Animation) editor allows layering, blending, and sequencing Actions. NLA tracks contain strips that reference Actions, controlling how they combine. For the Action system see [animation-actions](animation-actions.md). For keyframes and drivers see [keyframes-drivers](keyframes-drivers.md). For handlers and timers see [handlers-timers](handlers-timers.md).

## NLA Tracks

NLA tracks are ordered layers of animation strips on an object:

```python
import bpy

obj = bpy.context.object

# Ensure animation data exists
if obj.animation_data is None:
    obj.animation_data_create()

nla_tracks = obj.animation_data.nla_tracks

# Create a new track
track = nla_tracks.new()
track.name = "BaseMotion"

# Track properties
track.mute = False       # disable this track
track.is_solo = False     # solo — only this track plays
track.lock = False        # lock for editing
track.select = True
```

### Track Operations

```python
import bpy

obj = bpy.context.object
nla_tracks = obj.animation_data.nla_tracks

# Create multiple tracks
track_base = nla_tracks.new()
track_base.name = "Base"

track_overlay = nla_tracks.new()
track_overlay.name = "Overlay"

# Remove a track
nla_tracks.remove(track_overlay)

# Iterate tracks
for track in nla_tracks:
    print(f"{track.name}: {len(track.strips)} strips, mute={track.mute}")
```

## NLA Strips

Strips reference an Action and define how it plays within the track:

```python
import bpy

obj = bpy.context.object
action = bpy.data.actions["WalkCycle"]

if obj.animation_data is None:
    obj.animation_data_create()

track = obj.animation_data.nla_tracks.new()
track.name = "Walk"

# Add a strip: strips.new(name, start_frame, action)
strip = track.strips.new("Walk", start=1, action=action)
```

### Strip Properties

| Property | Type | Description |
|---|---|---|
| `action` | Action | The Action data-block this strip references |
| `name` | str | Display name |
| `frame_start` | float | Start frame in the NLA timeline |
| `frame_end` | float | End frame in the NLA timeline |
| `action_frame_start` | float | Start frame within the Action |
| `action_frame_end` | float | End frame within the Action |
| `repeat` | float | Number of times the Action repeats within the strip |
| `scale` | float | Time scaling factor |
| `blend_in` | float | Blend-in duration (frames) |
| `blend_out` | float | Blend-out duration (frames) |
| `influence` | float | Strip influence (0.0–1.0) |
| `mute` | bool | Disable this strip |
| `use_auto_blend` | bool | Auto-calculate blend-in/out from adjacent strips |
| `use_reverse` | bool | Play the Action in reverse |
| `use_animated_influence` | bool | Allow keyframing influence |
| `use_animated_time` | bool | Allow keyframing strip time |
| `use_animated_time_cyclic` | bool | Cyclic strip time |
| `strip_time` | float | Current strip time (read-only at evaluation) |

```python
import bpy

obj = bpy.context.object
track = obj.animation_data.nla_tracks[0]
strip = track.strips[0]

# Timing
strip.frame_start = 1
strip.frame_end = 60
strip.action_frame_start = 1
strip.action_frame_end = 30
strip.repeat = 2.0      # repeat the action twice
strip.scale = 1.0        # normal speed

# Blending
strip.blend_in = 5.0
strip.blend_out = 5.0
strip.influence = 1.0
strip.use_auto_blend = True

# Playback
strip.mute = False
strip.use_reverse = False
```

### Blend Types

Controls how a strip combines with strips below it:

| Blend Type | Enum | Description |
|---|---|---|
| Replace | `'REPLACE'` | Fully replaces lower strips |
| Combine | `'COMBINE'` | Combines using each property's combine method |
| Add | `'ADD'` | Adds values to lower strips |
| Subtract | `'SUBTRACT'` | Subtracts values from lower strips |
| Multiply | `'MULTIPLY'` | Multiplies values with lower strips |

```python
strip.blend_type = 'COMBINE'
```

### Extrapolation Modes

Controls strip behavior outside its frame range:

| Mode | Enum | Description |
|---|---|---|
| Hold | `'HOLD'` | Hold the last value before and after |
| Hold Forward | `'HOLD_FORWARD'` | Hold only after the strip ends |
| Nothing | `'NOTHING'` | No effect outside strip range |

```python
strip.extrapolation = 'HOLD'
```

## Push Down Action

"Push down" converts the active Action into an NLA strip, freeing the action slot for new animation:

```python
import bpy

obj = bpy.context.object

# Push down via operator (requires object context)
with bpy.context.temp_override(active_object=obj):
    bpy.ops.nla.action_pushdown()

# After push-down, the action is in an NLA strip
# and obj.animation_data.action is cleared
```

## Baking Animation

Bake NLA to keyframes:

```python
import bpy

obj = bpy.context.object

# Bake NLA result to keyframes on the object
with bpy.context.temp_override(active_object=obj, selected_objects=[obj]):
    bpy.ops.nla.bake(
        frame_start=1,
        frame_end=250,
        only_selected=False,
        visual_keying=True,
        clear_constraints=False,
        clear_parents=False,
        use_current_action=True,
        bake_types={'OBJECT'}  # 'OBJECT', 'POSE', 'OBJECT_POSE'
    )
```

## Multiple Strips on a Track

```python
import bpy

obj = bpy.context.object
walk = bpy.data.actions["WalkCycle"]
run = bpy.data.actions["RunCycle"]

if obj.animation_data is None:
    obj.animation_data_create()

track = obj.animation_data.nla_tracks.new()
track.name = "Locomotion"

# Place walk from frames 1-60
strip_walk = track.strips.new("Walk", start=1, action=walk)
strip_walk.frame_end = 60

# Place run from frames 61-120 (strips cannot overlap on the same track)
strip_run = track.strips.new("Run", start=61, action=run)
strip_run.frame_end = 120

# Auto-blend for smooth transition
strip_walk.use_auto_blend = True
strip_run.use_auto_blend = True
```

## Common Patterns

### Layer Additive Animation

```python
import bpy

obj = bpy.context.object

if obj.animation_data is None:
    obj.animation_data_create()

base_action = bpy.data.actions["IdleBreathing"]
overlay_action = bpy.data.actions["HeadLook"]

# Base track — replace mode
track_base = obj.animation_data.nla_tracks.new()
track_base.name = "Base"
strip_base = track_base.strips.new("Idle", start=1, action=base_action)
strip_base.blend_type = 'REPLACE'

# Overlay track — add mode
track_overlay = obj.animation_data.nla_tracks.new()
track_overlay.name = "Overlay"
strip_overlay = track_overlay.strips.new("HeadLook", start=1, action=overlay_action)
strip_overlay.blend_type = 'ADD'
strip_overlay.influence = 0.5  # half strength
```

### List All NLA Strips on an Object

```python
import bpy

obj = bpy.context.object
if obj.animation_data is None:
    print("No animation data")
else:
    for track in obj.animation_data.nla_tracks:
        print(f"Track: {track.name} (mute={track.mute})")
        for strip in track.strips:
            print(f"  Strip: {strip.name}")
            print(f"    Action: {strip.action.name if strip.action else 'None'}")
            print(f"    Frames: {strip.frame_start:.1f} - {strip.frame_end:.1f}")
            print(f"    Blend: {strip.blend_type}, Influence: {strip.influence:.2f}")
```

### Export NLA Strip Timing

```python
import bpy

obj = bpy.context.object

strips_data = []
for track in obj.animation_data.nla_tracks:
    for strip in track.strips:
        strips_data.append({
            "track": track.name,
            "strip": strip.name,
            "action": strip.action.name if strip.action else None,
            "start": strip.frame_start,
            "end": strip.frame_end,
            "blend_type": strip.blend_type,
            "influence": strip.influence,
            "repeat": strip.repeat,
        })

for s in strips_data:
    print(s)
```

## Gotchas

1. **Strips cannot overlap on the same track.** If you try to add a strip that overlaps an existing one on the same track, it will raise an error. Use separate tracks for overlapping animations.

2. **Push-down clears the active action.** After `nla.action_pushdown()`, `obj.animation_data.action` becomes `None` and the action moves to an NLA strip. The object is then ready for a new active action.

3. **Track order matters.** Higher tracks (later in the `nla_tracks` list) evaluate on top of lower tracks. The blend type of the upper strip determines how it combines with the result below.

4. **`action_frame_start/end` vs `frame_start/end`.** `frame_start/end` is the strip's position in the NLA timeline. `action_frame_start/end` defines which portion of the Action is used. These are independent — you can map a subset of an Action to a different time range.

5. **Bake operator needs selection.** `nla.bake()` requires the object to be selected and active. Use `context.temp_override()` to provide the correct context.

6. **Muted tracks still occupy evaluation.** Muting a track skips its contribution but does not remove it from the depsgraph. For performance, remove unused tracks rather than muting them.

7. **Solo overrides everything.** When `track.is_solo = True`, only that track plays. All other tracks are effectively muted. Only one track should be solo at a time.
