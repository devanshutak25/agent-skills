# Input Actions & InputMap Reference

## Input Actions

Input actions abstract physical inputs (keys, buttons, axes) behind named actions. Define once in Project Settings, use everywhere in code without hardcoding keys.

### Defining Actions in Project Settings

Project → Project Settings → Input Map tab:
1. Type action name in the top field (e.g. `move_left`, `jump`, `attack`)
2. Click "Add"
3. Click "+" to assign physical inputs (key, mouse button, joypad button/axis)
4. Set deadzone per action (default 0.5 — the threshold for analog-to-digital)

Built-in actions prefixed with `ui_` (e.g. `ui_accept`, `ui_cancel`, `ui_left`) are used by Control nodes. Don't remove them.

### Querying Actions

#### Polling (in _process / _physics_process)
```gdscript
# Digital (pressed/released)
if Input.is_action_pressed(&"move_left"):      # Held down
    pass
if Input.is_action_just_pressed(&"jump"):      # This frame only
    pass
if Input.is_action_just_released(&"attack"):   # Released this frame
    pass

# Analog (0.0 to 1.0)
var strength: float = Input.get_action_strength(&"accelerate")

# Raw strength (ignores deadzone)
var raw: float = Input.get_action_raw_strength(&"accelerate")
```

#### Axis and Vector Helpers
```gdscript
# Single axis (-1.0 to 1.0) — combines two actions
var horizontal: float = Input.get_axis(&"move_left", &"move_right")

# 2D vector — combines four actions with proper circular deadzone
var direction: Vector2 = Input.get_vector(
    &"move_left", &"move_right",
    &"move_up", &"move_down"
)
# Returns normalized Vector2 between (-1,-1) and (1,1)

# Optional: custom deadzone (5th parameter)
var direction: Vector2 = Input.get_vector(
    &"move_left", &"move_right",
    &"move_up", &"move_down",
    0.15  # deadzone override
)
```

**`get_vector()` vs manual subtraction**: `get_vector()` applies a circular deadzone. Manual `get_action_strength()` subtraction produces a square deadzone — diagonal movement has more range than cardinal. Always prefer `get_vector()` for 2D movement.

#### Event-Based (in _input / _unhandled_input)
```gdscript
func _unhandled_input(event: InputEvent) -> void:
    if event.is_action_pressed(&"jump"):
        jump()
        get_viewport().set_input_as_handled()
    
    if event.is_action_released(&"crouch"):
        stand_up()
    
    # Analog strength from event
    if event.is_action(&"accelerate"):
        var strength: float = event.get_action_strength()
```

### Polling vs Event-Based

| Polling (`Input.is_action_*`) | Event-Based (`_input` / `_unhandled_input`) |
|---|---|
| Check state every frame | Fires only when input changes |
| Use in `_process` / `_physics_process` | Use in `_input` / `_unhandled_input` |
| Simple, stateless | Can consume events (`set_input_as_handled`) |
| Good for continuous input (movement) | Good for discrete input (jump, shoot, pause) |
| Can't distinguish which device triggered it | `event.device` identifies source device |

### Input Processing Order

1. `_input()` — all nodes (bottom-up tree order)
2. `_gui_input()` — Control nodes (focus/draw order)
3. `_shortcut_input()` — keyboard shortcuts
4. `_unhandled_key_input()` — unhandled keyboard only
5. `_unhandled_input()` — everything not consumed above

Call `get_viewport().set_input_as_handled()` to stop propagation at any step.

**Best practices**:
- Gameplay input → `_unhandled_input()` (UI gets priority)
- Global shortcuts (pause, quit) → `_input()` or `_shortcut_input()`
- UI interaction → `_gui_input()` on Control nodes

### Defining Actions in Code (Runtime Remapping)

```gdscript
func _ready() -> void:
    # Add new action
    if not InputMap.has_action(&"attack"):
        InputMap.add_action(&"attack")
        
        # Assign keyboard key
        var key_event := InputEventKey.new()
        key_event.keycode = KEY_SPACE
        InputMap.action_add_event(&"attack", key_event)
        
        # Assign mouse button
        var mouse_event := InputEventMouseButton.new()
        mouse_event.button_index = MOUSE_BUTTON_LEFT
        InputMap.action_add_event(&"attack", mouse_event)
        
        # Assign joypad button
        var joy_event := InputEventJoypadButton.new()
        joy_event.button_index = JOY_BUTTON_A
        InputMap.action_add_event(&"attack", joy_event)

# Remap an action
func remap_action(action: StringName, new_event: InputEvent) -> void:
    InputMap.action_erase_events(action)
    InputMap.action_add_event(action, new_event)

# Set deadzone
InputMap.action_set_deadzone(&"move_left", 0.2)
```

### Key Rebinding UI Pattern

```gdscript
var _action_to_remap: StringName = &""
var _is_remapping: bool = false

func start_remap(action: StringName) -> void:
    _action_to_remap = action
    _is_remapping = true

func _input(event: InputEvent) -> void:
    if not _is_remapping:
        return
    
    # Filter out mouse motion and other noise
    if event is InputEventMouseMotion:
        return
    if not event.is_pressed():
        return
    
    # Remap
    InputMap.action_erase_events(_action_to_remap)
    InputMap.action_add_event(_action_to_remap, event)
    
    _is_remapping = false
    get_viewport().set_input_as_handled()
```

