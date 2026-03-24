# Camera & Viewport 2D Reference

## Camera2D

Defines the visible area of a 2D scene. Only one Camera2D is active per viewport.

```gdscript
extends Camera2D

func _ready() -> void:
    # Make this the active camera
    make_current()       # or set enabled = true
    
    # Zoom (Vector2 — higher values = zoom in)
    zoom = Vector2(2, 2)           # 2x zoom in
    zoom = Vector2(0.5, 0.5)       # 2x zoom out
    
    # Offset (shifts the view without moving the camera node)
    offset = Vector2(0, -50)       # Look slightly above the camera position
    
    # Rotation
    rotation = 0.0                 # Radians
    
    # Anchor mode
    anchor_mode = Camera2D.ANCHOR_MODE_DRAG_CENTER  # Default
    # ANCHOR_MODE_FIXED_TOP_LEFT
```

### Smoothing
```gdscript
# Position smoothing (camera follows target with delay)
position_smoothing_enabled = true
position_smoothing_speed = 5.0     # Higher = snappier following

# Rotation smoothing
rotation_smoothing_enabled = true
rotation_smoothing_speed = 5.0
```

### Limits
```gdscript
# Camera boundaries (world coordinates)
limit_left = 0
limit_top = 0
limit_right = 3200
limit_bottom = 1800
limit_smoothed = true    # Smooth transition at limits (prevents jerking)
```

### Drag
```gdscript
# Dead zone — camera doesn't move until target exceeds this area
drag_horizontal_enabled = true
drag_vertical_enabled = true
drag_left_margin = 0.2      # 20% of viewport width
drag_right_margin = 0.2
drag_top_margin = 0.1
drag_bottom_margin = 0.3    # More room above for platformers
```

### Screen Shake
```gdscript
extends Camera2D

var _shake_strength: float = 0.0
var _shake_decay: float = 5.0

func shake(intensity: float) -> void:
    _shake_strength = intensity

func _process(delta: float) -> void:
    if _shake_strength > 0.01:
        offset = Vector2(
            randf_range(-_shake_strength, _shake_strength),
            randf_range(-_shake_strength, _shake_strength)
        )
        _shake_strength = lerpf(_shake_strength, 0.0, _shake_decay * delta)
    else:
        offset = Vector2.ZERO
        _shake_strength = 0.0
```

### Camera Transition
```gdscript
# Smooth zoom
func zoom_to(target_zoom: Vector2, duration: float) -> void:
    var tween := create_tween()
    tween.tween_property(self, "zoom", target_zoom, duration).set_ease(Tween.EASE_OUT)

# Move to a point
func move_to(target_pos: Vector2, duration: float) -> void:
    var tween := create_tween()
    tween.tween_property(self, "global_position", target_pos, duration).set_ease(Tween.EASE_IN_OUT)
```

### Coordinate Conversions
```gdscript
# Screen → World
var world_pos: Vector2 = get_canvas_transform().affine_inverse() * screen_pos

# World → Screen
var screen_pos: Vector2 = get_canvas_transform() * world_pos

# Get visible area
var visible_rect: Rect2 = get_viewport_rect()
# Adjusted for camera transform:
func get_visible_world_rect() -> Rect2:
    var ctrans := get_canvas_transform()
    var screen_size := get_viewport_rect().size
    var top_left := ctrans.affine_inverse() * Vector2.ZERO
    var bottom_right := ctrans.affine_inverse() * screen_size
    return Rect2(top_left, bottom_right - top_left)
```

## Viewport

The root `Window` node acts as the main viewport. Every scene tree has one. It controls rendering settings.

### Project Settings (Window)
```
Project → Project Settings → Display → Window:
  Size:
    Viewport Width/Height       # Design resolution
    Window Width/Height Override # Actual window size (0 = match viewport)
  Stretch:
    Mode: canvas_items / viewport / disabled
    Aspect: keep / expand / keep_width / keep_height / ignore
    Scale: 1.0                  # UI scale factor
    Scale Mode: integer         # Pixel-perfect integer scaling
```

