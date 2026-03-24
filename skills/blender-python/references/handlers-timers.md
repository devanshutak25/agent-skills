# Handlers & Timers

Application handlers (`bpy.app.handlers`) are callback lists triggered by Blender events. Timers (`bpy.app.timers`) schedule recurring or delayed function calls. For animation see [animation-actions](animation-actions.md). For operators see [operators-custom](operators-custom.md).

## Handlers

### Complete Handler List

Each handler is a list of callables. Append your function to register, remove to unregister.

**Animation handlers:**

| Handler | Signature | When Triggered |
|---|---|---|
| `frame_change_pre` | `fn(scene, depsgraph)` | Before frame change evaluation |
| `frame_change_post` | `fn(scene, depsgraph)` | After frame change evaluation |

**Depsgraph handlers:**

| Handler | Signature | When Triggered |
|---|---|---|
| `depsgraph_update_pre` | `fn(scene, depsgraph)` | Before depsgraph evaluation |
| `depsgraph_update_post` | `fn(scene, depsgraph)` | After depsgraph evaluation |

**File handlers:**

| Handler | Signature | When Triggered |
|---|---|---|
| `load_pre` | `fn(filepath)` | Before loading a blend file |
| `load_post` | `fn(filepath)` | After loading a blend file |
| `load_post_fail` | `fn(filepath)` | After failing to load a blend file |
| `load_factory_startup_post` | `fn(filepath)` | After loading factory startup |
| `load_factory_preferences_post` | `fn(filepath)` | After loading factory preferences |
| `save_pre` | `fn(filepath)` | Before saving a blend file |
| `save_post` | `fn(filepath)` | After saving a blend file |
| `save_post_fail` | `fn(filepath)` | After failing to save a blend file |
| `blend_import_pre` | `fn(blend_import_context)` | Before blend file import/append/link |
| `blend_import_post` | `fn(blend_import_context)` | After blend file import/append/link |

**Render handlers:**

| Handler | Signature | When Triggered |
|---|---|---|
| `render_pre` | `fn(scene, depsgraph)` | Before rendering a frame |
| `render_post` | `fn(scene, depsgraph)` | After rendering a frame |
| `render_complete` | `fn(scene, depsgraph)` | After render completes (all frames) |
| `render_cancel` | `fn(scene, depsgraph)` | When render is cancelled |
| `render_init` | `fn(scene, depsgraph)` | When render engine initializes |
| `render_stats` | `fn(stats_string)` | When render stats are updated |
| `render_write` | `fn(scene, depsgraph)` | After writing a rendered frame to disk |

**Undo handlers:**

| Handler | Signature | When Triggered |
|---|---|---|
| `undo_pre` | `fn(scene)` | Before undo |
| `undo_post` | `fn(scene)` | After undo |
| `redo_pre` | `fn(scene)` | Before redo |
| `redo_post` | `fn(scene)` | After redo |

**Animation handlers:**

| Handler | Signature | When Triggered |
|---|---|---|
| `animation_playback_pre` | `fn(scene, depsgraph)` | When animation playback starts |
| `animation_playback_post` | `fn(scene, depsgraph)` | When animation playback ends |

**Other handlers:**

| Handler | Signature | When Triggered |
|---|---|---|
| `version_update` | `fn(scene)` | When opening a file from older Blender version |
| `annotation_pre` | `fn(grease_pencil, depsgraph)` | Before drawing an annotation |
| `annotation_post` | `fn(grease_pencil, depsgraph)` | After drawing an annotation |
| `composite_pre` | `fn(scene)` | Before compositor evaluation |
| `composite_post` | `fn(scene)` | After compositor evaluation |
| `composite_cancel` | `fn(scene)` | When compositing is cancelled |
| `object_bake_pre` | `fn(object)` | Before object bake |
| `object_bake_complete` | `fn(object)` | After object bake completes |
| `object_bake_cancel` | `fn(object)` | When object bake is cancelled |
| `xr_session_start_pre` | `fn(scene)` | Before XR session starts |
| `translation_update_post` | `fn(scene)` | After translation update |

> **5.1:** `exit_pre` — `fn()` — Called before Blender exits. New in 5.1.

### Registering Handlers

```python
import bpy

def my_frame_handler(scene, depsgraph):
    print(f"Frame: {scene.frame_current}")

# Register
bpy.app.handlers.frame_change_post.append(my_frame_handler)

# Unregister
bpy.app.handlers.frame_change_post.remove(my_frame_handler)

# Clear all handlers of a type
bpy.app.handlers.frame_change_post.clear()
```

### The @persistent Decorator

By default, handler functions are removed when loading a new file. The `@persistent` decorator keeps the handler registered across file loads:

```python
import bpy
from bpy.app.handlers import persistent

@persistent
def my_load_handler(filepath):
    print(f"File loaded: {filepath}")

bpy.app.handlers.load_post.append(my_load_handler)
```

Without `@persistent`, handler functions are cleared on file load to prevent stale references. Use `@persistent` for handlers that should survive across file loads (e.g., addon initialization, persistent monitoring).

```python
import bpy
from bpy.app.handlers import persistent

@persistent
def setup_scene(filepath):
    """Re-apply scene settings after every file load."""
    scene = bpy.context.scene
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080

bpy.app.handlers.load_post.append(setup_scene)
```

## Timers

`bpy.app.timers` schedules functions to run after a delay or repeatedly:

### Registering Timers

