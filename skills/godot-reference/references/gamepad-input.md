# Gamepad & Controller Input Reference

## Overview

Godot supports hundreds of controllers via the SDL game controller database. As of Godot 4.5+, desktop platforms use SDL 3 for controller support. Android, iOS, and Web use Godot's own controller code.

Supported: Xbox, PlayStation, Switch Pro, Steam Controller, and many third-party gamepads.

## Connection Detection

```gdscript
func _ready() -> void:
    Input.joy_connection_changed.connect(_on_joy_connection_changed)
    
    # Check already-connected controllers
    for id in Input.get_connected_joypads():
        print("Controller %d: %s" % [id, Input.get_joy_name(id)])

func _on_joy_connection_changed(device_id: int, connected: bool) -> void:
    if connected:
        print("Controller %d connected: %s" % [device_id, Input.get_joy_name(device_id)])
    else:
        print("Controller %d disconnected" % device_id)
```

### Device IDs

- Device `0` is the first connected controller
- Keyboard/mouse are not assigned a device ID in the joypad system
- Each physical controller gets a unique ID (may change between sessions)

```gdscript
# Check which device triggered an input event
func _input(event: InputEvent) -> void:
    if event is InputEventJoypadButton:
        print("Device: ", event.device)
```

## Buttons

### Button Constants
```gdscript
JOY_BUTTON_A              # Cross (PS), A (Xbox), B (Switch)
JOY_BUTTON_B              # Circle (PS), B (Xbox), A (Switch)
JOY_BUTTON_X              # Square (PS), X (Xbox), Y (Switch)
JOY_BUTTON_Y              # Triangle (PS), Y (Xbox), X (Switch)
JOY_BUTTON_LEFT_SHOULDER  # L1 / LB
JOY_BUTTON_RIGHT_SHOULDER # R1 / RB
JOY_BUTTON_LEFT_STICK     # L3 (click left stick)
JOY_BUTTON_RIGHT_STICK    # R3 (click right stick)
JOY_BUTTON_BACK           # Select / Share / -
JOY_BUTTON_START           # Start / Options / +
JOY_BUTTON_GUIDE          # PS / Xbox / Home
JOY_BUTTON_DPAD_UP
JOY_BUTTON_DPAD_DOWN
JOY_BUTTON_DPAD_LEFT
JOY_BUTTON_DPAD_RIGHT
JOY_BUTTON_MISC1          # Touchpad click (PS), Share (Xbox Series)
JOY_BUTTON_PADDLE1..4     # Back paddles (Elite controllers)
```

### Querying Buttons
```gdscript
# Via actions (PREFERRED — device-agnostic)
if Input.is_action_pressed(&"jump"):  # Mapped to JOY_BUTTON_A in InputMap
    jump()

# Direct button check (specific device)
if Input.is_joy_button_pressed(0, JOY_BUTTON_A):
    pass

# Via event
func _input(event: InputEvent) -> void:
    if event is InputEventJoypadButton:
        if event.button_index == JOY_BUTTON_A and event.pressed:
            jump()
```

## Axes (Analog Sticks and Triggers)

### Axis Constants
```gdscript
JOY_AXIS_LEFT_X           # Left stick horizontal (-1 left, +1 right)
JOY_AXIS_LEFT_Y           # Left stick vertical (-1 up, +1 down)
JOY_AXIS_RIGHT_X          # Right stick horizontal
JOY_AXIS_RIGHT_Y          # Right stick vertical
JOY_AXIS_TRIGGER_LEFT     # L2 / LT (0 to 1)
JOY_AXIS_TRIGGER_RIGHT    # R2 / RT (0 to 1)
```

### Querying Axes
```gdscript
# Via actions (PREFERRED)
var move_dir: Vector2 = Input.get_vector(
    &"move_left", &"move_right", &"move_up", &"move_down"
)

var look_dir: Vector2 = Input.get_vector(
    &"look_left", &"look_right", &"look_up", &"look_down"
)

var trigger_strength: float = Input.get_action_strength(&"accelerate")

# Direct axis read (specific device)
var left_x: float = Input.get_joy_axis(0, JOY_AXIS_LEFT_X)
var left_y: float = Input.get_joy_axis(0, JOY_AXIS_LEFT_Y)
var left_trigger: float = Input.get_joy_axis(0, JOY_AXIS_TRIGGER_LEFT)

# Via event
func _input(event: InputEvent) -> void:
    if event is InputEventJoypadMotion:
        if event.axis == JOY_AXIS_RIGHT_X:
            var value: float = event.axis_value  # -1.0 to 1.0
```