| Stretch Mode | Behavior |
|---|---|
| `disabled` | No stretching — viewport stays at design resolution |
| `canvas_items` | Viewport scales, 2D content re-renders at window resolution (sharp text/UI) |
| `viewport` | Entire viewport scales as image (pixel-perfect for pixel art) |

| Aspect | Behavior |
|---|---|
| `keep` | Letterbox to maintain exact aspect ratio |
| `expand` | Fill window, visible area changes |
| `keep_width` | Viewport width locked, height adjusts |
| `keep_height` | Viewport height locked, width adjusts |

**Pixel art setup**: Mode = `viewport`, Aspect = `keep`, Scale Mode = `integer`, Default Texture Filter = `Nearest`.

## SubViewport

Renders a separate scene to a texture. Use for: minimaps, picture-in-picture, render-to-texture, portals.

```gdscript
# Node hierarchy:
# SubViewportContainer (or use ViewportTexture on a sprite)
#   └── SubViewport
#         ├── Camera2D
#         └── (scene content)

# SubViewport properties
var sv := SubViewport.new()
sv.size = Vector2i(256, 256)           # Render resolution
sv.render_target_update_mode = SubViewport.UPDATE_ALWAYS
sv.transparent_bg = true               # Transparent background
sv.disable_3d = true                   # Optimize for 2D only
sv.world_2d = get_world_2d()           # Share world (or use own)
```

### SubViewportContainer
```gdscript
# Auto-sizes SubViewport to fill container
var container := SubViewportContainer.new()
container.stretch = true
container.custom_minimum_size = Vector2(200, 200)
```

### ViewportTexture (Display SubViewport on Sprite)
```gdscript
# On a Sprite2D or TextureRect:
$Sprite2D.texture = $SubViewport.get_texture()
# Or in editor: set texture → New ViewportTexture → select SubViewport path
```

### Minimap Pattern
```gdscript
# SubViewport with its own Camera2D that follows the player at a different zoom
extends SubViewport

@onready var camera: Camera2D = $MinimapCamera

func _process(delta: float) -> void:
    var player: Node2D = get_tree().get_first_node_in_group(&"player")
    if player:
        camera.global_position = player.global_position
```

## CanvasLayer

Renders children on a separate rendering layer, independent of the Camera2D transform:

```gdscript
# Common hierarchy:
# Root
#   ├── World (Camera2D, level, player...)
#   ├── CanvasLayer (layer=1)  # HUD — stays fixed on screen
#   │     ├── HealthBar
#   │     └── ScoreLabel
#   └── CanvasLayer (layer=-1) # Background — behind everything
#         └── ParallaxBackground
```

### Parallax

```gdscript
# Built-in parallax nodes
# ParallaxBackground → ParallaxLayer (children)

# ParallaxLayer properties:
motion_scale = Vector2(0.5, 0.5)     # 0.5 = scrolls at half camera speed
motion_offset = Vector2.ZERO
motion_mirroring = Vector2(1024, 0)  # Repeat horizontally at this interval
```

Or use CanvasLayer with `follow_viewport`:
```gdscript
var bg_layer := CanvasLayer.new()
bg_layer.layer = -1
bg_layer.follow_viewport_enabled = true
bg_layer.follow_viewport_scale = 0.3   # Moves at 30% of camera speed
```

## Rendering Order Summary

Draw order (back to front):
1. CanvasLayer with lowest `layer` value
2. Default canvas (layer 0) — sorted by tree order and `z_index`
3. Within same z_index: tree order (top-to-bottom in scene)
4. `y_sort_enabled` containers sort children by Y position
5. CanvasLayer with highest `layer` value

## C# Equivalents

```csharp
// Camera2D
camera.MakeCurrent();
camera.Zoom = new Vector2(2, 2);
camera.PositionSmoothingEnabled = true;
camera.PositionSmoothingSpeed = 5.0f;
camera.LimitLeft = 0;

// SubViewport
subViewport.Size = new Vector2I(256, 256);
var tex = subViewport.GetTexture();

// Viewport stretch settings are in Project Settings only
```
