# Panels & UI Layout

Define custom panels by subclassing `bpy.types.Panel`. Panels provide the primary UI for addons and tools in sidebars, Properties editor tabs, and headers. The `UILayout` object controls how widgets are arranged. See [ui-layout-advanced.md](ui-layout-advanced.md) for templates, UIList, and custom previews; see [operators-custom.md](operators-custom.md) for operator classes.

## Panel Class Structure

```python
import bpy

class VIEW3D_PT_my_panel(bpy.types.Panel):
    bl_idname = "VIEW3D_PT_my_panel"
    bl_label = "My Panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "My Tab"

    @classmethod
    def poll(cls, context):
        return context.active_object is not None

    def draw_header(self, context):
        self.layout.label(icon='OBJECT_DATA')

    def draw(self, context):
        layout = self.layout
        obj = context.active_object
        layout.prop(obj, "name")
        layout.prop(obj, "location")
```

### Class Name Convention

Panel class names use the pattern `SPACEID_PT_name`. The `_PT_` separator identifies panels (analogous to `_OT_` for operators, `_MT_` for menus, `_HT_` for headers, `_UL_` for UI lists).

### Required Attributes

| Attribute | Type | Description |
|---|---|---|
| `bl_label` | `str` | Panel header text |
| `bl_space_type` | `str` | Space where the panel appears (see table below) |
| `bl_region_type` | `str` | Region within that space (see table below) |

### Optional Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `bl_idname` | `str` | class name | Custom unique ID |
| `bl_category` | `str` | `""` | Sidebar tab name (for `bl_region_type = 'UI'`) |
| `bl_context` | `str` | `""` | Properties editor tab filter (see table below) |
| `bl_order` | `int` | `0` | Sort order — lower numbers appear first |
| `bl_parent_id` | `str` | `""` | Parent panel `bl_idname` — makes this a sub-panel |
| `bl_options` | `set` | `set()` | Panel behavior flags |
| `bl_ui_units_x` | `int` | `0` | When set, defines popup panel width |
| `bl_description` | `str` | `""` | Tooltip text |

### bl_options

| Flag | Description |
|---|---|
| `'DEFAULT_CLOSED'` | Panel starts collapsed |
| `'HIDE_HEADER'` | No collapse arrow or label — panel is always open |
| `'INSTANCED'` | Multiple instances in stacked layout (modifiers, constraints) |
| `'HEADER_LAYOUT_EXPAND'` | Header buttons stretch to fill width |

## bl_space_type Values

| Value | Editor |
|---|---|
| `'VIEW_3D'` | 3D Viewport |
| `'PROPERTIES'` | Properties editor |
| `'NODE_EDITOR'` | Node editor (Shader, Geometry, Compositor) |
| `'IMAGE_EDITOR'` | UV/Image Editor |
| `'SEQUENCE_EDITOR'` | Video Sequencer |
| `'CLIP_EDITOR'` | Movie Clip Editor |
| `'DOPESHEET_EDITOR'` | Dope Sheet |
| `'GRAPH_EDITOR'` | Graph Editor |
| `'NLA_EDITOR'` | Nonlinear Animation |
| `'TEXT_EDITOR'` | Text Editor |
| `'CONSOLE'` | Python Console |
| `'INFO'` | Info |
| `'OUTLINER'` | Outliner |
| `'FILE_BROWSER'` | File Browser |
| `'SPREADSHEET'` | Spreadsheet |
| `'PREFERENCES'` | Preferences |
| `'TOPBAR'` | Top Bar |
| `'STATUSBAR'` | Status Bar |

## bl_region_type Values

