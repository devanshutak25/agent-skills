# Terrain System & Autotile

## Overview

The terrain system automatically selects the correct tile variant based on neighboring tiles — creating smooth transitions between grass and dirt, water edges, wall corners, etc. Defined at the TileSet level using **Terrain Sets**, **Terrains**, and **Peering Bits**.

This replaces Godot 3's autotile system.

## Concepts

- **Terrain Set**: A group of related terrains (e.g., "Ground" set containing Grass, Dirt, Water terrains)
- **Terrain**: A specific terrain type within a set (e.g., Grass = terrain 0, Dirt = terrain 1)
- **Peering Bits**: Per-tile rules defining what terrain each neighbor should be. The engine uses these to pick the correct tile.
- **Terrain Mode**: How neighbors are checked — corners only, sides only, or both

## Setting Up Terrain Sets

### 1. Create Terrain Set
TileSet Inspector → Terrain Sets → Add Element

### 2. Choose Mode

| Mode | Checks | Peering Bits | Typical Use |
|---|---|---|---|
| **Match Corners and Sides** | 8 neighbors (4 sides + 4 corners) | Up to 8 bits per tile | Most common — blob/47-tile tilesets |
| **Match Corners** | 4 diagonal neighbors | 4 bits per tile | Simpler tilesets (RPG Maker style) |
| **Match Sides** | 4 cardinal neighbors | 4 bits per tile | Wang tiles, simple transitions |

### 3. Add Terrains
Under each Terrain Set, add terrain elements:
- Terrain 0: e.g., "Grass" (assign a color for visualization)
- Terrain 1: e.g., "Dirt"
- Terrain 2: e.g., "Water"
- etc.

## Assigning Peering Bits

### In Editor

1. Open TileSet bottom panel → select the **Paint** tool
2. In the Paint properties, choose **Terrain Set** and **Terrain**
3. Click tiles to assign their **center terrain** (which terrain this tile belongs to)
4. Paint **peering bits** on each tile:
   - Each tile shows a 3×3 grid overlay (for Corners and Sides mode)
   - Center square = this tile's terrain
   - Surrounding squares = expected neighbor terrain
   - Left-click to set a peering bit to the selected terrain
   - Right-click to clear (set to -1, meaning "any/empty")

