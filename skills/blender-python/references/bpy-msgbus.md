# Message Bus (bpy.msgbus)

RNA property change notification system. Subscribe to property changes and receive callbacks when values are updated through the UI or Python API. Callbacks are batched — they fire once per property per update cycle, after all operators finish.

## Overview

The message bus monitors changes made through Blender's RNA system. It does **not** fire for:
- Viewport manipulation (G/R/S grab, gizmo dragging)
- Animation playback (keyframed property changes)
- Direct memory writes bypassing RNA

Callbacks are postponed until all operators complete, and each property triggers its callback only once per cycle regardless of how many times the value changed.

## subscribe_rna

```python
bpy.msgbus.subscribe_rna(
    key,                # Property instance, type, or (type, "prop_name") tuple
    owner,              # Any Python object (identity comparison for cleanup)
    args,               # tuple — passed to notify callback as *args
    notify,             # callable — must return None
    *,
    options=set()       # keyword-only — {'PERSISTENT'} or empty set
)
```

### Key Types

Three forms for the `key` parameter:

**1. Property instance** — subscribe to one specific property on one specific data-block:

```python
import bpy

# Only fires when THIS object's location changes
subscribe_to = bpy.context.object.location
```

**2. Struct type** — subscribe to ANY change on ANY instance of that type:

```python
# Fires on any property change on any Object
subscribe_to = bpy.types.Object
```

**3. Tuple (type, property_name)** — subscribe to a specific property on ALL instances:

```python
# Fires when "location" changes on any Object
subscribe_to = (bpy.types.Object, "location")
```

### Owner

The `owner` is used for identity-based cleanup via `clear_by_owner()`. It can be any Python object, but you must keep a reference alive — if the owner is garbage collected, the subscription is lost.

```python
# Module-level owner — stays alive for addon lifetime
_owner = object()
```

### Options

| Option | Description |
|---|---|
| `'PERSISTENT'` | Keep subscription alive during ID remapping (library relinking, appending). Does **not** survive file load. |

### Complete Example

```python
import bpy

_owner = object()

def on_location_changed(*args):
    print("Location changed!", args)

bpy.msgbus.subscribe_rna(
    key=bpy.context.object.location,
    owner=_owner,
    args=(42,),
    notify=on_location_changed,
)
# When the object's location changes via UI or Python:
# prints "Location changed! (42,)"
```

## publish_rna

```python
bpy.msgbus.publish_rna(*, key)  # key is keyword-only
```

Manually trigger notification for all subscribers of the given key. Normally unnecessary — Blender publishes automatically when RNA properties change. Useful when you want to notify a broader key (e.g., publish a struct type when only a specific property changed).

```python
import bpy

# Manually notify all subscribers watching Object type
bpy.msgbus.publish_rna(key=bpy.types.Object)
```

## clear_by_owner

```python
bpy.msgbus.clear_by_owner(owner)
```

Remove all subscriptions associated with `owner`. The owner is compared by **identity** (`id()`), not equality — you must pass the exact same object used during subscription.

```python
bpy.msgbus.clear_by_owner(_owner)
```

## path_resolve for Subscription Keys

Some properties auto-convert to Python types on access (e.g., `object.name` returns a plain `str`). These lose their RNA reference and cannot be used as subscription keys. Use `path_resolve()` with `False` to get the raw RNA property:

```python
import bpy

obj = bpy.context.object

# WRONG — obj.name returns a Python str, not an RNA reference
key = obj.name  # Just a string "Cube" — useless as a key

# CORRECT — returns the RNA property reference
key = obj.path_resolve("name", False)

bpy.msgbus.subscribe_rna(
    key=key,
    owner=_owner,
    args=(),
    notify=on_name_changed,
)
```

Properties that return Blender types (like `location` returning `Vector`) work directly without `path_resolve`.

## Common Patterns

### Watching active object changes

```python
import bpy
from bpy.app.handlers import persistent

_owner = object()

def on_active_change():
    obj = bpy.context.active_object
    print(f"Active object is now: {obj.name if obj else 'None'}")

def subscribe():
    bpy.msgbus.subscribe_rna(
        key=bpy.types.LayerObjects,
        owner=_owner,
        args=(),
        notify=on_active_change,
    )

@persistent
def load_handler(dummy):
    subscribe()

def register():
    bpy.app.handlers.load_post.append(load_handler)
    subscribe()

def unregister():
    bpy.app.handlers.load_post.remove(load_handler)
    bpy.msgbus.clear_by_owner(_owner)
```

### Monitoring render engine switch

```python
import bpy
from bpy.app.handlers import persistent

_owner = object()

def on_engine_changed():
    engine = bpy.context.scene.render.engine
    print(f"Render engine changed to: {engine}")

def subscribe():
    bpy.msgbus.subscribe_rna(
        key=(bpy.types.RenderSettings, "engine"),
        owner=_owner,
        args=(),
        notify=on_engine_changed,
    )

@persistent
def load_handler(dummy):
    subscribe()

def register():
    bpy.app.handlers.load_post.append(load_handler)
    subscribe()

def unregister():
    bpy.app.handlers.load_post.remove(load_handler)
    bpy.msgbus.clear_by_owner(_owner)
```

### Watching a property on all instances of a type

```python
import bpy

_owner = object()

def on_any_object_name_change():
    print("Some object was renamed")

bpy.msgbus.subscribe_rna(
    key=(bpy.types.Object, "name"),
    owner=_owner,
    args=(),
    notify=on_any_object_name_change,
)
```

## Gotchas

- **All subscriptions are cleared on file load.** Re-subscribe in a `load_post` handler decorated with `@persistent`. This is the single most common msgbus bug.
- **`PERSISTENT` does not mean file-load persistent.** It only keeps subscriptions alive during ID remapping operations (library relinking). The name is misleading.
- **Transform system bypasses msgbus.** Moving objects with G/R/S keys or gizmos does not trigger notifications. Only direct RNA changes (Python API, UI fields) fire callbacks.
- **Animation does not trigger msgbus.** Properties animated via keyframes or drivers do not fire callbacks during playback.
- **Owner must stay alive.** If the owner object is garbage collected, the subscription silently disappears. Store the owner at module scope or as a class attribute.
- **Callbacks must return `None`.** The C implementation raises an error if the callback returns any other value.
- **Undo skips msgbus effects.** Changes made from msgbus callbacks are not included in undo steps. Users can undo past them.
- **One callback per property per cycle.** Even if a property changes multiple times before the callback fires, the callback runs only once. You cannot detect intermediate values.
