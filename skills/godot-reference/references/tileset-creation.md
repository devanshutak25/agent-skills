# TileSet Creation

## Overview

A `TileSet` is a shared resource defining the tiles available for painting in `TileMapLayer` nodes. It contains tile sources (atlas images or scene collections), physics/navigation/custom data layers, and terrain definitions.

**Deprecation note**: `TileMap` (single node with multiple layers) is deprecated. Use individual `TileMapLayer` nodes instead. Migration: select TileMap → bottom panel → toolbox icon → "Extract TileMap layers as individual TileMapLayer nodes."

## Creating a TileSet

### In Editor
1. Add a `TileMapLayer` node to the scene
2. In the Inspector, click the TileSet property → New TileSet
3. Set `tile_size` to match your art (e.g., 16×16, 32×32)
4. Open the TileSet panel at the bottom of the editor

### Tile Shape
TileSet supports: Square, Isometric, Half-Offset Square, Hexagonal.

Set in TileSet Inspector → Tile Shape. Affects grid layout, neighbor calculations, and terrain peering.

## Tile Sources

### Atlas Source (TileSetAtlasSource)

Most common — a single spritesheet image split into tiles:

1. In TileSet bottom panel, click `+` → Atlas
2. Assign the texture (spritesheet image)
3. Set texture region size to match tile dimensions
4. Godot auto-detects tiles; manually adjust if needed

**Properties**:
- **Texture**: The spritesheet image
- **Margins**: Pixel offset from texture edge
- **Separation**: Pixel gap between tiles
- **Texture Region Size**: Size of each tile in pixels (usually matches TileSet.tile_size)

**Auto-create tiles**: Right-click in atlas → "Create Tiles in Non-Transparent Texture Regions"

**Manual tile creation**: If auto-detect fails (tight packing, unusual layouts), use `+` button to manually add tiles at specific atlas coordinates.

### Scene Collection Source (TileSetScenesCollectionSource)

Uses entire scenes as tiles — for complex tiles with scripts, animations, or sub-nodes:

1. In TileSet bottom panel, click `+` → Scenes Collection
2. Add scenes by dragging `.tscn` files into the collection
3. Each scene becomes a tile you can paint

Use cases: animated torch tiles, interactive tiles, tiles with collision scripts.

**Pitfall**: Scene tiles are instanced per-cell — more expensive than atlas tiles. Use sparingly for special tiles.

## Tile Data Layers

Add in TileSet Inspector → Physics Layers / Navigation Layers / Custom Data Layers / Occlusion Layers.

### Physics Layers

Each physics layer creates collision bodies for tiles:
1. TileSet Inspector → Physics Layers → Add Element
2. Configure Collision Layer and Collision Mask (same as any physics body)
3. In TileSet editor, select a tile → Paint tool → add collision polygons

**Collision shapes per tile**:
- Use Select tool, click tile → Inspector shows physics polygon editors
- Draw polygons manually or use "Auto-detect" for rectangular shapes
- Multiple polygons per tile allowed (for complex shapes)
- Each physics layer gets its own polygon set

### Navigation Layers

Enable pathfinding through tiles:
1. TileSet Inspector → Navigation Layers → Add Element
2. Assign navigation layer bits
3. Paint navigation polygons on tiles (walkable areas)

The `TileMapLayer` automatically creates navigation regions from these polygons.

### Occlusion Layers

For 2D light occlusion:
1. TileSet Inspector → Occlusion Layers → Add Element
2. Paint occlusion polygons on tiles (blocks light)

### Custom Data Layers

Attach arbitrary data to tiles (damage values, terrain types, spawn weights, etc.):

1. TileSet Inspector → Custom Data Layers → Add Element
2. Set name and type (bool, int, float, string, color, vector2, etc.)
3. Paint values on tiles in the TileSet editor

Access from code:
```gdscript
var layer: TileMapLayer = $TileMapLayer
var cell_data: TileData = layer.get_cell_tile_data(Vector2i(5, 3))
if cell_data:
    var damage: int = cell_data.get_custom_data("damage")
    var is_water: bool = cell_data.get_custom_data("is_water")
```

## Painting Tile Properties

The TileSet editor has two modes:

### Select Mode
Click a tile → edit its properties in the Inspector panel (collision, navigation, custom data, animation, etc.).

### Paint Mode
Select a property (e.g., a physics layer's collision polygon) → click/drag across tiles to "paint" that property onto multiple tiles at once. Faster for bulk edits.

## Tile Animation

Tiles can be animated within the atlas:

1. Select a tile in the TileSet editor
2. In Inspector → Animation, set:
   - **Columns**: Number of animation frames horizontally
   - **Separation**: Pixel gap between frames
   - **Speed**: Frames per second
   - **Mode**: Default (loop) or Random Start Frame

Animation frames must be laid out consecutively in the atlas (left to right). The tile's atlas coordinates point to the first frame.

**Random start frame**: Use for tiles like water or foliage so they don't animate in sync.

## Alternative Tiles

Create variants of a tile with different properties (flipped, rotated, recolored):

1. In TileSet editor, select a tile
2. Right-click → "Create an Alternative Tile"
3. Modify the alternative's properties (flip, transpose, modulate, custom data, etc.)

Alternatives share the same atlas coords but have a different `alternative_id`. They appear as separate options when painting.

## Tile Identification

Every tile is identified by three values:
- `source_id` — which TileSource (atlas or scene collection)
- `atlas_coords` — Vector2i position in the atlas (grid coordinates, not pixels)
- `alternative_tile` — 0 for base tile, 1+ for alternatives

```gdscript
# Set a tile programmatically
layer.set_cell(Vector2i(5, 3), source_id, atlas_coords, alternative_tile)

# Get tile info
var source: int = layer.get_cell_source_id(Vector2i(5, 3))
var coords: Vector2i = layer.get_cell_atlas_coords(Vector2i(5, 3))
var alt: int = layer.get_cell_alternative_tile(Vector2i(5, 3))
```

## TileSet from GDScript

```gdscript
var tile_set := TileSet.new()
tile_set.tile_size = Vector2i(16, 16)

# Add atlas source
var source := TileSetAtlasSource.new()
source.texture = preload("res://art/tileset.png")
source.texture_region_size = Vector2i(16, 16)
var source_id: int = tile_set.add_source(source)

# Create tile at atlas position (0, 0)
source.create_tile(Vector2i(0, 0))

# Add physics layer
tile_set.add_physics_layer()
tile_set.set_physics_layer_collision_layer(0, 1)  # layer index, bitmask

# Add custom data layer
tile_set.add_custom_data_layer()
tile_set.set_custom_data_layer_name(0, "damage")
tile_set.set_custom_data_layer_type(0, Variant.Type.TYPE_INT)
```

## Common Pitfalls

1. **Tile size mismatch**: TileSet `tile_size` must match your art's grid. If tiles look offset, check margins and separation.
2. **Physics not working**: Must add a Physics Layer to TileSet first, then paint collision shapes onto tiles. Forgetting either step = no collision.
3. **Navigation not baking**: Navigation polygons on tiles only work when `TileMapLayer.navigation_enabled` is true (default). For external `NavigationRegion2D` baking, disable the layer's built-in navigation.
4. **Scene tiles expensive**: Each scene tile is a full scene instance per cell. Use atlas tiles for most tiles, scenes only for special interactive ones.
5. **Tile coordinates vs pixel coordinates**: `set_cell()` takes grid coordinates (Vector2i), not pixel positions. Convert with `layer.local_to_map(local_position)`.
