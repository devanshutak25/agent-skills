# Handles

## Table of Contents
- [Overview](#overview)
- [Static Handle Binding](#static-handle-binding)
- [Dynamic Handle Binding](#dynamic-handle-binding)
- [Handle Callbacks](#handle-callbacks)
- [Showing and Hiding Handles](#showing-and-hiding-handles)
- [Dynamic Handle Management at Runtime](#dynamic-handle-management-at-runtime)
- [Python Handles (Custom)](#python-handles-custom)
- [Handle Types Reference](#handle-types-reference)

---

## Overview

Handles are the standard way to let users interactively edit parameters in the viewport.
They provide ready-made UI for translate, rotate, scale, and many other parameter types.

There are two binding approaches:
- **Static binding** — direct 1:1 mapping between node parameters and handle parameters
- **Dynamic binding** — handle-to-state callbacks that let you interpret handle changes with code

And two handle categories:
- **Built-in handles** — Houdini's library of predefined handle types (`xform`, `vector`, etc.)
- **Python handles** — fully custom handles you implement yourself

Handles cannot be bound to nodeless states.

---

## Static Handle Binding

For straightforward 1:1 parameter mapping. No callbacks needed.

```python
def createViewerStateTemplate():
    template = hou.ViewerStateTemplate("mystate", "My State", hou.sopNodeTypeCategory())
    template.bindFactory(State)
    
    # Map node parameters directly to handle parameters
    template.bindHandleStatic(
        "xform",            # handle type
        "start_handle",     # unique handle name
        [                   # list of (node_parm, handle_parm) tuples
            ("startx", "tx"),
            ("starty", "ty"),
            ("startz", "tz"),
        ]
    )
    
    template.bindHandleStatic(
        "xform",
        "end_handle",
        [
            ("endx", "tx"),
            ("endy", "ty"),
            ("endz", "tz"),
        ]
    )
    
    return template
```

When the user drags the handle, the mapped node parameters update directly.

---

## Dynamic Handle Binding

For when you need to process handle changes with code (e.g., apply scaling, clamp values,
update multiple parameters from one handle movement).

```python
def createViewerStateTemplate():
    template = hou.ViewerStateTemplate("mystate", "My State", hou.sopNodeTypeCategory())
    template.bindFactory(State)
    
    template.bindHandle(
        "xform",              # handle type
        "twist_handle",       # unique handle name
        cache_previous_parms=True  # enables prev_parms in callback
    )
    
    return template
```

### cache_previous_parms
When `True`, the callback receives both current and previous handle parameter values — useful 
for computing deltas (e.g., how far the user dragged). When `False` (default), only current 
values are provided.

---

## Handle Callbacks

### onHandleToState(self, kwargs)
Called when the user manipulates a handle in the viewport.

```python
def onHandleToState(self, kwargs):
    handle_name = kwargs["handle"]       # which handle was manipulated
    parms = kwargs["parms"]              # current handle parameter values
    prev_parms = kwargs["prev_parms"]    # previous values (if cached)
    mod_parms = kwargs["mod_parms"]      # list of changed parameter names
    
    node = kwargs["node"]
    
    # Example: map handle translate to node parameters
    if handle_name == "twist_handle":
        node.parm("tx").set(parms["tx"])
        node.parm("ty").set(parms["ty"])
        node.parm("tz").set(parms["tz"])
```

### onStateToHandle(self, kwargs)
Called when node parameters change externally (e.g., user types in parameter editor),
so you can sync the handle position.

```python
def onStateToHandle(self, kwargs):
    handle_name = kwargs["handle"]
    parms = kwargs["parms"]
    node = kwargs["node"]
    
    if handle_name == "twist_handle":
        # Update handle position from node parameters
        parms["tx"] = node.parm("tx").eval()
        parms["ty"] = node.parm("ty").eval()
        parms["tz"] = node.parm("tz").eval()
```

---

## Showing and Hiding Handles

```python
# During state operation
self.scene_viewer.showHandle("twist_handle", True)   # show
self.scene_viewer.showHandle("twist_handle", False)  # hide
```

Or using the `hou.Handle` object:
```python
handle = self.scene_viewer.findHandle("twist_handle")
if handle:
    handle.show(True)
```

**Note**: Do NOT call `showHandle` from `__init__` — it will cause a runtime error. 
Use `onEnter` or later.

---

## Dynamic Handle Management at Runtime

You can bind and unbind handles dynamically (not just at registration):

```python
def onEnter(self, kwargs):
    # Bind a new handle at runtime
    self.scene_viewer.bindViewerHandle(
        "xform", "runtime_handle",
        cache_previous_parms=True
    )

def onExit(self, kwargs):
    # Unbind when done
    self.scene_viewer.unbindViewerHandle("runtime_handle")
```

---

## Python Handles (Custom)

When built-in handles aren't sufficient, you can write fully custom handles with their own
rendering, mouse interaction, and parameter management.

### Overview
Python handles:
- Are implemented as separate classes (similar to states)
- Registered via `hou.ViewerHandleTemplate`
- Can define custom parameters, gadgets, context menus
- Handle their own mouse/keyboard events
- Are reusable across multiple states

### Registration
```python
def createViewerHandleTemplate():
    handle_type = "my_custom_handle"
    handle_label = "My Custom Handle"
    handle_cat = hou.sopNodeTypeCategory()
    
    template = hou.ViewerHandleTemplate(handle_type, handle_label, handle_cat)
    template.bindFactory(MyHandle)
    
    # Define parameters
    template.bindParameter(hou.parmTemplateType.Float, "angle", "Angle")
    template.exportParameters(["angle"])  # Make available to states
    
    # Register gadgets for interactive geometry
    template.bindGadget(hou.drawableGeometryType.Face, "dial_gadget")
    
    return template
```

### Binding a Python Handle to a State
```python
def createViewerStateTemplate():
    template = hou.ViewerStateTemplate(...)
    
    # Bind the custom Python handle type
    template.bindHandle("my_custom_handle", "dial_instance")
    
    return template
```

### Python Handle Events
Python handles have their own event handlers:
- `onMouseEvent` — handle mouse events when cursor is over a gadget
- `onMouseIndirectEvent` — mouse events not directly over a gadget
- `onMouseWheelEvent` — scroll wheel
- `onKeyEvent` — keyboard events
- `onParmChangeEvent` — parameter value changes
- `onDraw` / `onDrawSetup` — rendering

**Event priority**: Python handle `onMouseEvent` is always processed before the active
state's `onMouseEvent`.

### Using hou.ViewerHandleDragger
For translating geometry along axes or planes:
```python
def onMouseEvent(self, kwargs):
    ui_event = kwargs["ui_event"]
    reason = ui_event.reason()
    
    if reason == hou.uiEventReason.Start:
        self.dragger.startDragAlongLine(ui_event, origin, direction)
    elif reason in (hou.uiEventReason.Active, hou.uiEventReason.Changed):
        drag_values = self.dragger.drag(ui_event)
        delta = drag_values["delta_position"]
        if reason == hou.uiEventReason.Changed:
            self.dragger.endDrag()
```

<!-- PLACEHOLDER: Expand with more Python handle patterns as experience grows -->

---

## Handle Types Reference

Common built-in handle types available for binding:

| Handle Type | Description |
|-------------|-------------|
| `xform` | Full transform (translate, rotate, scale) |
| `vector` | Direction vector |
| `bounding_box` | Bounding box manipulation |
| `ladder` | Value ladder (drag to change a value) |
| `pivot` | Pivot point handle |

<!-- PLACEHOLDER: Expand this list with more handle types and their parameter names -->

To discover available handles and their parameters, use the **Digital Asset Handle Bindings 
dialog** (Type Properties → Handles tab) which shows all handles matching the state context.

### Handle Snap Settings
Handles respect the viewport's snapping settings. You can control snapping behavior 
per-handle with the `snap_to_selection` parameter at bind time.
