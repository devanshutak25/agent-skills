# Canvas Drawing 2D Reference

## Custom Drawing with _draw()

Any `CanvasItem` (Node2D, Control, or subclass) can override `_draw()` for custom rendering.

```gdscript
extends Node2D

func _draw() -> void:
    # All draw calls happen here
    draw_circle(Vector2.ZERO, 50.0, Color.RED)
```

### Triggering Redraws

`_draw()` is called once, then cached. To redraw:

```gdscript
queue_redraw()   # Schedule redraw for next frame (Godot 4 — replaces update())

# Continuous redraw
func _process(delta: float) -> void:
    queue_redraw()    # Redraws every frame
```

## Draw Methods

All positions are in **local** coordinates relative to the node.

### Lines
```gdscript
# Single line
draw_line(Vector2(0, 0), Vector2(100, 50), Color.WHITE, 2.0)
# (from, to, color, width, antialiased)

# Polyline (connected line segments)
var points: PackedVector2Array = [Vector2(0,0), Vector2(50,20), Vector2(100,0)]
draw_polyline(points, Color.GREEN, 2.0, true)  # (points, color, width, antialiased)

# Colored polyline (per-vertex color)
var colors: PackedColorArray = [Color.RED, Color.GREEN, Color.BLUE]
draw_polyline_colors(points, colors, 2.0)

# Multiple disconnected lines
var lines: PackedVector2Array = [Vector2(0,0), Vector2(50,0), Vector2(0,20), Vector2(50,20)]
draw_multiline(lines, Color.WHITE, 1.0)  # Pairs: [start1, end1, start2, end2, ...]

# Dashed line
draw_dashed_line(Vector2(0,0), Vector2(200,0), Color.YELLOW, 2.0, 8.0)
# (from, to, color, width, dash_length)
```

**Width behavior**: Negative width uses primitive lines (stay thin when scaled). Positive width draws thick (scales with node).

### Shapes
```gdscript
# Rectangle
draw_rect(Rect2(10, 10, 100, 50), Color.BLUE)           # Filled
draw_rect(Rect2(10, 10, 100, 50), Color.BLUE, false, 2.0)  # Outline (filled=false, width)

# Circle
draw_circle(Vector2(100, 100), 40.0, Color.RED)          # Filled circle

# Arc
draw_arc(Vector2(100,100), 50.0, 0.0, PI, 32, Color.WHITE, 2.0)
# (center, radius, start_angle, end_angle, point_count, color, width)

# Polygon (filled, convex or concave)
var polygon: PackedVector2Array = [Vector2(0,-50), Vector2(50,50), Vector2(-50,50)]
draw_polygon(polygon, [Color.ORANGE])
# (points, colors) — single color fills all, or per-vertex colors

# Colored polygon with UV
draw_colored_polygon(polygon, Color.RED)

# Primitive (1 pt = point, 2 = line, 3 = triangle, 4 = quad)
draw_primitive([Vector2(0,0), Vector2(100,0), Vector2(50,80)],
    [Color.RED, Color.GREEN, Color.BLUE], [])
```

### Textures
```gdscript
var tex: Texture2D = preload("res://icon.png")

# Draw texture at position
draw_texture(tex, Vector2(10, 10))
# (texture, position, modulate)

# Draw texture stretched to rect
draw_texture_rect(tex, Rect2(0, 0, 200, 200), false, Color.WHITE)
# (texture, rect, tile, modulate, transpose)

# Draw texture region
draw_texture_rect_region(tex, Rect2(0,0,64,64), Rect2(32,0,32,32))
# (texture, dest_rect, src_rect, modulate, transpose)
```

### Text
```gdscript
var font: Font = ThemeDB.fallback_font
var font_size: int = 16

# Draw string
draw_string(font, Vector2(10, 30), "Hello World", HORIZONTAL_ALIGNMENT_LEFT,
    -1, font_size, Color.WHITE)
# (font, pos, text, alignment, width, font_size, color)

# Draw multiline string
draw_multiline_string(font, Vector2(10, 30), "Line 1\nLine 2",
    HORIZONTAL_ALIGNMENT_LEFT, -1, font_size, -1, Color.WHITE)

# Draw single character
draw_char(font, Vector2(10, 30), "A", font_size, Color.WHITE)
```

### Mesh
```gdscript
# Draw a mesh in 2D
draw_mesh(mesh, texture, Transform2D.IDENTITY, Color.WHITE)

# Draw MultiMesh in 2D
draw_multimesh(multimesh, texture)
```

