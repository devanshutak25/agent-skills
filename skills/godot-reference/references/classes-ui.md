# UI / Control Classes Quick Reference

## Control (Base)

Base class for all UI nodes. Provides layout, focus, theming.

**Layout properties**: `anchor_left/right/top/bottom`, `offset_left/right/top/bottom`, `size`, `position`, `minimum_size`, `size_flags_horizontal/vertical`, `layout_direction`, `grow_horizontal/vertical`

**Focus**: `focus_mode` (None, Click, All), `focus_neighbor_*`, `grab_focus()`, `has_focus()`

**Mouse**: `mouse_filter` (Stop, Pass, Ignore), `mouse_default_cursor_shape`, `tooltip_text`

**Theme**: `theme`, `add_theme_color_override(name, color)`, `add_theme_font_override(name, font)`, `add_theme_stylebox_override(name, sb)`

**Signals**: `resized`, `focus_entered`, `focus_exited`, `mouse_entered`, `mouse_exited`, `gui_input(event)`, `minimum_size_changed`

**4.5**: `set_mouse_filter_recursive()` — change mouse/focus behavior on entire subtree

## Containers

### BoxContainer (HBoxContainer / VBoxContainer)
Arranges children in a row or column. Children use `size_flags_horizontal/vertical` and `size_flags_stretch_ratio` to control sizing.

### GridContainer
Grid layout. Set `columns` property. Children fill left-to-right, top-to-bottom.

### MarginContainer
Adds margins around its single child. Set margins via theme constants.

### CenterContainer
Centers its child.

### PanelContainer
Panel background with optional StyleBox. Centers content with padding.

### ScrollContainer
Scrollable area for content larger than the container.
- `scroll_horizontal/vertical` — current scroll position

### HSplitContainer / VSplitContainer
Draggable split between two children.

### TabContainer
Tabbed interface. Each child is a tab page.
- `current_tab`, signal `tab_changed(tab_idx)`

### FlowContainer (HFlowContainer / VFlowContainer)
Wraps children to next row/column when space runs out.

### AspectRatioContainer
Maintains a fixed aspect ratio for its child.

### FoldableContainer (4.5+)
Collapsible/expandable container for organizing UI sections. Toggle whether contents are expanded programmatically or by user interaction. Eliminates previous workarounds for accordion-style UIs.

### SubViewportContainer
Displays a SubViewport as a Control. Set `stretch = true` to fit.

## Accessibility (4.5+)

### Screen Reader Support (Experimental)
Through AccessKit integration, Control nodes now support screen readers and assistive technologies.
- Supported: Project Manager, standard UI nodes, Inspector
- Not yet complete for the full editor
- Platform-dependent — test on your target OS
- Add accessibility descriptions to controls for visually impaired players

```gdscript
# Custom accessibility description on a Control
$Button.accessibility_name = "Start Game"
$Button.accessibility_description = "Begins a new adventure"
```

### Recursive Mouse & Focus Behavior (4.5+)
New properties on containers to propagate mouse/focus settings to all children:
```gdscript
# Disable mouse input on entire UI subtree
container.mouse_behavior_recursive = true
container.mouse_filter = Control.MOUSE_FILTER_IGNORE

# Disable focus on entire subtree
container.focus_behavior_recursive = true
container.focus_mode = Control.FOCUS_NONE
```

Eliminates the need to manually set `mouse_filter`/`focus_mode` on every child control.

## Text

### Label
Static text display.
- **Key properties**: `text`, `horizontal_alignment`, `vertical_alignment`, `autowrap_mode`, `text_overrun_behavior`, `lines_skipped`, `max_lines_visible`

### RichTextLabel
Rich text with BBCode formatting.
- **Key properties**: `bbcode_enabled`, `text`, `fit_content`, `scroll_active`
- **BBCode**: `[b]`, `[i]`, `[u]`, `[s]`, `[color=red]`, `[font_size=20]`, `[url=...]`, `[img]`, `[table]`, `[cell]`
- **Signals**: `meta_clicked(meta)` — link clicks
- **4.5**: Stacked effect layers (outline + shadow combinations without workarounds)