### Peering Bit Values
- **Terrain ID** (0, 1, 2...): This neighbor should be that terrain
- **-1**: This neighbor can be anything (empty/don't care)

### Example: Grass Center Tile
For a grass tile completely surrounded by grass:
```
[Grass] [Grass] [Grass]
[Grass] [GRASS] [Grass]   ← center is Grass
[Grass] [Grass] [Grass]
```
All 8 peering bits = Grass terrain ID.

### Example: Grass-Dirt Top Edge
For a tile that is grass on top, dirt on bottom:
```
[Grass] [Grass] [Grass]
[Grass] [GRASS] [Grass]   ← center is Grass
[ Dirt] [ Dirt] [ Dirt]
```
Top 3 bits = Grass, bottom 3 bits = Dirt.

### Example: Corner Tile
For a grass outer corner (top-left):
```
[-1  ] [-1  ] [-1  ]
[-1  ] [GRASS] [Grass]
[-1  ] [Grass] [Grass]
```
-1 means "empty/outside the terrain area."

## Painting with Terrains

### In Editor

1. Select TileMapLayer node
2. Open TileMap panel → switch to **Terrains** tab
3. Select the terrain to paint (e.g., Grass)
4. Paint on the map — Godot automatically picks the correct tile variant based on neighbors

The terrain system evaluates which tile best matches the peering bit requirements for each cell and its neighbors.

### Painting Modes
- **Connect** — painted tile connects to all existing neighboring terrain tiles (most common)
- **Path** — painted tiles only connect to each other in the order painted (for corridors, paths)

## Programmatic Terrain Placement

### set_cells_terrain_connect()
Places tiles and connects them to existing neighbors:
```gdscript
var layer: TileMapLayer = $GroundLayer
var cells: Array[Vector2i] = [
    Vector2i(0, 0), Vector2i(1, 0), Vector2i(2, 0),
    Vector2i(0, 1), Vector2i(1, 1), Vector2i(2, 1),
]
# terrain_set=0, terrain=0 (Grass)
layer.set_cells_terrain_connect(cells, 0, 0)
```

This is the most common programmatic method. It automatically:
1. Sets the terrain for each cell
2. Updates neighbors to pick the correct tile variants
3. Handles edge transitions

### set_cells_terrain_path()
Like `connect` but tiles only connect to each other in order (not to pre-existing neighbors):
```gdscript
# Creates a path that only connects to itself
var path_cells: Array[Vector2i] = [
    Vector2i(0, 0), Vector2i(1, 0), Vector2i(2, 0),
    Vector2i(2, 1), Vector2i(2, 2),
]
layer.set_cells_terrain_path(path_cells, 0, 1)  # terrain_set=0, terrain=1 (Dirt path)
```

### Erasing Terrain
```gdscript
# Erase cells and update surrounding terrain tiles
layer.set_cells_terrain_connect([Vector2i(5, 3)], 0, -1)
# terrain=-1 means "no terrain" → erases and recalculates neighbors
```

## Common Tileset Layouts

### 47-Tile Blob (Corners and Sides)
The complete set for a single terrain with full corner+side matching. Covers every possible combination of 8 neighbors. Standard for professional 2D games.

Layout: Typically arranged in a specific atlas pattern. Each tile handles a unique combination of filled/empty neighbors.

### 16-Tile Minimal (Corners and Sides)
A simplified version — corners are inferred from sides. Works for most cases but can look wrong at certain T-junctions.

### 4-Tile (Sides Only)
Simplest — one tile for each side configuration. No corner awareness. Works for simple grids.

### Wang Tiles (2-Corner or 3-Corner)
Multiple terrain types sharing transitions. Common for RPG overworld maps with grass/dirt/water transitions.

## Multi-Terrain Transitions

To create transitions between multiple terrain types:

1. Create all terrains in the same Terrain Set
2. For transition tiles (e.g., grass-to-dirt edge), assign peering bits with mixed terrain IDs:
```
[Grass] [Grass] [Grass]
[Grass] [GRASS] [Grass]   ← tile belongs to Grass
[ Dirt] [ Dirt] [ Dirt]    ← but bottom neighbors expect Dirt
```

3. Create corresponding tiles from the other terrain's perspective:
```
[Grass] [Grass] [Grass]
[ Dirt] [ DIRT] [ Dirt]   ← tile belongs to Dirt
[ Dirt] [ Dirt] [ Dirt]    ← but top neighbors expect Grass
```

## Procedural Generation with Terrain

```gdscript
func generate_island(layer: TileMapLayer, center: Vector2i, radius: int) -> void:
    var cells: Array[Vector2i] = []
    for x in range(-radius, radius + 1):
        for y in range(-radius, radius + 1):
            var pos := center + Vector2i(x, y)
            if Vector2(x, y).length() <= float(radius):
                cells.append(pos)

    # Place grass terrain with auto-connection
    layer.set_cells_terrain_connect(cells, 0, 0)  # terrain_set=0, grass=0

func generate_river(layer: TileMapLayer, points: Array[Vector2i]) -> void:
    # Water path — only connects to itself
    layer.set_cells_terrain_path(points, 0, 2)  # terrain_set=0, water=2
```

## Debugging Terrain

- **Terrain colors**: Each terrain has a configurable color in TileSet Inspector → Terrain Sets → Element → Color. These show in the editor when painting peering bits.
- **Missing tiles**: If the engine can't find a tile matching the required peering bits, it leaves the cell empty. Check that all necessary transition tiles have correct peering bits assigned.
- **Mismatched bits**: Use the TileSet editor's Select tool to inspect individual tile peering bits. Verify they match the expected neighbor pattern.

## Known Limitations

1. **No "ignore" bits**: Unlike Godot 3's autotile, the built-in terrain system has no way to mark a peering bit as "match anything." -1 means empty/no terrain, not "any terrain." The Better Terrain plugin adds this functionality.

2. **Performance with large updates**: `set_cells_terrain_connect()` recalculates all neighbors. For very large areas (hundreds of cells), this can be slow. Batch updates and call once rather than per-cell.

3. **Tile selection is "best match"**: The engine picks the tile whose peering bits most closely match the actual neighbors. Ties are broken by tile order in the atlas. This can occasionally produce unexpected results at complex junctions.

4. **No runtime terrain queries**: There's no built-in method to ask "what terrain is at cell X." You can store terrain info in Custom Data layers as a workaround.

5. **Single terrain per cell**: A cell can only belong to one terrain. For overlapping terrain effects (e.g., snow on top of grass), use multiple TileMapLayer nodes.

## Third-Party Alternatives

- **Better Terrain** plugin: Adds ignore bits, simpler rule definitions, multi-connection support, runtime API. Recommended if built-in terrain is too limited.
- **Terrain Autotiler** plugin: More accurate matching algorithm, supports full 256-tile Corners and Sides mode, procedural generation API.
