# Popups, Windows & Dialogs

## Window

`Window` is the base class for all popup/dialog types. In Godot 4, popups are real OS windows by default (can be made embedded).

```gdscript
var win := Window.new()
win.title = "Settings"
win.size = Vector2i(400, 300)
win.unresizable = false
win.transient = true       # Always on top of parent window
win.exclusive = true       # Blocks input to parent
add_child(win)
win.popup_centered()

win.close_requested.connect(func() -> void:
    win.hide()
)
```

### Embedded vs Native Windows

By default, Windows are native OS windows. To embed them inside the game viewport:
- Project Settings → Display → Window → Subwindows → `Embed Subwindows = true`
- Or per-window: set the `Window` as a child of a `SubViewportContainer`

**Pitfall**: On platforms without multi-window support (mobile, web), windows are always embedded regardless of setting.

## Popup

`Popup` extends `Window` with auto-hide behavior (hides when clicking outside or pressing Escape). Base class for menus and tooltips.

```gdscript
var popup := Popup.new()
popup.size = Vector2i(200, 100)
add_child(popup)
popup.popup_centered()  # Show centered on screen
popup.popup(Rect2i(100, 100, 200, 100))  # Show at specific rect
```

## PopupMenu

Context menu / dropdown menu with items, separators, submenus, checkboxes, and shortcuts.

```gdscript
var menu := PopupMenu.new()
add_child(menu)

# Basic items (id is optional, auto-increments)
menu.add_item("New File", 0)
menu.add_item("Open File", 1)
menu.add_separator()
menu.add_item("Save", 2)
menu.add_item("Save As...", 3)
menu.add_separator()
menu.add_item("Quit", 4)

# Shortcuts
var shortcut := Shortcut.new()
var event := InputEventKey.new()
event.keycode = KEY_S
event.ctrl_pressed = true
shortcut.events = [event]
menu.set_item_shortcut(2, shortcut)  # Ctrl+S for Save

# Checkable items
menu.add_check_item("Show Grid", 10)
menu.set_item_checked(menu.get_item_index(10), true)

# Radio check items (mutually exclusive within same group conceptually)
menu.add_radio_check_item("Small", 20)
menu.add_radio_check_item("Medium", 21)
menu.add_radio_check_item("Large", 22)

# Submenu
var sub := PopupMenu.new()
sub.name = "RecentFiles"
sub.add_item("file1.txt", 0)
sub.add_item("file2.txt", 1)
menu.add_child(sub)
menu.add_submenu_item("Recent Files", "RecentFiles")

# Show
menu.popup(Rect2i(get_global_mouse_position(), Vector2i.ZERO))

# Handle selection
menu.id_pressed.connect(func(id: int) -> void:
    match id:
        0: new_file()
        1: open_file()
        2: save_file()
        4: get_tree().quit()
        10:
            var idx: int = menu.get_item_index(10)
            menu.set_item_checked(idx, not menu.is_item_checked(idx))
)
```

### Right-Click Context Menu
```gdscript
func _gui_input(event: InputEvent) -> void:
    if event is InputEventMouseButton:
        if event.button_index == MOUSE_BUTTON_RIGHT and event.pressed:
            $ContextMenu.popup(Rect2i(
                Vector2i(get_global_mouse_position()), Vector2i.ZERO
            ))
            accept_event()
```

## PopupPanel

A popup with a panel background. Good for tooltips or simple info popups:
```gdscript
var pp := PopupPanel.new()
var label := Label.new()
label.text = "This is a tooltip"
pp.add_child(label)
add_child(pp)
pp.popup_centered()
```

## Built-In Dialogs

All inherit from `AcceptDialog` or `ConfirmationDialog`.

### AcceptDialog

Simple OK dialog:
```gdscript
var dialog := AcceptDialog.new()
dialog.title = "Notice"
dialog.dialog_text = "Operation completed."
dialog.ok_button_text = "Got it"
add_child(dialog)
dialog.popup_centered()

dialog.confirmed.connect(func() -> void:
    print("User acknowledged")
)
```

### ConfirmationDialog

OK + Cancel dialog:
```gdscript
var confirm := ConfirmationDialog.new()
confirm.title = "Confirm"
confirm.dialog_text = "Delete this item?"
confirm.ok_button_text = "Delete"
confirm.cancel_button_text = "Keep"
add_child(confirm)
confirm.popup_centered()

confirm.confirmed.connect(func() -> void:
    delete_item()
)
confirm.canceled.connect(func() -> void:
    print("Canceled")
)
```

### FileDialog

File open/save dialog:
```gdscript
var fd := FileDialog.new()
fd.file_mode = FileDialog.FILE_MODE_OPEN_FILE  # or SAVE_FILE, OPEN_FILES, OPEN_DIR
fd.access = FileDialog.ACCESS_USERDATA  # or ACCESS_RESOURCES, ACCESS_FILESYSTEM
fd.filters = PackedStringArray(["*.png, *.jpg ; Images", "*.json ; JSON Files"])
fd.current_dir = "user://"
add_child(fd)
fd.popup_centered(Vector2i(600, 400))

fd.file_selected.connect(func(path: String) -> void:
    print("Selected: ", path)
)
# For FILE_MODE_OPEN_FILES:
fd.files_selected.connect(func(paths: PackedStringArray) -> void:
    for p in paths:
        print("File: ", p)
)
```

**Note**: `ACCESS_FILESYSTEM` gives full OS filesystem access — only works on desktop. `ACCESS_RESOURCES` is `res://`, `ACCESS_USERDATA` is `user://`.

### ColorPickerDialog

A popup containing a full ColorPicker:
```gdscript
# Usually you'd use ColorPickerButton instead, which wraps this
var cpd := ColorPickerButton.new()
cpd.color = Color.WHITE
cpd.color_changed.connect(func(c: Color) -> void:
    $Sprite2D.modulate = c
)
```

## Custom Dialog Pattern

Build dialogs from ConfirmationDialog by adding custom content:
```gdscript
var dialog := ConfirmationDialog.new()
dialog.title = "Player Name"

var vbox := VBoxContainer.new()
var label := Label.new()
label.text = "Enter your name:"
vbox.add_child(label)

var input := LineEdit.new()
input.placeholder_text = "Name..."
vbox.add_child(input)

dialog.add_child(vbox)
dialog.register_text_enter(input)  # Submit on Enter key
add_child(dialog)
dialog.popup_centered(Vector2i(300, 150))

dialog.confirmed.connect(func() -> void:
    var player_name: String = input.text
    start_game(player_name)
)
```

## Tooltip System

Every Control has built-in tooltip support:
```gdscript
$Button.tooltip_text = "Click to start the game"
```

For custom-styled tooltips, override `_make_custom_tooltip()`:
```gdscript
func _make_custom_tooltip(for_text: String) -> Control:
    var panel := PanelContainer.new()
    var label := Label.new()
    label.text = for_text
    panel.add_child(label)
    return panel
```

The returned Control becomes the tooltip. Theme it however you want.

## Signals Summary

| Node | Key Signals |
|---|---|
| `Window` | `close_requested`, `visibility_changed`, `focus_entered`, `focus_exited` |
| `Popup` | `popup_hide` |
| `PopupMenu` | `id_pressed`, `index_pressed`, `id_focused` |
| `AcceptDialog` | `confirmed`, `canceled`, `custom_action` |
| `FileDialog` | `file_selected`, `files_selected`, `dir_selected` |
