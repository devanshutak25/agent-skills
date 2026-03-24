# BLF (Blender Font)

Text drawing module for rendering text in the viewport and to image buffers. For viewport overlay integration see [gpu-drawing](gpu-drawing.md). For GPU drawing see [gpu-module](gpu-module.md).

## Font Loading

```python
import blf

# Default font (font_id = 0) — always available, no loading needed
font_id = 0

# Load a custom font
font_id = blf.load("/path/to/font.ttf")

# Unload a custom font
blf.unload("/path/to/font.ttf")
```

Font ID 0 is Blender's built-in default font. Custom fonts get IDs > 0 from `blf.load()`.

## Core Drawing Functions

```python
import blf

font_id = 0

# Set font size (in points)
blf.size(font_id, 20)

# Set draw position (x, y in screen pixels, z usually 0)
blf.position(font_id, 100, 200, 0)

# Set text color (RGBA, 0.0–1.0)
blf.color(font_id, 1.0, 1.0, 1.0, 1.0)

# Draw text at the current position
blf.draw(font_id, "Hello World")
```

### Function Reference

| Function | Signature | Description |
|---|---|---|
| `blf.load` | `(filepath) → int` | Load font file, returns font_id |
| `blf.unload` | `(filepath)` | Unload a previously loaded font |
| `blf.size` | `(font_id, size)` | Set font size in points |
| `blf.position` | `(font_id, x, y, z)` | Set draw position in pixels |
| `blf.draw` | `(font_id, text)` | Draw text string |
| `blf.color` | `(font_id, r, g, b, a)` | Set text color (float RGBA) |
| `blf.dimensions` | `(font_id, text) → (width, height)` | Measure text size in pixels |

## Measuring Text

```python
import blf

font_id = 0
blf.size(font_id, 16)

# Get pixel dimensions of text
width, height = blf.dimensions(font_id, "Sample Text")
# width: horizontal span in pixels
# height: vertical span in pixels
```

Use `dimensions` to align text, calculate backgrounds, or wrap lines manually.

## Enable / Disable Options

`blf.enable(font_id, option)` and `blf.disable(font_id, option)` toggle drawing features:

| Option | Constant | Description |
|---|---|---|
| Shadow | `blf.SHADOW` | Draw text shadow |
| Rotation | `blf.ROTATION` | Rotate text |
| Clipping | `blf.CLIPPING` | Clip text to a rectangle |
| Word Wrap | `blf.WORD_WRAP` | Wrap text at specified width |

```python
import blf

font_id = 0

# Enable shadow
blf.enable(font_id, blf.SHADOW)

# Disable shadow
blf.disable(font_id, blf.SHADOW)
```

## Shadow

```python
import blf

font_id = 0

blf.enable(font_id, blf.SHADOW)

# Set shadow: level (0=none, 3=blur3, 5=blur5), RGBA color
blf.shadow(font_id, 5, 0.0, 0.0, 0.0, 0.8)

# Set shadow offset in pixels
blf.shadow_offset(font_id, 2, -2)

blf.size(font_id, 20)
blf.position(font_id, 100, 100, 0)
blf.color(font_id, 1.0, 1.0, 1.0, 1.0)
blf.draw(font_id, "Shadowed Text")

blf.disable(font_id, blf.SHADOW)
```

### Shadow Levels

| Level | Description |
|---|---|
| 0 | No shadow |
| 3 | 3×3 blur shadow |
| 5 | 5×5 blur shadow |

## Rotation

```python
import blf
import math

font_id = 0

blf.enable(font_id, blf.ROTATION)
blf.rotation(font_id, math.radians(45))  # angle in radians

blf.size(font_id, 16)
blf.position(font_id, 200, 200, 0)
blf.color(font_id, 1.0, 1.0, 0.0, 1.0)
blf.draw(font_id, "Rotated Text")

blf.disable(font_id, blf.ROTATION)
```

## Clipping

```python
import blf

font_id = 0

blf.enable(font_id, blf.CLIPPING)
blf.clipping(font_id, 50, 50, 300, 150)  # xmin, ymin, xmax, ymax

blf.size(font_id, 14)
blf.position(font_id, 60, 80, 0)
blf.color(font_id, 1.0, 1.0, 1.0, 1.0)
blf.draw(font_id, "This text is clipped to a rectangle")

blf.disable(font_id, blf.CLIPPING)
```

## Word Wrap

