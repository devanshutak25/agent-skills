# Modal Operators

Modal operators remain active and receive every event (mouse, keyboard, timer) until they return `{'FINISHED'}` or `{'CANCELLED'}`. Use them for interactive tools: click-drag transforms, drawing, real-time previews, and progress monitors. See [operators-custom.md](operators-custom.md) for basic operator structure and [bpy-ops.md](bpy-ops.md) for calling operators.

## Modal Operator Structure

A modal operator requires `invoke()` to start modal mode and `modal()` to handle events:

```python
import bpy

class VIEW3D_OT_drag_move(bpy.types.Operator):
    bl_idname = "view3d.drag_move"
    bl_label = "Drag Move"
    bl_options = {'REGISTER', 'UNDO'}

    def invoke(self, context, event):
        if context.active_object is None:
            self.report({'WARNING'}, "No active object")
            return {'CANCELLED'}
        self.init_x = event.mouse_x
        self.init_loc_x = context.active_object.location.x
        context.window_manager.modal_handler_add(self)
        return {'RUNNING_MODAL'}

    def modal(self, context, event):
        if event.type == 'MOUSEMOVE':
            delta = event.mouse_x - self.init_x
            context.active_object.location.x = self.init_loc_x + delta * 0.01
            return {'RUNNING_MODAL'}
        elif event.type == 'LEFTMOUSE' and event.value == 'RELEASE':
            return {'FINISHED'}
        elif event.type in {'RIGHTMOUSE', 'ESC'}:
            context.active_object.location.x = self.init_loc_x
            return {'CANCELLED'}
        return {'PASS_THROUGH'}

    def cancel(self, context):
        if context.active_object:
            context.active_object.location.x = self.init_loc_x
```

### Key Steps in invoke()

1. Store initial state (for undo on cancel)
2. Add the modal handler: `context.window_manager.modal_handler_add(self)`
3. Return `{'RUNNING_MODAL'}`

`modal_handler_add(self)` must be called before returning `{'RUNNING_MODAL'}`. It returns `True` on success.

### modal() Return Values

| Return | Effect |
|---|---|
| `{'RUNNING_MODAL'}` | Keep running, consume the event |
| `{'FINISHED'}` | Stop, push undo step (if `'UNDO'` in `bl_options`) |
| `{'CANCELLED'}` | Stop, no undo step |
| `{'PASS_THROUGH'}` | Keep running, let the event pass to other handlers |

Return `{'PASS_THROUGH'}` for events you don't handle, so navigation (middle-mouse orbit) still works.

## Event Types

The `event.type` attribute identifies what triggered the event.

### Mouse

Buttons: `'LEFTMOUSE'`, `'MIDDLEMOUSE'`, `'RIGHTMOUSE'`, `'BUTTON4MOUSE'`, `'BUTTON5MOUSE'`, `'BUTTON6MOUSE'`, `'BUTTON7MOUSE'`

Movement: `'MOUSEMOVE'`, `'INBETWEEN_MOUSEMOVE'` (high-frequency)

Scroll: `'WHEELUPMOUSE'`, `'WHEELDOWNMOUSE'`, `'WHEELINMOUSE'`, `'WHEELOUTMOUSE'`

Trackpad/Special: `'TRACKPADPAN'`, `'TRACKPADZOOM'`, `'MOUSEROTATE'`, `'MOUSESMARTZOOM'`

### Stylus

`'PEN'`, `'ERASER'`

### Keyboard — Alphanumeric

Letters: `'A'` through `'Z'`

Numbers: `'ZERO'`, `'ONE'`, `'TWO'`, `'THREE'`, `'FOUR'`, `'FIVE'`, `'SIX'`, `'SEVEN'`, `'EIGHT'`, `'NINE'`

### Keyboard — Function Keys

`'F1'` through `'F24'`

### Keyboard — Special Keys

`'ESC'`, `'TAB'`, `'RET'` (Enter), `'SPACE'`, `'BACK_SPACE'`, `'DEL'`, `'INSERT'`, `'HOME'`, `'END'`, `'PAGE_UP'`, `'PAGE_DOWN'`, `'PAUSE'`, `'LINE_FEED'`

