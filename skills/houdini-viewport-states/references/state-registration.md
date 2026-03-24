# State Registration & Migration

## Table of Contents
- [State Naming](#state-naming)
- [File-Based States](#file-based-states)
- [HDA-Embedded States](#hda-embedded-states)
- [Migration: File-Based → HDA-Embedded](#migration-file-based--hda-embedded)
- [State Categories](#state-categories)
- [ViewerStateTemplate API](#viewerstatetemplate-api)
- [Reloading States](#reloading-states)

---

## State Naming

Every state has an **internal name** (unique identifier) and a **label** (displayed in UI).

Rules:
- Internal names must be globally unique — if two states share a name, one fails to register
- You cannot use the name of an existing node type (Houdini auto-creates generic states for assets)
- For shareability, use namespace prefixes: `mystudio::my_state_name`
- State names have fewer character restrictions than node names (essentially arbitrary strings)
- The name may need to work as a filename if using file-based installation

## File-Based States

File-based states live as `.py` files in `$HOUDINI_USER_PREF_DIR/viewer_states/` and are 
auto-registered by Houdini at startup. This is the recommended approach for development because 
the files are plain Python — easy to diff, branch, and version-control with git.

### Boilerplate (File-Based)

```python
import hou
import viewerstate.utils as su

class State(object):
    def __init__(self, state_name, scene_viewer):
        self.state_name = state_name
        self.scene_viewer = scene_viewer

    # Add event handlers here...

def createViewerStateTemplate():
    """Mandatory entry point to create and return the viewer state
    template to register."""

    state_typename = "my_state_name"       # Unique internal name
    state_label = "My State Label"         # Human-readable label for UI
    state_cat = hou.sopNodeTypeCategory()  # Context: SOP, OBJ, DOP, COP, LOP

    template = hou.ViewerStateTemplate(state_typename, state_label, state_cat)
    template.bindFactory(State)
    template.bindIcon("MISC_python")

    # Bind handles, selectors, menus, gadgets, hotkeys here...

    return template
```

### File Location
- Save as: `$HOUDINI_USER_PREF_DIR/viewer_states/<state_typename>.py`
- Houdini scans this directory on startup and registers all states found
- The file is listed in the Viewer State Browser

### Launching a File-Based State
- You can launch it via a shelf tool script:
  ```python
  viewer = hou.ui.paneTabOfType(hou.paneTabType.SceneViewer)
  viewer.setCurrentState("my_state_name")
  ```
- Or enter it from the Viewer State Browser

## HDA-Embedded States

HDA-embedded states live inside a digital asset's "State Script" section. The state code is 
bundled with the asset — when you install the HDA, the state comes with it.

### Boilerplate (HDA-Embedded)

```python
import hou
import viewerstate.utils as su

class State(object):
    def __init__(self, state_name, scene_viewer):
        self.state_name = state_name
        self.scene_viewer = scene_viewer

    # Add event handlers here...

def createViewerStateTemplate():
    """Mandatory entry point to create and return the viewer state
    template to register."""

    # Derive state name from the asset's DefaultState section
    state_typename = kwargs["type"].definition().sections()["DefaultState"].contents()
    state_label = "My State Label"
    state_cat = hou.sopNodeTypeCategory()  # Match your asset's context

    template = hou.ViewerStateTemplate(state_typename, state_label, state_cat)
    template.bindFactory(State)
    template.bindIcon(kwargs["type"].icon())

    # Bind handles, selectors, menus, gadgets, hotkeys here...

    return template
```

Key differences from file-based:
- `state_typename` is derived from `kwargs["type"]` instead of hardcoded
- `kwargs` is available in the HDA's module scope (Houdini provides it)
- Icon is pulled from the asset type via `kwargs["type"].icon()`
- The code lives in **Type Properties → Interactive → State Script**

### Creating via Code Generator
Houdini provides a built-in code generator:
1. Right-click your asset → **Type Properties**
2. Click **Interactive | State Script** tab
3. Click **New…** to open the Viewer State Code Generator
4. Select the event handlers you need → **Accept**

## Migration: File-Based → HDA-Embedded

This is the recommended workflow: develop and iterate as file-based, then embed in your HDA 
when ready to ship.

### Step-by-Step Migration

**1. Copy your state class code** — The `State` class itself does not change at all. Copy it 
as-is into the HDA's State Script section.

**2. Update `createViewerStateTemplate()`** — This is where the changes happen:

| What | File-Based | HDA-Embedded |
|------|-----------|--------------|
| State name | `state_typename = "my_state"` | `state_typename = kwargs["type"].definition().sections()["DefaultState"].contents()` |
| Icon | `template.bindIcon("MISC_python")` | `template.bindIcon(kwargs["type"].icon())` |
| `kwargs` | Not available at module scope | Available (provided by Houdini) |

**3. Remove the file** from `$HOUDINI_USER_PREF_DIR/viewer_states/` to avoid registration 
conflicts. Two states with the same name will cause one to fail.

**4. Set the Default State** on your HDA:
- In Type Properties, under the **Node** tab, set the **Default State** field to your state name
- This tells Houdini to use your state when the Handles tool is active on this node type

### Gotchas During Migration
- **Name conflicts**: If both the file-based and HDA-embedded versions exist simultaneously, 
  one will fail to register. Always remove or rename the file-based version first.
- **`kwargs` scope**: In HDA-embedded code, `kwargs` is a module-level variable. In file-based 
  code, it doesn't exist. Don't reference `kwargs` outside of `createViewerStateTemplate()` in 
  HDA code — store what you need in local variables.
- **Testing after migration**: Always test the embedded version thoroughly. Enter the state via 
  the Handles tool (select the node, press Enter in the viewport).
- **Shared states**: If your state is shared across multiple HDAs (not node-specific), keep it 
  file-based. HDA-embedding is best for states tightly coupled to a single asset type.

### Reverse Migration (HDA → File)
If you need to extract an embedded state back to a file for development:
1. Copy the State class and `createViewerStateTemplate()` from the HDA's State Script
2. Replace the `kwargs`-based state name with a hardcoded string
3. Replace `kwargs["type"].icon()` with a static icon string like `"MISC_python"`
4. Remove any references to `kwargs` at module scope
5. Save to `$HOUDINI_USER_PREF_DIR/viewer_states/<name>.py`

## State Categories

Use these to set the context for your state:

| Context | Category Function | Notes |
|---------|-------------------|-------|
| SOP | `hou.sopNodeTypeCategory()` | Most common — geometry-level states |
| OBJ | `hou.objNodeTypeCategory()` | Object-level states, good for nodeless inspectors |
| DOP | `hou.dopNodeTypeCategory()` | Dynamics context |
| COP | `hou.copNodeTypeCategory()` | Copernicus compositor (see cop-lop-states.md) |
| LOP | `hou.lopNodeTypeCategory()` | USD/Solaris context (see cop-lop-states.md) |

## ViewerStateTemplate API

The template object is where you bind everything to your state during registration.

### Commonly Used Bind Methods
```python
template = hou.ViewerStateTemplate(name, label, category)
template.bindFactory(StateClass)                    # Required: bind your state class
template.bindIcon("MISC_python")                    # Set icon

# Features (see respective reference files for details)
template.bindHandle("xform", "my_handle")           # Dynamic handle
template.bindHandleStatic("xform", "h", [...])      # Static handle
template.bindGeometrySelector(...)                   # Geometry selector
template.bindObjectSelector(...)                     # Object selector
template.bindDrawableSelector(...)                   # Drawable selector
template.bindMenu(menu)                              # Context menu
template.bindHotkeyDefinitions(hotkey_defs)          # Hotkey definitions
template.bindGadget(geo_type, name, label=label)     # Gadget drawable
```

## Reloading States

During development, you don't need to restart Houdini for every change:

### File-Based States
- Use the **Viewer State Browser** → right-click your state → **Reload**
- Or use Python: 
  ```python
  hou.ui.reloadViewerState("my_state_name")
  ```

### HDA-Embedded States
- Save the Type Properties (click **Accept** or **Apply**)
- The state is automatically reloaded

### Tracing Execution
Enable tracing to see state callbacks in the Viewer State Browser console:
- Viewer State Browser → right-click your state → **Enable Tracing**
- Or use the debug context menu in the viewport (see patterns.md)
