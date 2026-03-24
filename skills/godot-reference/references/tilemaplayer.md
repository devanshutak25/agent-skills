# TileMapLayer

## Overview

`TileMapLayer` is the node for placing tiles in 2D scenes. Each layer is a single grid of tiles sharing one `TileSet` resource. Use multiple `TileMapLayer` nodes (as siblings or children) for ground, walls, decorations, etc.

**Replaces deprecated `TileMap`** (which bundled multiple layers in one node). Each `TileMapLayer` is independent with its own z-index, physics, navigation, and Y-sort settings.

## Basic Setup

1. Add `TileMapLayer` node to scene
2. Assign a `TileSet` resource (Inspector → TileSet)
3. Open TileMap panel (bottom of editor) → select tiles → paint

## Properties

| Property | Type | Description |
|---|---|---|
| `tile_set` | TileSet | Shared tile definitions |
| `enabled` | bool | Whether the layer processes/renders |
| `y_sort_enabled` | bool | Sort tiles by Y for top-down games |
| `x_draw_order_reversed` | bool | Reverse draw order on X axis |
| `rendering_quadrant_size` | int | Tiles per rendering batch (default 16) |
| `collision_enabled` | bool | Enable physics collision |
| `collision_visibility_mode` | enum | Debug collision display |
| `navigation_enabled` | bool | Enable navigation regions |
| `navigation_visibility_mode` | enum | Debug navigation display |

## Painting in Editor

### Tools
- **Select** — select/move painted tiles
- **Paint** — place single tiles (click/drag)
- **Line** — paint in a line
- **Rect** — fill a rectangle
- **Bucket** — flood fill contiguous area
- **Eraser** — remove tiles (right-click also erases in paint mode)

### Tile Picker
- Left panel shows available tiles from the TileSet
- Click to select, then paint on the canvas
- Hold Shift to pick a tile from the canvas (eyedropper)

### Patterns
Select a region → copy (Ctrl+C) → paste as a pattern. Patterns can be saved to the TileSet for reuse.

### Scatter
Select multiple tiles in the picker → painting randomly chooses between them. Adjust probability per tile.

## Placing Tiles from Code

### Basic Operations
```gdscript
var layer: TileMapLayer = $GroundLayer

# Place a tile (source_id, atlas_coords, alternative_id)
layer.set_cell(Vector2i(5, 3), 0, Vector2i(2, 1))

# Place with default source (0) and no alternative
layer.set_cell(Vector2i(5, 3), 0, Vector2i(0, 0))

# Erase a tile (source_id = -1)
layer.erase_cell(Vector2i(5, 3))
# or:
layer.set_cell(Vector2i(5, 3), -1)

# Check if cell has tile
if layer.get_cell_source_id(Vector2i(5, 3)) != -1:
    print("Tile exists")
```

### Reading Tile Data
```gdscript
# Get cell identifiers
var source_id: int = layer.get_cell_source_id(coords)
var atlas_coords: Vector2i = layer.get_cell_atlas_coords(coords)
var alt_id: int = layer.get_cell_alternative_tile(coords)

# Get TileData (for custom data, collision info, etc.)
var tile_data: TileData = layer.get_cell_tile_data(coords)
if tile_data:
    var damage: int = tile_data.get_custom_data("damage")
    var is_solid: bool = tile_data.get_custom_data("solid")
```

### Coordinate Conversion
```gdscript
# World/local position → grid coordinates
var grid_pos: Vector2i = layer.local_to_map(local_position)

# Grid coordinates → local position (center of cell)
var local_pos: Vector2 = layer.map_to_local(Vector2i(5, 3))

# Get all used cells
var cells: Array[Vector2i] = layer.get_used_cells()

# Get cells using a specific tile
var water_cells := layer.get_used_cells_by_id(0, Vector2i(3, 0))
```

### Bulk Operations
```gdscript
# Clear entire layer
layer.clear()

# Iterate all cells
for cell in layer.get_used_cells():
    var data: TileData = layer.get_cell_tile_data(cell)
    if data and data.get_custom_data("destructible"):
        layer.erase_cell(cell)
```

## Y-Sorting

For top-down games where tiles should overlap based on vertical position:

1. Enable `y_sort_enabled` on the TileMapLayer
2. Tiles sort by their Y position (bottom of cell)

