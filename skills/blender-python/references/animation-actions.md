# Animation Actions

The slotted Action system in Blender 5.0 stores animation data. An Action is a container of animation curves (F-Curves) organized by slots and channelbags. Each slot targets a specific data-block (object, material, etc.), enabling a single Action to animate multiple data-blocks. For keyframes and drivers see [keyframes-drivers](keyframes-drivers.md). For NLA see [nla](nla.md).

## Slotted Action System

In 5.0, Actions use **slots** to organize F-Curves. Each slot represents animation for one data-block. A **channelbag** within a slot contains the actual F-Curves.

### Core Concepts

| Concept | Description |
|---|---|
| **Action** | Top-level container. Lives in `bpy.data.actions`. |
| **Slot** (`ActionSlot`) | Associates animation data with a specific data-block type. |
| **Channelbag** | Stores F-Curves for one slot. Accessed via action strips. |
| **F-Curve** | A single animated channel (e.g., `location`, index 0 = X). |

## Creating and Assigning Actions

```python
import bpy

obj = bpy.context.object

# Create an action
action = bpy.data.actions.new("MyAction")

# Ensure the object has animation data
if obj.animation_data is None:
    obj.animation_data_create()

# Create a slot for this object
slot = action.slots.new(id_type='OBJECT', name=obj.name)

# Assign action and slot to the object
obj.animation_data.action = action
obj.animation_data.action_slot = slot
```

### Slots

A slot targets a specific ID type. `action.slots.new(id_type, name)` creates a slot for that type:

```python
import bpy

action = bpy.data.actions.new("MultiTargetAction")

obj = bpy.data.objects["Cube"]
light = bpy.data.lights["Light"]
mat = bpy.data.materials["Material"]

# Create slots for different data-blocks
obj_slot = action.slots.new(id_type='OBJECT', name=obj.name)
light_slot = action.slots.new(id_type='LIGHT', name=light.name)
mat_slot = action.slots.new(id_type='MATERIAL', name=mat.name)

# Each slot has a name and handle
print(f"Object slot: {obj_slot.name}, handle: {obj_slot.handle}")
print(f"Light slot: {light_slot.name}, handle: {light_slot.handle}")

# Assign
obj.animation_data_create()
obj.animation_data.action = action
obj.animation_data.action_slot = obj_slot
```

## Channelbags and F-Curves

F-Curves are stored in channelbags. Access them through the action's internal strip:

```python
import bpy

action = bpy.data.actions["MyAction"]
obj = bpy.context.object

# Ensure action and slot are assigned
if obj.animation_data is None:
    obj.animation_data_create()

slot = action.slots.new(id_type='OBJECT', name=obj.name)
obj.animation_data.action = action
obj.animation_data.action_slot = slot

# Get or create the channelbag for this slot
# Use the convenience function to ensure it exists
from bpy_extras.anim_utils import action_ensure_channelbag_for_slot
channelbag = action_ensure_channelbag_for_slot(action, slot)

# Create F-Curves in the channelbag
fc_loc_x = channelbag.fcurves.new("location", index=0)
fc_loc_y = channelbag.fcurves.new("location", index=1)
fc_loc_z = channelbag.fcurves.new("location", index=2)

# Or use ensure (creates if doesn't exist, returns existing if it does)
fc_rot_x = channelbag.fcurves.ensure("rotation_euler", index=0)

# Insert keyframes on the F-Curve
fc_loc_x.keyframe_points.insert(1, 0.0)    # frame 1, value 0.0
fc_loc_x.keyframe_points.insert(30, 5.0)   # frame 30, value 5.0
fc_loc_x.keyframe_points.insert(60, 0.0)   # frame 60, value 0.0
```

### Direct F-Curve Creation

`action.fcurve_ensure_for_datablock()` is a high-level method that handles slot and channelbag creation:

```python
import bpy

obj = bpy.context.object
action = bpy.data.actions.new("QuickAction")

if obj.animation_data is None:
    obj.animation_data_create()
obj.animation_data.action = action

# This creates the slot, channelbag, and F-Curve in one call
fc = action.fcurve_ensure_for_datablock(
    datablock=obj,
    data_path="location",
    index=0
)

# Now insert keyframes
fc.keyframe_points.insert(1, 0.0)
fc.keyframe_points.insert(50, 10.0)
```

## Accessing Existing F-Curves

```python
import bpy

obj = bpy.context.object
action = obj.animation_data.action
slot = obj.animation_data.action_slot

if action and slot:
    # Iterate through channelbags to find the one for our slot
    for strip in action.layers[0].strips:
        for channelbag in strip.channelbags:
            if channelbag.slot_handle == slot.handle:
                for fc in channelbag.fcurves:
                    print(f"{fc.data_path}[{fc.array_index}]: "
                          f"{len(fc.keyframe_points)} keyframes")
```

### Finding a Specific F-Curve

```python
import bpy

obj = bpy.context.object
action = obj.animation_data.action
slot = obj.animation_data.action_slot

def find_fcurve(action, slot, data_path, index=0):
    """Find an F-Curve for a given data path and array index."""
    for strip in action.layers[0].strips:
        for channelbag in strip.channelbags:
            if channelbag.slot_handle == slot.handle:
                for fc in channelbag.fcurves:
                    if fc.data_path == data_path and fc.array_index == index:
                        return fc
    return None

fc = find_fcurve(action, slot, "location", 0)
if fc:
    print(f"Found X location F-Curve with {len(fc.keyframe_points)} keys")
```

