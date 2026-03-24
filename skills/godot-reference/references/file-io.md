# FileAccess & DirAccess

## Path System

| Prefix | Meaning | Writable at Runtime |
|---|---|---|
| `res://` | Project root (where `project.godot` lives) | Editor only. Read-only in exports. |
| `user://` | Per-user persistent storage | Yes, always |

### user:// Location by Platform
- **Windows**: `%APPDATA%\Godot\app_userdata\<project_name>\`
- **macOS**: `~/Library/Application Support/Godot/app_userdata/<project_name>/`
- **Linux**: `~/.local/share/godot/app_userdata/<project_name>/`
- **Android**: Internal app storage
- **iOS**: `Documents/` directory
- **Web**: IndexedDB (virtual filesystem)

Override with `application/config/custom_user_dir_name` in Project Settings.

Open the user data folder from the editor: Project → Open User Data Folder.

## FileAccess

### Opening Files

`FileAccess.open()` is a static factory — returns a `FileAccess` instance or `null` on failure:

```gdscript
var file := FileAccess.open("user://data.txt", FileAccess.WRITE)
if file == null:
    var error: Error = FileAccess.get_open_error()
    push_error("Cannot open file: ", error)
    return
```

### Mode Flags

| Flag | Behavior |
|---|---|
| `FileAccess.READ` | Read only. File must exist. |
| `FileAccess.WRITE` | Write only. Creates or truncates. |
| `FileAccess.READ_WRITE` | Read and write. File must exist. Does not truncate. |
| `FileAccess.WRITE_READ` | Write and read. Creates or truncates. |

### Writing Text
```gdscript
var file := FileAccess.open("user://log.txt", FileAccess.WRITE)
file.store_string("Hello World")       # No newline
file.store_line("Line with newline")   # Appends \n
file.store_csv_line(["a", "b", "c"])   # Comma-separated with newline
# File auto-closes when `file` goes out of scope
```

### Reading Text
```gdscript
var file := FileAccess.open("user://log.txt", FileAccess.READ)
var full_text: String = file.get_as_text()         # Entire file
# or line by line:
while not file.eof_reached():
    var line: String = file.get_line()
    print(line)
```

### Reading CSV
```gdscript
var file := FileAccess.open("res://data/items.csv", FileAccess.READ)
var headers: PackedStringArray = file.get_csv_line()
while not file.eof_reached():
    var row: PackedStringArray = file.get_csv_line()
    if row.size() > 0:
        process_row(headers, row)
```

### Binary Read/Write

```gdscript
# Write
var file := FileAccess.open("user://data.bin", FileAccess.WRITE)
file.store_8(255)           # uint8
file.store_16(1024)         # uint16
file.store_32(100000)       # uint32
file.store_64(9999999999)   # uint64
file.store_float(3.14)      # 32-bit float
file.store_double(3.14159)  # 64-bit double
file.store_buffer(PackedByteArray([0x00, 0xFF, 0xAB]))

# Read
var file := FileAccess.open("user://data.bin", FileAccess.READ)
var byte: int = file.get_8()
var short: int = file.get_16()
var word: int = file.get_32()
var big: int = file.get_64()
var f: float = file.get_float()
var d: float = file.get_double()
var buf: PackedByteArray = file.get_buffer(3)
```

### Variant Serialization (store_var / get_var)

Serialize any Variant-compatible type to binary:

```gdscript
# Write
var file := FileAccess.open("user://save.dat", FileAccess.WRITE)
file.store_var({"health": 100, "pos": Vector2(10, 20), "items": ["sword"]})
file.store_var(player_color)  # Color type works natively

# Read
var file := FileAccess.open("user://save.dat", FileAccess.READ)
var data: Dictionary = file.get_var()
var color: Color = file.get_var()
```

**Security**: `store_var(data, false)` (default) prevents object serialization. Safe for untrusted data. `store_var(data, true)` allows objects — only use with trusted data.

### File Existence
```gdscript
if FileAccess.file_exists("user://savegame.dat"):
    load_game()
```

### File Size and Position
```gdscript
var file := FileAccess.open("user://data.bin", FileAccess.READ)
var length: int = file.get_length()
var pos: int = file.get_position()
file.seek(0)       # Jump to beginning
file.seek_end(-4)  # Jump to 4 bytes before end
```

### Encrypted Files
```gdscript
# Password-based
var file := FileAccess.open_encrypted_with_pass("user://secret.dat", FileAccess.WRITE, "password123")
file.store_var(sensitive_data)

# Key-based (32-byte key)
var key := "01234567890123456789012345678901".to_utf8_buffer()
var file := FileAccess.open_encrypted("user://secret.dat", FileAccess.WRITE, key)
```

### Compressed Files
```gdscript
var file := FileAccess.open_compressed("user://data.gz", FileAccess.WRITE, FileAccess.COMPRESSION_GZIP)
file.store_string(large_text)

