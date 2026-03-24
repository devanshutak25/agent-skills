# Text Editor & Scripting Environment

Blender's text data-block API, script execution methods, development tools, and the Python environment. For addon development see [addon-structure](addon-structure.md). For bpy.utils see [bpy-utils](bpy-utils.md).

## Text Data-Blocks

```python
import bpy

# Create a new text
text = bpy.data.texts.new("my_script.py")

# Load from file
text = bpy.data.texts.load("/path/to/script.py", internal=False)
# internal=True: don't link to external file

# Access existing
text = bpy.data.texts["my_script.py"]

# Remove
bpy.data.texts.remove(text)
```

### Reading and Writing Content

```python
import bpy

text = bpy.data.texts["my_script.py"]

# Get full text as string
content = text.as_string()

# Replace entire content
text.from_string("print('hello')\n")

# Write at cursor position
text.write("# new comment\n")

# Clear all content
text.clear()

# Access individual lines
for line in text.lines:
    print(line.body)

# Cursor position
print(text.current_line_index)
print(text.current_character)
```

### Text Properties

```python
import bpy

text = bpy.data.texts["my_script.py"]

text.use_module = True    # auto-run on .blend load (requires Register)
text.filepath             # linked file path (empty if internal)
```

## Running Scripts

### From Text Editor

```python
import bpy

# Run the active text block
bpy.ops.text.run_script()
```

### Command Line

```bash
# Run a script file
blender --python script.py

# Run a Python expression
blender --python-expr "import bpy; print(bpy.app.version)"

# Interactive Python console
blender --python-console

# Set exit code from script errors
blender --python-exit-code 1 --python script.py
```

### Background Mode

```bash
# Run without GUI (for batch processing)
blender --background --python script.py
blender -b file.blend --python render_script.py
```

## Python Environment

### sys.path in Blender

Blender adds these to `sys.path`:
- User scripts directory (`bpy.utils.script_path_user()`)
- Addons directory
- Startup scripts directory
- Modules directory
- The text editor's working directory

```python
import sys
for p in sys.path:
    print(p)
```

### Module Reloading

During development, reload modules without restarting Blender:

```python
import importlib
import my_module

importlib.reload(my_module)
```

For addon packages:

```python
if "my_submodule" in locals():
    importlib.reload(my_submodule)
else:
    from . import my_submodule
```

## Developer Tools

### Info Editor

The Info editor logs operator calls (those with the `REGISTER` option). Copy-paste from Info to get Python equivalents of UI actions.

### Developer Extras

Enable in Preferences → Interface → Developer Extras to get:
- Python tooltips (hover over any UI element)
- "Copy Data Path" and "Copy Full Data Path" in right-click menus
- Python operator search in the operator search dialog

```python
import bpy

# Enable developer extras programmatically
bpy.context.preferences.view.show_developer_ui = True
```

### Copy Data Path

Right-click any property → "Copy Data Path" gives the Python path:

```python
# Example copied path
bpy.data.objects["Cube"].location
bpy.data.objects["Cube"].modifiers["Subdivision"].levels
```

"Copy Full Data Path" includes `bpy.data.`:

```python
bpy.data.objects["Cube"].location
```

## Text Editor Operators

```python
import bpy

# File operations
bpy.ops.text.open(filepath="/path/to/file.py")
bpy.ops.text.save()
bpy.ops.text.save_as(filepath="/path/to/output.py")

# Editing
bpy.ops.text.comment_toggle()    # toggle line comment
bpy.ops.text.indent()            # indent selection
bpy.ops.text.unindent()          # unindent selection
bpy.ops.text.autocomplete()      # trigger autocomplete

# Navigation
bpy.ops.text.jump(line=10)       # jump to line
bpy.ops.text.move(type='LINE_BEGIN')
bpy.ops.text.select_line()
```

## Script Templates

Blender includes script templates accessible via Templates → Python in the text editor. Categories include:
- Background Job
- Operator (Simple, Modal, File Import/Export)
- Panel (Simple)
- UI (List, Menu, Pie Menu)
- Custom Nodes
- Addon

## Common Patterns

### Run Script and Capture Output

```python
import bpy
import io
import sys

text = bpy.data.texts["my_script.py"]
code = text.as_string()

# Capture stdout
old_stdout = sys.stdout
sys.stdout = buffer = io.StringIO()

try:
    exec(compile(code, text.name, 'exec'))
finally:
    sys.stdout = old_stdout

output = buffer.getvalue()
print(f"Script output:\n{output}")
```

### Create and Run Script Programmatically

```python
import bpy

# Create script
text = bpy.data.texts.new("generated_script.py")
text.from_string("""
import bpy
for obj in bpy.data.objects:
    print(obj.name, obj.type)
""")

# Make it active and run
for area in bpy.context.screen.areas:
    if area.type == 'TEXT_EDITOR':
        area.spaces[0].text = text
        break

# Execute
exec(compile(text.as_string(), text.name, 'exec'))
```

## Gotchas

1. **`text.write()` inserts at cursor.** `write()` doesn't replace content — it inserts at the current cursor position. Use `from_string()` to replace all content.

2. **`use_module` requires saving.** Setting `text.use_module = True` auto-executes the script on file load, but only if "Auto Run Python Scripts" is enabled in preferences.

3. **No automatic undo for script operations.** Python scripts that modify data don't automatically create undo steps. Use `bpy.ops.ed.undo_push(message="My Operation")` if needed.

4. **Background mode has no UI context.** Running with `--background` means `bpy.context.screen`, `bpy.context.area`, etc. are `None`. Use `context.temp_override()` to provide context. See [bpy-context](bpy-context.md).

5. **Info editor only logs REGISTER operators.** Not all operator calls appear in the Info editor. Only operators with `'REGISTER'` in their `bl_options` are logged.

6. **`--python-exit-code` for CI.** Without this flag, Blender exits with code 0 even if the script raises an error. Always use `--python-exit-code 1` in CI/CD pipelines.
