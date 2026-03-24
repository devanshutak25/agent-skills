# Advanced UI Layout

Advanced UILayout templates, UIList for scrollable item lists, custom icon previews, dynamic enum callbacks, popovers, and pie menus. See [panels-ui.md](panels-ui.md) for basic panel/layout fundamentals; see [bpy-props.md](bpy-props.md) for property definitions.

## prop_search

Search field that auto-completes from a collection property:

```python
UILayout.prop_search(
    data,                   # RNA object containing the property
    property,               # str — property name to set
    search_data,            # RNA object containing the search collection
    search_property,        # str — collection property name to search
    text="",                # str — override label
    icon='NONE',            # str — icon identifier
    results_are_suggestions=False  # bool — accept values not in collection
)
```

```python
def draw(self, context):
    layout = self.layout
    obj = context.active_object
    # Search vertex groups by name
    layout.prop_search(obj, "vertex_groups_active", obj, "vertex_groups")
    # Search bone names from armature
    arm = context.active_object.data
    layout.prop_search(self, "bone_name", arm, "bones", icon='BONE_DATA')
```

## template_ID

Standard data-block selector with browse, new, and unlink buttons:

```python
UILayout.template_ID(
    data,                   # RNA data containing the property
    property,               # str — ID property identifier
    new="",                 # str — operator for creating new (e.g., "material.new")
    open="",                # str — operator for opening/browsing
    unlink="",              # str — operator for unlinking
    filter='ALL',           # str — ID type filter
    live_icon=False,        # bool — show live icon preview
    text="",                # str — override label
)
```

```python
def draw(self, context):
    layout = self.layout
    obj = context.active_object
    layout.template_ID(obj, "active_material", new="material.new")
    layout.template_ID(context.space_data, "image", open="image.open")
```

### template_ID_preview

Like `template_ID` but with a large icon grid preview:

```python
layout.template_ID_preview(obj, "active_material", new="material.new", rows=4, cols=6)
```

## template_list

Scrollable list widget driven by a `UIList` subclass:

```python
UILayout.template_list(
    listtype_name,          # str — bl_idname of UIList subclass
    list_id="",             # str — unique ID (for multiple lists in same panel)
    dataptr,                # RNA object containing the collection
    propname,               # str — collection property name
    active_dataptr,         # RNA object containing the active index
    active_propname,        # str — active index property name
    item_dyntip_propname="",# str — property name for dynamic tooltips
    rows=5,                 # int — default visible rows
    maxrows=5,              # int — maximum visible rows
    type='DEFAULT',         # str — 'DEFAULT', 'COMPACT', 'GRID'
    columns=9,              # int — grid columns (DEPRECATED)
    sort_reverse=False,     # bool — default reverse sort
    sort_lock=False,        # bool — lock sort order
)
```

> **5.1:** The `columns` parameter is deprecated and has been ineffective since 5.0.

### UIList Subclass

Subclass `bpy.types.UIList` to control how each item draws. Class names use the `_UL_` separator:

```python
class MY_UL_material_list(bpy.types.UIList):
    bl_idname = "MY_UL_material_list"

    def draw_item(self, context, layout, data, item, icon, active_data, active_propname, index=0, flt_flag=0):
        mat = item
        if self.layout_type in {'DEFAULT', 'COMPACT'}:
            row = layout.row(align=True)
            row.prop(mat, "name", text="", emboss=False, icon_value=icon)
            row.prop(mat, "diffuse_color", text="")
        elif self.layout_type == 'GRID':
            layout.alignment = 'CENTER'
            layout.label(text="", icon_value=icon)
```

#### draw_item Parameters

| Parameter | Type | Description |
|---|---|---|
| `context` | `Context` | Current context |
| `layout` | `UILayout` | Layout to draw into |
| `data` | `AnyType` | RNA object containing the collection |
| `item` | `AnyType` | Current collection item |
| `icon` | `int` | Computed icon value for this item |
| `active_data` | `AnyType` | RNA object containing active index |
| `active_propname` | `str` | Active index property name |
| `index` | `int` | Item index in collection |
| `flt_flag` | `int` | Filter result bitflag for this item |