## Deadzone

Analog sticks never truly rest at 0.0 — they drift slightly. Deadzones filter out this noise.

### Action Deadzone
Set per-action in Project Settings → Input Map (default: 0.5). This controls:
- The threshold for `is_action_pressed()` to return `true`
- The zero-point offset for `get_action_strength()`

### get_vector Deadzone
`Input.get_vector()` applies a **circular** deadzone — correct for 2D movement. The default uses the average deadzone of the four actions. Override with the 5th parameter:
```gdscript
var direction: Vector2 = Input.get_vector(
    &"move_left", &"move_right", &"move_up", &"move_down",
    0.15  # Custom deadzone
)
```

### Manual Deadzone
For direct axis reads without actions:
```gdscript
func apply_deadzone(value: float, deadzone: float = 0.15) -> float:
    if absf(value) < deadzone:
        return 0.0
    return signf(value) * remap(absf(value), deadzone, 1.0, 0.0, 1.0)

# Circular deadzone for 2D (prevents square deadzone artifact)
func apply_circular_deadzone(input: Vector2, deadzone: float = 0.15) -> Vector2:
    var length: float = input.length()
    if length < deadzone:
        return Vector2.ZERO
    return input.normalized() * remap(length, deadzone, 1.0, 0.0, 1.0)
```

**Pitfall**: The default action deadzone of 0.5 is the trigger threshold, not the axis deadzone. For smooth analog movement, configure actions with a lower deadzone (0.1–0.2) or use `get_vector()` with an explicit value.

## Vibration (Haptic Feedback)

```gdscript
# Start vibration
# device_id, weak_magnitude (0-1), strong_magnitude (0-1), duration_seconds
Input.start_joy_vibration(0, 0.5, 0.8, 0.3)

# Parameters:
# weak_magnitude  — high-frequency motor (subtle rumble)
# strong_magnitude — low-frequency motor (heavy rumble)
# duration — 0 = infinite until stopped

# Stop vibration
Input.stop_joy_vibration(0)

# Get current vibration
var strength: Vector2 = Input.get_joy_vibration_strength(0)
# x = weak, y = strong

# Get remaining vibration duration
var remaining: float = Input.get_joy_vibration_duration(0)
```

### Vibration Patterns
```gdscript
# Light tap
func vibrate_light() -> void:
    Input.start_joy_vibration(0, 0.3, 0.0, 0.1)

# Heavy impact
func vibrate_heavy() -> void:
    Input.start_joy_vibration(0, 0.5, 1.0, 0.2)

# Damage received (pulse)
func vibrate_damage() -> void:
    Input.start_joy_vibration(0, 0.7, 0.9, 0.15)
    await get_tree().create_timer(0.15).timeout
    Input.start_joy_vibration(0, 0.2, 0.3, 0.1)

# Engine/motor (continuous, varies with speed)
func vibrate_engine(rpm_normalized: float) -> void:
    Input.start_joy_vibration(0, rpm_normalized * 0.3, rpm_normalized * 0.1, 0.0)
```

Always provide a setting to disable or reduce vibration intensity.

## Multi-Controller (Local Multiplayer)

Actions in the Input Map are device-agnostic by default. For local multiplayer, query per-device:

```gdscript
# Method 1: Direct device query
func get_player_input(device_id: int) -> Vector2:
    var x: float = Input.get_joy_axis(device_id, JOY_AXIS_LEFT_X)
    var y: float = Input.get_joy_axis(device_id, JOY_AXIS_LEFT_Y)
    return apply_circular_deadzone(Vector2(x, y))

# Method 2: Create device-specific actions at runtime
func setup_player_actions(player_id: int, device_id: int) -> void:
    var actions := {
        "p%d_move_left" % player_id: [JOY_AXIS_LEFT_X, -1],
        "p%d_move_right" % player_id: [JOY_AXIS_LEFT_X, 1],
        "p%d_jump" % player_id: [JOY_BUTTON_A],
    }
    for action_name in actions:
        InputMap.add_action(action_name)
        # ... add events with specific device

# Method 3: Check event.device in _input
func _input(event: InputEvent) -> void:
    if event.device == 0:
        handle_player_1(event)
    elif event.device == 1:
        handle_player_2(event)
```

