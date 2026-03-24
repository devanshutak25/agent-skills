# Sequencer Effects & Retiming

Effect strips, strip modifiers, and retiming controls. For basic strip operations see [sequencer-strips](sequencer-strips.md).

## Effect Strips

```python
import bpy

seq = bpy.context.scene.sequence_editor

# Create an effect strip
effect = seq.strips.new_effect(
    name="CrossFade",
    type='CROSS',
    channel=3,
    frame_start=50,
    frame_end=75,
    input1=seq.strips["ClipA"],    # first input strip
    input2=seq.strips["ClipB"],    # second input strip
)
```

### Effect Types

**Transitions (require 2 inputs):**

| Type | Description |
|---|---|
| `'CROSS'` | Cross dissolve |
| `'GAMMA_CROSS'` | Gamma-corrected cross dissolve |
| `'WIPE'` | Wipe transition |

**Compositing (require 2 inputs):**

| Type | Description |
|---|---|
| `'ADD'` | Additive blend |
| `'SUBTRACT'` | Subtract blend |
| `'MULTIPLY'` | Multiply blend |
| `'ALPHA_OVER'` | Alpha compositing (over) |
| `'ALPHA_UNDER'` | Alpha compositing (under) |
| `'COLORMIX'` | Color mixing |

**Single input:**

| Type | Description |
|---|---|
| `'TRANSFORM'` | Scale/rotate/translate |
| `'SPEED'` | Speed control |
| `'GLOW'` | Glow/bloom effect |
| `'GAUSSIAN_BLUR'` | Gaussian blur |

**No input:**

| Type | Description |
|---|---|
| `'COLOR'` | Solid color strip |
| `'TEXT'` | Text overlay |
| `'ADJUSTMENT'` | Adjustment layer |

```python
import bpy

seq = bpy.context.scene.sequence_editor

# Color strip (no input needed)
color = seq.strips.new_effect(
    name="Background",
    type='COLOR',
    channel=1,
    frame_start=1,
    frame_end=100,
)
color.color = (0.1, 0.1, 0.1)

# Text strip
text = seq.strips.new_effect(
    name="Title",
    type='TEXT',
    channel=2,
    frame_start=1,
    frame_end=50,
)
text.text = "My Title"
text.font_size = 60
text.location = (0.5, 0.5)  # center
```

## Strip Modifiers

Modifiers apply color/exposure adjustments to strips:

```python
import bpy

strip = bpy.context.scene.sequence_editor.strips["MyVideo"]

# Add a modifier
mod = strip.modifiers.new("Brightness", 'BRIGHT_CONTRAST')
mod.bright = 0.2
mod.contrast = 0.1

# Other modifier types
mod = strip.modifiers.new("Curves", 'CURVES')
mod = strip.modifiers.new("Hue", 'HUE_CORRECT')
mod = strip.modifiers.new("WB", 'WHITE_BALANCE')
mod = strip.modifiers.new("Balance", 'COLOR_BALANCE')
mod = strip.modifiers.new("Tonemap", 'TONEMAP')

# Remove modifier
strip.modifiers.remove(mod)
```

### Modifier Types

| Type | Key Properties |
|---|---|
| `'BRIGHT_CONTRAST'` | `bright`, `contrast` |
| `'CURVES'` | `curve_mapping` |
| `'HUE_CORRECT'` | `curve_mapping` |
| `'WHITE_BALANCE'` | `white_value` |
| `'COLOR_BALANCE'` | `color_balance` (lift/gamma/gain) |
| `'TONEMAP'` | `tonemap_type`, `key`, `offset`, `gamma` |

## Retiming

Retiming controls allow speed changes within a strip:

```python
import bpy

strip = bpy.context.scene.sequence_editor.strips["MyVideo"]

# Access retiming keys
for key in strip.retiming_keys:
    print(key.timeline_frame, key.retiming_factor)
```

> **5.1:** `retiming_segment_speed_set` no longer has the `keep_retiming` parameter (removed in 5.1).

## Strip Time Properties

> **5.1:** Strip time properties were renamed in 5.1:

| Old Name (pre-5.1) | New Name (5.1) | Description |
|---|---|---|
| `frame_start` | `content_start` | Underlying content start frame |
| `frame_final_start` | `left_handle` | Effective visible start |
| `frame_final_end` | `right_handle` | Effective visible end |
| `frame_final_duration` | `duration` | Effective duration |
| `frame_offset_start` | `left_handle_offset` | Left handle offset |
| `frame_offset_end` | `right_handle_offset` | Right handle offset |
| `frame_duration` | `content_duration` | Total content duration |
| `animation_offset_start` | `content_trim_start` | Content trim from start |
| `animation_offset_end` | `content_trim_end` | Content trim from end |
| — | `content_end` | Content end (read-only, new in 5.1) |

Old names are deprecated and scheduled for removal in 6.0.

```python
import bpy

strip = bpy.context.scene.sequence_editor.strips["MyVideo"]

# 5.1 property names
print(strip.content_start)       # content start offset
print(strip.content_end)         # content end (read-only)
```

## Common Patterns

### Crossfade Between Two Clips

```python
import bpy

scene = bpy.context.scene
seq = scene.sequence_editor

clip_a = seq.strips["ClipA"]
clip_b = seq.strips["ClipB"]

# Overlap clips by 30 frames
overlap = 30
clip_b.frame_start = clip_a.frame_final_end - overlap

# Add crossfade
fade = seq.strips.new_effect(
    name="Fade",
    type='GAMMA_CROSS',
    channel=max(clip_a.channel, clip_b.channel) + 1,
    frame_start=clip_b.frame_final_start,
    frame_end=clip_a.frame_final_end,
    input1=clip_a,
    input2=clip_b,
)
```

### Apply Color Grading

```python
import bpy

strip = bpy.context.scene.sequence_editor.strips["MyVideo"]

# Add brightness/contrast
bc = strip.modifiers.new("Grade", 'BRIGHT_CONTRAST')
bc.bright = 0.05
bc.contrast = 0.15

# Add color balance
cb = strip.modifiers.new("Balance", 'COLOR_BALANCE')
cb.color_balance.lift = (0.95, 0.95, 1.05)
cb.color_balance.gamma = (1.0, 1.0, 1.0)
cb.color_balance.gain = (1.1, 1.05, 1.0)
```

## Gotchas

1. **`input1`/`input2` not `seq1`/`seq2`.** Effect strip creation uses `input1` and `input2` parameters. The old names `seq1`/`seq2` were renamed.

2. **Effect channel must be above inputs.** The effect strip's channel should be higher than its input strips to layer correctly.

3. **Transition effects need overlapping strips.** Cross dissolves and wipes require two strips with overlapping frame ranges on the timeline.

4. **Modifier order matters.** Modifiers process top-to-bottom. Reorder with `strip.modifiers.move(from_index, to_index)` if needed.

5. **Strip time renames (5.1).** `frame_offset_start` → `content_start`. Code using old property names will get `AttributeError` in 5.1+.

6. **Retiming key changes (5.1).** The `keep_retiming` parameter was removed from `retiming_segment_speed_set` in 5.1.
