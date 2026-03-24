# Sequencer Strips

Video Sequence Editor (VSE) strip management: creating, accessing, and configuring media strips. For effects and retiming see [sequencer-effects-retiming](sequencer-effects-retiming.md).

## Sequence Editor

```python
import bpy

scene = bpy.context.scene

# Get or create the sequence editor
if scene.sequence_editor is None:
    scene.sequence_editor_create()

seq_editor = scene.sequence_editor

# Access strips
for strip in seq_editor.strips:
    print(strip.name, strip.type, strip.channel)
```

## Creating Strips

### Movie Strip

```python
import bpy

seq = bpy.context.scene.sequence_editor

strip = seq.strips.new_movie(
    name="MyVideo",
    filepath="/path/to/video.mp4",
    channel=1,
    frame_start=1,
)
```

### Sound Strip

```python
import bpy

seq = bpy.context.scene.sequence_editor

strip = seq.strips.new_sound(
    name="Audio",
    filepath="/path/to/audio.wav",
    channel=2,
    frame_start=1,
)
```

### Image Strip

```python
import bpy

seq = bpy.context.scene.sequence_editor

strip = seq.strips.new_image(
    name="Photo",
    filepath="/path/to/image.png",
    channel=1,
    frame_start=1,
    fit_method='FIT',   # FIT, FILL, STRETCH, ORIGINAL
)

# For image sequences, add more elements
strip.elements.append("frame_002.png")
strip.elements.append("frame_003.png")
```

### Scene Strip

```python
import bpy

seq = bpy.context.scene.sequence_editor

strip = seq.strips.new_scene(
    name="SceneStrip",
    scene=bpy.data.scenes["OtherScene"],
    channel=1,
    frame_start=1,
)
```

### Clip Strip

```python
import bpy

seq = bpy.context.scene.sequence_editor

strip = seq.strips.new_clip(
    name="ClipStrip",
    clip=bpy.data.movieclips["MyClip"],
    channel=1,
    frame_start=1,
)
```

## Strip Types

| Type | Description |
|---|---|
| `'MOVIE'` | Video file |
| `'SOUND'` | Audio file |
| `'IMAGE'` | Image or image sequence |
| `'SCENE'` | Render from another scene |
| `'META'` | Meta strip (group) |
| `'CLIP'` | Movie clip |
| `'MASK'` | Mask |
| `'COLOR'` | Solid color |
| `'TEXT'` | Text overlay |
| `'ADJUSTMENT'` | Adjustment layer |
| `'CROSS'` | Cross dissolve (effect) |
| `'ADD'` | Additive blend (effect) |
| `'SUBTRACT'` | Subtract blend (effect) |
| `'ALPHA_OVER'` | Alpha over (effect) |
| `'ALPHA_UNDER'` | Alpha under (effect) |
| `'GAMMA_CROSS'` | Gamma cross dissolve (effect) |
| `'MULTIPLY'` | Multiply blend (effect) |
| `'WIPE'` | Wipe transition (effect) |
| `'GLOW'` | Glow effect |
| `'TRANSFORM'` | Transform effect |
| `'SPEED'` | Speed control |
| `'GAUSSIAN_BLUR'` | Blur effect |
| `'COLORMIX'` | Color mix effect |

## Strip Properties

```python
import bpy

strip = bpy.context.scene.sequence_editor.strips["MyVideo"]

# Timing
strip.frame_start              # start frame in timeline
strip.frame_final_start        # effective start (with offsets)
strip.frame_final_end          # effective end
strip.frame_final_duration     # effective duration

# Channel and visibility
strip.channel                  # channel number (1-based)
strip.mute = False             # mute/disable strip
strip.lock = False             # lock from editing

# Selection
strip.select = True
strip.select_left_handle = False
strip.select_right_handle = False

# Blending
strip.blend_type = 'REPLACE'   # REPLACE, CROSS, ADD, SUBTRACT, etc.
strip.blend_alpha = 1.0        # blend factor

# Name
strip.name = "Renamed"
```

### Image Strip Elements

```python
import bpy

strip = bpy.context.scene.sequence_editor.strips["Photo"]

# Image strips have elements (file list)
for elem in strip.elements:
    print(elem.filename)

# Set the directory
strip.directory = "/path/to/frames/"
```

## Removing Strips

```python
import bpy

seq = bpy.context.scene.sequence_editor

# Remove by reference
strip = seq.strips["MyVideo"]
seq.strips.remove(strip)
```

## Common Patterns

### Add Video with Audio

```python
import bpy

scene = bpy.context.scene
if scene.sequence_editor is None:
    scene.sequence_editor_create()

seq = scene.sequence_editor

# Video on channel 1
video = seq.strips.new_movie("Video", "/path/to/video.mp4", 1, 1)

# Audio on channel 2 (same file)
audio = seq.strips.new_sound("Audio", "/path/to/video.mp4", 2, 1)
```

### Set Scene Duration to Match Strips

```python
import bpy

scene = bpy.context.scene
seq = scene.sequence_editor

if seq and seq.strips:
    scene.frame_start = min(s.frame_final_start for s in seq.strips)
    scene.frame_end = max(s.frame_final_end for s in seq.strips)
```

## Gotchas

1. **`strips` not `sequences`.** The collection is `sequence_editor.strips`, not `sequence_editor.sequences` (the old name).

2. **Channel numbers start at 1.** Channel 0 is invalid. Strips on higher channels overlay lower ones.

3. **`frame_final_start` vs `frame_start`.** `frame_start` is the raw start. `frame_final_start` accounts for handle offsets and is the effective visible start.

4. **Create sequence editor first.** `scene.sequence_editor` is `None` by default. Call `scene.sequence_editor_create()` before accessing `.strips`.

5. **Image strip directory.** For image sequences, set `strip.directory` and add filenames via `strip.elements`. The filepath in `new_image` sets the first element.
