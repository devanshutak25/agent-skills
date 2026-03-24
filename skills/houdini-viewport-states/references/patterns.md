# Patterns, Undo & Debugging

## Table of Contents
- [Undo Support](#undo-support)
- [Debugging](#debugging)
- [State Machine Patterns](#state-machine-patterns)
- [Performance Tips](#performance-tips)
- [Common Gotchas](#common-gotchas)
- [ViewerStateDragger](#viewerstatedragger)

---

## Undo Support

In a custom state, scripted actions across many calls should be wrapped into single undo-able 
actions. Without undo blocks, every parameter change during a drag becomes a separate undo step.

### Basic Pattern
```python
def onMouseEvent(self, kwargs):
    node = kwargs["node"]
    ui_event = kwargs["ui_event"]
    reason = ui_event.reason()
    
    if reason == hou.uiEventReason.Start:
        # Begin undo block when drag starts
        self.scene_viewer.beginStateUndo("Paint Points")
        self._dragging = True
        
    elif reason == hou.uiEventReason.Active:
        # Make changes during drag (all bundled into one undo)
        if self._dragging:
            # modify parameters, geometry, etc.
            pass
            
    elif reason == hou.uiEventReason.Changed:
        # End undo block when drag ends
        if self._dragging:
            self.scene_viewer.endStateUndo()
            self._dragging = False
    
    return False
```

### Key Rules
- `beginStateUndo(label)` — label appears in Houdini's undo history
- All scripting between `begin` and `end` is bundled as one undo step
- `endStateUndo()` will raise an exception if called without a matching `begin`
- Always end the undo block on interrupt:

```python
def onInterrupt(self, kwargs):
    if self._dragging:
        self.scene_viewer.endStateUndo()
        self._dragging = False
```

### Complete Example: Draw Points
```python
class DrawPoints(object):
    def __init__(self, state_name, scene_viewer):
        self.state_name = state_name
        self.scene_viewer = scene_viewer
        self._pressed = False
        self._index = -1
    
    def _start(self):
        if not self._pressed:
            self.scene_viewer.beginStateUndo("Add Point")
            self._index = self._insert_point()
            self._pressed = True
    
    def _finish(self):
        if self._pressed:
            self.scene_viewer.endStateUndo()
            self._pressed = False
    
    def onMouseEvent(self, kwargs):
        node = kwargs["node"]
        ui_event = kwargs["ui_event"]
        device = ui_event.device()
        origin, direction = ui_event.ray()
        
        # Find intersection
        intersected = -1
        inputs = node.inputs()
        if inputs and inputs[0]:
            geometry = inputs[0].geometry()
            intersected, position, _, _ = su.sopGeometryIntersection(
                geometry, origin, direction
            )
        if intersected < 0:
            position = su.cplaneIntersection(self.scene_viewer, origin, direction)
        
        if device.isLeftButton():
            self._start()
            self._set(self._index, position)
        else:
            self._finish()
        
        return False
    
    def onInterrupt(self, kwargs):
        self._finish()
```

### Alternative: hou.undos.group
For non-state contexts, you can use the context manager:
```python
with hou.undos.group("My Operation"):
    node.parm("tx").set(1.0)
    node.parm("ty").set(2.0)
```

---

## Debugging

### Tracing Execution
Enable in the Viewer State Browser:
- Right-click your state → **Enable Tracing**
- All callback invocations are logged to the browser console

### self.log() Method
Available in all state classes (injected by Houdini):
```python
def onMouseEvent(self, kwargs):
    self.log("Mouse position:", kwargs["ui_event"].device().mouseX())
```
Output appears in the **Viewer State Browser** console.

### viewerstate.utils.DebugAid
For more structured debugging:
```python
import viewerstate.utils as su

class State(object):
    def __init__(self, state_name, scene_viewer):
        self.state_name = state_name
        self.scene_viewer = scene_viewer
        # DebugAid provides logging methods
```
<!-- PLACEHOLDER: Document DebugAid methods in detail -->

### Python print()
Regular `print()` output goes to Houdini's Python Shell / console.

### Prompt Messages
For quick visual feedback during debugging:
```python
self.scene_viewer.setPromptMessage("Debug: hit prim %d" % prim_num)
```

### hou.ui.displayMessage
For modal debug popups (blocks interaction):
```python
hou.ui.displayMessage("Debug value: %s" % str(value))
```

### Debug Context Menu
The viewport has a debug context menu for states. Access it through the Viewer State Browser's
debug options.

### Reloading States
- File-based: `hou.ui.reloadViewerState("state_name")` or use browser
- HDA-embedded: Save Type Properties (Accept/Apply)

---

## State Machine Patterns

Complex states often implement internal state machines to manage multi-step interactions.

### Enum-Based State Machine
```python
class Mode:
    IDLE = "idle"
    PLACING = "placing"  
    DRAGGING = "dragging"
    SELECTING = "selecting"

class State(object):
    def __init__(self, state_name, scene_viewer):
        self.state_name = state_name
        self.scene_viewer = scene_viewer
        self._mode = Mode.IDLE
    
    def onMouseEvent(self, kwargs):
        reason = kwargs["ui_event"].reason()
        
        if self._mode == Mode.IDLE:
            if reason == hou.uiEventReason.Picked:
                self._mode = Mode.PLACING
                self._begin_placement(kwargs)
                
        elif self._mode == Mode.PLACING:
            if reason == hou.uiEventReason.Start:
                self._mode = Mode.DRAGGING
                self.scene_viewer.beginStateUndo("Drag")
            elif reason == hou.uiEventReason.Picked:
                self._confirm_placement(kwargs)
                self._mode = Mode.IDLE
                
        elif self._mode == Mode.DRAGGING:
            if reason == hou.uiEventReason.Active:
                self._update_drag(kwargs)
            elif reason == hou.uiEventReason.Changed:
                self._end_drag(kwargs)
                self.scene_viewer.endStateUndo()
                self._mode = Mode.IDLE
        
        return False
    
    def onInterrupt(self, kwargs):
        if self._mode == Mode.DRAGGING:
            self.scene_viewer.endStateUndo()
        self._mode = Mode.IDLE
```

<!-- PLACEHOLDER: Add more state machine examples (brush tool, multi-step placement, etc.) -->

---

## Performance Tips

1. **Cache geometry references** — fetch `node.inputs()[0].geometry()` once in `onEnter`, 
   not per-event. Houdini builds acceleration structures on first `intersect()`.

2. **Transform, don't recreate drawables** — changing a drawable's transform via 
   `setTransform()` is far cheaper than creating new geometry per frame.

3. **Avoid heavy computation in onMouseEvent** — this fires on every mouse move. Keep it 
   fast. Defer expensive operations to `onDraw` or to when actions complete (Changed/Picked).

4. **Use `onDraw`/`onDrawSetup` for rendering updates** — these are called in the render 
   loop and are the right place for per-frame visual updates.

5. **Minimize parameter sets during drag** — batch parameter changes if possible. Each 
   `parm.set()` may trigger a cook.

6. **Guide geometry should be closed polygon meshes** — other geometry types may not 
   render correctly in drawables.

7. **Force viewport redraw sparingly** — `scene_viewer.curViewport().draw()` is useful but 
   don't call it in a tight loop.

<!-- PLACEHOLDER: Add profiling tips, benchmarking approaches -->

---

## Common Gotchas

1. **No node access in `__init__`** — the node isn't available until `onEnter`/`onGenerate`.
   Create drawables and cache geometry there, not in the constructor.

2. **Consuming events breaks selectors** — returning `True` from `onMouseEvent` prevents 
   the event from reaching active selectors. Be very deliberate about consumption.

3. **Drawable garbage collection** — if you don't store a reference to a Drawable on `self`, 
   Python will garbage-collect it and it will vanish from the viewport.

4. **Forgetting to end undo blocks** — always pair `beginStateUndo` with `endStateUndo`, 
   including in `onInterrupt`. Unmatched calls cause exceptions or broken undo stacks.

5. **RMB swallowed by menu** — if your state has a bound menu, `onMouseEvent` won't receive 
   right-click events. Design accordingly.

6. **State name conflicts** — file-based and HDA-embedded states with the same name will 
   conflict. Remove one before registering the other.

7. **showHandle in __init__** — calling `scene_viewer.showHandle()` in the constructor 
   causes a runtime error. Use `onEnter` instead.

8. **Double event processing** — if `onKeyEvent` doesn't consume a key that has a hotkey 
   binding, `onMenuAction` will also fire for it. Return `True` in `onKeyEvent` to prevent 
   double-handling.

---

## ViewerStateDragger

For dragging interactions along lines or planes — works with both states and gadgets.

```python
class State(object):
    def __init__(self, state_name, scene_viewer):
        self.state_name = state_name
        self.scene_viewer = scene_viewer
        self.dragger = hou.ViewerStateDragger()
    
    def onMouseEvent(self, kwargs):
        ui_event = kwargs["ui_event"]
        reason = ui_event.reason()
        
        if reason == hou.uiEventReason.Start:
            self.scene_viewer.beginStateUndo("Drag")
            # Drag along a line from origin in direction
            self.dragger.startDragAlongLine(ui_event, origin, direction)
            
        elif reason == hou.uiEventReason.Active:
            drag_values = self.dragger.drag(ui_event)
            delta = drag_values["delta_position"]  # Vector3
            # Apply delta to parameters
            
        elif reason == hou.uiEventReason.Changed:
            self.dragger.endDrag()
            self.scene_viewer.endStateUndo()
        
        return False
```

### Dragger Methods
- `startDragAlongLine(ui_event, origin, direction)` — constrain drag along a line
- `startDragAlongPlane(ui_event, origin, normal)` — constrain drag along a plane  
- `drag(ui_event)` → dict with `"position"`, `"delta_position"`, etc.
- `endDrag()` — terminate the drag

<!-- PLACEHOLDER: Add more dragger patterns, plane dragging examples -->
