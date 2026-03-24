# imbuf (Image Buffer)

Standalone image buffer operations outside Blender's data system. For Blender images see `bpy.data.images`. For text rendering to buffers see [blf](blf.md).

## Creating and Loading

```python
import imbuf

# Create a new empty buffer
buf = imbuf.new(512, 256)

# Load from file
buf = imbuf.load("/path/to/image.png")

# Write to file
imbuf.write(buf, "/path/to/output.png")
```

## ImBuf Properties

```python
import imbuf

buf = imbuf.new(256, 256)

buf.size          # (256, 256) — (width, height) tuple
buf.channels      # 4 — number of color channels
buf.planes        # 32 — bits per pixel
buf.filepath      # file path if loaded from disk
buf.ppm           # (ppm_x, ppm_y) — pixels per meter
```

## Pixel Access

```python
import imbuf

buf = imbuf.new(256, 256)

# Pixel data as flat float array: [r, g, b, a, r, g, b, a, ...]
# Row-major, bottom-to-top
pixels = buf.pixels

# Set all pixels to red
for i in range(0, len(pixels), 4):
    pixels[i] = 1.0      # R
    pixels[i + 1] = 0.0  # G
    pixels[i + 2] = 0.0  # B
    pixels[i + 3] = 1.0  # A
```

## Operations

```python
import imbuf

buf = imbuf.load("/path/to/image.png")

# Copy
buf_copy = buf.copy()

# Crop (modifies in-place)
buf.crop(min_x=10, min_y=10, max_x=200, max_y=200)

# Resize (modifies in-place)
buf.resize((128, 128), method='BILINEAR')  # 'FAST' or 'BILINEAR'
```

## imbuf vs bpy.data.images

| Feature | `imbuf` | `bpy.data.images` |
|---|---|---|
| Blender data system | No | Yes |
| Persists in .blend | No | Yes |
| GPU texture support | No | Yes |
| Standalone processing | Yes | No |
| Text rendering (blf) | Yes | No |

Use `imbuf` for standalone image processing. Use `bpy.data.images` for images that need to be used in materials, textures, or saved with the blend file.

## Common Patterns

### Render Text to Image

```python
import blf
import imbuf

buf = imbuf.new(512, 128)

font_id = 0
blf.size(font_id, 32)
blf.position(font_id, 20, 50, 0)
blf.color(font_id, 1.0, 1.0, 1.0, 1.0)

with blf.bind_imbuf(font_id, buf, display_name="sRGB"):
    blf.draw_buffer(font_id, "Hello from imbuf!")

imbuf.write(buf, "/tmp/text_render.png")
```

### Process Image Pixels

```python
import imbuf

buf = imbuf.load("/path/to/photo.png")
pixels = buf.pixels
w, h = buf.size

# Invert colors
for i in range(0, len(pixels), 4):
    pixels[i] = 1.0 - pixels[i]          # R
    pixels[i + 1] = 1.0 - pixels[i + 1]  # G
    pixels[i + 2] = 1.0 - pixels[i + 2]  # B
    # Alpha unchanged

imbuf.write(buf, "/tmp/inverted.png")
```

## Gotchas

1. **`imbuf` objects are not Blender data.** They don't appear in `bpy.data.images` and aren't saved with the blend file. Use them for temporary processing only.

2. **Pixel order is bottom-to-top.** Like OpenGL textures, row 0 is the bottom of the image. Flip vertically if needed for formats that expect top-to-bottom.

3. **`crop` and `resize` modify in-place.** These operations change the buffer directly. Use `copy()` first if you need the original.

4. **File format is inferred from extension.** `imbuf.write` determines the output format from the file extension (`.png`, `.jpg`, `.bmp`, `.tga`, etc.).