| Value | Description |
|---|---|
| `'WINDOW'` | Main area (Properties editor panels) |
| `'UI'` | Sidebar (N-panel in 3D Viewport) |
| `'TOOLS'` | Toolbar (T-panel) |
| `'HEADER'` | Header |
| `'TOOL_HEADER'` | Tool header |
| `'FOOTER'` | Footer |
| `'CHANNELS'` | Channels (Dope Sheet, Graph Editor) |
| `'TEMPORARY'` | Temporary region |
| `'PREVIEW'` | Preview |
| `'HUD'` | Floating region |
| `'NAVIGATION_BAR'` | Navigation bar |
| `'EXECUTE'` | Execute buttons |
| `'TOOL_PROPS'` | Tool properties |
| `'XR'` | XR |

## bl_context Values (Properties Editor)

When `bl_space_type = 'PROPERTIES'`, set `bl_context` to restrict which tab the panel appears on:

| Value | Tab |
|---|---|
| `"render"` | Render |
| `"output"` | Output |
| `"view_layer"` | View Layer |
| `"scene"` | Scene |
| `"world"` | World |
| `"collection"` | Collection |
| `"object"` | Object |
| `"modifier"` | Modifier |
| `"particle"` | Particle |
| `"physics"` | Physics |
| `"constraint"` | Object Constraint |
| `"data"` | Object Data (mesh, curve, etc.) |
| `"material"` | Material |
| `"texture"` | Texture |
| `"bone"` | Bone |
| `"bone_constraint"` | Bone Constraint |

## Sub-Panels

Set `bl_parent_id` to nest a panel inside another:

```python
class VIEW3D_PT_parent(bpy.types.Panel):
    bl_idname = "VIEW3D_PT_parent"
    bl_label = "Parent Panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "My Tab"

    def draw(self, context):
        self.layout.label(text="Parent content")


class VIEW3D_PT_child(bpy.types.Panel):
    bl_idname = "VIEW3D_PT_child"
    bl_label = "Child Panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "My Tab"
    bl_parent_id = "VIEW3D_PT_parent"
    bl_options = {'DEFAULT_CLOSED'}

    def draw(self, context):
        self.layout.label(text="Nested content")
```

Sub-panels inherit the parent's `bl_category` and appear indented under the parent. They can have their own `poll()`.

## Panel Methods

### draw(self, context)

Called every time the panel redraws. Use `self.layout` to add widgets:

```python
def draw(self, context):
    layout = self.layout
    layout.use_property_split = True
    layout.use_property_decorate = False
    obj = context.active_object
    layout.prop(obj, "location")
    layout.prop(obj, "rotation_euler")
```

### draw_header(self, context)

Draw widgets in the panel header (next to the collapse arrow):

```python
def draw_header(self, context):
    self.layout.prop(context.active_object, "hide_viewport", text="")
```

### draw_header_preset(self, context)

Draw preset buttons in the panel header (right side).

### poll(cls, context) → bool

Classmethod that controls panel visibility. Return `False` to hide the panel entirely:

```python
@classmethod
def poll(cls, context):
    return context.active_object and context.active_object.type == 'MESH'
```

## UILayout — Structure Methods

All structure methods return a new `UILayout` sub-layout.

### row(align=False, heading="", heading_ctxt="", translate=True)

Horizontal row. When `align=True`, widgets pack tightly without gaps:

```python
row = layout.row(align=True)
row.prop(obj, "location", index=0, text="X")
row.prop(obj, "location", index=1, text="Y")
row.prop(obj, "location", index=2, text="Z")
```

### column(align=False, heading="", heading_ctxt="", translate=True)

Vertical column:

```python
col = layout.column(align=True)
col.prop(obj, "location")
col.prop(obj, "rotation_euler")
col.prop(obj, "scale")
```

### box()

Outlined container:

```python
box = layout.box()
box.label(text="Inside a box")
box.prop(obj, "name")
```

### split(factor=0.0, align=False)

Split layout into two parts. `factor` (0.0–1.0) controls left/right width ratio (0.0 = automatic):

```python
split = layout.split(factor=0.4)
split.label(text="Label:")
split.prop(obj, "name", text="")
```

