# Operators (bpy.ops)

Blender's operator system provides high-level commands for scene manipulation. Operators are the same functions triggered by menus, buttons, and shortcuts. Call them from Python via `bpy.ops.<module>.<name>()`. Prefer direct data access (`bpy.data`, `bpy.types`) for batch operations — operators carry overhead from polling, undo, and UI updates.

## Calling Operators

```python
bpy.ops.<module>.<operator_name>(execution_context, undo, **operator_properties)
```

Both positional arguments are optional and must appear in this order:

| Argument | Type | Default | Description |
|---|---|---|---|
| `execution_context` | `str` | `'EXEC_DEFAULT'` | Controls how the operator runs (see below) |
| `undo` | `bool` | `False` | Push an undo step for this call |
| `**kwargs` | | | Operator-specific properties |

```python
import bpy

# Minimal call — uses EXEC_DEFAULT, no undo
bpy.ops.object.select_all(action='DESELECT')

# With execution context
bpy.ops.mesh.primitive_cube_add('INVOKE_DEFAULT')

# With undo enabled
bpy.ops.object.delete('EXEC_DEFAULT', True, use_global=False)
```

### Return Values

Operators return a `set` containing one of:

| Value | Meaning |
|---|---|
| `'FINISHED'` | Completed successfully |
| `'CANCELLED'` | Exited without doing anything |
| `'RUNNING_MODAL'` | Operator is running modally (stays active) |
| `'PASS_THROUGH'` | Did nothing, passed event on |
| `'INTERFACE'` | Spawned a UI popup that took over control |

```python
result = bpy.ops.object.mode_set(mode='EDIT')
if 'FINISHED' in result:
    print("Switched to edit mode")
```

**Error handling:** If the operator posts `{'ERROR'}` reports, a `RuntimeError` is raised after completion — even if the return value is `{'FINISHED'}`. Calling an operator in the wrong context also raises `RuntimeError`.

### Execution Context

Controls whether the operator's `invoke()` or only `execute()` method runs.

**INVOKE variants** — call `invoke()`, which may show dialogs, file browsers, or prompt for input, then call `execute()`:

`'INVOKE_DEFAULT'`, `'INVOKE_REGION_WIN'`, `'INVOKE_REGION_CHANNELS'`, `'INVOKE_REGION_PREVIEW'`, `'INVOKE_AREA'`, `'INVOKE_SCREEN'`

**EXEC variants** — call only `execute()`, running silently without UI:

`'EXEC_DEFAULT'`, `'EXEC_REGION_WIN'`, `'EXEC_REGION_CHANNELS'`, `'EXEC_REGION_PREVIEW'`, `'EXEC_AREA'`, `'EXEC_SCREEN'`

The `_REGION_WIN`, `_AREA`, `_SCREEN` suffixes control which part of the UI receives the event. Use `_DEFAULT` unless you need to target a specific region.

### Undo Parameter

By default, operators called from Python do not push undo steps. Pass `undo=True` to enable:

```python
# This call will be undoable
bpy.ops.mesh.primitive_cube_add('EXEC_DEFAULT', True)
```

## Context Requirements

Most operators require specific context — a certain mode, selection, area type, or active object. Calling an operator without the right context raises `RuntimeError`.

### Checking with poll()

```python
# Check before calling
if bpy.ops.object.mode_set.poll():
    bpy.ops.object.mode_set(mode='EDIT')
else:
    print("Cannot switch mode in current context")
```

### Providing Context with temp_override

Use `context.temp_override()` to set up the required context. See [bpy-context.md](bpy-context.md) for full details.

```python
import bpy

# Run a 3D viewport operator from a script (no area by default)
for window in bpy.context.window_manager.windows:
    for area in window.screen.areas:
        if area.type == 'VIEW_3D':
            for region in area.regions:
                if region.type == 'WINDOW':
                    with bpy.context.temp_override(window=window, area=area, region=region):
                        bpy.ops.view3d.camera_to_view()
                    break
            break
    break
```