### Keyboard — Arrow Keys

`'LEFT_ARROW'`, `'RIGHT_ARROW'`, `'UP_ARROW'`, `'DOWN_ARROW'`

### Keyboard — Numpad

`'NUMPAD_0'` through `'NUMPAD_9'`, `'NUMPAD_PERIOD'`, `'NUMPAD_ENTER'`, `'NUMPAD_PLUS'`, `'NUMPAD_MINUS'`, `'NUMPAD_ASTERIX'`, `'NUMPAD_SLASH'`

Note: The multiply key is spelled `NUMPAD_ASTERIX` (not ASTERISK).

### Keyboard — Punctuation / Modifiers

Punctuation: `'SEMI_COLON'`, `'PERIOD'`, `'COMMA'`, `'QUOTE'`, `'ACCENT_GRAVE'`, `'MINUS'`, `'PLUS'`, `'SLASH'`, `'BACK_SLASH'`, `'EQUAL'`, `'LEFT_BRACKET'`, `'RIGHT_BRACKET'`, `'APP'`, `'GRLESS'`

Modifiers: `'LEFT_CTRL'`, `'RIGHT_CTRL'`, `'LEFT_SHIFT'`, `'RIGHT_SHIFT'`, `'LEFT_ALT'`, `'RIGHT_ALT'`, `'OSKEY'`

### Timer Events

| Type | Source |
|---|---|
| `'TIMER'` | User-registered timer (`event_timer_add`) |
| `'TIMER0'`, `'TIMER1'`, `'TIMER2'` | Numbered timer channels |
| `'TIMER_JOBS'` | Job system timer |
| `'TIMER_AUTOSAVE'` | Auto-save timer |
| `'TIMER_REPORT'` | Report timer |
| `'TIMERREGION'` | Region redraw timer |

### NDOF (3D Mouse)

`'NDOF_MOTION'`, `'NDOF_BUTTON_MENU'`, `'NDOF_BUTTON_FIT'`, views (`_TOP`, `_BOTTOM`, `_LEFT`, `_RIGHT`, `_FRONT`, `_BACK`, `_ISO1`, `_ISO2`), rotations (`_ROLL_CW`, `_ROLL_CCW`, `_SPIN_CW`, `_SPIN_CCW`, `_TILT_CW`, `_TILT_CCW`), `_ROTATE`, `_PANZOOM`, `_DOMINANT`, `_PLUS`, `_MINUS`, `_V1`-`_V3`, `_1` through `_10`, `_A`, `_B`, `_C` (all prefixed `NDOF_BUTTON`).

### Other

`'TEXTINPUT'`, `'WINDOW_DEACTIVATE'`, `'ACTIONZONE_AREA'`, `'ACTIONZONE_REGION'`, `'ACTIONZONE_FULLSCREEN'`, `'XR_ACTION'`

## Event Values

The `event.value` attribute indicates the state of the event:

| Value | Description |
|---|---|
| `'PRESS'` | Key or button pressed down |
| `'RELEASE'` | Key or button released |
| `'CLICK'` | Click (press + release without drag) |
| `'DOUBLE_CLICK'` | Double click |
| `'CLICK_DRAG'` | Click then drag |
| `'NOTHING'` | No value (movement events, timers) |
| `'ANY'` | Matches any value (for keymap definitions, not events) |

## Event Properties

All properties are read-only on `bpy.types.Event`.

**Mouse position (int):** `mouse_x`/`mouse_y` (window-relative), `mouse_region_x`/`mouse_region_y` (region-relative, use for drawing), `mouse_prev_x`/`mouse_prev_y` (previous position), `mouse_prev_press_x`/`mouse_prev_press_y` (last press position).

**Modifiers (bool):** `alt`, `ctrl`, `shift`, `oskey`.

**State (bool):** `is_repeat` (key held), `is_tablet`, `is_mouse_absolute`.