## Controller Mapping

If a controller is misidentified or has wrong button mapping:

```gdscript
# Add custom SDL mapping string
Input.add_joy_mapping(
    "03000000346900000500000000000000,Gamepad,a:b2,b:b1,...",
    true  # update_existing
)

# Get GUID for debugging
var guid: String = Input.get_joy_guid(0)
print("Controller GUID: ", guid)
```

Use the Godot joypad mapping tool or SDL2 Gamepad Tool to generate mapping strings. Contribute correct mappings upstream to the Godot controller database.

## Input Icons / Prompts

Detect the last used input device to show correct prompts (keyboard vs controller):

```gdscript
enum InputDevice { KEYBOARD, GAMEPAD }
var last_device: InputDevice = InputDevice.KEYBOARD

func _input(event: InputEvent) -> void:
    if event is InputEventKey or event is InputEventMouseButton or event is InputEventMouseMotion:
        if last_device != InputDevice.KEYBOARD:
            last_device = InputDevice.KEYBOARD
            input_device_changed.emit(last_device)
    
    elif event is InputEventJoypadButton or event is InputEventJoypadMotion:
        if event is InputEventJoypadMotion and absf(event.axis_value) < 0.5:
            return  # Ignore stick noise
        if last_device != InputDevice.GAMEPAD:
            last_device = InputDevice.GAMEPAD
            input_device_changed.emit(last_device)

signal input_device_changed(device: InputDevice)
```

Then swap UI prompt textures based on `last_device`.

## Common Patterns

### Dual-Stick Shooter
```gdscript
func _physics_process(delta: float) -> void:
    # Left stick — movement
    var move_dir: Vector2 = Input.get_vector(
        &"move_left", &"move_right", &"move_up", &"move_down"
    )
    velocity = move_dir * speed
    move_and_slide()
    
    # Right stick — aim
    var aim_dir: Vector2 = Input.get_vector(
        &"aim_left", &"aim_right", &"aim_up", &"aim_down"
    )
    if aim_dir.length() > 0.1:
        rotation = aim_dir.angle()
    
    # Triggers — shoot
    if Input.get_action_strength(&"shoot") > 0.5:
        fire()
```

### Combined KB+Mouse and Gamepad
```gdscript
func _physics_process(delta: float) -> void:
    # Movement works for both (WASD maps to same actions as left stick)
    var move_dir: Vector2 = Input.get_vector(
        &"move_left", &"move_right", &"move_up", &"move_down"
    )
    velocity = move_dir * speed
    move_and_slide()

func _unhandled_input(event: InputEvent) -> void:
    # Camera look — must be separate paths
    if event is InputEventMouseMotion:
        if Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
            rotate_camera(event.relative * mouse_sensitivity)
    
    elif event is InputEventJoypadMotion:
        # Right stick handled in _process for smooth continuous rotation
        pass

func _process(delta: float) -> void:
    # Right stick camera (polled for smooth rotation)
    var look: Vector2 = Input.get_vector(
        &"look_left", &"look_right", &"look_up", &"look_down"
    )
    if look.length() > 0.0:
        rotate_camera(look * gamepad_sensitivity * delta)
```

## C# Equivalents

```csharp
// Connection
Input.JoyConnectionChanged += OnJoyConnectionChanged;
Input.GetConnectedJoypads();
Input.GetJoyName(0);

// Axes
Input.GetJoyAxis(0, JoyAxis.LeftX);
Input.GetVector("move_left", "move_right", "move_up", "move_down");

// Buttons
Input.IsJoyButtonPressed(0, JoyButton.A);

// Vibration
Input.StartJoyVibration(0, 0.5f, 0.8f, 0.3f);
Input.StopJoyVibration(0);

// Events
public override void _Input(InputEvent @event)
{
    if (@event is InputEventJoypadButton jb)
    {
        GD.Print($"Button {jb.ButtonIndex} on device {jb.Device}");
    }
    if (@event is InputEventJoypadMotion jm)
    {
        GD.Print($"Axis {jm.Axis}: {jm.AxisValue}");
    }
}
```