### grid_flow(row_major=False, columns=0, even_columns=False, even_rows=False, align=False)

Grid layout. `columns=0` for auto, positive for fixed count:

```python
flow = layout.grid_flow(columns=2, even_columns=True, align=True)
flow.prop(obj, "show_name")
flow.prop(obj, "show_axis")
flow.prop(obj, "show_wire")
flow.prop(obj, "show_bounds")
```

### separator(factor=1.0)

Vertical space. `factor` scales the gap size.

### separator_spacer()

Horizontal spacer — pushes adjacent items apart (useful in headers).

## UILayout — Widget Methods

### label(text="", icon='NONE', icon_value=0)

Static text label:

```python
layout.label(text="Hello", icon='INFO')
```

### prop(data, property, ...)

Draw a property widget:

```python
layout.prop(obj, "name")                        # text field
layout.prop(obj, "location")                     # XYZ vector
layout.prop(obj, "location", index=0, text="X")  # single axis
layout.prop(obj, "hide_viewport", toggle=True)   # toggle button
layout.prop(obj, "type", expand=True)            # expanded enum
layout.prop(obj, "scale", slider=True)           # slider
layout.prop(obj, "hide_render", icon_only=True)  # icon only
```

Key parameters:

| Parameter | Type | Default | Description |
|---|---|---|---|
| `text` | `str` | `""` | Override label (empty = auto from property name) |
| `icon` | `str` | `'NONE'` | Icon identifier |
| `expand` | `bool` | `False` | Expand enum/set as separate buttons |
| `slider` | `bool` | `False` | Slider widget for numbers |
| `toggle` | `int` | `-1` | -1 = auto, 0 = checkbox, 1 = toggle button |
| `icon_only` | `bool` | `False` | Show only icon, no text |
| `index` | `int` | `-1` | Array index (-1 = all elements) |
| `icon_value` | `int` | `0` | Custom icon integer |
| `invert_checkbox` | `bool` | `False` | Invert boolean display |
| `emboss` | `bool` | `True` | Draw embossed |

### operator(operator, text="", icon='NONE', ...) → OperatorProperties

Draw an operator button. Returns `OperatorProperties` to set pre-filled values:

```python
layout.operator("mesh.primitive_cube_add", text="Add Cube", icon='MESH_CUBE')

props = layout.operator("transform.translate")
props.value = (1.0, 0.0, 0.0)
```

Key parameters: `text`, `icon`, `emboss` (bool), `depress` (bool), `icon_value` (int).

### menu(menu, text="", icon='NONE', icon_value=0)

Draw a drop-down menu button:

```python
layout.menu("VIEW3D_MT_add", text="Add", icon='ADD')
```

### prop_enum(data, property, value, text="", icon='NONE')

Single enum value button:

```python
layout.prop_enum(obj, "type", 'MESH', text="Mesh")
layout.prop_enum(obj, "type", 'CURVE', text="Curve")
```

## UILayout — Display Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `enabled` | `bool` | `True` | Grayed-out when `False` |
| `active` | `bool` | `True` | Dim appearance when `False` |
| `alert` | `bool` | `False` | Red highlight |
| `alignment` | `str` | `'EXPAND'` | `'EXPAND'`, `'LEFT'`, `'CENTER'`, `'RIGHT'` |
| `scale_x` | `float` | `0.0` | Horizontal scale factor |
| `scale_y` | `float` | `0.0` | Vertical scale factor |
| `use_property_split` | `bool` | `False` | Label-value split layout |
| `use_property_decorate` | `bool` | `False` | Keyframe decorator buttons |
| `emboss` | `str` | `'NORMAL'` | `'NORMAL'`, `'NONE'`, `'PULLDOWN_MENU'`, `'PIE_MENU'`, `'NONE_OR_STATUS'` |
| `operator_context` | `str` | `'INVOKE_DEFAULT'` | Execution context for operator buttons |

### use_property_split