### UIList Filtering

Override `filter_items()` for custom filtering and sorting:

```python
class MY_UL_filtered_objects(bpy.types.UIList):
    bl_idname = "MY_UL_filtered_objects"

    def draw_item(self, context, layout, data, item, icon, active_data, active_propname):
        layout.prop(item, "name", text="", emboss=False, icon='OBJECT_DATA')

    def filter_items(self, context, data, propname):
        items = getattr(data, propname)
        flt_flags = [0] * len(items)
        flt_neworder = []

        # Show only mesh objects
        for i, item in enumerate(items):
            if item.type == 'MESH':
                flt_flags[i] |= self.bitflag_filter_item

        # Sort alphabetically
        flt_neworder = bpy.types.UIList.sort_items_helper(
            [(i, item.name) for i, item in enumerate(items)],
            key=lambda x: x[1].lower(),
        )

        return flt_flags, flt_neworder

    def draw_filter(self, context, layout):
        row = layout.row(align=True)
        row.prop(self, "filter_name", text="", icon='VIEWZOOM')
        row.prop(self, "use_filter_invert", text="", icon='ARROW_LEFTRIGHT')
```

#### filter_items Return Format

Returns a tuple `(flt_flags, flt_neworder)`:
- `flt_flags`: `list[int]` — same length as collection. Set `self.bitflag_filter_item` bit to show an item.
- `flt_neworder`: `list[int]` — mapping `original_index → new_index`, or empty list for no reorder.

#### Built-in Helper Methods

```python
# Filter by name (static method)
UIList.filter_items_by_name(pattern, bitflag, items, propname='name', flags=None, reverse=False)

# Sort by name (class method)
UIList.sort_items_by_name(items, propname='name')

# Generic sort helper (static method)
UIList.sort_items_helper(sort_data, key, reverse=False)
```

### Using template_list

```python
def draw(self, context):
    layout = self.layout
    obj = context.active_object

    row = layout.row()
    row.template_list(
        "MY_UL_material_list", "",
        obj, "material_slots",
        obj, "active_material_index",
    )

    col = row.column(align=True)
    col.operator("object.material_slot_add", icon='ADD', text="")
    col.operator("object.material_slot_remove", icon='REMOVE', text="")
```

## Custom Previews (icon_value)

Custom icons are loaded through `bpy.utils.previews`:

```python
import os
import bpy.utils.previews

preview_collections = {}

def register():
    pcoll = bpy.utils.previews.new()
    icons_dir = os.path.join(os.path.dirname(__file__), "icons")
    pcoll.load("my_icon", os.path.join(icons_dir, "custom.png"), 'IMAGE')
    preview_collections["main"] = pcoll

def unregister():
    for pcoll in preview_collections.values():
        bpy.utils.previews.remove(pcoll)
    preview_collections.clear()
```

### Using Custom Icons

Access `icon_id` from the loaded preview and pass it as `icon_value`:

```python
def draw(self, context):
    pcoll = preview_collections["main"]
    icon = pcoll["my_icon"]
    layout = self.layout
    layout.label(text="Custom Icon", icon_value=icon.icon_id)
    layout.operator("my.operator", icon_value=icon.icon_id)
```

### ImagePreviewCollection API

```python
pcoll = bpy.utils.previews.new()                        # create collection
preview = pcoll.load(name, filepath, filetype)           # load from file
preview = pcoll.new(name)                                # create empty preview
pcoll.clear()                                            # clear all previews
pcoll.close()                                            # close and clear
bpy.utils.previews.remove(pcoll)                         # remove collection
```

`filetype`: `'IMAGE'`, `'MOVIE'`, `'BLEND'`, `'FONT'`

`ImagePreview` properties: `icon_id` (int, read-only), `icon_size` (tuple), `icon_pixels` (flat RGBA list), `image_size` (tuple), `image_pixels` (flat RGBA list).

