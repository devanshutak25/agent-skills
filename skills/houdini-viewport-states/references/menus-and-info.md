# Context Menus, Hotkeys & Info Panels

## Table of Contents
- [Context Menus](#context-menus)
- [Menu Item Types](#menu-item-types)
- [Responding to Menu Actions](#responding-to-menu-actions)
- [Reading Menu Settings in Other Handlers](#reading-menu-settings)
- [Updating Menus Dynamically](#updating-menus-dynamically)
- [Hotkeys](#hotkeys)
- [Info Panels (HUD)](#info-panels)

---

## Context Menus

Build a context menu using `hou.ViewerStateMenu` and bind it to your template. The menu
appears when the user right-clicks while your state is active.

### Building and Binding
```python
def createViewerStateTemplate():
    template = hou.ViewerStateTemplate("mystate", "My State", hou.sopNodeTypeCategory())
    template.bindFactory(State)
    
    # Create menu
    menu = hou.ViewerStateMenu('my_menu', 'My Tool')
    menu.addActionItem("delete", "Delete Current")
    menu.addActionItem("duplicate", "Duplicate")
    menu.addSeparator()
    menu.addToggleItem("show_guides", "Show Guides", True)  # default on
    
    template.bindMenu(menu)
    return template
```

**Important**: If a state has a bound context menu, RMB events are NOT sent to `onMouseEvent`.
The menu takes priority.

---

## Menu Item Types

### Action Items
Simple clickable actions:
```python
menu.addActionItem("item_id", "Display Label")
```

### Toggle Items (Checkboxes)
```python
menu.addToggleItem("show_points", "Show Points", True)  # True = default on
```

### Radio Strips
Mutually exclusive options:
```python
menu.addRadioStrip("deform_type", "Deformation Type", "bend")  # default item
menu.addRadioStripItem("deform_type", "bend", "Bend")
menu.addRadioStripItem("deform_type", "squash", "Squash")
menu.addRadioStripItem("deform_type", "twist", "Twist")
```

### Separators
```python
menu.addSeparator()
```

### Sub-menus
```python
sub_menu = hou.ViewerStateMenu('sub_menu', 'Options...')
sub_menu.addActionItem("opt1", "Option 1")
sub_menu.addActionItem("opt2", "Option 2")
menu.addMenu(sub_menu)
```

---

## Responding to Menu Actions

### Basic if/else
```python
def onMenuAction(self, kwargs):
    item = kwargs["menu_item"]
    if item == "delete":
        self._do_delete()
    elif item == "duplicate":
        self._do_duplicate()
```

### Dynamic Dispatch (Cleaner for Many Items)
```python
def onMenuAction(self, kwargs):
    method = getattr(self, "_" + kwargs["menu_item"], None)
    if method:
        return method(kwargs)

def _delete(self, kwargs):
    # handle delete
    pass

def _duplicate(self, kwargs):
    # handle duplicate
    pass
```

### Toggle State
```python
def onMenuAction(self, kwargs):
    if kwargs["menu_item"] == "show_points":
        show = kwargs["show_points"]  # current True/False value
        self._guide.show(show)
```

### Radio Strip Selection
```python
def onMenuAction(self, kwargs):
    if kwargs["menu_item"] == "deform_type":
        current = kwargs["deform_type"]  # selected item ID string
        if current == "bend":
            pass
        elif current == "squash":
            pass
```

---

## Reading Menu Settings

Toggle and radio values are injected into **every** `kwargs` dict passed to **every** handler.
This means you can check menu settings in `onMouseEvent`, `onKeyEvent`, etc.:

```python
def onMouseEvent(self, kwargs):
    ui_event = kwargs["ui_event"]
    
    # Check if the "Show Guides" toggle is on
    if kwargs.get("show_guides"):
        # draw guides
        pass
    
    # Check current radio selection
    mode = kwargs.get("deform_type", "bend")
    
    return False
```

---

## Updating Menus Dynamically

### onMenuPreOpen(self, kwargs)
Called before the context menu opens. Modify menu item states here:

```python
def onMenuPreOpen(self, kwargs):
    # Enable/disable items based on current state
    # Update toggle values, etc.
    pass
```

<!-- PLACEHOLDER: Expand with concrete onMenuPreOpen patterns -->

---

## Hotkeys

### Hotkey System (Houdini 20.5+)
Houdini uses symbolic hotkey names rather than direct key assignments. Users can remap 
hotkeys via the Hotkey Editor.

### Defining Hotkeys
```python
def createViewerStateTemplate():
    template = hou.ViewerStateTemplate("mystate", "My State", hou.sopNodeTypeCategory())
    template.bindFactory(State)
    
    # Create hotkey definitions
    hotkey_definitions = hou.PluginHotkeyDefinitions()
    
    # Define hotkey symbols with default key assignments
    import viewerstate.utils as su
    hk_delete = su.defineHotkey(hotkey_definitions, "mystate", "delete", "x")
    hk_cycle = su.defineHotkey(hotkey_definitions, "mystate", "cycle", "y")
    
    template.bindHotkeyDefinitions(hotkey_definitions)
    
    # Create menu and assign hotkeys to items
    menu = hou.ViewerStateMenu('my_menu', 'My Tool')
    menu.addActionItem("delete", "Delete", hotkey=hk_delete)
    menu.addActionItem("cycle", "Cycle Mode", hotkey=hk_cycle)
    template.bindMenu(menu)
    
    return template
```

### Hotkey Symbol Format
For a SOP viewer state, the hotkey symbol prefix is:
```
h.pane.gview.state.sop.<state_name>.<action_name>
```

### Hotkey Consumer Chain
1. `onKeyEvent` (gets first chance)
2. `onMenuAction` (via symbolic hotkey)
3. Active selector

If `onKeyEvent` consumes a key that also has a hotkey binding, `onMenuAction` won't fire
for that key. Be deliberate about what you consume in `onKeyEvent`.

---

## Info Panels

Info panels display a HUD overlay with hotkey hints, current settings, and status information.

### Defining the Info Panel
```python
def createViewerStateTemplate():
    template = hou.ViewerStateTemplate(...)
    template.bindFactory(State)
    
    # Define info panel template
    info = hou.ViewerStateInfoTemplate()
    
    # Plain text rows
    info.addRow("mode_label", "Mode")
    info.addRow("radius_label", "Radius")
    
    # Bargraph (progress-bar style, value 0.0-1.0)
    info.addBargraph("radius_bar", 0.0)
    
    # Radio bar (shows current selection from N choices)
    info.addRadioBar("mode_bar", count=3, value=0)
    
    # Divider (blank space separator)
    info.addDivider()
    
    template.bindInfoPanel(info)
    return template
```

### Updating the Info Panel
```python
def onMouseEvent(self, kwargs):
    # Update info panel values
    self.scene_viewer.hudInfo(
        mode_label={"value": "Paint"},
        radius_label={"value": "0.5"},
        radius_bar={"value": 0.5},   # normalized 0.0-1.0
        mode_bar={"value": 1},        # index of active radio
    )
    return False
```

### Info Panel Style Guide (from SideFX Docs)
- Don't document everything — only commonly useful hints/settings
- The panel is NOT meant to update based on what's under the mouse — it's for "always useful 
  to know" tips and status
- Put current mode indicators at the top
- For numeric values, show both a plain text row AND a bargraph row below it
- Remember to update both plain and graph rows when a value changes
- Keep it compact — the panel occupies significant screen space

### Row Types

| Type | Description | Value Range |
|------|-------------|-------------|
| Plain text | Label + value text | Any string |
| Bargraph | Progress-bar style | 0.0 to 1.0 (must normalize) |
| Radio bar | Shows N segments, one highlighted | 0 to count-1 |
| Divider | Blank space separator | N/A |

<!-- PLACEHOLDER: Expand with more info panel examples and patterns -->