## InputEvent Types

All input events inherit from `InputEvent`. Key types:

| Type | Triggered By | Key Properties |
|---|---|---|
| `InputEventKey` | Keyboard | `keycode`, `physical_keycode`, `unicode`, `pressed`, `echo` |
| `InputEventMouseButton` | Mouse click | `button_index`, `pressed`, `double_click`, `position` |
| `InputEventMouseMotion` | Mouse move | `relative`, `velocity`, `position`, `pressure` |
| `InputEventJoypadButton` | Gamepad button | `button_index`, `pressed`, `pressure` |
| `InputEventJoypadMotion` | Gamepad axis | `axis`, `axis_value` |
| `InputEventScreenTouch` | Touch press | `index` (finger), `position`, `pressed` |
| `InputEventScreenDrag` | Touch drag | `index`, `relative`, `velocity`, `position` |
| `InputEventAction` | Synthetic | `action`, `pressed`, `strength` |
| `InputEventMIDI` | MIDI device | `channel`, `message`, `pitch`, `velocity` |

### Common Event Checks
```gdscript
func _unhandled_input(event: InputEvent) -> void:
    # Type checks
    if event is InputEventKey:
        if event.keycode == KEY_ESCAPE and event.pressed and not event.echo:
            toggle_pause()
    
    if event is InputEventMouseButton:
        if event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
            shoot_at(event.position)
        if event.button_index == MOUSE_BUTTON_WHEEL_UP:
            zoom_in()
    
    if event is InputEventMouseMotion:
        if Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
            rotate_camera(event.relative)
    
    if event is InputEventScreenTouch:
        if event.pressed:
            handle_touch(event.index, event.position)
```

### Physical vs Logical Keycodes
```gdscript
if event is InputEventKey:
    # keycode — layout-dependent (QWERTY: KEY_W is "W" key)
    event.keycode
    
    # physical_keycode — layout-independent (physical position on keyboard)
    # Use for movement keys so AZERTY players get correct layout
    event.physical_keycode
    
    # unicode — the actual character typed (affected by Shift, etc.)
    event.unicode
```

For movement (WASD), use `physical_keycode` or actions with physical key assignments. For text input, use `unicode`.

### Echo Events
Held keys produce repeated `echo` events. Filter them out for single-press actions:
```gdscript
if event is InputEventKey and event.pressed and not event.echo:
    # True first press only
    pass
```

Actions already handle this: `is_action_just_pressed()` ignores echo.

## Input Singleton

The `Input` singleton provides global input state:

```gdscript
# Mouse
Input.get_mouse_button_mask()     # Bitmask of pressed mouse buttons
Input.get_last_mouse_velocity()   # Velocity of last mouse movement

# Mouse mode
Input.mouse_mode = Input.MOUSE_MODE_VISIBLE   # Normal
Input.mouse_mode = Input.MOUSE_MODE_HIDDEN    # Hidden but not captured
Input.mouse_mode = Input.MOUSE_MODE_CAPTURED  # Hidden + locked to window
Input.mouse_mode = Input.MOUSE_MODE_CONFINED  # Visible but locked to window
Input.mouse_mode = Input.MOUSE_MODE_CONFINED_HIDDEN  # Hidden + confined

# Warp mouse (desktop only)
Input.warp_mouse(Vector2(400, 300))

# Custom cursor
Input.set_custom_mouse_cursor(texture, Input.CURSOR_ARROW, Vector2(16, 16))

# Joypad
Input.get_connected_joypads()          # Array of connected device IDs
Input.get_joy_name(device_id)          # Controller name string
Input.is_joy_known(device_id)          # Is it in the controller DB?
Input.get_joy_vibration_strength(device_id)

# Vibration
Input.start_joy_vibration(device_id, weak_magnitude, strong_magnitude, duration)
Input.stop_joy_vibration(device_id)

# Touch
Input.is_emulating_touch_from_mouse()

# Synthetic input
Input.parse_input_event(event)         # Inject a fake input event
Input.action_press(&"jump")            # Simulate action press
Input.action_release(&"jump")          # Simulate action release

# Accumulated input (merges rapid events per frame — default on)
Input.use_accumulated_input = false    # Disable for precise drawing tools
```

## C# Equivalents

```csharp
// Actions
Input.IsActionPressed("jump");
Input.IsActionJustPressed("jump");
Input.IsActionJustReleased("jump");
Input.GetActionStrength("accelerate");
Input.GetAxis("move_left", "move_right");
Input.GetVector("move_left", "move_right", "move_up", "move_down");

// Event handling
public override void _UnhandledInput(InputEvent @event)
{
    if (@event.IsActionPressed("jump"))
    {
        Jump();
        GetViewport().SetInputAsHandled();
    }
    
    if (@event is InputEventMouseMotion motion)
    {
        RotateCamera(motion.Relative);
    }
}

// Mouse mode
Input.MouseMode = Input.MouseModeEnum.Captured;

// Vibration
Input.StartJoyVibration(0, 0.5f, 0.8f, 0.3f);
```
