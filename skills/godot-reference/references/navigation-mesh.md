# Navigation Meshes

## Overview

Navigation in Godot works independently from physics and rendering. The navigation system uses its own mesh data to define walkable areas, computes paths through them, and provides agent-based movement with avoidance.

**Core architecture**:
- `NavigationServer2D` / `NavigationServer3D` — singletons that manage maps, regions, agents
- **Navigation Map** — the world. Regions connect to form a unified navmesh. One map per world by default
- **Navigation Region** — a chunk of walkable area. Multiple regions merge by proximity
- **Navigation Mesh** — the data defining walkable polygons (2D: `NavigationPolygon`, 3D: `NavigationMesh`)

## 2D: NavigationRegion2D + NavigationPolygon

### Setup

1. Add a `NavigationRegion2D` to your scene
2. In Inspector → Navigation Polygon → create a new `NavigationPolygon`
3. Draw the walkable area using the polygon editor in the toolbar
4. Click **Bake NavigationPolygon** in the toolbar

The baked mesh appears as a blue semi-transparent overlay.

### Key NavigationPolygon Properties

| Property | Description |
|---|---|
| `parsed_geometry_type` | What geometry to parse: mesh instances, static bodies, or both |
| `collision_mask` | Which physics layers to include when parsing static bodies |
| `agent_radius` | Shrink navmesh edges by this amount (agent clearance) |
| `source_geometry_mode` | Root node / group-based source selection |

### Runtime Baking (2D)

```gdscript
@onready var nav_region: NavigationRegion2D = $NavigationRegion2D

func rebake_navigation() -> void:
    nav_region.bake_navigation_polygon()

# Await bake completion
func rebake_and_wait() -> void:
    nav_region.bake_navigation_polygon()
    await nav_region.bake_finished
    print("Navmesh rebaked")
```

## 3D: NavigationRegion3D + NavigationMesh

### Setup

1. Add a `NavigationRegion3D` to your scene
2. In Inspector → Navigation Mesh → create a new `NavigationMesh`
3. Configure settings (see below)
4. Click **Bake NavigationMesh** in the toolbar

### Key NavigationMesh Properties

| Property | Description |
|---|---|
| `cell_size` | Voxel resolution for baking. Smaller = more accurate, more expensive |
| `cell_height` | Vertical voxel resolution |
| `agent_radius` | Clearance from walls |
| `agent_height` | Minimum ceiling height for walkable area |
| `agent_max_climb` | Max step height the agent can traverse |
| `agent_max_slope` | Max walkable slope angle in degrees |
| `parsed_geometry_type` | Mesh instances, static bodies, or both |
| `collision_mask` | Physics layers to include |
| `source_geometry_mode` | Which nodes to parse |
| `filter_low_hanging_obstacles` | Remove areas under low ceilings |
| `filter_baking_aabb` | Limit baking to a specific AABB region |

### Cell Size Alignment

**Critical**: The `cell_size` in the NavigationMesh must match the project setting `navigation/3d/default_cell_size`. Mismatched values cause the error "cell_size is different from the one used to generate the navigation mesh" and broken pathfinding.

```gdscript
# Check / set project cell size
var map_rid: RID = get_world_3d().navigation_map
NavigationServer3D.map_set_cell_size(map_rid, 0.25)
```

### Parsed Geometry Type

| Mode | What it parses |
|---|---|
| `PARSED_GEOMETRY_MESH_INSTANCES` | MeshInstance3D nodes only |
| `PARSED_GEOMETRY_STATIC_COLLIDERS` | StaticBody3D collision shapes |
| `PARSED_GEOMETRY_BOTH` | Both meshes and static colliders |

For most games, `BOTH` or `STATIC_COLLIDERS` is appropriate. Use `collision_mask` to control which layers are included.

### Source Geometry Groups

To bake only specific nodes, use `source_geometry_mode = SOURCE_GEOMETRY_GROUPS_WITH_CHILDREN` and assign nodes to a group (e.g., `"navigation_mesh_source"`).

