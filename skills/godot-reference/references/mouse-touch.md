# Mouse & Touch Input Reference

## Mouse Input

### Mouse Position
```gdscript
# Viewport-relative position (most common)
var mouse_pos: Vector2 = get_viewport().get_mouse_position()

# Local to current node (for Control nodes)
var local_pos: Vector2 = get_local_mouse_position()

# Global (same as viewport for 2D without camera transform)
var global_pos: Vector2 = get_global_mouse_position()
```

### Mouse Buttons
```gdscript
func _unhandled_input(event: InputEvent) -> void:
    if event is InputEventMouseButton:
        match event.button_index:
            MOUSE_BUTTON_LEFT:
                if event.pressed:
                    start_action(event.position)
                else:
                    end_action(event.position)
            MOUSE_BUTTON_RIGHT:
                if event.pressed:
                    open_context_menu(event.position)
            MOUSE_BUTTON_MIDDLE:
                if event.pressed:
                    start_pan()
            MOUSE_BUTTON_WHEEL_UP:
                zoom_in()
            MOUSE_BUTTON_WHEEL_DOWN:
                zoom_out()
        
        # Double click
        if event.button_index == MOUSE_BUTTON_LEFT and event.double_click:
            select_word(event.position)
```

### Mouse Motion
```gdscript
func _unhandled_input(event: InputEvent) -> void:
    if event is InputEventMouseMotion:
        # Relative movement (pixels since last event)
        var delta: Vector2 = event.relative
        
        # Current position
        var pos: Vector2 = event.position
        
        # Mouse velocity (pixels/second)
        var vel: Vector2 = event.velocity
        
        # Button mask (which buttons are held during motion)
        if event.button_mask & MOUSE_BUTTON_MASK_LEFT:
            drag(delta)
        
        # Pen pressure (0.0–1.0, for tablets)
        var pressure: float = event.pressure
        
        # Pen tilt
        var tilt: Vector2 = event.tilt
```

### Mouse Modes

```gdscript
# Normal — cursor visible, free to leave window
Input.mouse_mode = Input.MOUSE_MODE_VISIBLE

# Hidden — cursor invisible, still generates position events
Input.mouse_mode = Input.MOUSE_MODE_HIDDEN

# Captured — hidden + locked to window center, only relative motion reported
# Use for FPS camera, flight controls
Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

# Confined — visible but cannot leave the window
Input.mouse_mode = Input.MOUSE_MODE_CONFINED

# Confined + Hidden — locked to window, invisible
Input.mouse_mode = Input.MOUSE_MODE_CONFINED_HIDDEN
```

#### FPS Camera Pattern
```gdscript
var mouse_sensitivity: float = 0.002

func _ready() -> void:
    Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

func _unhandled_input(event: InputEvent) -> void:
    if event is InputEventMouseMotion:
        # Rotate camera based on relative motion
        rotate_y(-event.relative.x * mouse_sensitivity)
        $CameraPivot.rotate_x(-event.relative.y * mouse_sensitivity)
        $CameraPivot.rotation.x = clampf(
            $CameraPivot.rotation.x, -PI / 2.0, PI / 2.0
        )
    
    # Release on Escape
    if event.is_action_pressed(&"ui_cancel"):
        Input.mouse_mode = Input.MOUSE_MODE_VISIBLE

# Recapture on click
func _input(event: InputEvent) -> void:
    if event is InputEventMouseButton:
        if event.pressed and Input.mouse_mode == Input.MOUSE_MODE_VISIBLE:
            Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
```

### Custom Cursors
```gdscript
# From texture
var cursor_tex: Texture2D = preload("res://ui/cursor_crosshair.png")
Input.set_custom_mouse_cursor(cursor_tex, Input.CURSOR_ARROW, Vector2(16, 16))
# Third param is hotspot (click point offset)

# Reset to default
Input.set_custom_mouse_cursor(null)

# Per-cursor-shape overrides
Input.set_custom_mouse_cursor(pointer_tex, Input.CURSOR_POINTING_HAND)
Input.set_custom_mouse_cursor(resize_tex, Input.CURSOR_HSIZE)
```