**Tablet (float):** `pressure` (1.0 if no tablet), `tilt` (float[2], zeros if no tablet).

**Text:** `ascii` (str, single char), `unicode` (str, single char).

**Previous event:** `type_prev` (str), `value_prev` (str).

**Drag direction:** `direction` — `'ANY'`, `'NORTH'`, `'SOUTH'`, `'EAST'`, `'WEST'`, `'NORTH_EAST'`, `'SOUTH_EAST'`, `'SOUTH_WEST'`, `'NORTH_WEST'`.

## Timers

Timers fire `'TIMER'` events at a regular interval for periodic updates.

```python
# Create in invoke():
self._timer = context.window_manager.event_timer_add(time_step=0.1, window=context.window)

# Handle in modal():
if event.type == 'TIMER':
    # periodic update logic
    return {'RUNNING_MODAL'}

# Remove in cleanup (MUST do on finish/cancel):
context.window_manager.event_timer_remove(self._timer)
```

`event_timer_add(time_step, window=None)` returns a `Timer` with read-only properties: `time_step` (float, interval), `time_delta` (float, time since last step), `time_duration` (float, total elapsed).

## Draw Callbacks

Register GPU drawing callbacks to render custom overlays in the 3D viewport. Drawing uses the `gpu` module (BGL was removed in 5.0).

`SpaceView3D.draw_handler_add(callback, args, region_type, draw_type)` registers a callback. Returns a handle for removal. Parameters: `callback` (callable), `args` (tuple passed to callback), `region_type` (usually `'WINDOW'`), `draw_type`:

| draw_type | Space | Use |
|---|---|---|
| `'POST_VIEW'` | 3D world | Lines/shapes in world space |
| `'POST_PIXEL'` | 2D screen | HUD, labels, overlays |
| `'PRE_VIEW'` | 3D, before scene | Background geometry |
| `'BACKDROP'` | 2D | Node editor backgrounds |

```python
# In invoke():
self._handle = bpy.types.SpaceView3D.draw_handler_add(
    draw_fn, (self, context), 'WINDOW', 'POST_VIEW')

# In cleanup():
bpy.types.SpaceView3D.draw_handler_remove(self._handle, 'WINDOW')
context.area.tag_redraw()
```

Always remove on finish/cancel. Call `context.area.tag_redraw()` to force refresh. See [gpu-module.md](gpu-module.md) and [gpu-drawing.md](gpu-drawing.md) for shader/batch details.

## Status Text

Display key hints or progress during modal operation:

```python
# Header bar (per-area)
context.area.header_text_set("LMB: confirm | RMB/Esc: cancel")
context.area.header_text_set(None)  # restore default

# Status bar (global, bottom of window)
context.workspace.status_text_set("Processing frame 42/100...")
context.workspace.status_text_set(None)  # clear
```

`status_text_set` also accepts a function `(header, context)` for dynamic text. Always clear both in your cleanup path.

## Common Patterns

### Interactive Draw + Modal (Rectangle Selection)

Combines draw callback, mouse tracking, and cleanup. The draw callback uses `'POST_PIXEL'` for 2D screen-space drawing:

