# Custom Operators

Define custom operators by subclassing `bpy.types.Operator`. Operators are registered classes that appear in menus, search, and keymaps, and can be called from Python via `bpy.ops.<category>.<name>()`. See [bpy-ops.md](bpy-ops.md) for calling existing operators; see [operators-modal.md](operators-modal.md) for modal operators.

## Operator Class Structure

```python
import bpy

class OBJECT_OT_simple_example(bpy.types.Operator):
    """Tooltip shown on hover (alternative to bl_description)"""
    bl_idname = "object.simple_example"
    bl_label = "Simple Example"
    bl_description = "Moves the active object along X"
    bl_options = {'REGISTER', 'UNDO'}

    offset: bpy.props.FloatProperty(name="Offset", default=1.0)

    @classmethod
    def poll(cls, context):
        return context.active_object is not None

    def execute(self, context):
        context.active_object.location.x += self.offset
        return {'FINISHED'}
```

### Class Name Convention

The class name must follow the pattern `CATEGORY_OT_name`. The `_OT_` separator identifies it as an operator (analogous to `_PT_` for panels, `_MT_` for menus, `_HT_` for headers, `_UL_` for UI lists).

### Required Attributes

| Attribute | Type | Description |
|---|---|---|
| `bl_idname` | `str` | Unique ID in `"category.name"` format. Lowercase letters, digits, underscores only. Exactly one dot. |
| `bl_label` | `str` | Display name shown in menus and search |

**Optional:** `bl_description` (str, tooltip — defaults to class docstring), `bl_options` (set, default `{'REGISTER'}`), `bl_translation_context` (str), `bl_undo_group` (str, for `UNDO_GROUPED`), `bl_property` (str, primary property for file selectors/search), `bl_cursor_pending` (str, cursor icon while pending).

## bl_options

| Flag | Description |
|---|---|
| `'REGISTER'` | Show in Info editor, enable Adjust Last Operation panel (F9) |
| `'UNDO'` | Push an undo step when returning `FINISHED` |
| `'UNDO_GROUPED'` | Single undo event for repeated instances of this operator |
| `'BLOCKING'` | Block anything else from using the cursor |
| `'MACRO'` | Mark as a macro operator |
| `'GRAB_CURSOR'` | Grab mouse focus, enable continuous grab wrapping (X and Y) |
| `'GRAB_CURSOR_X'` | Grab, warp X axis only |
| `'GRAB_CURSOR_Y'` | Grab, warp Y axis only |
| `'DEPENDS_ON_CURSOR'` | Uses initial cursor position; prompts placement when run from menus |
| `'PRESET'` | Show preset selector in operator properties panel |
| `'INTERNAL'` | Hide from search results (F3 menu) |
| `'MODAL_PRIORITY'` | Handle events before other modal operators. Use with caution. |

Typical combinations:

```python
bl_options = {'REGISTER', 'UNDO'}                  # standard data-modifying operator
bl_options = {'REGISTER', 'UNDO', 'PRESET'}         # with preset support
bl_options = {'REGISTER', 'UNDO', 'GRAB_CURSOR'}    # modal with mouse grab
bl_options = {'INTERNAL'}                            # internal, no search, no undo
bl_options = set()                                   # no registration, no undo
```

## Operator Methods

### poll(cls, context) -> bool

Class method. Called before execution to determine if the operator can run. Return `True` to enable, `False` to grey out in menus. The operator button tooltip shows the poll failure message if defined.

```python
@classmethod
def poll(cls, context):
    return (context.active_object is not None
            and context.active_object.type == 'MESH'
            and context.mode == 'OBJECT')
```

### execute(self, context) -> set[str]

Main execution logic. Must return `{'FINISHED'}` or `{'CANCELLED'}`.

```python
def execute(self, context):
    if not self.validate():
        self.report({'ERROR'}, "Invalid parameters")
        return {'CANCELLED'}
    # ... do work ...
    return {'FINISHED'}
```

### invoke(self, context, event) -> set[str]

Called on user interaction (UI or keymap). Receives the triggering `event`. Use to initialize from context, show dialogs, or start modal. Typical patterns: `return self.execute(context)` (run directly), `return context.window_manager.invoke_props_dialog(self)` (show dialog first), or call `modal_handler_add(self)` and `return {'RUNNING_MODAL'}`.