Cursor shapes: `CURSOR_ARROW`, `CURSOR_IBEAM`, `CURSOR_POINTING_HAND`, `CURSOR_CROSS`, `CURSOR_WAIT`, `CURSOR_BUSY`, `CURSOR_DRAG`, `CURSOR_CAN_DROP`, `CURSOR_FORBIDDEN`, `CURSOR_VSIZE`, `CURSOR_HSIZE`, `CURSOR_BDIAGSIZE`, `CURSOR_FDIAGSIZE`, `CURSOR_MOVE`, `CURSOR_VSPLIT`, `CURSOR_HSPLIT`, `CURSOR_HELP`

### Mouse Warp
```gdscript
# Teleport cursor (desktop only)
Input.warp_mouse(Vector2(400, 300))
Input.warp_mouse(get_viewport_rect().size / 2.0)  # Center of window
```

### Raycasting from Mouse (2D)
```gdscript
# Get world position under mouse
func get_mouse_world_pos() -> Vector2:
    return get_global_mouse_position()

# Physics query under mouse (2D)
func get_body_at_mouse() -> PhysicsBody2D:
    var space := get_world_2d().direct_space_state
    var params := PhysicsPointQueryParameters2D.new()
    params.position = get_global_mouse_position()
    params.collision_mask = 1  # Layer 1
    var results := space.intersect_point(params)
    if results.size() > 0:
        return results[0].collider as PhysicsBody2D
    return null
```

### Raycasting from Mouse (3D)
```gdscript
func get_mouse_ray_hit() -> Dictionary:
    var camera := get_viewport().get_camera_3d()
    var mouse_pos := get_viewport().get_mouse_position()
    var from := camera.project_ray_origin(mouse_pos)
    var to := from + camera.project_ray_normal(mouse_pos) * 1000.0
    
    var space := get_world_3d().direct_space_state
    var query := PhysicsRayQueryParameters3D.create(from, to)
    query.collision_mask = 1
    return space.intersect_ray(query)
    # Returns dict with: position, normal, collider, collider_id, rid, shape, face_index
    # Returns empty dict if no hit
```

## Touch Input

### Touch Events

```gdscript
func _unhandled_input(event: InputEvent) -> void:
    # Touch press/release
    if event is InputEventScreenTouch:
        var finger_id: int = event.index     # 0, 1, 2... per finger
        var pos: Vector2 = event.position
        
        if event.pressed:
            on_touch_start(finger_id, pos)
        else:
            on_touch_end(finger_id, pos)
        
        # Double tap
        if event.double_tap:
            on_double_tap(pos)
    
    # Touch drag
    if event is InputEventScreenDrag:
        var finger_id: int = event.index
        var pos: Vector2 = event.position
        var delta: Vector2 = event.relative   # Movement since last drag event
        var vel: Vector2 = event.velocity     # Drag velocity
        
        on_touch_drag(finger_id, pos, delta)
```

### Multi-Touch Gestures

Godot doesn't have built-in gesture recognition. Implement manually:

#### Pinch Zoom
```gdscript
var _touches: Dictionary = {}  # finger_id → position

func _unhandled_input(event: InputEvent) -> void:
    if event is InputEventScreenTouch:
        if event.pressed:
            _touches[event.index] = event.position
        else:
            _touches.erase(event.index)
    
    if event is InputEventScreenDrag:
        _touches[event.index] = event.position
        
        if _touches.size() == 2:
            var keys := _touches.keys()
            var p1: Vector2 = _touches[keys[0]]
            var p2: Vector2 = _touches[keys[1]]
            var current_dist: float = p1.distance_to(p2)
            
            if _prev_pinch_distance > 0.0:
                var zoom_factor: float = current_dist / _prev_pinch_distance
                apply_zoom(zoom_factor)
            
            _prev_pinch_distance = current_dist

var _prev_pinch_distance: float = 0.0

func _on_all_touches_released() -> void:
    _prev_pinch_distance = 0.0
```

#### Two-Finger Pan
```gdscript
func _unhandled_input(event: InputEvent) -> void:
    if event is InputEventScreenDrag and _touches.size() == 2:
        # Average movement of both fingers
        pan_camera(event.relative)
```

### Emulation Settings

Project → Project Settings → Input Devices → Pointing:

| Setting | Effect |
|---|---|
| **Emulate Mouse From Touch** (default: ON) | Touch events generate mouse events. Touch → `InputEventMouseButton`/`InputEventMouseMotion` |
| **Emulate Touch From Mouse** (default: OFF) | Mouse clicks generate touch events. LMB → `InputEventScreenTouch`/`InputEventScreenDrag` |