## Operator Submodules

Common submodules (77 total):

| Module | Description |
|---|---|
| `bpy.ops.object` | Object-level operations (add, delete, join, parent, etc.) |
| `bpy.ops.mesh` | Mesh editing (extrude, subdivide, merge, etc.) |
| `bpy.ops.transform` | Transform operations (translate, rotate, scale) |
| `bpy.ops.wm` | Window manager, file I/O, import/export operators |
| `bpy.ops.render` | Rendering operations |
| `bpy.ops.anim` | Animation operations |
| `bpy.ops.action` | Action/keyframe operations |
| `bpy.ops.armature` | Armature editing |
| `bpy.ops.pose` | Pose mode operations |
| `bpy.ops.curve` | Legacy curve editing |
| `bpy.ops.curves` | New curves (hair) editing |
| `bpy.ops.node` | Node editor operations |
| `bpy.ops.material` | Material operations |
| `bpy.ops.uv` | UV editing |
| `bpy.ops.sculpt` | Sculpt mode operations |
| `bpy.ops.paint` | Painting (vertex/weight/texture) |
| `bpy.ops.sequencer` | Video sequence editor |
| `bpy.ops.clip` | Movie clip tracking |
| `bpy.ops.constraint` | Constraint operations |
| `bpy.ops.particle` | Particle system operations |
| `bpy.ops.collection` | Collection management |
| `bpy.ops.screen` | Screen/layout operations |
| `bpy.ops.ed` | Editor utilities (undo_push, etc.) |
| `bpy.ops.view3d` | 3D viewport navigation |
| `bpy.ops.graph` | Graph editor operations |
| `bpy.ops.nla` | NLA editor operations |
| `bpy.ops.image` | Image editor operations |
| `bpy.ops.text_editor` | Text editor operations |
| `bpy.ops.extensions` | Extension/add-on management |
| `bpy.ops.grease_pencil` | Grease Pencil v3 operations |
| `bpy.ops.geometry` | Geometry nodes operations |
| `bpy.ops.outliner` | Outliner operations |
| `bpy.ops.file` | File browser operations |
| `bpy.ops.preferences` | Preferences operations |
| `bpy.ops.export_scene` | Legacy scene export (prefer `bpy.ops.wm`) |
| `bpy.ops.import_scene` | Legacy scene import (prefer `bpy.ops.wm`) |

Import/export operators have migrated to `bpy.ops.wm` as C++ implementations: `wm.obj_import`, `wm.obj_export`, `wm.stl_import`, `wm.stl_export`, `wm.ply_import`, `wm.ply_export`, `wm.usd_import`, `wm.usd_export`.

### Finding Operators

- **Info editor:** Shows Python calls for every UI action. Open via *Editor Type → Info*.
- **Python tooltips:** Enable *Preferences → Interface → Python Tooltips* to see operator IDs in UI tooltips.
- **Python console:** Tab-complete `bpy.ops.<module>.` to list operators in a submodule.

## Operator Class Definition

Custom operators subclass `bpy.types.Operator`:

```python
import bpy

class OBJECT_OT_my_operator(bpy.types.Operator):
    bl_idname = "object.my_operator"  # <category>.<name>, lowercase + underscores
    bl_label = "My Operator"
    bl_description = "Does something useful"
    bl_options = {'REGISTER', 'UNDO'}

    my_prop: bpy.props.FloatProperty(name="Value", default=1.0)

    @classmethod
    def poll(cls, context):
        return context.active_object is not None

    def execute(self, context):
        context.active_object.location.x += self.my_prop
        return {'FINISHED'}

def register():
    bpy.utils.register_class(OBJECT_OT_my_operator)

def unregister():
    bpy.utils.unregister_class(OBJECT_OT_my_operator)
```

### bl_options Flags

