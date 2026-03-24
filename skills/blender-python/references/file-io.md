# File I/O

Blend file operations: saving, loading, linking, appending, library overrides, and packing. For import/export formats see [import-export](import-export.md). For USD see [usd-pipeline](usd-pipeline.md). For path utilities see [bpy-path](bpy-path.md).

## Saving and Loading

```python
import bpy

# Save current file
bpy.ops.wm.save_mainfile()

# Save as new file
bpy.ops.wm.save_as_mainfile(
    filepath="/path/to/file.blend",
    copy=False,       # True = save copy, keep original open
    compress=True,     # use compression
)

# Open a file
bpy.ops.wm.open_mainfile(filepath="/path/to/file.blend")

# Revert to last saved
bpy.ops.wm.revert_mainfile()

# Current filepath
print(bpy.data.filepath)  # "" if unsaved

# Save user preferences
bpy.ops.wm.save_userpref()
```

## Linking and Appending

Use `bpy.data.libraries.load()` as a context manager:

### Append (copy data into current file)

```python
import bpy

filepath = "/path/to/library.blend"

with bpy.data.libraries.load(filepath, link=False) as (data_from, data_to):
    # List available objects
    print(data_from.objects)  # ['Cube', 'Suzanne', ...]

    # Select what to append
    data_to.objects = ["Suzanne"]
    data_to.materials = ["MyMaterial"]

# Link appended objects to the scene
for obj in data_to.objects:
    if obj is not None:
        bpy.context.collection.objects.link(obj)
```

### Link (reference from external file)

```python
import bpy

filepath = "/path/to/library.blend"

with bpy.data.libraries.load(filepath, link=True) as (data_from, data_to):
    data_to.objects = ["Suzanne"]

for obj in data_to.objects:
    if obj is not None:
        bpy.context.collection.objects.link(obj)
```

### Available Data Categories

`data_from` / `data_to` have attributes for each data type:
`objects`, `meshes`, `materials`, `textures`, `images`, `node_groups`, `collections`, `actions`, `worlds`, `cameras`, `lights`, `armatures`, `particles`, `curves`, `fonts`, etc.

## Library Overrides

Library overrides allow editing linked data locally:

```python
import bpy

# Create override from linked object
linked_obj = bpy.data.objects["LinkedSuzanne"]
bpy.ops.object.make_override_library()

# Check if object has an override
if obj.override_library:
    print(f"Override of: {obj.override_library.reference.name}")

    # Iterate override properties
    for prop in obj.override_library.properties:
        print(f"  {prop.rna_path}")
```

## Libraries

```python
import bpy

# List linked libraries
for lib in bpy.data.libraries:
    print(lib.filepath)
    print(f"  Users: {len(lib.users_id)}")

    # Reload library
    lib.reload()
```

## Packing and Unpacking

```python
import bpy

# Pack all external files into .blend
bpy.ops.file.pack_all()

# Unpack all
bpy.ops.file.unpack_all(method='USE_LOCAL')
# Methods: USE_LOCAL, WRITE_LOCAL, USE_ORIGINAL, WRITE_ORIGINAL

# Pack/unpack individual images
image = bpy.data.images["MyTexture"]
image.pack()
image.unpack(method='USE_LOCAL')
```

## Common Patterns

### Batch Append Objects from Library

```python
import bpy

def append_from_library(filepath, object_names):
    with bpy.data.libraries.load(filepath, link=False) as (data_from, data_to):
        data_to.objects = [name for name in object_names if name in data_from.objects]

    for obj in data_to.objects:
        if obj is not None:
            bpy.context.collection.objects.link(obj)
    return data_to.objects

append_from_library("/path/to/assets.blend", ["Chair", "Table", "Lamp"])
```

### Save Incremental Backup

```python
import bpy
import os

filepath = bpy.data.filepath
if filepath:
    base, ext = os.path.splitext(filepath)
    i = 1
    while os.path.exists(f"{base}_{i:03d}{ext}"):
        i += 1
    bpy.ops.wm.save_as_mainfile(filepath=f"{base}_{i:03d}{ext}", copy=True)
```

## Gotchas

1. **Blend file format forward-incompatibility.** Files saved in Blender 5.0+ cannot be opened in versions earlier than 4.5. There is no backward-save option.

2. **`libraries.load` is a context manager.** Data selection (`data_to.objects = [...]`) must happen inside the `with` block. The data is loaded when the context exits.

3. **Linked objects are read-only.** Linked (not appended) data cannot be modified directly. Use library overrides to make local edits.

4. **`data_to` items may be `None`.** If an object fails to load (e.g., missing dependencies), it appears as `None` in the result list. Always check for `None`.

5. **Packing increases file size.** `pack_all()` embeds all external images, sounds, and fonts into the blend file. This can dramatically increase file size.

6. **`bpy.data.filepath` is empty for unsaved files.** Check `bpy.data.filepath != ""` before operations that depend on a saved location.