Enables label-value split layout (standard for Properties editor panels):

```python
def draw(self, context):
    layout = self.layout
    layout.use_property_split = True
    layout.use_property_decorate = False
    obj = context.active_object
    layout.prop(obj, "location")  # label "Location" on left, XYZ fields on right
```

## Common Patterns

### Sidebar Panel with Multiple Sections

```python
import bpy

class VIEW3D_PT_object_info(bpy.types.Panel):
    bl_idname = "VIEW3D_PT_object_info"
    bl_label = "Object Info"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "Item"

    @classmethod
    def poll(cls, context):
        return context.active_object is not None

    def draw(self, context):
        layout = self.layout
        layout.use_property_split = True
        layout.use_property_decorate = False
        obj = context.active_object

        col = layout.column(align=True)
        col.prop(obj, "name")
        col.prop(obj, "type", text="Type")

        layout.separator()

        col = layout.column(align=True)
        col.prop(obj, "location")
        col.prop(obj, "rotation_euler")
        col.prop(obj, "scale")

        layout.separator()

        row = layout.row(align=True)
        row.operator("object.location_clear", text="Clear Loc")
        row.operator("object.rotation_clear", text="Clear Rot")
        row.operator("object.scale_clear", text="Clear Scale")


def register():
    bpy.utils.register_class(VIEW3D_PT_object_info)

def unregister():
    bpy.utils.unregister_class(VIEW3D_PT_object_info)
```

### Properties Editor Panel with Header Toggle

```python
import bpy

class OBJECT_PT_custom_settings(bpy.types.Panel):
    bl_idname = "OBJECT_PT_custom_settings"
    bl_label = "Custom Settings"
    bl_space_type = 'PROPERTIES'
    bl_region_type = 'WINDOW'
    bl_context = "object"

    @classmethod
    def poll(cls, context):
        return context.active_object is not None

    def draw_header(self, context):
        obj = context.active_object
        self.layout.prop(obj, "hide_viewport", text="")

    def draw(self, context):
        layout = self.layout
        layout.use_property_split = True
        obj = context.active_object
        layout.active = not obj.hide_viewport
        layout.prop(obj, "display_type")
        layout.prop(obj, "show_name")
        layout.prop(obj, "color")


def register():
    bpy.utils.register_class(OBJECT_PT_custom_settings)

def unregister():
    bpy.utils.unregister_class(OBJECT_PT_custom_settings)
```

### Conditional Layout with Enabled/Active

```python
def draw(self, context):
    layout = self.layout
    obj = context.active_object

    row = layout.row()
    row.prop(obj, "show_wire")

    sub = layout.column()
    sub.active = obj.show_wire
    sub.prop(obj, "show_all_edges")

    row = layout.row()
    row.enabled = context.mode == 'OBJECT'
    row.operator("object.shade_smooth")
```

## Gotchas

1. **poll() must be a classmethod** — forgetting `@classmethod` causes a registration error.

2. **bl_category is ignored without `bl_region_type = 'UI'`** — sidebar tabs only apply to the UI region (N-panel). Other regions ignore `bl_category`.

3. **Properties editor requires bl_context** — without `bl_context`, a panel in `PROPERTIES` / `WINDOW` appears on every tab, cluttering the entire Properties editor.

4. **draw() is called frequently** — avoid expensive computations in `draw()`. Cache results on the object or use a timer. The draw method runs on every UI redraw (mouse hover, value change, etc.).

5. **layout.prop() auto-generates labels** — passing `text=""` suppresses the label. Omitting `text` entirely uses the property's RNA name. This is different from passing `text="custom"` which overrides it.

6. **Sub-panel bl_space_type/bl_region_type must match parent** — if they differ from the parent panel, the sub-panel silently fails to appear.

7. **use_property_split propagates to sub-layouts** — once set on a parent layout, all children inherit it. Set `use_property_split = False` on a sub-layout to override.