WindowManager invoke helpers: `invoke_props_dialog(op, width=300)` — dialog then execute; `invoke_props_popup(op, event)` — popup, execute immediately; `invoke_confirm(op, event)` — confirmation dialog; `invoke_search_popup(op)` — search popup (needs `bl_property` on an `EnumProperty`); `fileselect_add(op)` — file browser (needs `filepath: StringProperty(subtype='FILE_PATH')`).

### check(self, context) -> bool

Called after property changes in the operator panel. Return `True` if properties were modified (triggers redraw). Use to clamp or validate values.

### draw(self, context) -> None

Custom UI layout for F9 panel. If omitted, properties are drawn automatically. Use `self.layout` to build UI.

### cancel(self, context) -> None

Cleanup on modal cancellation — remove timers, draw handlers, restore state. See [operators-modal.md](operators-modal.md).

### description(cls, context, properties) -> str

Class method. Return a dynamic tooltip string based on context and current properties.

## Return Values

Returned as a `set` from `execute`, `invoke`, and `modal`:

| Value | Meaning |
|---|---|
| `'FINISHED'` | Completed successfully. Pushes undo if `'UNDO'` in `bl_options`. |
| `'CANCELLED'` | Exited without action. No undo step. |
| `'RUNNING_MODAL'` | Operator is running modally. Only from `invoke`/`modal`. |
| `'PASS_THROUGH'` | Do nothing, pass event to next handler. Only from `modal`. |
| `'INTERFACE'` | Handled but not executed (popup menus). |

## Operator Properties

Define properties as class annotations using `bpy.props`. These appear in the Adjust Last Operation panel, are saved for undo/redo, and can be passed as keyword arguments when calling the operator. See [bpy-props.md](bpy-props.md) for full property type details.

```python
class MESH_OT_add_grid(bpy.types.Operator):
    bl_idname = "mesh.add_grid_custom"
    bl_label = "Add Custom Grid"
    bl_options = {'REGISTER', 'UNDO'}

    subdivisions: bpy.props.IntProperty(name="Subdivisions", default=10, min=1, max=1000)
    size: bpy.props.FloatProperty(name="Size", default=2.0, min=0.001, unit='LENGTH')
    align: bpy.props.EnumProperty(
        name="Align",
        items=[('WORLD', "World", ""), ('VIEW', "View", ""), ('CURSOR', "Cursor", "")],
        default='WORLD',
    )
```

Access inside methods via `self.<property_name>`. From Python, pass as kwargs: `bpy.ops.mesh.add_grid_custom(subdivisions=20, size=5.0)`. Use `self.as_keywords(ignore=("filter_glob",))` to convert all properties to a dict for forwarding to helpers.

## report()

Display a message to the user in the status bar.

```python
self.report({'INFO'}, "Operation completed")
self.report({'WARNING'}, "Some values were clamped")
self.report({'ERROR'}, "Failed — no mesh selected")
```

| Type | Behavior |
|---|---|
| `'DEBUG'` | Not shown in UI |
| `'INFO'` | Status bar message |
| `'OPERATOR'` | Internal operator message |
| `'PROPERTY'` | Internal property message |
| `'WARNING'` | Status bar, yellow |
| `'ERROR'` | Status bar, red. Raises `RuntimeError` when called from Python. |
| `'ERROR_INVALID_INPUT'` | Invalid input error |
| `'ERROR_INVALID_CONTEXT'` | Invalid context error |
| `'ERROR_OUT_OF_MEMORY'` | Out of memory error |

## Menu Registration

Add operators to existing menus using `append` or `prepend`:

```python
def draw_menu_item(self, context):
    self.layout.operator("mesh.add_grid_custom", text="Custom Grid", icon='MESH_GRID')

def register():
    bpy.utils.register_class(MESH_OT_add_grid)
    bpy.types.VIEW3D_MT_mesh_add.append(draw_menu_item)

def unregister():
    bpy.types.VIEW3D_MT_mesh_add.remove(draw_menu_item)
    bpy.utils.unregister_class(MESH_OT_add_grid)
```

The draw function signature is `(self, context)` — same as `Menu.draw`. Common menus: `VIEW3D_MT_mesh_add`, `VIEW3D_MT_add`, `VIEW3D_MT_object`, `VIEW3D_MT_object_context_menu`, `TOPBAR_MT_file`, `TOPBAR_MT_file_import`, `TOPBAR_MT_file_export`, `NODE_MT_add`.

