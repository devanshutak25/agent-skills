# UI Nodes Reference

## Text Display

### Label
Displays static text. Supports autowrap and clipping.
```gdscript
var label := Label.new()
label.text = "Score: 100"
label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
label.clip_text = true  # Truncate if too small
label.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
```

### RichTextLabel
Supports BBCode formatting, inline images, effects, and clickable links.
```gdscript
var rtl := RichTextLabel.new()
rtl.bbcode_enabled = true
rtl.text = "[b]Bold[/b] and [color=red]red[/color] and [url=link_id]clickable[/url]"
rtl.fit_content = true  # Resize vertically to fit content
rtl.scroll_active = false  # Disable scrollbar

# Append programmatically
rtl.push_color(Color.YELLOW)
rtl.push_bold()
rtl.add_text("Warning!")
rtl.pop()  # bold
rtl.pop()  # color
```

**BBCode tags**: `[b]`, `[i]`, `[u]`, `[s]`, `[color=]`, `[font_size=]`, `[center]`, `[right]`, `[url]`, `[img]`, `[table]`, `[cell]`, `[outline_color=]`, `[wave]`, `[shake]`, `[rainbow]`, `[fade]`, `[pulse]`.

```gdscript
# Clickable links
rtl.meta_clicked.connect(_on_meta_clicked)

func _on_meta_clicked(meta: Variant) -> void:
    if meta == "link_id":
        OS.shell_open("https://example.com")
```

## Text Input

### LineEdit
Single-line text input.
```gdscript
var line := LineEdit.new()
line.placeholder_text = "Enter name..."
line.max_length = 32
line.clear_button_enabled = true
line.secret = true  # Password mode (dots)

# Signals
line.text_changed.connect(func(new_text: String) -> void:
    print("Typing: ", new_text)
)
line.text_submitted.connect(func(text: String) -> void:
    print("Submitted: ", text)
)
```

### TextEdit
Multi-line text editor.
```gdscript
var te := TextEdit.new()
te.placeholder_text = "Enter description..."
te.wrap_mode = TextEdit.LINE_WRAPPING_BOUNDARY
te.scroll_smooth = true
te.minimap_draw = true

# Get/set text
te.text = "Hello\nWorld"
var content: String = te.text
```

### CodeEdit
Extends TextEdit with code-specific features: line numbers, code folding, auto-indent, auto-complete, gutters.
```gdscript
var code := CodeEdit.new()
code.gutters_draw_line_numbers = true
code.auto_brace_completion_enabled = true
code.indent_automatic = true
code.code_completion_enabled = true
```

## Buttons

### Button
Standard push button with text and optional icon.
```gdscript
var btn := Button.new()
btn.text = "Start"
btn.icon = preload("res://icons/play.png")
btn.icon_alignment = HORIZONTAL_ALIGNMENT_LEFT
btn.disabled = false
btn.pressed.connect(_on_start)
```

### TextureButton
Button using images for each state.
```gdscript
var tb := TextureButton.new()
tb.texture_normal = preload("res://ui/btn_normal.png")
tb.texture_hover = preload("res://ui/btn_hover.png")
tb.texture_pressed = preload("res://ui/btn_pressed.png")
tb.texture_disabled = preload("res://ui/btn_disabled.png")
tb.stretch_mode = TextureButton.STRETCH_KEEP_ASPECT_CENTERED
tb.ignore_texture_size = true  # Allow custom sizing
```

### CheckBox
Toggle with label.
```gdscript
var cb := CheckBox.new()
cb.text = "Enable sound"
cb.button_pressed = true  # Checked state
cb.toggled.connect(func(on: bool) -> void:
    AudioServer.set_bus_mute(0, not on)
)
```

### CheckButton
Toggle switch (same API as CheckBox, different visual).

### OptionButton
Dropdown selection.
```gdscript
var opt := OptionButton.new()
opt.add_item("Easy", 0)
opt.add_item("Medium", 1)
opt.add_item("Hard", 2)
opt.selected = 1  # Select "Medium"
opt.item_selected.connect(func(index: int) -> void:
    print("Selected: ", opt.get_item_text(index))
)
```

