# bpy.path

Path utility functions for Blender-specific path handling. Resolves `//` relative paths, sanitizes filenames, and handles cross-platform path operations.

## Absolute / Relative Path Conversion

### abspath

```python
import bpy

# Resolve '//' relative paths to absolute
# '//' means relative to the .blend file directory
abs_path = bpy.path.abspath("//textures/image.png")
# e.g., "C:/projects/myproject/textures/image.png"

# With custom start directory
abs_path = bpy.path.abspath("//textures/image.png", start="/other/dir")

# With library reference (for linked data)
abs_path = bpy.path.abspath("//tex.png", library=bpy.data.libraries[0])
```

### relpath

```python
import bpy

# Create '//' relative path from absolute
rel_path = bpy.path.relpath("/home/user/project/textures/image.png")
# e.g., "//textures/image.png" (if .blend is in /home/user/project/)

# With custom start directory
rel_path = bpy.path.relpath("/home/user/file.txt", start="/home/user/project")
```

## Filename Utilities

### clean_name

```python
import bpy

# Sanitize a string for use as a filename
safe = bpy.path.clean_name("My Object: <test>")
# "My Object__-test-" — replaces invalid chars with '_' by default

# Custom replacement character
safe = bpy.path.clean_name("My:File", replace="-")
```

### ensure_ext

```python
import bpy

# Ensure filepath has the correct extension
path = bpy.path.ensure_ext("/path/to/file", ".png")
# "/path/to/file.png"

path = bpy.path.ensure_ext("/path/to/file.png", ".png")
# "/path/to/file.png"  (no change)

# Case insensitive by default
path = bpy.path.ensure_ext("/path/to/file.PNG", ".png", case_sensitive=False)
# "/path/to/file.PNG"  (already has .png variant)
```

### basename

```python
import bpy

# Like os.path.basename but handles Blender's '//' paths
name = bpy.path.basename("//textures/image.png")
# "image.png"

name = bpy.path.basename("/absolute/path/file.blend")
# "file.blend"
```

## Display Name Functions

### display_name

```python
import bpy

# Format a name for UI display
name = bpy.path.display_name("my_texture_file.png")
# "My Texture File"  (removes ext, replaces _ with space, title-cases)

name = bpy.path.display_name("my_texture_file.png", has_ext=True, title_case=True)

# Without title case
name = bpy.path.display_name("my_texture", has_ext=False, title_case=False)
# "my texture"
```

### display_name_to_filepath / display_name_from_filepath

```python
import bpy

# Convert between display names and filepath-safe names
filepath = bpy.path.display_name_to_filepath("My Texture File")
# "my_texture_file"

display = bpy.path.display_name_from_filepath("my_texture_file")
# "My Texture File"
```

## Platform Utilities

### native_pathsep

```python
import bpy

# Convert path to OS-native separators
path = bpy.path.native_pathsep("C:/Users/test/file.blend")
# Windows: "C:\\Users\\test\\file.blend"
# Linux/Mac: "C:/Users/test/file.blend" (unchanged)
```

### resolve_ncase

```python
import bpy

# Resolve path with case-insensitive matching (useful on Linux)
resolved = bpy.path.resolve_ncase("/home/user/Textures/Image.PNG")
# Finds the actual file even if case doesn't match on case-sensitive filesystems
# Returns the input unchanged if no match found
```

## Module Discovery

### module_names

```python
import bpy

# Find Python module names in a directory
modules = bpy.path.module_names("/path/to/addons", recursive=False)
# Returns: [("addon_name", "/path/to/addons/addon_name.py"), ...]
# or [("package_name", "/path/to/addons/package_name/__init__.py"), ...]

# Recursive search
modules = bpy.path.module_names("/path/to/addons", recursive=True)
```

## Function Reference

| Function | Signature | Returns |
|---|---|---|
| `abspath` | `(path, start=None, library=None)` | `str` |
| `relpath` | `(path, start=None)` | `str` |
| `clean_name` | `(name, replace="_")` | `str` |
| `ensure_ext` | `(filepath, ext, case_sensitive=False)` | `str` |
| `basename` | `(path)` | `str` |
| `display_name` | `(name, has_ext=True, title_case=True)` | `str` |
| `display_name_to_filepath` | `(name)` | `str` |
| `display_name_from_filepath` | `(name)` | `str` |
| `native_pathsep` | `(path)` | `str` |
| `resolve_ncase` | `(path)` | `str` |
| `is_subdir` | `(path, directory)` | `bool` |
| `reduce_dirs` | `(dirs)` | `list[str]` |
| `module_names` | `(path, recursive=False)` | `list[(str, str)]` |

## Common Patterns

### Resolve All Image Paths

```python
import bpy

for img in bpy.data.images:
    if img.filepath:
        abs_path = bpy.path.abspath(img.filepath, library=img.library)
        print(f"{img.name}: {abs_path}")
```

### Safe Output Filename from Object Name

```python
import bpy

obj = bpy.context.active_object
safe_name = bpy.path.clean_name(obj.name)
output_path = bpy.path.abspath(f"//exports/{safe_name}.fbx")
```

### Check if Path is Relative

```python
import bpy

path = "//textures/wood.png"
is_relative = path.startswith("//")

if is_relative:
    abs_path = bpy.path.abspath(path)
```

## Gotchas

1. **`//` means blend-file-relative.** Blender uses `//` prefix for paths relative to the current .blend file, not the filesystem root. `abspath()` resolves these. If no .blend file is saved, `//` resolves relative to the current working directory.

2. **`abspath` needs a saved file.** If the .blend file hasn't been saved yet (`bpy.data.filepath == ""`), `//` relative paths resolve relative to the system's current directory, which may not be what you expect.

3. **`relpath` only works for same-drive paths.** On Windows, you cannot create relative paths between different drives (e.g., `C:` to `D:`). `relpath` returns the absolute path in this case.

4. **`clean_name` is not reversible.** Multiple different names can map to the same cleaned name. Don't rely on it for round-tripping.

5. **Path separators.** Blender internally uses forward slashes on all platforms. Use `native_pathsep` only when interfacing with OS-level tools that require backslashes on Windows.

6. **Library paths.** When resolving paths from linked/appended data, always pass the `library` parameter to `abspath()` so `//` is resolved relative to the library file, not the current file.