For custom menus, subclass `bpy.types.Menu` with `bl_idname = "VIEW3D_MT_custom_menu"` and `draw(self, context)`. Call from other menus: `layout.menu("VIEW3D_MT_custom_menu")`.

## Keymap Registration

Register keyboard shortcuts for operators:

```python
addon_keymaps = []

def register():
    bpy.utils.register_class(OBJECT_OT_simple_example)

    wm = bpy.context.window_manager
    kc = wm.keyconfigs.addon
    if kc:
        km = kc.keymaps.new(name='3D View', space_type='VIEW_3D')
        kmi = km.keymap_items.new(
            "object.simple_example",
            type='T',
            value='PRESS',
            ctrl=True,
            shift=True,
        )
        # Set default property values for this binding
        kmi.properties.offset = 2.0
        addon_keymaps.append((km, kmi))

def unregister():
    for km, kmi in addon_keymaps:
        km.keymap_items.remove(kmi)
    addon_keymaps.clear()
    bpy.utils.unregister_class(OBJECT_OT_simple_example)
```

`KeyMaps.new(name, space_type='EMPTY', region_type='WINDOW')` — creates or gets a keymap. `KeyMapItems.new(idname, type, value, *, shift=0, ctrl=0, alt=0, oskey=0, any=False, key_modifier='NONE', repeat=False, head=False)` — adds a binding. Modifier values: -1=ignore, 0=not held, 1=held. Set `any=True` to match any modifier combination.

## Common Patterns

### File Export Operator with Browser

```python
import bpy
from bpy_extras.io_utils import ExportHelper

class EXPORT_OT_my_format(bpy.types.Operator, ExportHelper):
    bl_idname = "export.my_format"
    bl_label = "Export My Format"

    filename_ext = ".myf"
    filter_glob: bpy.props.StringProperty(default="*.myf", options={'HIDDEN'})
    use_selection: bpy.props.BoolProperty(name="Selection Only", default=False)

    def execute(self, context):
        objects = context.selected_objects if self.use_selection else context.scene.objects
        with open(self.filepath, 'w') as f:
            for obj in objects:
                f.write(f"{obj.name} {obj.location[:]}\n")
        self.report({'INFO'}, f"Exported to {self.filepath}")
        return {'FINISHED'}
```

Register in the export menu with `bpy.types.TOPBAR_MT_file_export.append(menu_func)`. `ExportHelper` provides `filepath`, `filename_ext`, and `filter_glob` handling. See [bpy-extras.md](bpy-extras.md) for `ImportHelper`/`ExportHelper` details.

### Operator with Search Popup

Set `bl_property = "target"` pointing to a dynamic `EnumProperty`, then call `context.window_manager.invoke_search_popup(self)` from `invoke()` (return `{'CANCELLED'}` — the popup handles execution). The enum `items` callback generates options: `items=lambda self, ctx: [(o.name, o.name, "") for o in ctx.scene.objects]`.

For a confirmation dialog, return `context.window_manager.invoke_confirm(self, event)` from `invoke()`.

## Gotchas

- **bl_idname must be lowercase with exactly one dot.** `"My.Operator"` or `"object_my_op"` will fail silently or raise an error at registration. Use `"category.snake_case_name"`.
- **Class name must match bl_idname pattern.** If `bl_idname = "object.my_op"`, the class should be named `OBJECT_OT_my_op`. Mismatches cause warnings.
- **poll() must not modify state.** It is called frequently (every UI redraw). Accessing `context.active_object` is fine; creating objects or modifying data is not.
- **Properties are reset between calls.** Each operator invocation gets fresh default values unless the user adjusts them in the F9 panel. To persist state across calls, store data on the scene or in addon preferences.
- **Registration order matters.** If operator B references operator A (e.g., in a macro), A must be registered first. See [addon-structure.md](addon-structure.md) for class registration order.
- **invoke() vs execute().** When called from Python (`bpy.ops.x.y()`), only `execute()` runs by default (`EXEC_DEFAULT`). Use `bpy.ops.x.y('INVOKE_DEFAULT')` to trigger `invoke()`. Menus and keymaps always use `INVOKE_DEFAULT`.