## Action Properties

```python
import bpy

action = bpy.data.actions["MyAction"]

# Frame range
action.frame_start = 1
action.frame_end = 250

# Use frame range (clamp to start/end)
action.use_frame_range = True

# Slots
for slot in action.slots:
    print(f"Slot: {slot.name} (type: {slot.id_type}, handle: {slot.handle})")

# Number of F-Curves (across all channelbags)
total_fcurves = 0
for layer in action.layers:
    for strip in layer.strips:
        for channelbag in strip.channelbags:
            total_fcurves += len(channelbag.fcurves)
print(f"Total F-Curves: {total_fcurves}")
```

## Action Layers and Strips

Actions have a layer/strip hierarchy:

```python
import bpy

action = bpy.data.actions["MyAction"]

# Actions have layers (typically one)
for layer in action.layers:
    print(f"Layer: {layer.name}")
    for strip in layer.strips:
        print(f"  Strip: frame {strip.frame_start}-{strip.frame_end}")
        for channelbag in strip.channelbags:
            print(f"    Channelbag (slot handle: {channelbag.slot_handle})")
            print(f"    F-Curves: {len(channelbag.fcurves)}")
```

## Common Patterns

### Animate an Object's Transform

```python
import bpy

obj = bpy.context.object

# Create action with animation
action = bpy.data.actions.new("BounceAction")
if obj.animation_data is None:
    obj.animation_data_create()
obj.animation_data.action = action

# Create location Z F-Curve
fc = action.fcurve_ensure_for_datablock(obj, "location", index=2)

# Bouncing animation
frames_values = [(1, 0.0), (15, 3.0), (30, 0.0), (45, 2.0), (60, 0.0)]
for frame, value in frames_values:
    fc.keyframe_points.insert(frame, value)

# Set all keyframes to AUTO handle type for smooth interpolation
for kp in fc.keyframe_points:
    kp.handle_left_type = 'AUTO'
    kp.handle_right_type = 'AUTO'

# Set frame range
action.frame_start = 1
action.frame_end = 60
action.use_frame_range = True
```

### Copy Animation Between Objects

```python
import bpy

src = bpy.data.objects["Cube"]
dst = bpy.data.objects["Cube.001"]

src_action = src.animation_data.action
if src_action is None:
    raise ValueError("Source has no action")

# Duplicate the action
new_action = src_action.copy()
new_action.name = f"{dst.name}_Action"

# Create animation data on destination
if dst.animation_data is None:
    dst.animation_data_create()

# Create a new slot for the destination object
new_slot = new_action.slots.new(id_type='OBJECT', name=dst.name)

# Assign
dst.animation_data.action = new_action
dst.animation_data.action_slot = new_slot

# The F-Curves are copied but still reference the original slot.
# For the destination to use them, you may need to re-create F-Curves
# under the new slot's channelbag.
```

### Batch Keyframe Insertion via keyframe_insert

The simplest way to keyframe is through the data-block method:

```python
import bpy

obj = bpy.context.object

# Ensure animation data exists
if obj.animation_data is None:
    obj.animation_data_create()
if obj.animation_data.action is None:
    obj.animation_data.action = bpy.data.actions.new(f"{obj.name}_Action")
    slot = obj.animation_data.action.slots.new(id_type='OBJECT', name=obj.name)
    obj.animation_data.action_slot = slot

# Keyframe current value at current frame
obj.keyframe_insert(data_path="location", frame=bpy.context.scene.frame_current)
obj.keyframe_insert(data_path="rotation_euler", frame=bpy.context.scene.frame_current)

# Keyframe at specific frames
for frame in range(1, 61, 10):
    obj.location.z = frame * 0.05
    obj.keyframe_insert(data_path="location", index=2, frame=frame)
```

## Gotchas

1. **Slot must be assigned.** After setting `obj.animation_data.action = action`, you must also set `obj.animation_data.action_slot = slot`. Without a slot assignment, keyframe insertion and F-Curve access will not work correctly.

2. **`animation_data_create()` required.** Objects do not have `animation_data` by default. Always call `obj.animation_data_create()` before assigning an action. Checking `obj.animation_data is None` first avoids re-creating.

3. **Channelbag creation.** F-Curves are stored in channelbags, which live inside strips. Use `action_ensure_channelbag_for_slot()` from `bpy_extras.anim_utils` or `action.fcurve_ensure_for_datablock()` to handle the creation chain automatically.

4. **Slot handle matching.** When iterating channelbags, match `channelbag.slot_handle` to `slot.handle` to find the correct channelbag for a given data-block.

5. **Action data-path strings.** F-Curve `data_path` must exactly match the RNA property path. Common paths: `"location"`, `"rotation_euler"`, `"rotation_quaternion"`, `"scale"`, `'pose.bones["BoneName"].location'`. Typos in data paths cause silent failures.

6. **Multi-slot actions.** A single action can animate multiple data-blocks (object + material, etc.). Each gets its own slot. Be careful when copying or reassigning actions — the slot bindings may not match the new targets.

7. **`keyframe_insert` creates infrastructure automatically.** Calling `obj.keyframe_insert()` will create the action, slot, channelbag, and F-Curve if they don't exist. However, this auto-creation may assign default names. For precise control, create these manually.