### Transform
```gdscript
func _draw() -> void:
    # Draw something at a custom transform
    draw_set_transform(Vector2(100, 100), PI / 4.0, Vector2(2, 2))
    # (position, rotation, scale) — affects all subsequent draw calls
    draw_circle(Vector2.ZERO, 20.0, Color.RED)  # Drawn at (100,100), rotated, scaled
    
    # Reset transform
    draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
    draw_circle(Vector2.ZERO, 10.0, Color.BLUE)  # Back to normal
```

## Common Patterns

### Health Bar
```gdscript
extends Node2D

var health: float = 0.75  # 0.0 to 1.0
var bar_size: Vector2 = Vector2(40, 4)
var bar_offset: Vector2 = Vector2(-20, -30)

func _draw() -> void:
    # Background
    draw_rect(Rect2(bar_offset, bar_size), Color(0.2, 0.2, 0.2))
    # Fill
    var fill_width: float = bar_size.x * health
    var fill_color: Color = Color.GREEN if health > 0.5 else Color.YELLOW if health > 0.25 else Color.RED
    draw_rect(Rect2(bar_offset, Vector2(fill_width, bar_size.y)), fill_color)

func set_health(value: float) -> void:
    health = clampf(value, 0.0, 1.0)
    queue_redraw()
```

### Debug Visualization
```gdscript
extends CharacterBody2D

func _draw() -> void:
    if not OS.is_debug_build():
        return
    # Velocity vector
    draw_line(Vector2.ZERO, velocity * 0.1, Color.YELLOW, 2.0)
    # Collision radius
    draw_arc(Vector2.ZERO, 16.0, 0, TAU, 32, Color.CYAN, 1.0)
```

### Trail Effect
```gdscript
extends Line2D

@export var max_length: int = 50

func _process(delta: float) -> void:
    var parent_pos: Vector2 = get_parent().global_position
    add_point(parent_pos)
    if get_point_count() > max_length:
        remove_point(0)
```

## Line2D Node

Built-in node for rendering polylines with width, gradient, texture:

```gdscript
extends Line2D

func _ready() -> void:
    width = 5.0
    default_color = Color.WHITE
    
    # Width curve (varies width along length)
    width_curve = Curve.new()
    width_curve.add_point(Vector2(0, 1))
    width_curve.add_point(Vector2(1, 0))   # Tapers to 0
    
    # Gradient
    gradient = Gradient.new()
    gradient.set_color(0, Color.RED)
    gradient.add_point(1.0, Color.BLUE)
    
    # Texture
    texture = preload("res://beam.png")
    texture_mode = Line2D.LINE_TEXTURE_TILE
    
    # Joint and cap style
    joint_mode = Line2D.LINE_JOINT_ROUND
    begin_cap_mode = Line2D.LINE_CAP_ROUND
    end_cap_mode = Line2D.LINE_CAP_ROUND
    
    # Anti-aliasing
    antialiased = true

# Add/remove points
add_point(Vector2(100, 200))
remove_point(0)
clear_points()
set_point_position(0, Vector2(50, 50))
```

## Polygon2D

Filled polygon with UV mapping, texture, skeleton support:

```gdscript
extends Polygon2D

func _ready() -> void:
    polygon = PackedVector2Array([
        Vector2(0, -50), Vector2(50, 50), Vector2(-50, 50)
    ])
    color = Color.ORANGE
    
    # Texture mapping
    texture = preload("res://pattern.png")
    texture_offset = Vector2.ZERO
    texture_scale = Vector2(0.5, 0.5)
    texture_rotation = 0.0
    
    # UV mapping (per-vertex texture coordinates)
    uv = PackedVector2Array([
        Vector2(0.5, 0), Vector2(1, 1), Vector2(0, 1)
    ])
```

## C# Equivalents

```csharp
public override void _Draw()
{
    DrawCircle(Vector2.Zero, 50.0f, Colors.Red);
    DrawLine(new Vector2(0, 0), new Vector2(100, 50), Colors.White, 2.0f);
    DrawRect(new Rect2(10, 10, 100, 50), Colors.Blue);
    
    var font = ThemeDB.FallbackFont;
    DrawString(font, new Vector2(10, 30), "Hello", HorizontalAlignment.Left,
        -1, 16, Colors.White);
}

// Trigger redraw
QueueRedraw();
```