```python
import blf

font_id = 0

blf.enable(font_id, blf.WORD_WRAP)
blf.word_wrap(font_id, 200)  # wrap width in pixels

blf.size(font_id, 14)
blf.position(font_id, 20, 300, 0)
blf.color(font_id, 1.0, 1.0, 1.0, 1.0)
blf.draw(font_id, "This is a long text that will wrap at the specified pixel width automatically.")

blf.disable(font_id, blf.WORD_WRAP)
```

## Drawing Text to Image Buffers

`blf.bind_imbuf(font_id, imbuf, *, display_name=None)` is a context manager that redirects text drawing into an `ImBuf` instead of the screen. Use `blf.draw_buffer(font_id, text)` inside the context:

```python
import blf
import imbuf as imbuf_module

# Create an image buffer
buf = imbuf_module.new(512, 256)

font_id = 0
blf.size(font_id, 24)
blf.position(font_id, 20, 100, 0)
blf.color(font_id, 1.0, 1.0, 1.0, 1.0)

# Draw text into the buffer (display_name sets color space, e.g. "sRGB")
with blf.bind_imbuf(font_id, buf, display_name="sRGB"):
    blf.draw_buffer(font_id, "Text in image buffer")

# Save the buffer
imbuf_module.write(buf, "/tmp/text_output.png")
```

## Complete Viewport Text Overlay

```python
import bpy
import blf

class TextOverlay:
    def __init__(self):
        self.font_id = 0
        self.handle = bpy.types.SpaceView3D.draw_handler_add(
            self.draw, (), 'WINDOW', 'POST_PIXEL'
        )

    def draw(self):
        blf.size(self.font_id, 16)

        # Draw with shadow
        blf.enable(self.font_id, blf.SHADOW)
        blf.shadow(self.font_id, 3, 0.0, 0.0, 0.0, 0.7)
        blf.shadow_offset(self.font_id, 1, -1)

        # Line 1
        blf.position(self.font_id, 20, 80, 0)
        blf.color(self.font_id, 1.0, 1.0, 1.0, 1.0)
        blf.draw(self.font_id, f"Objects: {len(bpy.data.objects)}")

        # Line 2
        blf.position(self.font_id, 20, 55, 0)
        blf.color(self.font_id, 0.8, 0.8, 0.3, 1.0)
        obj = bpy.context.active_object
        blf.draw(self.font_id, f"Active: {obj.name if obj else 'None'}")

        blf.disable(self.font_id, blf.SHADOW)

    def remove(self):
        bpy.types.SpaceView3D.draw_handler_remove(self.handle, 'WINDOW')

overlay = TextOverlay()
# Later: overlay.remove()
```

## Common Patterns

### Right-Aligned Text

```python
import blf

def draw_right_aligned(font_id, text, right_edge, y):
    width, height = blf.dimensions(font_id, text)
    blf.position(font_id, right_edge - width, y, 0)
    blf.draw(font_id, text)
```

### Centered Text

```python
import blf

def draw_centered(font_id, text, center_x, y):
    width, height = blf.dimensions(font_id, text)
    blf.position(font_id, center_x - width / 2, y, 0)
    blf.draw(font_id, text)
```

### Multi-Line Text

```python
import blf

def draw_multiline(font_id, lines, x, y, line_spacing=1.4):
    _, line_height = blf.dimensions(font_id, "Mg")
    spacing = line_height * line_spacing
    for i, line in enumerate(lines):
        blf.position(font_id, x, y - i * spacing, 0)
        blf.draw(font_id, line)
```

## Gotchas

1. **Call `size` before `dimensions`.** `blf.dimensions()` uses the last size set via `blf.size()`. If you haven't set a size, the result is undefined.

2. **`position` resets after `draw`.** Each call to `blf.draw()` advances the internal cursor. Always call `blf.position()` before each `blf.draw()`.

3. **POST_PIXEL only.** Text drawing uses screen-space coordinates. Use `'POST_PIXEL'` draw type in `draw_handler_add`, not `'POST_VIEW'`.

4. **Disable options after use.** Options like `SHADOW` and `ROTATION` persist until explicitly disabled. Always call `blf.disable()` after drawing to avoid affecting other draw callbacks.

5. **Font ID 0 always works.** Custom font IDs from `blf.load()` may become invalid after file reload. Font ID 0 (built-in default) is always safe.

6. **Y axis goes up.** Screen coordinates start at bottom-left (0, 0). Higher Y values are higher on screen. Account for this when positioning multi-line text (subtract for each line).
