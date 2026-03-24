# Selectors

## Table of Contents
- [Overview](#overview)
- [Selection Approaches](#selection-approaches)
- [Manual Scripted Selection (Tool Script)](#manual-scripted-selection)
- [Bound Geometry Selectors](#bound-geometry-selectors)
- [Bound Object Selectors](#bound-object-selectors)
- [Bound Drawable Selectors](#bound-drawable-selectors)
- [Multiple Selectors](#multiple-selectors)
- [Volatile Selection](#volatile-selection)
- [Existing Selection on Enter](#existing-selection-on-enter)
- [Secure Selection](#secure-selection)
- [Selection Modifiers](#selection-modifiers)

---

## Overview

Many SOP tools need the user to select geometry components (points, edges, prims) before or
during operation. Houdini provides several mechanisms for this, ranging from shelf tool scripts
that prompt for selection before creating the node, to persistent selectors that run while 
the state is active.

---

## Selection Approaches

| Approach | Best For | Notes |
|----------|----------|-------|
| Manual scripted (tool script) | Multi-step selection, complex workflows | Traditional Houdini pattern. Strongly recommended by SideFX. |
| Bound geometry selector | Single-type selection during state | Persistent, calls `onSelection()` |
| Bound object selector | OBJ-level object picking | For OBJ context states |
| Bound drawable selector | Selecting guide/drawable geometry | For custom interactive UIs |
| Volatile selection | Reusing Houdini's select state | No selector binding needed |

---

## Manual Scripted Selection

The traditional Houdini pattern: a shelf tool script prompts for selections, creates the node,
then enters the state. The state itself just handles display/manipulation.

Use this when:
- You need multiple selection steps (e.g., "select curves" then "select points")
- You need to inspect the selection before creating the node
- You want the most compatible, well-tested workflow

```python
# Shelf tool script
import stateutils
import soptoolutils

pane = stateutils.activePane()
if isinstance(pane, hou.SceneViewer):
    source = stateutils.Selector(
        name="select_polys",
        geometry_types=[hou.geometryType.Primitives],
        prompt="Select primitive(s) to copy, then press Enter",
        primitive_types=[hou.primType.Polygon],
        group_parm_name="sourcegroup",
        input_index=0,
        input_required=True,
    )
    target = stateutils.Selector(
        name="select_points",
        geometry_types=[hou.geometryType.Points],
        prompt="Select points to copy onto, then press Enter",
        group_parm_name="targetgroup",
        input_index=1,
        input_required=True,
    )

    container, selections = stateutils.runSelectors(
        pane, [source, target], allow_obj_selection=True
    )
    newnode = stateutils.createFilterSop(
        kwargs, "$HDA_NAME", container, selections
    )
    pane.enterCurrentNodeState()
else:
    soptoolutils.genericTool(kwargs, "$HDA_NAME")
```

---

## Bound Geometry Selectors

Bind a selector that runs persistently when your SOP state is active. When the user completes
a selection, `onSelection()` is called.

### Registration
```python
def createViewerStateTemplate():
    template = hou.ViewerStateTemplate("mystate", "My State", hou.sopNodeTypeCategory())
    template.bindFactory(State)
    
    template.bindGeometrySelector(
        name="my_selector",
        prompt="Select polygons, then press Enter",
        quick_select=False,             # True = accept on single click
        use_existing_selection=True,     # Use pre-existing selection if any
        geometry_types=[hou.geometryType.Primitives],
        primitive_types=[hou.primType.Polygon],
        allow_other_sops=False           # Restrict to current node's geometry
    )
    
    return template
```

### Handler
```python
def onSelection(self, kwargs):
    selection = kwargs["selection"]  # hou.GeometrySelection
    sel_name = kwargs["name"]        # "my_selector"
    
    geo_type = selection.geometryType()
    selections = selection.selections()  # list of hou.Selection objects
    if selections:
        count = selections[0].numSelected()
        
    # Return True to accept and enter regular operation
    # Return False to reject and keep selecting
    return count > 0
```

### Limitations
- A Python state can only accept a **single type** of geometry selection per bound selector
- For multi-type selection workflows (curves then points), use manual scripted selection

---

## Bound Object Selectors

For OBJ-level states that need the user to pick objects.

```python
def createViewerStateTemplate():
    template = hou.ViewerStateTemplate("mystate", "My State", hou.objNodeTypeCategory())
    template.bindFactory(State)
    
    template.bindObjectSelector(
        prompt="Select camera object(s) and press Enter",
        quick_select=False,
        use_existing_selection=True,
        allowed_types=('*cam*',)  # Filter by node type pattern
    )
    
    return template

# Handler
def onSelection(self, kwargs):
    cameras = kwargs["selection"]  # list of hou.OpNode objects
    return len(cameras) > 0
```

---

## Bound Drawable Selectors

Select components of drawables (guide geometry) rather than scene geometry.

```python
def createViewerStateTemplate():
    template = hou.ViewerStateTemplate(...)
    template.bindFactory(State)
    
    template.bindDrawableSelector(
        name="guide_selector",
        prompt="Select guide geometry components",
        quick_select=True,
        geometry_types=[hou.geometryType.Points],
        drawable_mask=["my_drawable_name"]  # Which drawables to select from
    )
    
    return template
```

Drawable selectors support standard Houdini selection tools (box, lasso, etc.).

### Drawable Selection Format
When `onSelection` fires for a drawable selector, the selection object contains references
to the drawable and its selected components.

---

## Multiple Selectors

You can bind multiple selectors and trigger them individually:

```python
def createViewerStateTemplate():
    template = hou.ViewerStateTemplate(...)
    
    template.bindGeometrySelector(name="selector1", prompt="First selection...", ...)
    template.bindGeometrySelector(name="selector2", prompt="Second selection...", ...)
    
    return template

# In your state class
def some_method(self):
    # Start a specific selector
    self.scene_viewer.triggerStateSelector("selector2")
    
def onSelection(self, kwargs):
    name = kwargs["name"]
    if name == "selector1":
        # handle first selection
        pass
    elif name == "selector2":
        # handle second selection
        pass
    return True
```

---

## Volatile Selection

Volatile selection uses Houdini's built-in select state (S key) without binding any selectors.
Just implement `onSelection` — when the user finishes selecting (taps S again), your handler
is called.

```python
class State(object):
    def __init__(self, state_name, scene_viewer):
        self.state_name = state_name
        self.scene_viewer = scene_viewer
    
    def onSelection(self, kwargs):
        selection = kwargs["selection"]
        # Process the volatile selection
        return True
```

Note: `onStartSelection` and `onStopSelection` do NOT fire for volatile selections — they're
only for bound selectors.

---

## Existing Selection on Enter

If geometry is already selected when your state activates, Houdini passes it to `onSelection`
automatically and consumes the selection.

To opt into this, set `use_existing_selection=True` when binding your selector.

---

## Secure Selection

Controls whether the selector respects the viewport's "secure selection" toggle:

| Mode | Behavior |
|------|----------|
| `hou.secureSelectionOption.Obey` | Selector follows viewport setting (default) |
| `hou.secureSelectionOption.Off` | Selector turns off secure selection while active; restores on exit |
| `hou.secureSelectionOption.Ignore` | Selector ignores secure selection entirely |

When secure selection is **on**, the selector is passive — users can't change the selection.
When **off**, users can freely select.

---

## Selection Modifiers

Your state can react to selection modifiers (Add, Toggle, Remove) from the Select tool menu.
Use `viewerstate.utils.DrawableSelectorColors` for standard Houdini modifier colors:

```python
import viewerstate.utils as su

# Get standard colors for the current modifier
colors = su.DrawableSelectorColors()
# Use colors.locate_color, colors.select_color, etc.
```

<!-- PLACEHOLDER: Expand with more modifier handling patterns -->