### LineEdit
Single-line text input.
- **Key properties**: `text`, `placeholder_text`, `max_length`, `editable`, `secret`, `clear_button_enabled`
- **Signals**: `text_changed(new_text)`, `text_submitted(new_text)`

### TextEdit
Multi-line text editor.
- **Key properties**: `text`, `placeholder_text`, `editable`, `wrap_mode`

### CodeEdit
Extended TextEdit for code editing (syntax highlighting, auto-complete, gutters).

## Buttons

### Button
Standard push button with text and/or icon.
- **Key properties**: `text`, `icon`, `flat`, `disabled`, `toggle_mode`, `button_pressed`
- **Signals**: `pressed`, `toggled(pressed)`

### TextureButton
Image-based button with normal/pressed/hover/disabled/focused textures.

### CheckBox
Toggle checkbox. `toggle_mode = true` by default.

### CheckButton
On/off toggle switch appearance.

### OptionButton
Dropdown selection. Items added via `add_item(label)`.
- `selected`, signal `item_selected(index)`

### MenuButton
Button that opens a PopupMenu on press.

### LinkButton
Hyperlink-styled button.

## Sliders & Bars

### HSlider / VSlider
Draggable slider. Extends Range.
- **Key properties**: `min_value`, `max_value`, `value`, `step`, `editable`
- **Signal**: `value_changed(value)`

### SpinBox
Numeric input with up/down buttons. Extends Range.
- `prefix`, `suffix`, `editable`

### ProgressBar
Visual progress indicator. Extends Range.
- `show_percentage`

### HScrollBar / VScrollBar
Scrollbar. Usually managed automatically by ScrollContainer.

## Popups & Dialogs

### PopupMenu
Context menu / dropdown menu.
- `add_item(label, id)`, `add_check_item(label, id)`, `add_separator()`
- **Signal**: `id_pressed(id)`, `index_pressed(index)`

### AcceptDialog
OK dialog with message.
- `dialog_text`, `ok_button_text`, signal `confirmed`

### ConfirmationDialog
OK + Cancel dialog.
- Signals: `confirmed`, `canceled`

### FileDialog
File open/save dialog.
- `file_mode` (OpenFile, SaveFile, OpenDir, etc.), `filters`, `current_path`
- **Signal**: `file_selected(path)`, `dir_selected(path)`

### ColorPickerButton / ColorPicker
Color selection UI.

### Window
OS-level window. Can float or embed.

## Item Lists & Trees

### ItemList
Scrollable list of selectable items.
- `add_item(text, icon)`, `select(idx)`, `get_selected_items()`
- **Signal**: `item_selected(index)`, `item_activated(index)` (double-click)

### Tree
Hierarchical tree view.
- `create_item(parent)` returns TreeItem
- **Signal**: `item_selected`, `item_activated`, `cell_selected`

### GraphEdit / GraphNode
Node-based graph editor (for visual scripting-style UIs).

## Texture Display

### TextureRect
Displays a texture in the UI.
- **Key properties**: `texture`, `stretch_mode` (Scale, Tile, Keep, KeepAspect, etc.), `flip_h`, `flip_v`

### NinePatchRect
Stretchable texture with fixed borders (for panels, frames).

### VideoStreamPlayer
Video playback node. Supports OGV (Theora) format.

## Layout Helpers

### Separator (HSeparator / VSeparator)
Visual divider line.

### Panel
Background panel using a StyleBox theme.

### ColorRect
Solid color rectangle.

### ReferenceRect
Editor-only rectangle for layout reference (not visible in game).

## Theme System

A `Theme` resource defines:
- **Colors**: `add_theme_color_override("font_color", Color.RED)`
- **Fonts**: `add_theme_font_override("font", my_font)`
- **Font sizes**: `add_theme_font_size_override("font_size", 20)`
- **StyleBoxes**: `add_theme_stylebox_override("panel", my_stylebox)`
- **Constants**: `add_theme_constant_override("margin_left", 10)`

StyleBox types: StyleBoxEmpty, StyleBoxFlat, StyleBoxTexture, StyleBoxLine

Themes cascade: child controls inherit from parent unless overridden.