```python
import bpy

def my_timer():
    print("Timer fired!")
    return 2.0  # call again in 2 seconds

# Register: function is called after first_interval seconds
bpy.app.timers.register(my_timer, first_interval=1.0)
```

**`bpy.app.timers.register` parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `function` | callable | required | Function to call |
| `first_interval` | float | `0` | Seconds until first call (0 = next frame) |
| `persistent` | bool | `False` | Survive file loads |

### Timer Return Values

The return value of the timer function controls its behavior:

| Return Value | Behavior |
|---|---|
| `float` (positive) | Timer fires again after that many seconds |
| `None` | Timer is unregistered (one-shot) |

```python
import bpy

# One-shot timer (runs once)
def once():
    print("Ran once!")
    return None  # or just don't return

bpy.app.timers.register(once, first_interval=3.0)

# Repeating timer
def every_second():
    print(f"Frame: {bpy.context.scene.frame_current}")
    return 1.0  # repeat every 1 second

bpy.app.timers.register(every_second)

# Timer with countdown
counter = [10]
def countdown():
    counter[0] -= 1
    print(f"Countdown: {counter[0]}")
    if counter[0] <= 0:
        print("Done!")
        return None  # stop
    return 0.5  # continue every 0.5s

bpy.app.timers.register(countdown, first_interval=0.5)
```

### Managing Timers

```python
import bpy

def my_timer():
    return 1.0

bpy.app.timers.register(my_timer)

# Check if registered
if bpy.app.timers.is_registered(my_timer):
    print("Timer is running")

# Unregister
bpy.app.timers.unregister(my_timer)
```

### Persistent Timers

```python
import bpy

def monitoring_timer():
    # This timer survives file loads
    print("Monitoring...")
    return 5.0

bpy.app.timers.register(monitoring_timer, persistent=True)
```

## Common Patterns

### Auto-Save Reminder

```python
import bpy
from bpy.app.handlers import persistent

@persistent
def auto_save_reminder(filepath):
    """Remind to save every 5 minutes after file load."""
    def remind():
        if bpy.data.is_dirty:
            print("Reminder: You have unsaved changes!")
        return 300.0  # 5 minutes

    bpy.app.timers.register(remind, first_interval=300.0)

bpy.app.handlers.load_post.append(auto_save_reminder)
```

### Scene Setup on File Load

```python
import bpy
from bpy.app.handlers import persistent

@persistent
def on_load(filepath):
    """Initialize custom data after file load."""
    for obj in bpy.data.objects:
        if "initialized" not in obj:
            obj["initialized"] = True
            obj["custom_state"] = 0

bpy.app.handlers.load_post.append(on_load)
```

### Monitor Depsgraph Changes

```python
import bpy

def on_depsgraph_update(scene, depsgraph):
    for update in depsgraph.updates:
        if update.is_updated_geometry:
            print(f"Geometry changed: {update.id.name}")
        if update.is_updated_transform:
            print(f"Transform changed: {update.id.name}")

bpy.app.handlers.depsgraph_update_post.append(on_depsgraph_update)
```

### Frame-Driven Effect

```python
import bpy
import math

def animate_emission(scene, depsgraph):
    """Pulse emission strength based on frame."""
    mat = bpy.data.materials.get("PulseMaterial")
    if mat and mat.node_tree:
        principled = mat.node_tree.nodes.get("Principled BSDF")
        if principled:
            frame = scene.frame_current
            strength = abs(math.sin(frame * 0.1)) * 5.0
            principled.inputs["Emission Strength"].default_value = strength

bpy.app.handlers.frame_change_post.append(animate_emission)
```

### Deferred Execution via Timer

```python
import bpy

def deferred_action():
    """Run code after Blender finishes current operation."""
    bpy.ops.object.select_all(action='DESELECT')
    print("Deferred select-all complete")
    return None  # one-shot

# Schedule for next available moment
bpy.app.timers.register(deferred_action, first_interval=0.0)
```

## Gotchas

1. **Handlers are cleared on file load.** Without `@persistent`, all registered handler functions are removed when a new file is loaded. Always use `@persistent` for addon handlers that should persist.

2. **Handler performance.** `depsgraph_update_post` and `frame_change_post` fire very frequently. Heavy computation in these handlers causes UI lag. Keep handler functions fast and bail out early when the update is irrelevant.

3. **Flexible argument counts.** Blender's handler system inspects your callback's argument count. A `fn(scene, depsgraph)` handler works, but so does `fn(scene)` — Blender passes only what the function accepts. Define the arguments you need.

4. **Timer functions run on the main thread.** Timers execute in Blender's main thread during idle processing. Long-running timer functions block the UI. For heavy work, do a small chunk per call and return a short interval.

5. **Duplicate handler registration.** Appending the same function multiple times registers it multiple times — it will be called multiple times per event. Check before appending, or use `if fn not in handler_list`.

6. **No handler for arbitrary property changes.** There is no per-property change handler. Use `bpy.msgbus` for property-level notifications. See [bpy-msgbus](bpy-msgbus.md).

7. **Timer `first_interval=0` means next frame.** A timer with `first_interval=0` runs at the next available idle moment, not immediately. This is useful for deferring work that cannot run in the current operator context.

8. **File load clears msgbus subscriptions.** Both handler registrations (without `@persistent`) and message bus subscriptions are cleared on file load. Re-subscribe in a persistent `load_post` handler.