| Flag | Description |
|---|---|
| `'REGISTER'` | Show in Info editor and support Adjust Last Operation panel |
| `'UNDO'` | Push an undo step |
| `'UNDO_GROUPED'` | Single undo event for repeated calls |
| `'BLOCKING'` | Block cursor for other uses |
| `'MACRO'` | Operator is a macro |
| `'GRAB_CURSOR'` | Grab mouse, enable continuous grab wrapping |
| `'GRAB_CURSOR_X'` | Grab, warp X axis only |
| `'GRAB_CURSOR_Y'` | Grab, warp Y axis only |
| `'DEPENDS_ON_CURSOR'` | Uses initial cursor position; prompts placement from menus |
| `'PRESET'` | Show preset selector in operator panel |
| `'INTERNAL'` | Hide from search results |

### Operator Methods

| Method | Signature | When Called |
|---|---|---|
| `poll` | `poll(cls, context) → bool` | Before execution to check availability |
| `execute` | `execute(self, context) → set` | Main logic |
| `invoke` | `invoke(self, context, event) → set` | On user interaction (INVOKE mode) |
| `modal` | `modal(self, context, event) → set` | Each event during modal operation |
| `draw` | `draw(self, context) → None` | Custom UI in operator panel |
| `cancel` | `cancel(self, context) → None` | Cleanup on modal cancellation |
| `check` | `check(self, context) → bool` | Return True to redraw operator panel |

### report()

```python
self.report({'INFO'}, "Operation completed")
self.report({'WARNING'}, "Something may be wrong")
self.report({'ERROR'}, "Operation failed")
```

Report types: `'DEBUG'`, `'INFO'`, `'OPERATOR'`, `'PROPERTY'`, `'WARNING'`, `'ERROR'`, `'ERROR_INVALID_INPUT'`, `'ERROR_INVALID_CONTEXT'`, `'ERROR_OUT_OF_MEMORY'`.

## Common Patterns

### Batch operations on selected objects

```python
import bpy

for obj in bpy.context.selected_objects:
    obj.location.z += 1.0  # Direct data access — fast, no operator overhead
```

### Running a viewport operator from a timer or handler

```python
import bpy

def find_3d_area():
    for window in bpy.context.window_manager.windows:
        for area in window.screen.areas:
            if area.type == 'VIEW_3D':
                for region in area.regions:
                    if region.type == 'WINDOW':
                        return window, area, region
    return None, None, None

window, area, region = find_3d_area()
if area is not None:
    with bpy.context.temp_override(window=window, area=area, region=region):
        bpy.ops.view3d.snap_cursor_to_center()
```

### Getting operator properties with as_keywords

```python
class EXPORT_OT_my_format(bpy.types.Operator):
    bl_idname = "export.my_format"
    bl_label = "Export My Format"

    filepath: bpy.props.StringProperty(subtype='FILE_PATH')
    use_selection: bpy.props.BoolProperty(default=False)

    def execute(self, context):
        keywords = self.as_keywords(ignore=("filter_glob",))
        # keywords == {"filepath": "/path/to/file", "use_selection": False}
        return my_export_function(**keywords)
```

## Gotchas

- **Operators are slow for bulk work.** Each call polls context, may push undo, and triggers depsgraph updates. For modifying many objects, directly set properties on `bpy.data` objects instead.
- **Context changes between calls.** An operator may alter mode, selection, or active object. A second operator call may fail because the context it expects is no longer valid.
- **Some operators only work in specific modes.** `bpy.ops.mesh.*` requires Edit mode; `bpy.ops.pose.*` requires Pose mode. Always check `poll()` or handle `RuntimeError`.
- **Undo grouping.** Each operator call with undo enabled creates a separate undo step. Use `bpy.ops.ed.undo_push(message="Description")` to group steps manually if needed.
- **No return data.** Operators communicate results through context changes (new objects, selection), reports, or side effects — they do not return data directly. Check `context.active_object` or `context.selected_objects` after calls that create or modify objects.
- **Import/export migration.** Many I/O operators moved from `export_scene`/`import_scene` to `bpy.ops.wm` (e.g., `wm.obj_export`). Check both locations if an operator appears missing.