### template_icon and template_icon_view

```python
# Display large static icon
layout.template_icon(icon_value=preview.icon_id, scale=2.0)

# Grid of icons from an EnumProperty
layout.template_icon_view(data, "my_enum_prop", show_labels=False, scale=6.0, scale_popup=5.0)
```

## Dynamic Enum Callbacks

`EnumProperty` accepts a callable for `items` that generates choices at runtime:

```python
_enum_items = []  # module-level reference — REQUIRED

def get_object_items(self, context):
    _enum_items.clear()
    for obj in bpy.data.objects:
        _enum_items.append((obj.name, obj.name, f"Select {obj.name}", 'OBJECT_DATA', hash(obj.name) & 0x7FFFFFFF))
    return _enum_items

class MY_PG_settings(bpy.types.PropertyGroup):
    target: bpy.props.EnumProperty(
        name="Target Object",
        items=get_object_items,
    )
```

### Callback Signature

```python
def items_func(self, context) -> list[tuple]:
```

Each tuple is one of:
- **3-tuple**: `(identifier, name, description)`
- **4-tuple**: `(identifier, name, description, number)`
- **5-tuple**: `(identifier, name, description, icon, number)`

`icon` can be a string (`'OBJECT_DATA'`) or an `int` (custom `icon_value`). `number` is a unique integer per item. Use `None` or `""` as a list entry to create a separator.

**Critical**: the callback must keep a persistent reference to the returned list. If the list is garbage-collected, Blender accesses freed memory and crashes. Always use a module-level list variable and `.clear()` + `.append()` on it.

## Popover

A popover shows a panel in a floating popup:

```python
layout.popover(
    panel,                  # str — bl_idname of the Panel
    text="",                # str — button label
    icon='NONE',            # str — icon
    icon_value=0,           # int — custom icon
)
```

```python
def draw(self, context):
    layout = self.layout
    layout.popover(panel="VIEW3D_PT_shading_options", text="Shading")
```

The referenced panel must be a registered `bpy.types.Panel` subclass. Its `draw()` output appears in the floating popover.

## Pie Menus

Pie menus radiate items from a center point. Define a `Menu` subclass and use `layout.menu_pie()`:

```python
class VIEW3D_MT_add_pie(bpy.types.Menu):
    bl_idname = "VIEW3D_MT_add_pie"
    bl_label = "Add Primitives"

    def draw(self, context):
        pie = self.layout.menu_pie()
        # Items placed in order: West, East, South, North, NW, NE, SW, SE
        pie.operator("mesh.primitive_cube_add", text="Cube", icon='MESH_CUBE')
        pie.operator("mesh.primitive_uv_sphere_add", text="Sphere", icon='MESH_UVSPHERE')
        pie.operator("mesh.primitive_cylinder_add", text="Cylinder", icon='MESH_CYLINDER')
        pie.operator("mesh.primitive_cone_add", text="Cone", icon='MESH_CONE')
        pie.operator("mesh.primitive_plane_add", text="Plane", icon='MESH_PLANE')
        pie.operator("mesh.primitive_circle_add", text="Circle", icon='MESH_CIRCLE')
        pie.operator("mesh.primitive_torus_add", text="Torus", icon='MESH_TORUS')
        pie.operator("mesh.primitive_ico_sphere_add", text="Ico", icon='MESH_ICOSPHERE')
```

Call the pie menu from an operator or keymap:

```python
bpy.ops.wm.call_menu_pie(name="VIEW3D_MT_add_pie")
```

Pie menu item order is positional: West(1), East(2), South(3), North(4), NW(5), NE(6), SW(7), SE(8). Items beyond 8 appear in a sub-menu.

## Common Patterns

### Scrollable List with Add/Remove Buttons