### Runtime Baking (3D)

```gdscript
@onready var nav_region: NavigationRegion3D = $NavigationRegion3D

func rebake_navigation() -> void:
    nav_region.bake_navigation_mesh()
    await nav_region.bake_finished
    print("3D navmesh rebaked")
```

Runtime baking runs on a background thread by default. The scene tree remains responsive during baking.

## Multiple Regions

Multiple `NavigationRegion2D`/`3D` nodes on the same navigation map are automatically merged by proximity. Regions whose edges are within `edge_connection_margin` distance get welded together:

```gdscript
# Adjust edge connection margin (default: cell_size * 4)
var map_rid: RID = get_world_2d().navigation_map
NavigationServer2D.map_set_edge_connection_margin(map_rid, 5.0)
```

### Use Cases for Multiple Regions
- Large levels split into chunks (bake each independently)
- Procedurally generated rooms that connect at doorways
- Moving platforms (attach a region to the platform; it rebakes/re-merges as it moves)

### Moving Regions

NavigationRegion transforms can be changed at runtime. The navigation map re-merges edges automatically:
```gdscript
# Move a navigation region (e.g., a moving platform)
$NavigationRegion3D.global_position = new_position
# Navigation server auto-syncs on next physics frame
```

## NavigationMesh Obstacles for Baking

`NavigationObstacle2D`/`3D` with `affect_navigation_mesh = true` can carve holes in the navmesh during baking — useful for excluding areas like walls, pillars, or rooftops:

```gdscript
# On NavigationObstacle3D:
# affect_navigation_mesh = true
# carve_navigation_mesh = true  (removes navmesh inside the obstacle shape)
# vertices = [outline points]   (defines the obstacle shape for static carving)
```

**Note**: This only affects baking. Obstacles do NOT dynamically update the baked navmesh at runtime — they affect avoidance instead (see `navigation-advanced.md`).

## Querying Paths Directly

Without using NavigationAgent, query the server directly:

```gdscript
# 2D
func get_path_2d(from: Vector2, to: Vector2) -> PackedVector2Array:
    var map_rid: RID = get_world_2d().navigation_map
    return NavigationServer2D.map_get_path(map_rid, from, to, true)

# 3D
func get_path_3d(from: Vector3, to: Vector3) -> PackedVector3Array:
    var map_rid: RID = get_world_3d().navigation_map
    return NavigationServer3D.map_get_path(map_rid, from, to, true)
```

The last parameter `optimize` controls whether the path uses a string-pulling algorithm (true = smoother, fewer waypoints) or follows polygon edges (false).

### Closest Point on Navmesh

```gdscript
# Find the closest navigable point to an arbitrary position
var closest: Vector3 = NavigationServer3D.map_get_closest_point(map_rid, world_position)
```

## Debug Visualization

Enable in the editor: Debug → Visible Navigation (or `NavigationServer3D.set_debug_enabled(true)` at runtime).

Project Settings → Debug → Navigation:
- `enable_edge_connections` — show where regions connect
- `enable_geometry_face_random_color` — color each region differently
- `enable_agent_paths` — show agent navigation paths

## Common Pitfalls

1. **Cell size mismatch**: NavigationMesh `cell_size` must match the project's `default_cell_size`. Mismatches cause broken paths
2. **Agent radius too large**: Navmesh shrinks from walls by `agent_radius`. Too large = no walkable area in narrow corridors
3. **Forgetting to bake**: Navigation polygons/meshes must be baked before use. Unbaked = no paths
4. **Parsing wrong geometry**: Check `parsed_geometry_type` and `collision_mask`. Missing geometry = holes in navmesh
5. **Regions too far apart**: Edges beyond `edge_connection_margin` won't connect. Increase margin or overlap region edges
6. **Baking on first frame**: Navigation map syncs on the physics frame after regions are added. Query paths only after a physics frame has passed, or connect to `NavigationServer.map_changed` signal
