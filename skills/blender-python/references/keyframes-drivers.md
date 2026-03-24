# Keyframes & Drivers

Keyframe insertion/manipulation and driver expressions. For the slotted Action system see [animation-actions](animation-actions.md). For NLA see [nla](nla.md). For handlers and timers see [handlers-timers](handlers-timers.md).

## Keyframe Insertion

### Via Data-Block Method

The simplest approach — `keyframe_insert` on any animatable data-block:

```python
import bpy

obj = bpy.context.object
scene = bpy.context.scene

# Keyframe location at current frame
obj.keyframe_insert(data_path="location", frame=scene.frame_current)

# Keyframe a specific component (index: 0=X, 1=Y, 2=Z)
obj.keyframe_insert(data_path="location", index=2, frame=10)

# Keyframe rotation
obj.keyframe_insert(data_path="rotation_euler", frame=1)

# Keyframe scale
obj.keyframe_insert(data_path="scale", frame=1)

# Keyframe a custom property
obj["my_prop"] = 5.0
obj.keyframe_insert(data_path='["my_prop"]', frame=1)

# Keyframe a material property
mat = obj.data.materials[0]
mat.node_tree.nodes["Principled BSDF"].inputs["Roughness"].keyframe_insert(
    data_path="default_value", frame=1
)

# Keyframe a bone's transform
obj.pose.bones["Bone"].keyframe_insert(data_path="location", frame=1)
# Or from the armature object:
obj.keyframe_insert(data_path='pose.bones["Bone"].location', frame=1)
```

**`keyframe_insert` parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `data_path` | str | required | RNA property path |
| `index` | int | `-1` | Array index (-1 = all components) |
| `frame` | float | current | Frame number |
| `group` | str | `""` | F-Curve group name |
| `options` | set | `set()` | Options: `{'INSERTKEY_NEEDED'}`, `{'INSERTKEY_VISUAL'}`, `{'INSERTKEY_AVAILABLE'}` |

### Keyframe Deletion

```python
import bpy

obj = bpy.context.object

# Delete keyframe at current frame
obj.keyframe_delete(data_path="location", frame=bpy.context.scene.frame_current)

# Delete specific component keyframe
obj.keyframe_delete(data_path="location", index=0, frame=10)
```

## F-Curve Direct Manipulation

For fine control, work with F-Curves directly:

```python
import bpy

obj = bpy.context.object
action = obj.animation_data.action

# Get F-Curve via action (see animation-actions.md for channelbag access)
fc = action.fcurve_ensure_for_datablock(obj, "location", index=0)

# Insert keyframes on the F-Curve
kp = fc.keyframe_points.insert(frame=1, value=0.0)
kp2 = fc.keyframe_points.insert(frame=30, value=5.0)
kp3 = fc.keyframe_points.insert(frame=60, value=0.0)

# Bulk add keyframes (faster for many keys)
fc.keyframe_points.add(count=100)
for i, kp in enumerate(fc.keyframe_points):
    kp.co = (i + 1, i * 0.1)  # (frame, value)
fc.update()  # recalculate handles after bulk operations
```

### Keyframe Handle Types

Each keyframe has left and right handles controlling interpolation:

| Handle Type | Description |
|---|---|
| `'FREE'` | Handles move independently |
| `'ALIGNED'` | Handles stay aligned (opposite directions) |
| `'VECTOR'` | Points toward adjacent keyframe |
| `'AUTO'` | Automatically smoothed |
| `'AUTO_CLAMPED'` | Auto-smoothed but prevents overshoot |

```python
import bpy

obj = bpy.context.object
action = obj.animation_data.action
fc = action.fcurve_ensure_for_datablock(obj, "location", index=2)

# Insert keyframes
fc.keyframe_points.insert(1, 0.0)
fc.keyframe_points.insert(30, 5.0)
fc.keyframe_points.insert(60, 0.0)

# Set handle types
for kp in fc.keyframe_points:
    kp.handle_left_type = 'AUTO_CLAMPED'
    kp.handle_right_type = 'AUTO_CLAMPED'

# Manual handle positions (only effective for FREE or ALIGNED)
kp = fc.keyframe_points[1]
kp.handle_left_type = 'FREE'
kp.handle_right_type = 'FREE'
kp.handle_left = (25, 4.0)    # (frame, value)
kp.handle_right = (35, 4.0)
```