```python
import bpy

class MY_UL_items(bpy.types.UIList):
    bl_idname = "MY_UL_items"

    def draw_item(self, context, layout, data, item, icon, active_data, active_propname):
        row = layout.row(align=True)
        row.prop(item, "name", text="", emboss=False)
        row.prop(item, "enabled", text="", icon='CHECKBOX_HLT' if item.enabled else 'CHECKBOX_DEHLT')


class VIEW3D_PT_list_demo(bpy.types.Panel):
    bl_idname = "VIEW3D_PT_list_demo"
    bl_label = "List Demo"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "Demo"

    def draw(self, context):
        layout = self.layout
        scene = context.scene

        row = layout.row()
        row.template_list("MY_UL_items", "", scene, "objects", scene, "my_active_index", rows=4)

        col = row.column(align=True)
        col.operator("my.list_add", icon='ADD', text="")
        col.operator("my.list_remove", icon='REMOVE', text="")
        col.separator()
        col.operator("my.list_move_up", icon='TRIA_UP', text="")
        col.operator("my.list_move_down", icon='TRIA_DOWN', text="")
```

### Dynamic Enum with Previews in Icon View

```python
import bpy
import os
import bpy.utils.previews

preview_collections = {}
_style_items = []

def get_style_items(self, context):
    pcoll = preview_collections.get("styles")
    if pcoll is None:
        return []
    _style_items.clear()
    icons_dir = os.path.join(os.path.dirname(__file__), "style_icons")
    for i, name in enumerate(("Modern", "Classic", "Rustic")):
        filename = f"{name.lower()}.png"
        filepath = os.path.join(icons_dir, filename)
        if name not in pcoll:
            pcoll.load(name, filepath, 'IMAGE')
        _style_items.append((name.upper(), name, f"{name} style", pcoll[name].icon_id, i))
    return _style_items

class MY_PG_props(bpy.types.PropertyGroup):
    style: bpy.props.EnumProperty(name="Style", items=get_style_items)

class VIEW3D_PT_style_picker(bpy.types.Panel):
    bl_idname = "VIEW3D_PT_style_picker"
    bl_label = "Style Picker"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "Styles"

    def draw(self, context):
        layout = self.layout
        props = context.scene.my_props
        layout.template_icon_view(props, "style", show_labels=True, scale=5.0)
        layout.prop(props, "style", text="Active")

def register():
    pcoll = bpy.utils.previews.new()
    preview_collections["styles"] = pcoll
    bpy.utils.register_class(MY_PG_props)
    bpy.utils.register_class(VIEW3D_PT_style_picker)
    bpy.types.Scene.my_props = bpy.props.PointerProperty(type=MY_PG_props)

def unregister():
    del bpy.types.Scene.my_props
    bpy.utils.unregister_class(VIEW3D_PT_style_picker)
    bpy.utils.unregister_class(MY_PG_props)
    for pcoll in preview_collections.values():
        bpy.utils.previews.remove(pcoll)
    preview_collections.clear()
```

## Gotchas

1. **Dynamic enum callback must retain references** — if the returned list is garbage-collected, Blender crashes. Always use a module-level list cleared and repopulated each call.

2. **UIList.filter_items must return two lists** — `flt_flags` must be the same length as the collection. An empty or wrong-length list causes a crash or silent failure.

3. **template_list type='GRID' columns parameter is deprecated** — the `columns` parameter was ineffective since 5.0 and is formally deprecated in 5.1. Grid layout auto-calculates columns.

4. **draw_filter vs draw_filter_item** — the method name is `draw_filter`, not `draw_filter_item`. Using the wrong name silently falls back to the default filter UI.

5. **Custom previews must be cleaned up** — call `bpy.utils.previews.remove(pcoll)` in `unregister()`. Leaked preview collections persist in memory and accumulate across addon reloads.

6. **Pie menu item order matters** — items are placed by index (W, E, S, N, NW, NE, SW, SE). Skipping positions requires inserting an empty `pie.separator()`. Using more than 8 items causes overflow to a sub-menu.

7. **popover() panel must have matching bl_space_type** — if the popover panel's `bl_space_type` doesn't match the calling context, the popover appears empty.