For **mobile-first games**: Keep "Emulate Mouse From Touch" ON so you only need mouse code. Touch automatically maps to left-click.

For **multi-touch games**: Turn OFF "Emulate Mouse From Touch" to prevent duplicate events. Handle `InputEventScreenTouch`/`InputEventScreenDrag` directly.

For **desktop games testing touch on desktop**: Turn ON "Emulate Touch From Mouse" during development.

### Virtual Controls (Mobile)

Use `TouchScreenButton` node for on-screen buttons:
```
TouchScreenButton
├── normal: Texture2D (unpressed)
├── pressed: Texture2D (pressed)
├── action: "jump"           # Input action to trigger
├── shape: Shape2D           # Touch area
└── passby_press: true       # Allow press by dragging over
```

For virtual joystick, use a custom implementation or an addon. Basic approach:
```gdscript
# virtual_joystick.gd — attach to a Control node
var _touch_index: int = -1
var _center: Vector2
var output: Vector2 = Vector2.ZERO  # Normalized direction

func _gui_input(event: InputEvent) -> void:
    if event is InputEventScreenTouch:
        if event.pressed and _touch_index == -1:
            _touch_index = event.index
            _center = size / 2.0
        elif not event.pressed and event.index == _touch_index:
            _touch_index = -1
            output = Vector2.ZERO
    
    if event is InputEventScreenDrag and event.index == _touch_index:
        var offset: Vector2 = event.position - _center
        output = offset.limit_length(1.0)
```

## Click-Through and Mouse Filter (UI)

Control nodes consume mouse events by default. Configure `mouse_filter`:

```gdscript
# Receives mouse events and stops propagation (default for most controls)
mouse_filter = Control.MOUSE_FILTER_STOP

# Receives mouse events but lets them pass through
mouse_filter = Control.MOUSE_FILTER_PASS

# Invisible to mouse — events go to nodes behind
mouse_filter = Control.MOUSE_FILTER_IGNORE
```

Common use: Set `MOUSE_FILTER_IGNORE` on overlay panels, decorative labels, and HUD backgrounds that shouldn't block gameplay clicks.

### _gui_input vs _input

```gdscript
# _gui_input — only fires for the specific Control node
# Respects focus and mouse_filter
# Use for: buttons, sliders, custom UI widgets
func _gui_input(event: InputEvent) -> void:
    if event is InputEventMouseButton and event.pressed:
        accept_event()  # Consume event in UI context
```

## Coordinate Spaces

```gdscript
# Screen/viewport coordinates (pixels from top-left)
event.position                           # Where the event occurred
get_viewport().get_mouse_position()      # Current mouse position

# Canvas coordinates (affected by CanvasTransform — camera, zoom)
get_global_mouse_position()              # Mouse in world space
get_canvas_transform()                   # Viewport → canvas transform
get_global_transform()                   # Node → canvas transform

# Convert screen → world (2D)
var world_pos: Vector2 = get_canvas_transform().affine_inverse() * screen_pos

# Convert world → screen (2D)
var screen_pos: Vector2 = get_canvas_transform() * world_pos
```

## C# Equivalents

```csharp
// Mouse position
GetViewport().GetMousePosition();
GetGlobalMousePosition();

// Mouse mode
Input.MouseMode = Input.MouseModeEnum.Captured;

// Event handling
public override void _UnhandledInput(InputEvent @event)
{
    if (@event is InputEventMouseButton mb)
    {
        if (mb.ButtonIndex == MouseButton.Left && mb.Pressed)
            StartAction(mb.Position);
    }
    
    if (@event is InputEventMouseMotion mm)
    {
        RotateCamera(mm.Relative);
    }
    
    if (@event is InputEventScreenTouch touch)
    {
        if (touch.Pressed)
            OnTouchStart(touch.Index, touch.Position);
    }
}

// Custom cursor
Input.SetCustomMouseCursor(cursorTex, Input.CursorShape.Arrow, new Vector2(16, 16));

// Raycast from mouse (3D)
var camera = GetViewport().GetCamera3D();
var from = camera.ProjectRayOrigin(mousePos);
var to = from + camera.ProjectRayNormal(mousePos) * 1000f;
```
