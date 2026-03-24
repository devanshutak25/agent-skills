# Control Layout System

## Layout Modes

Every Control has a layout mode determining how it's positioned:

| Mode | Behavior |
|---|---|
| Position | Manual `position` and `size` (default for non-container children) |
| Anchors | Position relative to parent using anchor points + offsets |
| Container | Parent Container manages position/size via size flags |

When a Control is a child of a Container, its layout mode is automatically set to Container. Manual position/anchor editing is disabled — the Container controls layout.

## Anchors

Anchors define where the control's edges are positioned relative to the parent's rect. Each edge (left, top, right, bottom) has an anchor value from `0.0` (start) to `1.0` (end).

```gdscript
# Anchor values: 0.0 = left/top edge, 1.0 = right/bottom edge of parent

# Full rect (fills parent)
anchor_left = 0.0
anchor_top = 0.0
anchor_right = 1.0
anchor_bottom = 1.0

# Center of parent
anchor_left = 0.5
anchor_right = 0.5
anchor_top = 0.5
anchor_bottom = 0.5

# Bottom-right corner
anchor_left = 1.0
anchor_top = 1.0
anchor_right = 1.0
anchor_bottom = 1.0
```

### Anchor Presets

Use the toolbar dropdown or code:
```gdscript
# Common presets
set_anchors_preset(PRESET_FULL_RECT)       # Fill parent
set_anchors_preset(PRESET_CENTER)           # Center
set_anchors_preset(PRESET_TOP_LEFT)         # Top-left corner
set_anchors_preset(PRESET_BOTTOM_WIDE)      # Bottom bar (full width, bottom)
set_anchors_preset(PRESET_LEFT_WIDE)        # Left sidebar (full height, left)
set_anchors_preset(PRESET_CENTER_TOP)       # Centered at top
```

## Offsets

Offsets are pixel distances from the anchor points to the control's actual edges:

```gdscript
# Anchors set to full rect, offsets add 16px margin
set_anchors_preset(PRESET_FULL_RECT)
offset_left = 16      # 16px from left anchor
offset_top = 16       # 16px from top anchor
offset_right = -16    # 16px inward from right anchor (negative = inward)
offset_bottom = -16   # 16px inward from bottom anchor (negative = inward)
```

**Pitfall**: Positive right/bottom offsets push the edge *outward* (beyond the anchor). Use negative values to create inward margins on right/bottom edges.

## Grow Direction

Controls which direction the control expands when its size changes:

```gdscript
grow_horizontal = GROW_DIRECTION_END     # Grows right (default)
grow_horizontal = GROW_DIRECTION_BEGIN   # Grows left
grow_horizontal = GROW_DIRECTION_BOTH    # Grows from center

grow_vertical = GROW_DIRECTION_END       # Grows down (default)
grow_vertical = GROW_DIRECTION_BEGIN     # Grows up
grow_vertical = GROW_DIRECTION_BOTH      # Grows from center
```

## Minimum Size

Controls can declare a minimum size. Containers respect this:
```gdscript
custom_minimum_size = Vector2(100, 50)  # At least 100x50 pixels
```

Built-in controls calculate their own minimum size from content. Override `_get_minimum_size()` for custom controls:
```gdscript
func _get_minimum_size() -> Vector2:
    return Vector2(200, 100)
```

## Containers

Containers automatically arrange their children. Children use **size flags** to control behavior within the container.

### Common Container Types

| Container | Behavior |
|---|---|
| `HBoxContainer` | Arranges children horizontally (left to right) |
| `VBoxContainer` | Arranges children vertically (top to bottom) |
| `GridContainer` | Grid layout, set `columns` property |
| `MarginContainer` | Adds margins around its single child |
| `CenterContainer` | Centers children in its rect |
| `PanelContainer` | Adds a panel background, single child fills it |
| `ScrollContainer` | Adds scrollbars when content exceeds size |
| `HSplitContainer` / `VSplitContainer` | Draggable split between two children |
| `TabContainer` | Tabbed pages, one visible at a time |
| `FlowContainer` | Wraps children to next line when out of space |
| `AspectRatioContainer` | Maintains child aspect ratio |
| `SubViewportContainer` | Displays a SubViewport |

### Size Flags

Size flags control how children behave inside Containers:

```gdscript
# Horizontal flags
size_flags_horizontal = Control.SIZE_FILL           # Fill allocated space
size_flags_horizontal = Control.SIZE_EXPAND          # Request extra space
size_flags_horizontal = Control.SIZE_EXPAND_FILL     # Expand + fill (most common)
size_flags_horizontal = Control.SIZE_SHRINK_BEGIN     # Align to left (default)
size_flags_horizontal = Control.SIZE_SHRINK_CENTER    # Center in allocated space
size_flags_horizontal = Control.SIZE_SHRINK_END       # Align to right

# Vertical flags work identically
size_flags_vertical = Control.SIZE_EXPAND_FILL
```

### Stretch Ratio

When multiple children have `SIZE_EXPAND`, `size_flags_stretch_ratio` determines proportional allocation:

```gdscript
# In an HBoxContainer:
# child_a gets 2/3 of space, child_b gets 1/3
child_a.size_flags_horizontal = Control.SIZE_EXPAND_FILL
child_a.size_flags_stretch_ratio = 2.0

child_b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
child_b.size_flags_stretch_ratio = 1.0
```

### Container Separation

HBox/VBoxContainer separation gap:
```gdscript
var hbox := HBoxContainer.new()
hbox.add_theme_constant_override("separation", 8)  # 8px between children
```

### MarginContainer

```gdscript
var margin := MarginContainer.new()
margin.add_theme_constant_override("margin_left", 16)
margin.add_theme_constant_override("margin_top", 16)
margin.add_theme_constant_override("margin_right", 16)
margin.add_theme_constant_override("margin_bottom", 16)
```

### GridContainer
```gdscript
var grid := GridContainer.new()
grid.columns = 3  # 3 columns, rows determined by child count
grid.add_theme_constant_override("h_separation", 4)
grid.add_theme_constant_override("v_separation", 4)
```

## Common Layout Patterns

### Full-Screen UI Root
```gdscript
var root := Control.new()
root.set_anchors_preset(Control.PRESET_FULL_RECT)
root.mouse_filter = Control.MOUSE_FILTER_IGNORE  # Pass clicks through
```

### HUD Bar at Top
```
Control (Full Rect)
└── MarginContainer (Top Wide, margins: 8)
    └── HBoxContainer
        ├── Label (health)
        ├── Control (SIZE_EXPAND_FILL — spacer)
        └── Label (score)
```

### Centered Panel
```
Control (Full Rect)
└── CenterContainer (Full Rect)
    └── PanelContainer
        └── MarginContainer (margins: 16)
            └── VBoxContainer
                ├── Label
                ├── LineEdit
                └── Button
```

### Scrollable List
```
ScrollContainer (Full Rect)
└── VBoxContainer (SIZE_EXPAND_FILL horizontal)
    ├── ItemRow
    ├── ItemRow
    └── ItemRow
```

**Pitfall**: ScrollContainer's child VBox needs `size_flags_horizontal = SIZE_EXPAND_FILL` to fill the width. Without it, the VBox shrinks to its minimum width.

## Mouse Filter

Controls how mouse events propagate:

```gdscript
mouse_filter = MOUSE_FILTER_STOP     # Consumes mouse events (default for interactive)
mouse_filter = MOUSE_FILTER_PASS     # Receives events, then passes to parent
mouse_filter = MOUSE_FILTER_IGNORE   # Invisible to mouse (for overlays/backgrounds)
```

**Tip**: Set `MOUSE_FILTER_IGNORE` on background panels and layout containers that shouldn't block clicks.

## Focus

Keyboard navigation:
```gdscript
focus_mode = FOCUS_NONE    # Can't receive focus
focus_mode = FOCUS_CLICK   # Focus on click only
focus_mode = FOCUS_ALL     # Focus via click or keyboard (Tab/Shift+Tab)

# Set focus neighbors for custom navigation
focus_neighbor_top = $ButtonAbove.get_path()
focus_neighbor_bottom = $ButtonBelow.get_path()

# Grab focus programmatically
$StartButton.grab_focus()
```

## Responsive Layout

```gdscript
func _ready() -> void:
    get_viewport().size_changed.connect(_on_viewport_resized)
    _on_viewport_resized()

func _on_viewport_resized() -> void:
    var vp_size: Vector2 = get_viewport_rect().size
    if vp_size.x < 600:
        $Container.vertical = true   # Stack narrow
    else:
        $Container.vertical = false  # Side by side
```
