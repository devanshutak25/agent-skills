# Event Handlers

## Table of Contents
- [Lifecycle Handlers](#lifecycle-handlers)
- [UI Input Handlers](#ui-input-handlers)
- [Handle Handlers](#handle-handlers)
- [Selection Handlers](#selection-handlers)
- [Drawing Handlers](#drawing-handlers)
- [Drag and Drop Handlers](#drag-and-drop-handlers)
- [Menu Handler](#menu-handler)
- [UIEvent and UIEventDevice](#uievent-and-uieventdevice)
- [Event Reasons (LMB State Machine)](#event-reasons)
- [Pointing Ray and Geometry Intersection](#pointing-ray-and-geometry-intersection)

---

## Lifecycle Handlers

These control the state's lifecycle — when it starts, stops, gets interrupted, etc.

### onGenerate(self, kwargs)
Called when the state is first entered and needs to create a new node. For nodeless states, 
this is the entry point (called via `setCurrentState()`).
- `kwargs["node"]` — the node (if applicable)

### onEnter(self, kwargs)
Called when entering the state on an existing node (e.g., user selects a node and presses Enter).
This is where you should set up drawables, cache geometry references, and initialize state.
- `kwargs["node"]` — the current node

### onExit(self, kwargs)
Called when leaving the state. Clean up resources, restore snapping modes, etc.
- `kwargs["node"]` — the current node

### onInterrupt(self, kwargs)
Called when another (volatile) state temporarily takes over — e.g., user starts tumbling, 
dollying, or enters a selection state. Hide guide geometry here.
- `kwargs["interrupt_state"]` — name of the interrupting state (or empty string)

### onResume(self, kwargs)
Called when returning from an interrupt. Re-show guide geometry here.

**Important**: For things that track the mouse (guide geometry under cursor), show in 
`onMouseEvent()` instead of `onResume()` — `onMouseEvent()` gives you the position and 
is guaranteed to fire when the mouse is in the viewer.

### onStateToHandle(self, kwargs)
See [Handle Handlers](#handle-handlers).

### onHandleToState(self, kwargs)
See [Handle Handlers](#handle-handlers).

---

## UI Input Handlers

### onMouseEvent(self, kwargs)
Primary mouse handler. Called for mouse moves, clicks, and drags.
- `kwargs["ui_event"]` — hou.ViewerEvent
- Return `True` to consume (stop propagation), `False` to pass through
- **Warning**: Consuming events breaks active selectors. Be careful.

```python
def onMouseEvent(self, kwargs):
    ui_event = kwargs["ui_event"]
    device = ui_event.device()
    reason = ui_event.reason()
    
    if reason == hou.uiEventReason.Picked:
        # LMB single click (press + release without drag)
        pass
    elif reason == hou.uiEventReason.Start:
        # LMB pressed down (drag starting)
        pass
    elif reason == hou.uiEventReason.Active:
        # Mouse dragging with LMB held
        pass
    elif reason == hou.uiEventReason.Changed:
        # LMB released (drag ended)
        pass
    elif reason == hou.uiEventReason.Located:
        # Mouse moved (no button held) — most common reason
        pass
    
    return False
```

### onMouseDoubleClickEvent(self, kwargs)
Called on LMB double-click. Always called after `onMouseEvent` has processed.
- **Warning**: Consuming this event breaks active selectors.

### onMouseWheelEvent(self, kwargs)
Called on vertical mouse wheel scroll.
```python
def onMouseWheelEvent(self, kwargs):
    device = kwargs["ui_event"].device()
    scroll = device.mouseWheel()  # positive = scroll up, negative = scroll down
    return False
```

### onKeyEvent(self, kwargs)
Keyboard event handler. Called for key presses and held keys.
```python
def onKeyEvent(self, kwargs):
    ui_event = kwargs["ui_event"]
    key_string = ui_event.device().keyString()     # e.g., "a", "shift a", "ctrl g"
    key_value = ui_event.device().keyValue()        # ASCII value
    is_repeat = ui_event.device().isAutoRepeat()    # True if key held down
    
    if key_string == "a":
        # handle 'a' key
        return True  # consume
    return False
```

### onKeyTransitEvent(self, kwargs)
Monitors key up/down transitions — use when you need to know when a key is released.
```python
def onKeyTransitEvent(self, kwargs):
    ui_event = kwargs["ui_event"]
    device = ui_event.device()
    is_up = device.isKeyUp()
    is_down = device.isKeyDown()
    key = device.keyString()
    return False
```

### Keyboard Consumer Chain
The event flows through in this order:
1. `onKeyEvent` (state gets first crack)
2. `onMenuAction` (if key matches a hotkey symbol)
3. Active state selector

If `onKeyEvent` returns `True`, the event won't reach `onMenuAction`. Be deliberate about 
what you consume.

---

## Handle Handlers

### onHandleToState(self, kwargs)
Called when the user manipulates a handle in the viewport.
- `kwargs["handle"]` — name of the handle being manipulated
- `kwargs["parms"]` — dict of current handle parameter values
- `kwargs["prev_parms"]` — dict of previous values (only if `cache_previous_parms=True`)
- `kwargs["mod_parms"]` — list of parameter names that changed

```python
def onHandleToState(self, kwargs):
    handle_name = kwargs["handle"]
    parms = kwargs["parms"]
    prev_parms = kwargs["prev_parms"]
    
    for parm_name in kwargs["mod_parms"]:
        old_val = prev_parms[parm_name]
        new_val = parms[parm_name]
        # Update node parameters based on handle change
```

### onStateToHandle(self, kwargs)
Called when node parameters change (e.g., user edits parameter UI), so you can sync handles.
- `kwargs["parms"]` — dict of current handle parameter values

---

## Selection Handlers

### onSelection(self, kwargs)
Called when the user completes a geometry, object, or drawable selection.
- For geometry selectors: `kwargs["selection"]` — hou.GeometrySelection
- For object selectors: `kwargs["selection"]` — list of hou.OpNode
- `kwargs["name"]` — selector name (useful when multiple selectors are bound)
- Return `True` to accept selection and enter regular state operation
- Return `False` to reject and keep the selector running

### onStartSelection(self, kwargs)
Called when a bound selector starts.

### onStopSelection(self, kwargs)
Called when a bound selector stops.

### onLocateSelection(self, kwargs)
Called during hovering/locating while a selector is active.

---

## Drawing Handlers

### onDraw(self, kwargs)
Called when the viewport needs to redraw. Use this to draw your drawables.
- `kwargs["draw_handle"]` — the draw handle to pass to `.draw(handle)`

```python
def onDraw(self, kwargs):
    handle = kwargs["draw_handle"]
    self.my_drawable.draw(handle)
```

### onDrawSetup(self, kwargs)
Called before `onDraw`. Use for per-frame setup like updating transforms or parameters 
on drawables before they render.

---

## Drag and Drop Handlers

For states that accept drag-and-drop from outside the viewport.

### onDragTest(self, kwargs)
Validate whether the drag source is acceptable.
- Use `hou.ui.hasDragSourceData('text/plain')` to check source type
- Return `True` to accept, `False` to reject

### onDropGetOptions(self, kwargs)
Populate a drop option list for the user to choose from.
```python
def onDropGetOptions(self, kwargs):
    kwargs['drop_options']['ids'] = ('option1', 'option2')
    kwargs['drop_options']['labels'] = ('Option 1', 'Option 2')
```

### onDropAccept(self, kwargs)
Process the dropped data with the selected option.
- `kwargs['drop_selection']` — the option the user chose
- Return `True` to accept

---

## Menu Handler

### onMenuAction(self, kwargs)
Called when a context menu item is selected.
- `kwargs["menu_item"]` — ID of the selected item
- For toggles: `kwargs["<item_id>"]` — current True/False value
- For radio strips: `kwargs["<strip_id>"]` — current selection index

See `menus-and-info.md` for full menu setup details.

### onMenuPreOpen(self, kwargs)
Called before the context menu opens. Use to dynamically update menu item states.

---

## UIEvent and UIEventDevice

### hou.ViewerEvent (kwargs["ui_event"])
- `.device()` → hou.UIEventDevice (mouse/keyboard/tablet state)
- `.ray()` → (origin: Vector3, direction: Vector3) — pointing ray into scene
- `.snappingRay()` → dict with snap-aware ray (origin_point, direction, snapped, ...)
- `.reason()` → hou.uiEventReason value

### hou.UIEventDevice (ui_event.device())
Mouse:
- `.mouseX()`, `.mouseY()` — screen coordinates within the viewer
- `.isLeftButton()`, `.isMiddleButton()`, `.isRightButton()` — button pressed
- `.isLeftButtonReleased()`, `.isMiddleButtonReleased()`, `.isRightButtonReleased()`
- `.mouseWheel()` — vertical scroll value

Modifiers:
- `.isShiftKey()`, `.isCtrlKey()`, `.isAltKey()`

Keyboard:
- `.keyString()` — e.g., `"a"`, `"shift a"`, `"ctrl g"`
- `.keyValue()` — ASCII value
- `.isAutoRepeat()` — True if key is held down
- `.isKeyUp()`, `.isKeyDown()` — transition states (for `onKeyTransitEvent`)

Tablet:
- `.tabletPressure()` — 0.0 to 1.0
- `.tabletTilt()` — tilt angle
- `.tabletAngle()` — rotation angle
- `.tabletRoll()` — roll value

---

## Event Reasons

The `hou.uiEventReason` values form a state machine for LMB interactions:

| Reason | Meaning |
|--------|---------|
| `Located` | Mouse moved (no button pressed) — most common |
| `Picked` | LMB single click (press + release, no drag) |
| `Start` | LMB pressed down (potential drag starting) |
| `Active` | Dragging with LMB held |
| `Changed` | LMB released after drag |

Typical drag tracking pattern:
```python
def onMouseEvent(self, kwargs):
    reason = kwargs["ui_event"].reason()
    
    if reason == hou.uiEventReason.Start:
        self.scene_viewer.beginStateUndo("My Action")
        # Initialize drag state
        
    elif reason == hou.uiEventReason.Active:
        # Update during drag
        
    elif reason == hou.uiEventReason.Changed:
        # Finish drag
        self.scene_viewer.endStateUndo()
    
    return False
```

---

## Pointing Ray and Geometry Intersection

### Getting the Ray
```python
def onMouseEvent(self, kwargs):
    ui_event = kwargs["ui_event"]
    origin, direction = ui_event.ray()  # World-space ray from mouse into scene
```

### Intersecting Geometry
Use `hou.Geometry.intersect()` to find what's under the cursor. The utility function 
from `viewerstate.utils` wraps this:

```python
import viewerstate.utils as su

# In onEnter — cache geometry ONCE for performance
def onEnter(self, kwargs):
    node = kwargs["node"]
    inputs = node.inputs()
    if inputs and inputs[0]:
        self._geometry = inputs[0].geometry()

# In onMouseEvent — reuse cached geometry
def onMouseEvent(self, kwargs):
    origin, direction = kwargs["ui_event"].ray()
    if self._geometry:
        hit_prim, position, normal, uvw = su.sopGeometryIntersection(
            self._geometry, origin, direction
        )
        if hit_prim >= 0:
            # Mouse is over geometry at `position`
            pass
```

**Performance tip**: Always cache the geometry reference. Houdini builds acceleration 
structures on first `intersect()` call. Re-fetching geometry per event rebuilds these 
structures every time, causing significant slowdown.

### Intersecting the Construction Plane
When the ray doesn't hit geometry, fall back to the construction plane:
```python
position = su.cplaneIntersection(self.scene_viewer, origin, direction)
```

### Snapping-Aware Ray
```python
snap_dict = ui_event.snappingRay()
if snap_dict["snapped"]:
    if snap_dict["geo_type"] == hou.snappingPriority.GeoPoint:
        point_idx = snap_dict["point_index"]
```
Note: Requires snap options to be enabled in the viewport.

### Managing Snap Modes
If your state needs specific snapping, set and restore it:
```python
def onEnter(self, kwargs):
    self._snap_mode = self.scene_viewer.snappingMode()
    self.scene_viewer.setSnappingMode(hou.snappingMode.Point)

def onExit(self, kwargs):
    self.scene_viewer.setSnappingMode(self._snap_mode)

def onInterrupt(self, kwargs):
    self.scene_viewer.setSnappingMode(self._snap_mode)

def onResume(self, kwargs):
    self._snap_mode = self.scene_viewer.snappingMode()
    self.scene_viewer.setSnappingMode(hou.snappingMode.Point)
```

### Interacting with Intersected Primitives
```python
if hit_prim >= 0:
    prim = self._geometry.prim(hit_prim)
    prim_type = prim.type()  # hou.primType value
    # e.g., hou.primType.Polygon → you have a hou.Polygon object
```

### Compensating for Parent Transforms
Drawables render in world space. If your node is inside a transformed OBJ container,
you need to compensate. Find the ancestor object node and get its world transform:
```python
def _get_world_transform(self, node):
    obj_node = su.ancestorObject(node)
    if obj_node:
        return obj_node.worldTransform()
    return hou.Matrix4(1)  # identity
```
