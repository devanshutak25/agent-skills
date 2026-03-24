# Themes & Styling

## Theme System Overview

Godot's UI theming works through a cascading lookup:

1. **Theme overrides** on the specific Control (highest priority)
2. **Theme** resource assigned to the Control
3. **Theme** resource on an ancestor Control
4. **Project theme** (Project Settings → GUI → Theme → Custom)
5. **Default theme** (Godot's built-in fallback)

A single Theme resource can style every UI node in a scene subtree. Assign it to the root Control and all descendants inherit it automatically.

## Theme Resource

A Theme contains five categories of items, each keyed by **type name** (e.g., `"Button"`, `"Label"`):

| Category | What It Stores | Example |
|---|---|---|
| Colors | `Color` values | Font color, outline color |
| Constants | `int` values | Margins, separation, outline size |
| Fonts | `Font` resources | Normal, bold, italic fonts |
| Font Sizes | `int` values | Default font size per type |
| Styles | `StyleBox` resources | Backgrounds, borders, panels |

### Creating a Theme

In the editor: right-click FileSystem → New Resource → Theme. Or via code:
```gdscript
var theme := Theme.new()
theme.set_color("font_color", "Label", Color.WHITE)
theme.set_font_size("font_size", "Label", 18)
theme.set_stylebox("normal", "Button", my_stylebox)
$UIRoot.theme = theme
```

### Theme Editor

Select a `.theme` file → Bottom panel opens the Theme Editor. Add types to edit, then modify colors/constants/fonts/styles per type. Use "Show Default" to see all available fields for a given type.

## StyleBox Types

| Type | Use Case |
|---|---|
| `StyleBoxFlat` | Solid color backgrounds, borders, rounded corners |
| `StyleBoxTexture` | Image-based backgrounds with 9-slice support |
| `StyleBoxLine` | Single line (underline, separator) |
| `StyleBoxEmpty` | Explicitly no visual (removes inherited style) |

### StyleBoxFlat

The most commonly used:
```gdscript
var sb := StyleBoxFlat.new()
sb.bg_color = Color(0.15, 0.15, 0.2)

# Corners
sb.corner_radius_top_left = 8
sb.corner_radius_top_right = 8
sb.corner_radius_bottom_left = 8
sb.corner_radius_bottom_right = 8
# Or set all corners at once via Inspector

# Border
sb.border_width_left = 2
sb.border_width_top = 2
sb.border_width_right = 2
sb.border_width_bottom = 2
sb.border_color = Color(0.4, 0.4, 0.5)

# Content margin (padding inside the box)
sb.content_margin_left = 12
sb.content_margin_top = 8
sb.content_margin_right = 12
sb.content_margin_bottom = 8

# Shadow
sb.shadow_color = Color(0, 0, 0, 0.3)
sb.shadow_size = 4
sb.shadow_offset = Vector2(2, 2)

# Anti-aliasing (smooth rounded corners)
sb.anti_aliasing = true
sb.anti_aliasing_size = 1.0
```

### StyleBoxTexture (9-Slice)

For image-based UI panels:
```gdscript
var sb := StyleBoxTexture.new()
sb.texture = preload("res://ui/panel_bg.png")

# 9-slice margins (which parts don't stretch)
sb.texture_margin_left = 16
sb.texture_margin_top = 16
sb.texture_margin_right = 16
sb.texture_margin_bottom = 16

# Content margin (padding inside)
sb.content_margin_left = 20
sb.content_margin_top = 20
sb.content_margin_right = 20
sb.content_margin_bottom = 20

# Axis stretch mode
sb.axis_stretch_horizontal = StyleBoxTexture.AXIS_STRETCH_MODE_TILE
sb.axis_stretch_vertical = StyleBoxTexture.AXIS_STRETCH_MODE_TILE
```

## Button StyleBoxes

A Button has multiple style states. Set each in the theme:

| Style Name | When Active |
|---|---|
| `normal` | Default idle state |
| `hover` | Mouse hovering |
| `pressed` | Being clicked |
| `disabled` | Button is disabled |
| `focus` | Keyboard focus (drawn on top of other state) |

```gdscript
var theme := Theme.new()

var normal := StyleBoxFlat.new()
normal.bg_color = Color(0.2, 0.2, 0.3)
theme.set_stylebox("normal", "Button", normal)

var hover := StyleBoxFlat.new()
hover.bg_color = Color(0.3, 0.3, 0.4)
theme.set_stylebox("hover", "Button", hover)

var pressed := StyleBoxFlat.new()
pressed.bg_color = Color(0.1, 0.1, 0.2)
theme.set_stylebox("pressed", "Button", pressed)

# Colors
theme.set_color("font_color", "Button", Color.WHITE)
theme.set_color("font_hover_color", "Button", Color(1, 1, 0.8))
theme.set_color("font_pressed_color", "Button", Color(0.8, 0.8, 0.8))
theme.set_color("font_disabled_color", "Button", Color(0.5, 0.5, 0.5))
```

## Theme Overrides

Override individual theme properties directly on a Control node. Highest priority — ignores any Theme resource:

```gdscript
# Via code
$Label.add_theme_color_override("font_color", Color.RED)
$Label.add_theme_font_size_override("font_size", 24)
$Panel.add_theme_stylebox_override("panel", my_stylebox)
$HBox.add_theme_constant_override("separation", 12)
$Label.add_theme_font_override("font", my_font)

# Remove an override (revert to theme)
$Label.remove_theme_color_override("font_color")

# Check if override exists
if $Label.has_theme_color_override("font_color"):
    pass
```

In the Inspector: Theme Overrides section appears on every Control node.

## Theme Type Variations

Create named variations of existing types for specialized styling without duplicating the full type:

```gdscript
# In the Theme Editor: add a type variation
# Type: "HeaderLabel", Base Type: "Label"
# Override just font_size and font_color

# Then on your Label node, set theme_type_variation = "HeaderLabel"
$TitleLabel.theme_type_variation = &"HeaderLabel"
```

This way `HeaderLabel` inherits all `Label` styles but overrides only what you specify.

## Fonts

### Font Resources

Godot supports:
- **SystemFont**: Uses system-installed fonts by name
- **FontFile**: Loaded from `.ttf`, `.otf`, `.woff`, `.woff2`
- **FontVariation**: Wraps a font with modified properties (size, spacing, etc.)

```gdscript
# Load a font file
var font := load("res://fonts/Roboto-Regular.ttf") as FontFile

# Font variation (adjust without modifying the base font)
var bold_font := FontVariation.new()
bold_font.base_font = font
bold_font.variation_embolden = 1.5  # Fake bold
```

### Setting Fonts in Theme

```gdscript
var theme := Theme.new()
theme.default_font = load("res://fonts/Roboto-Regular.ttf")
theme.default_font_size = 16

# Type-specific
theme.set_font("font", "Label", load("res://fonts/Roboto-Regular.ttf"))
theme.set_font("bold_font", "RichTextLabel", load("res://fonts/Roboto-Bold.ttf"))
theme.set_font_size("font_size", "Button", 18)
```

### Bitmap Fonts

For pixel art games, use `FontFile` with `.fnt` (BMFont) files or import a PNG font sheet. Set `fixed_size` for pixel-perfect rendering at specific sizes.

## Common Styling Patterns

### Dark Panel Theme
```gdscript
var panel_sb := StyleBoxFlat.new()
panel_sb.bg_color = Color(0.12, 0.12, 0.15, 0.95)
panel_sb.corner_radius_top_left = 6
panel_sb.corner_radius_top_right = 6
panel_sb.corner_radius_bottom_left = 6
panel_sb.corner_radius_bottom_right = 6
panel_sb.border_width_left = 1
panel_sb.border_width_top = 1
panel_sb.border_width_right = 1
panel_sb.border_width_bottom = 1
panel_sb.border_color = Color(0.3, 0.3, 0.35)
panel_sb.content_margin_left = 16
panel_sb.content_margin_top = 16
panel_sb.content_margin_right = 16
panel_sb.content_margin_bottom = 16
theme.set_stylebox("panel", "PanelContainer", panel_sb)
```

### Dynamically Swapping Themes
```gdscript
var light_theme: Theme = preload("res://themes/light.theme")
var dark_theme: Theme = preload("res://themes/dark.theme")

func set_dark_mode(enabled: bool) -> void:
    $UIRoot.theme = dark_theme if enabled else light_theme
```

## Pitfalls

1. **Theme vs Theme Override**: Theme overrides on a node always win. If styling seems stuck, check for overrides in the Inspector.
2. **Type name must match**: `theme.set_color("font_color", "Button", ...)` — the second argument must be the exact class name.
3. **Rebuild required for C#**: After changing themes programmatically in C# tool scripts, call `NotifyPropertyListChanged()` if the editor doesn't refresh.
4. **StyleBox sharing**: StyleBox resources are shared by default. If you modify one at runtime, it affects all Controls using it. Use `duplicate()` for per-instance changes:
   ```gdscript
   var sb: StyleBoxFlat = $Button.get_theme_stylebox("normal").duplicate()
   sb.bg_color = Color.RED
   $Button.add_theme_stylebox_override("normal", sb)
   ```