When Y-sort is enabled, each tile gets its own rendering call instead of being batched — more expensive but correct overlap order.

**Tip**: For tiles taller than one cell (trees, buildings), set the tile's `y_sort_origin` in the TileSet to the base of the tile.

## Rendering Quadrants

`rendering_quadrant_size` controls batching. Default 16 means tiles are grouped in 16×16 tile chunks for draw calls. Larger = fewer draw calls but coarser culling. Smaller = more draw calls but finer culling.

- Large open maps → larger quadrants (32-64)
- Dense scenes with heavy culling → smaller quadrants (8-16)
- Y-sorted layers → quadrant size is irrelevant (each tile is separate)

## Signals

```gdscript
# Emitted when any cell changes
layer.changed.connect(_on_layer_changed)
```

## Layer Organization Patterns

### Multiple Sibling Layers
```
Scene
├── GroundLayer (z_index: 0)
├── WallsLayer (z_index: 1)
├── DecorationLayer (z_index: 2)
└── Player (z_index: 1, between walls and deco)
```

All layers share the same TileSet resource (or different TileSets if needed).

### Y-Sorted Layer with Entities
```
Scene
├── GroundLayer (no y-sort)
├── YSortRoot (Node2D, y_sort_enabled)
│   ├── EntitiesLayer (y_sort_enabled)
│   ├── Player
│   └── NPCs
└── OverlayLayer (z_index: 10)
```

### Per-Layer Physics

Each `TileMapLayer` generates its own collision bodies. Configure per-layer:
- `collision_enabled` — toggle physics for this layer
- Collision layer/mask is set on the TileSet's Physics Layers, not the node itself

## Common Patterns

### Detect Tile Under Player
```gdscript
func get_tile_at_player() -> TileData:
    var grid_pos: Vector2i = ground_layer.local_to_map(
        ground_layer.to_local(player.global_position)
    )
    return ground_layer.get_cell_tile_data(grid_pos)
```

### Destroy Tile on Hit
```gdscript
func break_tile(world_pos: Vector2) -> void:
    var grid_pos: Vector2i = layer.local_to_map(layer.to_local(world_pos))
    var data: TileData = layer.get_cell_tile_data(grid_pos)
    if data and data.get_custom_data("breakable"):
        layer.erase_cell(grid_pos)
        # Spawn particle effect at tile center
        var center: Vector2 = layer.to_global(layer.map_to_local(grid_pos))
        spawn_break_particles(center)
```

### Procedural Level Generation
```gdscript
func generate_floor(width: int, height: int) -> void:
    var floor_atlas := Vector2i(0, 0)   # grass tile coords
    var wall_atlas := Vector2i(1, 0)    # wall tile coords

    for x in range(width):
        for y in range(height):
            if x == 0 or x == width - 1 or y == 0 or y == height - 1:
                wall_layer.set_cell(Vector2i(x, y), 0, wall_atlas)
            else:
                ground_layer.set_cell(Vector2i(x, y), 0, floor_atlas)
```

### Saving / Loading Tile State
```gdscript
func save_layer(layer: TileMapLayer) -> Array:
    var data: Array = []
    for cell in layer.get_used_cells():
        data.append({
            "pos": cell,
            "source": layer.get_cell_source_id(cell),
            "atlas": layer.get_cell_atlas_coords(cell),
            "alt": layer.get_cell_alternative_tile(cell),
        })
    return data

func load_layer(layer: TileMapLayer, data: Array) -> void:
    layer.clear()
    for entry in data:
        layer.set_cell(entry.pos, entry.source, entry.atlas, entry.alt)
```

## Pitfalls

1. **`local_to_map` expects local coordinates**: If you have a world position, convert first with `layer.to_local(global_pos)`.
2. **Erased cell returns -1 for source_id**: Always check `get_cell_source_id() != -1` before accessing tile data.
3. **Shared TileSet resource**: Modifying a TileSet affects all layers using it. Use `tile_set.duplicate()` if you need independent copies.
4. **Physics on wrong layer**: Collision shapes are per-physics-layer in the TileSet. If collision doesn't work, verify the correct physics layer index has shapes painted.
5. **Large maps + Y-sort = expensive**: Y-sorted layers can't batch tiles. For large Y-sorted maps, split into chunks or use rendering quadrants strategically.
