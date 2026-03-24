# COP (Copernicus) & LOP Viewer States

> **Note**: This file is intentionally placeholder-heavy. COP and LOP viewer states are newer
> features with less community documentation. Expand these sections as you gain hands-on
> experience and as SideFX publishes more detailed guides.

## Table of Contents
- [COP (Copernicus) States](#cop-copernicus-states)
- [COP Limitations](#cop-limitations)
- [COP Registration](#cop-registration)
- [Drawable2D](#drawable2d)
- [LOP States](#lop-states)
- [Cross-Context Patterns](#cross-context-patterns)

---

## COP (Copernicus) States

Copernicus Python states run in both the **Compositing Viewer** and the **Scene Viewer**.
You write a single state, and Houdini uses the same code in both contexts.

### Key Principle
- Define COP states with `hou.copNodeTypeCategory()`
- This lets the state instantiate as a COP state in the Compositor and a SOP state in the 
  Scene Viewer
- **Author and test COP states in the Composite Viewer first**, then verify they work 
  in the Scene Viewer

---

## COP Limitations

COP states have significant restrictions compared to SOP/OBJ states:

| Feature | Available? |
|---------|-----------|
| Scene geometry access | ❌ No |
| Geometry selection | ❌ No |
| SOP geometry verbs | ❌ No |
| `hou.GeometryDrawable` | ❌ No |
| `hou.SimpleDrawable` | ❌ No |
| `hou.Drawable2D` | ✅ Yes |
| Viewport flipbooking | ❌ No |
| Snapping | ❌ No |
| `beginStateUndo` / `endStateUndo` | ❌ No |
| Viewport message prompts | ❌ No |
| Mouse/keyboard events | ✅ Yes |
| Context menus | ✅ Yes |
| Handles | ✅ Yes (with COP-specific handle types) |

The main drawing primitive for COP states is `hou.Drawable2D`.

---

## COP Registration

```python
import hou
import viewerstate.utils as su

class State(object):
    def __init__(self, state_name, scene_viewer):
        self.state_name = state_name
        self.scene_viewer = scene_viewer
    
    def onMouseEvent(self, kwargs):
        ui_event = kwargs["ui_event"]
        # For COP states, ui_event may be a hou.CompositorViewerEvent
        # instead of hou.ViewerEvent
        return False

def createViewerStateTemplate():
    state_typename = "my_cop_state"
    state_label = "My COP State"
    state_cat = hou.copNodeTypeCategory()  # COP category
    
    template = hou.ViewerStateTemplate(state_typename, state_label, state_cat)
    template.bindFactory(State)
    template.bindIcon("MISC_python")
    return template
```

### COP Event Differences
In COP context, `kwargs["ui_event"]` may be a `hou.CompositorViewerEvent` instead of 
`hou.ViewerEvent`. Be aware of this when accessing event properties.

---

## Drawable2D

The primary drawing API for COP states. Also works in the Scene Viewer.

```python
# Basic 2D drawable usage
self._drawable2d = hou.Drawable2D(
    self.scene_viewer,
    self.state_name + "_2d"
)
```

<!-- PLACEHOLDER: Expand with Drawable2D API details -->
<!-- Areas to document:
     - Creating and configuring 2D drawables
     - Coordinate systems (screen space vs UV space)
     - Drawing shapes, lines, text in 2D
     - Dragger2D for 2D dragging interactions
     - Integration with COP node parameters
-->

### COP Python Handle Draggers
For COP handles, use `drawable2d.Dragger2D` instead of `hou.ViewerHandleDragger`:

```python
# In a COP Python handle
from drawable2d import Dragger2D

# Use Dragger2D for 2D parameter manipulation
```

<!-- PLACEHOLDER: Expand with Dragger2D usage patterns -->

---

## LOP States

LOP (Solaris/USD) viewer states work at the LOP network level for USD scene interaction.

### Registration
```python
def createViewerStateTemplate():
    state_typename = "my_lop_state"
    state_label = "My LOP State"
    state_cat = hou.lopNodeTypeCategory()  # LOP category
    
    template = hou.ViewerStateTemplate(state_typename, state_label, state_cat)
    template.bindFactory(State)
    return template
```

<!-- PLACEHOLDER: Expand with LOP-specific details -->
<!-- Areas to document:
     - USD stage interaction from viewer states
     - LOP-specific event handling
     - Scene graph selection vs geometry selection
     - LOP handle types
     - Interaction with Solaris viewport
     - LOP state examples
-->

---

## Cross-Context Patterns

### DOP States
DOP (dynamics) states work similarly to SOP states:
```python
state_cat = hou.dopNodeTypeCategory()
```

<!-- PLACEHOLDER: Document DOP-specific patterns if needed -->

### Context Detection
If your state needs to behave differently based on context:
```python
def onEnter(self, kwargs):
    viewport = self.scene_viewer.curViewport()
    # Check viewport type or node context
```

---

## Future Expansion Notes

Areas to expand as documentation and experience grows:

- [ ] Drawable2D full API reference
- [ ] COP handle parameter patterns
- [ ] LOP scene graph interaction from states
- [ ] LOP USD stage manipulation examples
- [ ] Cross-viewer (Compositor ↔ Scene) state behavior differences
- [ ] DOP state patterns for dynamics tools
- [ ] COP state performance considerations
- [ ] Real-world COP/LOP state examples
