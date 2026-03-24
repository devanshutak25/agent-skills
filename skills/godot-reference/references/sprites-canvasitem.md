# Sprites & Textures 2D Reference

## Sprite2D

Displays a 2D texture. The most common node for showing images.

```gdscript
extends Sprite2D

func _ready() -> void:
    texture = preload("res://player.png")
    
    # Offset and centering
    centered = true                  # Default: origin at center
    offset = Vector2(0, -8)          # Shift sprite relative to origin
    flip_h = false                   # Horizontal mirror
    flip_v = false                   # Vertical mirror
    
    # Sprite sheet (region)
    region_enabled = true
    region_rect = Rect2(0, 0, 64, 64)  # Crop from source texture
    
    # Sprite sheet grid (hframes/vframes)
    hframes = 4                      # Columns in sheet
    vframes = 2                      # Rows in sheet
    frame = 0                        # Current frame index (0 to hframes*vframes-1)
    frame_coords = Vector2i(2, 1)    # Column, row (alternative to frame index)
    
    # Rendering
    modulate = Color.WHITE           # Tint color (multiplied)
    self_modulate = Color.WHITE      # Tint without affecting children
    visible = true
    z_index = 0                      # Draw order (-4096 to 4096)
    z_as_relative = true             # z_index relative to parent
```

### Texture Filtering

Set per-node or project-wide (Project Settings → Rendering → Textures → Canvas Textures → Default Texture Filter):

```gdscript
# Per-node (CanvasItem property)
texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST           # Pixel art (sharp)
texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR             # Smooth (default)
texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST_WITH_MIPMAPS  # Pixel art + mipmaps
texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS   # Smooth + mipmaps
texture_filter = CanvasItem.TEXTURE_FILTER_PARENT_NODE        # Inherit from parent
```

For pixel art games: set project default to `Nearest`, or set it on the root node.

### Texture Repeat
```gdscript
texture_repeat = CanvasItem.TEXTURE_REPEAT_DISABLED   # No repeat (default)
texture_repeat = CanvasItem.TEXTURE_REPEAT_ENABLED    # Tile
texture_repeat = CanvasItem.TEXTURE_REPEAT_MIRROR     # Tile with mirroring
```

## AnimatedSprite2D

Sprite with built-in frame animation using `SpriteFrames` resource.

```gdscript
extends AnimatedSprite2D

func _ready() -> void:
    # SpriteFrames set in editor or:
    sprite_frames = preload("res://player_frames.tres")
    
    play(&"idle")               # Play animation by name
    play(&"run")                # Switch animation
    play(&"attack", 1.5)        # Custom speed multiplier
    play_backwards(&"die")      # Play in reverse
    stop()                      # Stop at current frame
    pause()                     # Pause (resume with play)
    
    # Properties
    animation = &"idle"         # Current animation name
    frame = 0                   # Current frame index
    speed_scale = 1.0           # Global speed multiplier
    autoplay = &"idle"          # Auto-play on _ready
    
    # Signals
    animation_finished.connect(_on_animation_finished)
    frame_changed.connect(_on_frame_changed)
    animation_changed.connect(_on_animation_changed)

func _on_animation_finished() -> void:
    if animation == &"attack":
        play(&"idle")
```

### SpriteFrames Resource

Created in editor (SpriteFrames panel at bottom) or code:

```gdscript
var frames := SpriteFrames.new()
frames.add_animation(&"walk")
frames.set_animation_speed(&"walk", 10.0)       # FPS
frames.set_animation_loop(&"walk", true)

# Add individual frames
frames.add_frame(&"walk", preload("res://walk_0.png"))
frames.add_frame(&"walk", preload("res://walk_1.png"))

# Or from sprite sheet — use AtlasTexture
for i in 4:
    var atlas := AtlasTexture.new()
    atlas.atlas = preload("res://walk_sheet.png")
    atlas.region = Rect2(i * 64, 0, 64, 64)
    frames.add_frame(&"walk", atlas)

$AnimatedSprite2D.sprite_frames = frames
```

### Animation from Sprite Sheet (Editor Workflow)

1. Select AnimatedSprite2D → Inspector → SpriteFrames → New SpriteFrames
2. Open SpriteFrames panel (bottom of editor)
3. Click grid icon → "Add Frames from Sprite Sheet"
4. Select your sprite sheet image
5. Set grid size (H/V), select frames, click "Add Frames"
6. Rename animation, set FPS, toggle loop