# Reading compressed
var file := FileAccess.open_compressed("user://data.gz", FileAccess.READ, FileAccess.COMPRESSION_GZIP)
var text: String = file.get_as_text()
```

Compression modes: `COMPRESSION_FASTLZ`, `COMPRESSION_DEFLATE`, `COMPRESSION_ZSTD`, `COMPRESSION_GZIP`.

**Note**: `open_compressed` only reads files written by Godot, not arbitrary compressed files from external tools.

### File Hashing
```gdscript
var md5: String = FileAccess.get_md5("user://savegame.dat")
var sha256: String = FileAccess.get_sha256("user://savegame.dat")
```

## DirAccess

### Opening Directories
```gdscript
var dir := DirAccess.open("user://saves")
if dir == null:
    push_error("Cannot open directory: ", DirAccess.get_open_error())
```

### Listing Contents
```gdscript
var dir := DirAccess.open("user://")
if dir:
    dir.list_dir_begin()
    var name: String = dir.get_next()
    while name != "":
        if dir.current_is_dir():
            print("Directory: ", name)
        else:
            print("File: ", name)
        name = dir.get_next()
    dir.list_dir_end()
```

### Directory Operations
```gdscript
# Create directory
DirAccess.make_dir_absolute("user://saves")
DirAccess.make_dir_recursive_absolute("user://saves/slot_1/backups")

# Check existence
if DirAccess.dir_exists_absolute("user://saves"):
    pass

# Copy file
DirAccess.copy_absolute("user://old.dat", "user://new.dat")

# Rename / move
DirAccess.rename_absolute("user://old.dat", "user://renamed.dat")

# Delete
DirAccess.remove_absolute("user://temp.dat")
```

### Static vs Instance Methods

Many DirAccess methods have both static (`_absolute`) and instance versions:

```gdscript
# Static — works with full paths
DirAccess.make_dir_absolute("user://saves")
DirAccess.dir_exists_absolute("user://saves")

# Instance — works relative to opened directory
var dir := DirAccess.open("user://")
dir.make_dir("saves")           # Creates user://saves
dir.dir_exists("saves")         # Checks user://saves
dir.file_exists("config.cfg")   # Checks user://config.cfg
```

## Practical Patterns

### List All Files with Extension
```gdscript
func get_files_in_dir(path: String, extension: String) -> PackedStringArray:
    var files: PackedStringArray = []
    var dir := DirAccess.open(path)
    if dir == null:
        return files
    dir.list_dir_begin()
    var name: String = dir.get_next()
    while name != "":
        if not dir.current_is_dir() and name.ends_with(extension):
            files.append(name)
        name = dir.get_next()
    dir.list_dir_end()
    return files

# Usage
var saves: PackedStringArray = get_files_in_dir("user://saves", ".tres")
```

### Delete Directory Recursively
```gdscript
func remove_dir_recursive(path: String) -> void:
    var dir := DirAccess.open(path)
    if dir == null:
        return
    dir.list_dir_begin()
    var name: String = dir.get_next()
    while name != "":
        var full_path: String = path.path_join(name)
        if dir.current_is_dir():
            remove_dir_recursive(full_path)
        else:
            DirAccess.remove_absolute(full_path)
        name = dir.get_next()
    dir.list_dir_end()
    DirAccess.remove_absolute(path)
```

### Ensure Directory Exists Before Writing
```gdscript
func save_to_path(path: String, data: Variant) -> void:
    var dir_path: String = path.get_base_dir()
    if not DirAccess.dir_exists_absolute(dir_path):
        DirAccess.make_dir_recursive_absolute(dir_path)
    var file := FileAccess.open(path, FileAccess.WRITE)
    if file:
        file.store_var(data)
```

## Path Utilities (Built into String)

```gdscript
var path := "user://saves/slot_1/game.tres"

path.get_file()        # "game.tres"
path.get_basename()    # "user://saves/slot_1/game"
path.get_extension()   # "tres"
path.get_base_dir()    # "user://saves/slot_1"
path.path_join("sub")  # "user://saves/slot_1/game.tres/sub" — use on dirs

"user://saves".path_join("game.tres")  # "user://saves/game.tres"

# Simplify path
"res://a/../b/./c".simplify_path()  # "res://b/c"
```

## OS-Level Paths

```gdscript
# Absolute filesystem path for user://
var user_path: String = OS.get_user_data_dir()
# e.g., "C:/Users/Name/AppData/Roaming/Godot/app_userdata/MyGame"

# Executable directory
var exe_path: String = OS.get_executable_path().get_base_dir()

# Globalize a res:// path (editor only — exported builds remap)
var abs_path: String = ProjectSettings.globalize_path("res://data/config.json")
```