### Keyframe Interpolation

```python
import bpy

obj = bpy.context.object
fc = obj.animation_data.action.fcurve_ensure_for_datablock(obj, "location", index=0)

fc.keyframe_points.insert(1, 0.0)
fc.keyframe_points.insert(30, 5.0)

# Set interpolation mode per keyframe
for kp in fc.keyframe_points:
    kp.interpolation = 'BEZIER'  # default smooth
    # Other modes: 'CONSTANT' (step), 'LINEAR', 'BEZIER',
    # 'SINE', 'QUAD', 'CUBIC', 'QUART', 'QUINT',
    # 'EXPO', 'CIRC', 'BACK', 'BOUNCE', 'ELASTIC'

    kp.easing = 'AUTO'  # 'AUTO', 'EASE_IN', 'EASE_OUT', 'EASE_IN_OUT'
```

### F-Curve Properties

```python
import bpy

fc = bpy.context.object.animation_data.action.fcurve_ensure_for_datablock(
    bpy.context.object, "location", index=0
)

# Data path info
print(f"Path: {fc.data_path}[{fc.array_index}]")

# Extrapolation (behavior beyond keyframe range)
fc.extrapolation = 'CONSTANT'  # 'CONSTANT' or 'LINEAR'

# Mute the F-Curve
fc.mute = False

# Lock for editing
fc.lock = False

# Color mode
fc.color_mode = 'AUTO_RAINBOW'  # 'AUTO_RAINBOW', 'AUTO_RGB', 'AUTO_YRGB', 'CUSTOM'

# Evaluate at a specific frame
value = fc.evaluate(frame=15)
print(f"Value at frame 15: {value}")
```

## F-Curve Modifiers

F-Curve modifiers alter the curve non-destructively:

```python
import bpy

fc = bpy.context.object.animation_data.action.fcurve_ensure_for_datablock(
    bpy.context.object, "location", index=0
)

# Add a modifier
mod = fc.modifiers.new(type='NOISE')
```

### Modifier Types

| Type | Description | Key Properties |
|---|---|---|
| `'GENERATOR'` | Polynomial function | `mode` ('POLYNOMIAL', 'POLYNOMIAL_FACTORED'), `poly_order`, `coefficients` |
| `'BUILTIN_FUNCTION'` | Built-in math function | `function_type` ('SIN', 'COS', 'TAN', 'SQRT', 'LN', 'SINC'), `amplitude`, `phase_multiplier`, `phase_offset`, `value_offset` |
| `'ENVELOPE'` | Min/max envelope | `reference_value`, `default_min`, `default_max`, `control_points` |
| `'CYCLES'` | Repeat cycles | `mode_before` / `mode_after` ('NONE', 'REPEAT', 'REPEAT_OFFSET', 'MIRROR'), `cycles_before`, `cycles_after` |
| `'NOISE'` | Random noise | `blend_type`, `scale`, `strength`, `phase`, `depth`, `offset` |
| `'LIMITS'` | Clamp values | `use_min_x/y`, `min_x/y`, `use_max_x/y`, `max_x/y` |
| `'STEPPED'` | Staircase | `frame_step`, `frame_offset`, `use_frame_start/end` |

```python
import bpy

fc = bpy.context.object.animation_data.action.fcurve_ensure_for_datablock(
    bpy.context.object, "location", index=0
)

# Cycles modifier — loop animation
cycles = fc.modifiers.new(type='CYCLES')
cycles.mode_before = 'REPEAT_OFFSET'
cycles.mode_after = 'REPEAT_OFFSET'

# Noise modifier — add randomness
noise = fc.modifiers.new(type='NOISE')
noise.scale = 5.0
noise.strength = 0.5
noise.phase = 0.0

# Generator — polynomial curve
gen = fc.modifiers.new(type='GENERATOR')
gen.mode = 'POLYNOMIAL'
gen.poly_order = 2
gen.coefficients = (0, 0, 0.01)  # y = 0.01 * x^2

# Built-in function — sine wave
sine = fc.modifiers.new(type='BUILTIN_FUNCTION')
sine.function_type = 'SIN'
sine.amplitude = 2.0
sine.phase_multiplier = 0.1

# Remove a modifier
fc.modifiers.remove(noise)
```