## Texture Types

| Type | Use |
|---|---|
| `CompressedTexture2D` | Default for imported images (.png, .jpg → .ctex) |
| `ImageTexture` | Created at runtime from `Image` data |
| `AtlasTexture` | Region of a larger texture (sprite sheets) |
| `GradientTexture1D` / `2D` | Procedural gradients |
| `NoiseTexture2D` | Procedural noise (FastNoiseLite) |
| `PlaceholderTexture2D` | Placeholder when texture is missing |
| `ViewportTexture` | Live render from SubViewport |
| `CurveTexture` / `CurveXYZTexture` | Baked from Curve resource |
| `CanvasTexture` | Wraps a texture with normal/specular maps for 2D lighting |

### ImageTexture (Runtime)
```gdscript
# Create from Image
var img := Image.create(256, 256, false, Image.FORMAT_RGBA8)
img.fill(Color.RED)
var tex := ImageTexture.create_from_image(img)
$Sprite2D.texture = tex

# Load at runtime (not preload)
var tex := ImageTexture.new()
var img := Image.new()
img.load("user://screenshot.png")
tex = ImageTexture.create_from_image(img)
```

### AtlasTexture
```gdscript
var atlas := AtlasTexture.new()
atlas.atlas = preload("res://tileset.png")       # Source texture
atlas.region = Rect2(128, 64, 32, 32)            # Region to display
atlas.filter_clip = true                          # Prevent bleeding at edges
atlas.margin = Rect2(1, 1, 1, 1)                 # Transparent margin
```

### NoiseTexture2D
```gdscript
var noise_tex := NoiseTexture2D.new()
noise_tex.width = 512
noise_tex.height = 512
noise_tex.noise = FastNoiseLite.new()
noise_tex.noise.noise_type = FastNoiseLite.TYPE_SIMPLEX
noise_tex.noise.frequency = 0.02
noise_tex.seamless = true    # Tileable
```

## CanvasGroup

Merges children into a single draw call, allowing group-wide effects:

```
CanvasGroup       # Children rendered as one unit
├── Sprite2D      # Body
├── Sprite2D      # Arm
└── Sprite2D      # Weapon
```

Useful with shaders: apply outline or glow to the entire group rather than individual sprites.

## Draw Order

CanvasItems draw in tree order (top-to-bottom in Scene panel = back-to-front). Override with:

```gdscript
z_index = 5              # Higher = drawn later (in front)
z_as_relative = true     # z_index adds to parent's z_index
show_behind_parent = true  # Draw behind parent instead of in front
```

### Y-Sort

For top-down games where objects lower on screen appear in front:

```gdscript
# On parent Node2D
y_sort_enabled = true    # Children sorted by Y position each frame
```

Children with lower `global_position.y` draw first (behind). Works recursively — nested y-sorted containers merge into parent's sort.

## CanvasLayer

Draws children on a separate layer (ignores camera transform). Use for: HUD, UI, parallax backgrounds.

```gdscript
# CanvasLayer properties
layer = 1           # Draw order (-128 to 128). Higher = in front
follow_viewport_enabled = false  # If true, moves with camera (for parallax)
follow_viewport_scale = 0.5     # Parallax scroll speed (0.5 = half speed)
offset = Vector2.ZERO
scale = Vector2.ONE
```

## Visibility

```gdscript
visible = false                     # Hide node + children
show()                              # Show
hide()                              # Hide
modulate.a = 0.5                    # Semi-transparent
VisibilityNotifier2D / VisibleOnScreenNotifier2D  # React when entering/leaving screen
```

### VisibleOnScreenNotifier2D
```gdscript
# Attach as child — emits signals when entering/leaving viewport
$VisibleOnScreenNotifier2D.screen_entered.connect(func(): set_physics_process(true))
$VisibleOnScreenNotifier2D.screen_exited.connect(func(): set_physics_process(false))
```

## C# Equivalents

```csharp
// Sprite2D
sprite.Texture = GD.Load<Texture2D>("res://player.png");
sprite.FlipH = true;
sprite.Frame = 3;
sprite.Modulate = Colors.White;

// AnimatedSprite2D
animSprite.Play("idle");
animSprite.AnimationFinished += OnAnimationFinished;
```