### MenuButton
Button that opens a PopupMenu on click:
```gdscript
var mb := MenuButton.new()
mb.text = "File"
var popup: PopupMenu = mb.get_popup()
popup.add_item("New", 0)
popup.add_item("Open", 1)
popup.add_separator()
popup.add_item("Quit", 2)
popup.id_pressed.connect(_on_menu_item)
```

## Sliders & Spinboxes

### HSlider / VSlider
```gdscript
var slider := HSlider.new()
slider.min_value = 0.0
slider.max_value = 1.0
slider.step = 0.01
slider.value = 0.75
slider.value_changed.connect(func(val: float) -> void:
    AudioServer.set_bus_volume_db(0, linear_to_db(val))
)
```

### SpinBox
Numeric input with +/- buttons:
```gdscript
var spin := SpinBox.new()
spin.min_value = 1
spin.max_value = 100
spin.step = 1
spin.value = 10
spin.prefix = "Qty: "
spin.suffix = " items"
spin.editable = true
```

### ProgressBar
```gdscript
var bar := ProgressBar.new()
bar.min_value = 0
bar.max_value = 100
bar.value = 75
bar.show_percentage = true
bar.fill_mode = ProgressBar.FILL_BEGIN_TO_END  # or FILL_END_TO_BEGIN, FILL_TOP_TO_BOTTOM, FILL_BOTTOM_TO_TOP
```

## Item Lists

### ItemList
Scrollable list of selectable items with optional icons.
```gdscript
var list := ItemList.new()
list.add_item("Sword", preload("res://icons/sword.png"))
list.add_item("Shield", preload("res://icons/shield.png"))
list.add_item("Potion")  # No icon
list.select_mode = ItemList.SELECT_SINGLE
list.max_columns = 1

list.item_selected.connect(func(index: int) -> void:
    print("Selected: ", list.get_item_text(index))
)
```

### Tree
Hierarchical tree with columns, checkboxes, buttons per cell.
```gdscript
var tree := Tree.new()
tree.columns = 2
tree.set_column_title(0, "Name")
tree.set_column_title(1, "Value")
tree.column_titles_visible = true

var root: TreeItem = tree.create_item()
root.set_text(0, "Settings")

var child: TreeItem = tree.create_item(root)
child.set_text(0, "Volume")
child.set_range(1, 0.8)
child.set_editable(1, true)
child.set_range_config(1, 0.0, 1.0, 0.01)

tree.item_edited.connect(_on_tree_edited)
```

## Texture / Color Display

### TextureRect
Displays a texture:
```gdscript
var tr := TextureRect.new()
tr.texture = preload("res://art/portrait.png")
tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE  # Ignore texture size, use Control size
tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
```

### NinePatchRect
9-slice texture display (similar to StyleBoxTexture but as a standalone node):
```gdscript
var np := NinePatchRect.new()
np.texture = preload("res://ui/panel.png")
np.patch_margin_left = 16
np.patch_margin_top = 16
np.patch_margin_right = 16
np.patch_margin_bottom = 16
```

### ColorRect
Solid color rectangle:
```gdscript
var cr := ColorRect.new()
cr.color = Color(0, 0, 0, 0.5)  # Semi-transparent black overlay
cr.mouse_filter = Control.MOUSE_FILTER_IGNORE
```

### ColorPickerButton
Button that opens a color picker popup:
```gdscript
var cpb := ColorPickerButton.new()
cpb.color = Color.WHITE
cpb.color_changed.connect(func(col: Color) -> void:
    $Sprite2D.modulate = col
)
```

## Separators

`HSeparator` and `VSeparator` — thin visual dividers, useful inside HBox/VBoxContainers. No configuration needed beyond theme styling.

## VideoStreamPlayer

Plays video files (.ogv Theora format):
```gdscript
var vsp := VideoStreamPlayer.new()
vsp.stream = preload("res://videos/intro.ogv")
vsp.autoplay = true
vsp.finished.connect(func() -> void:
    get_tree().change_scene_to_file("res://scenes/main.tscn")
)
```