## Drivers

Drivers link a property's value to an expression or other properties:

### Creating Drivers

```python
import bpy

obj = bpy.context.object

# Add a driver to a property
fc = obj.driver_add("location", 0)  # returns the driver F-Curve
driver = fc.driver

# Driver type
driver.type = 'SCRIPTED'  # evaluate a Python expression

# Simple expression
driver.expression = "frame * 0.1"
```

### Driver Types

| Type | Description |
|---|---|
| `'AVERAGE'` | Average of all variable values |
| `'SUM'` | Sum of all variable values |
| `'SCRIPTED'` | Custom Python expression |
| `'MIN'` | Minimum variable value |
| `'MAX'` | Maximum variable value |

### Driver Variables

Variables provide inputs to the driver expression:

```python
import bpy

obj = bpy.context.object
target = bpy.data.objects["Empty"]

# Create driver on Z location
fc = obj.driver_add("location", 2)
driver = fc.driver
driver.type = 'SCRIPTED'

# Add a variable
var = driver.variables.new()
var.name = "dist"
var.type = 'TRANSFORMS'

# Configure the target
var.targets[0].id = target
var.targets[0].transform_type = 'LOC_X'
var.targets[0].transform_space = 'WORLD_SPACE'

# Use the variable in the expression
driver.expression = "dist * 2.0"
```

### Variable Types

| Type | Description | Target Properties |
|---|---|---|
| `'SINGLE_PROP'` | Read a single RNA property | `id`, `data_path` |
| `'TRANSFORMS'` | Read an object/bone transform | `id`, `bone_target`, `transform_type`, `transform_space` |
| `'ROTATION_DIFF'` | Rotation difference between two objects/bones | Two targets: `id`, `bone_target` |
| `'LOC_DIFF'` | Distance between two objects/bones | Two targets: `id`, `bone_target`, `transform_space` |
| `'CONTEXT_PROP'` | Read from evaluation context | `context_property` |

```python
import bpy

obj = bpy.context.object

# SINGLE_PROP — read any RNA property
fc = obj.driver_add("location", 0)
driver = fc.driver
driver.type = 'SCRIPTED'

var = driver.variables.new()
var.name = "ctrl"
var.type = 'SINGLE_PROP'
var.targets[0].id_type = 'OBJECT'
var.targets[0].id = bpy.data.objects["Controller"]
var.targets[0].data_path = "location.x"

driver.expression = "ctrl * 3.0"
```

```python
import bpy

obj = bpy.context.object

# TRANSFORMS — read object or bone transform channel
fc = obj.driver_add("scale", 0)
driver = fc.driver
driver.type = 'SCRIPTED'

var = driver.variables.new()
var.name = "rot"
var.type = 'TRANSFORMS'
var.targets[0].id = bpy.data.objects["Controller"]
var.targets[0].transform_type = 'ROT_Z'
# Transform types: LOC_X, LOC_Y, LOC_Z, ROT_X, ROT_Y, ROT_Z,
#                  ROT_W, SCALE_X, SCALE_Y, SCALE_Z
var.targets[0].transform_space = 'LOCAL_SPACE'
# Spaces: WORLD_SPACE, TRANSFORM_SPACE, LOCAL_SPACE

driver.expression = "1.0 + rot"
```

```python
import bpy

obj = bpy.context.object

# LOC_DIFF — distance between two objects
fc = obj.driver_add("location", 2)
driver = fc.driver
driver.type = 'SCRIPTED'

var = driver.variables.new()
var.name = "dist"
var.type = 'LOC_DIFF'
var.targets[0].id = bpy.data.objects["A"]
var.targets[1].id = bpy.data.objects["B"]

driver.expression = "dist"
```

### Self-Referencing Drivers

`use_self` allows the driver to reference the owning data-block without creating a variable:

```python
import bpy

obj = bpy.context.object

# Driver that references the object's own properties
fc = obj.driver_add("location", 2)
driver = fc.driver
driver.type = 'SCRIPTED'
driver.use_self = True

# 'self' is the owning ID (the Object in this case)
driver.expression = "self.scale.x * 2.0"
```

### Driver Expression Syntax

Expressions support Python math:

```python
# Built-in functions available in driver expressions:
# sin, cos, tan, asin, acos, atan, atan2
# sqrt, pow, log, log2, log10
# abs, min, max, round, floor, ceil
# pi, e
# radians, degrees
# clamp(value, min, max)
# lerp(a, b, factor)

# Examples:
"var * 2.0 + 1.0"                    # linear
"sin(frame * 0.1) * 3.0"             # sine wave using frame
"clamp(var, 0.0, 1.0)"               # clamped
"lerp(a, b, factor)"                 # interpolation
"max(var1, var2)"                     # maximum
"radians(var)"                        # degrees to radians
"1.0 if var > 0.5 else 0.0"          # conditional
```

### Removing Drivers

```python
import bpy

obj = bpy.context.object

# Remove driver from a specific property
obj.driver_remove("location", 0)  # remove X location driver

# Remove all component drivers
obj.driver_remove("location")  # remove X, Y, Z location drivers

# Access all drivers on an object
if obj.animation_data:
    for fc in obj.animation_data.drivers:
        print(f"Driver on: {fc.data_path}[{fc.array_index}]")
        print(f"  Expression: {fc.driver.expression}")
```

## Common Patterns

### Procedural Animation with Drivers

```python
import bpy
import math

obj = bpy.context.object

# Sine wave on Z location driven by frame
fc = obj.driver_add("location", 2)
driver = fc.driver
driver.type = 'SCRIPTED'
driver.expression = "sin(frame * 0.1) * 2.0"
```

### Driven Property from Custom Control

```python
import bpy

obj = bpy.context.object
ctrl = bpy.data.objects["Empty"]

# Add a custom property to the controller
ctrl["influence"] = 1.0

# Drive object scale uniformly from the controller's custom property
for axis in range(3):
    fc = obj.driver_add("scale", axis)
    driver = fc.driver
    driver.type = 'SCRIPTED'

    var = driver.variables.new()
    var.name = "inf"
    var.type = 'SINGLE_PROP'
    var.targets[0].id_type = 'OBJECT'
    var.targets[0].id = ctrl
    var.targets[0].data_path = '["influence"]'

    driver.expression = "inf"
```

### Batch Keyframe with NumPy

```python
import bpy
import numpy as np

obj = bpy.context.object
action = obj.animation_data.action
fc = action.fcurve_ensure_for_datablock(obj, "location", index=2)

# Generate 100 keyframes
frames = np.arange(1, 101, dtype=np.float32)
values = np.sin(frames * 0.1) * 3.0

# Bulk insert
fc.keyframe_points.add(count=len(frames))
for i, kp in enumerate(fc.keyframe_points):
    kp.co = (float(frames[i]), float(values[i]))
    kp.interpolation = 'BEZIER'

fc.update()  # recalculate handles
```

## Gotchas

1. **`driver_add` returns an F-Curve.** The returned F-Curve's `.driver` attribute holds the driver configuration. The F-Curve itself can also have keyframes (for shaping the driver output), though this is rarely used.

2. **Driver namespace.** Only safe math functions are available in driver expressions by default. `import` statements and most Python builtins are blocked for security. Enable "Auto-Run Python Scripts" in preferences if you need `bpy` access via `#` in the expression.

3. **`use_self` data-block type.** `self` refers to the owning ID, not the property. For `obj.driver_add("location", 0)`, `self` is the Object. For a material driver, `self` is the Material data-block.

4. **F-Curve `update()` after bulk changes.** After adding or modifying keyframe points in bulk (via `.add()` or `.co` assignment), call `fc.update()` to recalculate handles and ensure correct evaluation.

5. **Driver variable `id_type`.** For `SINGLE_PROP` variables, set `var.targets[0].id_type` before `var.targets[0].id`. Valid types: `'OBJECT'`, `'SCENE'`, `'WORLD'`, `'MATERIAL'`, `'MESH'`, `'CAMERA'`, `'LIGHT'`, `'ARMATURE'`, etc.

6. **`data_path` for nested properties.** Bone drivers need the full path from the object: `'pose.bones["BoneName"].location'`. Material socket drivers: `'node_tree.nodes["NodeName"].inputs["InputName"].default_value'`.

7. **Drivers and depsgraph.** Drivers are evaluated by the dependency graph. Circular dependencies (A drives B, B drives A) cause undefined behavior. Blender will warn about dependency cycles in the console.