```python
import bpy, gpu
from gpu_extras.batch import batch_for_shader

def draw_rect(self, context):
    verts = [(self.sx, self.sy), (self.ex, self.sy),
             (self.ex, self.ey), (self.sx, self.ey), (self.sx, self.sy)]
    shader = gpu.shader.from_builtin('POLYLINE_UNIFORM_COLOR')
    batch = batch_for_shader(shader, 'LINE_STRIP', {"pos": verts})
    shader.bind()
    shader.uniform_float("color", (1.0, 1.0, 1.0, 0.8))
    shader.uniform_float("lineWidth", 2.0)
    shader.uniform_float("viewportSize", (context.region.width, context.region.height))
    batch.draw(shader)

class VIEW3D_OT_rect_select(bpy.types.Operator):
    bl_idname = "view3d.rect_select_custom"
    bl_label = "Rectangle Select"

    def invoke(self, context, event):
        self.sx = self.ex = event.mouse_region_x
        self.sy = self.ey = event.mouse_region_y
        self._handle = bpy.types.SpaceView3D.draw_handler_add(
            draw_rect, (self, context), 'WINDOW', 'POST_PIXEL')
        context.window_manager.modal_handler_add(self)
        return {'RUNNING_MODAL'}

    def modal(self, context, event):
        context.area.tag_redraw()
        if event.type == 'MOUSEMOVE':
            self.ex, self.ey = event.mouse_region_x, event.mouse_region_y
            return {'RUNNING_MODAL'}
        elif event.type == 'LEFTMOUSE' and event.value == 'RELEASE':
            bpy.types.SpaceView3D.draw_handler_remove(self._handle, 'WINDOW')
            return {'FINISHED'}
        elif event.type in {'RIGHTMOUSE', 'ESC'}:
            bpy.types.SpaceView3D.draw_handler_remove(self._handle, 'WINDOW')
            return {'CANCELLED'}
        return {'PASS_THROUGH'}
```

### Timer-Based Progress Monitor

```python
import bpy

class WM_OT_progress(bpy.types.Operator):
    bl_idname = "wm.progress_monitor"
    bl_label = "Progress Monitor"

    def invoke(self, context, event):
        self.frame, self.total = 0, 100
        self._timer = context.window_manager.event_timer_add(0.05, window=context.window)
        context.window_manager.modal_handler_add(self)
        return {'RUNNING_MODAL'}

    def modal(self, context, event):
        if event.type == 'TIMER':
            self.frame += 1
            context.area.header_text_set(f"{self.frame}/{self.total} | ESC to cancel")
            if self.frame >= self.total:
                return self.finish(context, {'FINISHED'})
            return {'RUNNING_MODAL'}
        elif event.type == 'ESC':
            return self.finish(context, {'CANCELLED'})
        return {'PASS_THROUGH'}

    def finish(self, context, ret):
        context.window_manager.event_timer_remove(self._timer)
        context.area.header_text_set(None)
        return ret

    def cancel(self, context):
        self.finish(context, {'CANCELLED'})
```

### Numeric Input with Keyboard

Build an input string by matching digit event types (`'ZERO'`–`'NINE'`, `'NUMPAD_0'`–`'NUMPAD_9'`) on `'PRESS'` and appending `event.ascii`. Handle `'BACK_SPACE'` (delete), `'PERIOD'` (decimal), `'RET'`/`'NUMPAD_ENTER'` (confirm), `'ESC'` (cancel). Parse with `float()`. Update `header_text_set` each keystroke.

## Gotchas

- **Always remove timers and draw handlers.** If you forget to remove them in both `finish` and `cancel` paths, they persist after the operator ends, causing crashes or visual artifacts. Implement cleanup in a shared method called from all exit paths.
- **PASS_THROUGH for unhandled events.** Return `{'PASS_THROUGH'}` for events you don't use. Returning `{'RUNNING_MODAL'}` for everything blocks viewport navigation and other interaction.
- **modal_handler_add must precede RUNNING_MODAL.** Call `context.window_manager.modal_handler_add(self)` in `invoke()` before returning `{'RUNNING_MODAL'}`. Forgetting this means `modal()` never receives events.
- **Store state on self, not locals.** `modal()` is called fresh each event. Any state (initial position, timer handles, draw handles) must be stored on `self`.
- **mouse_region_x/y can be negative.** When the mouse leaves the region boundary, region-relative coordinates go negative or exceed region dimensions. Check bounds before using for pixel-space operations.
- **tag_redraw() for visual updates.** The viewport does not automatically redraw when your operator changes visual state. Call `context.area.tag_redraw()` explicitly after modifying draw data.
- **BGL is removed.** All GPU drawing must use the `gpu` module. Legacy `bgl.glEnable` / `bgl.glLineWidth` calls will fail. Use `gpu.state.line_width_set()` and related functions instead. See [gpu-module.md](gpu-module.md).
