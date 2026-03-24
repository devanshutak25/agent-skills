---
name: houdini-viewport-states
description: >
  Write, edit, update, and improve Python viewer state code for Houdini 21.0.
  Use this skill whenever the user mentions Houdini viewer states, Python states,
  viewport interaction, custom handles in Houdini, guide geometry, geometry drawables,
  viewport selectors, HDA state scripts, nodeless states, onMouseEvent in Houdini,
  or any task involving Python-driven viewport interactivity in SideFX Houdini.
  Also trigger when the user references SOP/OBJ/DOP/LOP/COP state code, 
  hou.ViewerStateTemplate, state registration, onHandleToState, onSelection,
  or asks to build interactive tools for Houdini's 3D viewport. Even if they
  just say "write me a Houdini state" or "I need viewport interaction code",
  use this skill.
---

# Houdini Python Viewport States

This skill helps you write, edit, and improve Python viewer state code for Houdini 21.0.

## What are Python Viewer States?

A viewer state controls how Houdini interprets mouse movements, clicks, keys, and other input
in the 3D viewport. Every interactive tool in Houdini (Rotate, Translate, the Handles tool) is
a viewer state. Houdini lets you create custom viewer states in Python to build your own
interactive viewport tools.

A custom state can:
- Display and respond to handles for parameter editing
- Respond to mouse, keyboard, and tablet events
- Display guide geometry (drawables, gadgets)
- Let users select geometry components
- Show context menus and info panels (HUD)
- Wrap actions in undo blocks
- Work with or without a specific node (nodeless states)

Available contexts: **SOP**, **OBJ**, **DOP**, **COP** (Copernicus), and **LOP**.

## How to Use This Skill

Before writing any code, read the relevant reference file(s) from the `references/` directory
based on what the user needs. Use this decision tree:

### What does the user need?

1. **Creating a new state from scratch**
   → Read `references/state-registration.md` first (for boilerplate and structure)
   → Then read whichever feature references apply to their use case

2. **Adding/editing event handling** (mouse, keyboard, tablet)
   → Read `references/event-handlers.md`

3. **Adding/editing guide geometry or drawables**
   → Read `references/drawables-and-guides.md`

4. **Adding/editing handles** (built-in or Python handles)
   → Read `references/handles.md`

5. **Adding/editing selection behavior**
   → Read `references/selectors.md`

6. **Adding/editing context menus, hotkeys, or info panels**
   → Read `references/menus-and-info.md`

7. **Migrating file-based state → HDA-embedded**
   → Read `references/state-registration.md` (migration section)

8. **Undo support, debugging, or architectural patterns**
   → Read `references/patterns.md`

9. **COP (Copernicus) or LOP state specifics**
   → Read `references/cop-lop-states.md`

Multiple references will often be needed for a single task. For example, building a brush tool
would require `state-registration.md` + `event-handlers.md` + `drawables-and-guides.md` + 
`patterns.md` (for undo).

## Core Principles When Writing State Code

### Structure
Every viewer state consists of two parts:
1. **A state class** — implements behavior via event handler methods
2. **A `createViewerStateTemplate()` function** — registers the state with Houdini, binding
   handles, selectors, menus, gadgets, and hotkeys to the state template

### State Class Pattern
```python
import hou
import viewerstate.utils as su

class State(object):
    def __init__(self, state_name, scene_viewer):
        self.state_name = state_name
        self.scene_viewer = scene_viewer
    
    # Event handlers go here (onEnter, onMouseEvent, etc.)
```

### Key Rules
- The `__init__` receives `state_name` (string) and `scene_viewer` (hou.SceneViewer)
- You do NOT have access to the node in `__init__` — use `onEnter(kwargs)` where
  `kwargs["node"]` is available
- Event handlers receive a single `kwargs` dict containing context-specific items
- Return `True` from input event handlers to consume the event (stops propagation)
- Return `False` (default) to let the event continue to other consumers
- Consuming events carelessly can break selectors and other Houdini UI
- Store references to Drawable objects on `self` to prevent garbage collection
- Cache geometry references (e.g., from `node.inputs()[0].geometry()`) rather than
  re-fetching per event — Houdini builds acceleration structures for intersection

### File-Based Development Workflow (Recommended)
The recommended workflow for developing states under version control:

1. **Develop** as a file-based state in `$HOUDINI_USER_PREF_DIR/viewer_states/`
2. **Test** iteratively (Houdini auto-registers on startup; use reload for changes)
3. **Version control** the `.py` file with git (clean diffs, standard workflow)
4. **Migrate to HDA** when ready to ship — embed the code in the asset's State Script

See `references/state-registration.md` for the full registration boilerplate and migration guide.

### kwargs Dictionary
Most event handlers receive a `kwargs` dict. Common keys include:
- `"node"` — hou.OpNode for the current node (not available in nodeless states)
- `"ui_event"` — hou.ViewerEvent for input events (mouse, key)
- `"state_parms"` — dict of state parameter names/values
- `"state_flags"` — dict of flags you can set
- Menu toggle/radio values are injected directly into kwargs by their item IDs

## Reference Files

| File | Contents |
|------|----------|
| `references/state-registration.md` | File-based & HDA registration, naming, migration workflow |
| `references/event-handlers.md` | All lifecycle & UI event handler signatures and behavior |
| `references/drawables-and-guides.md` | SimpleDrawable, GeometryDrawable, TextDrawable, gadgets |
| `references/handles.md` | Static & dynamic handle binding, onHandleToState/onStateToHandle |
| `references/selectors.md` | Geometry, object, drawable selectors; volatile & existing selection |
| `references/menus-and-info.md` | Context menus, hotkeys, info panels (HUD) |
| `references/patterns.md` | Undo, debugging, state machine patterns, performance tips |
| `references/cop-lop-states.md` | COP (Copernicus) and LOP viewer state specifics |

## Quick Examples

### Minimal SOP State (file-based)
```python
import hou
import viewerstate.utils as su

class State(object):
    def __init__(self, state_name, scene_viewer):
        self.state_name = state_name
        self.scene_viewer = scene_viewer

    def onEnter(self, kwargs):
        self.scene_viewer.setPromptMessage("My custom state is active")

    def onMouseEvent(self, kwargs):
        ui_event = kwargs["ui_event"]
        dev = ui_event.device()
        self.log("Mouse:", dev.mouseX(), dev.mouseY())
        return False

def createViewerStateTemplate():
    state_typename = "my_custom_state"
    state_label = "My Custom State"
    state_cat = hou.sopNodeTypeCategory()

    template = hou.ViewerStateTemplate(state_typename, state_label, state_cat)
    template.bindFactory(State)
    template.bindIcon("MISC_python")
    return template
```

### Minimal OBJ Nodeless State (file-based)
```python
import hou
import viewerstate.utils as su

class State(object):
    def __init__(self, state_name, scene_viewer):
        self.state_name = state_name
        self.scene_viewer = scene_viewer

    def onGenerate(self, kwargs):
        self.scene_viewer.setPromptMessage("Inspector active — move mouse over geometry")

    def onMouseEvent(self, kwargs):
        ui_event = kwargs["ui_event"]
        origin, direction = ui_event.ray()
        self.log("Ray origin:", origin)
        return False

def createViewerStateTemplate():
    state_typename = "my_inspector"
    state_label = "My Inspector"
    state_cat = hou.objNodeTypeCategory()

    template = hou.ViewerStateTemplate(state_typename, state_label, state_cat)
    template.bindFactory(State)
    template.bindIcon("MISC_python")
    return template
```
