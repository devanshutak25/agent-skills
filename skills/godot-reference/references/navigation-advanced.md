# Navigation Advanced: Links, Obstacles, Avoidance

## Navigation Links

`NavigationLink2D` / `NavigationLink3D` connect two positions on the navigation mesh over arbitrary distances — useful for jumps, teleporters, ladders, doors, one-way drops.

### Setup

1. Add a `NavigationLink2D` or `NavigationLink3D` to the scene
2. Set `start_position` and `end_position` (local to the link node)
3. Set `bidirectional` to `true` (both ways) or `false` (start → end only)
4. Optionally set `navigation_layers` to restrict which agents can use it

```gdscript
# In Inspector or code:
@onready var link: NavigationLink2D = $NavigationLink2D

func _ready() -> void:
    link.start_position = Vector2(0, 0)
    link.end_position = Vector2(200, -100)  # Jump target
    link.bidirectional = false  # One-way (jump down only)
    link.enabled = true
```

### Detecting Link Traversal

When a NavigationAgent reaches a link, it emits `link_reached`:

```gdscript
func _ready() -> void:
    nav_agent.link_reached.connect(_on_link_reached)

func _on_link_reached(details: Dictionary) -> void:
    # details contains:
    #   "position" — the link entry point
    #   "type" — the path segment type (link vs region)
    #   "rid" — the link's RID
    #   "owner" — the NavigationLink node (if available)
    #   "link_entry_position" — world position of link start
    #   "link_exit_position" — world position of link end

    # Play jump animation, teleport, etc.
    var exit: Vector2 = details["link_exit_position"]
    global_position = exit
```

### Dynamic Links

Enable/disable links at runtime for doors, drawbridges, etc.:
```gdscript
func open_door() -> void:
    $DoorLink.enabled = true

func close_door() -> void:
    $DoorLink.enabled = false
```

### Travel Cost

Links have a `travel_cost` property. Higher cost makes the pathfinder prefer other routes unless the link is the only option:

```gdscript
link.travel_cost = 5.0  # Expensive — used only if no cheaper path exists
```

Also configurable on NavigationRegion via `travel_cost` for the entire region.

## Navigation Obstacles

`NavigationObstacle2D` / `NavigationObstacle3D` serve two distinct purposes depending on configuration:

### Dynamic Obstacles (Avoidance)

Set `radius` > 0. The obstacle pushes away agents that have `avoidance_enabled = true`. Does NOT affect pathfinding:

```gdscript
# Moving NPC that other agents should avoid
# Scene tree:
# NPC (CharacterBody2D)
#   └── NavigationObstacle2D (radius = 30.0)

@onready var obstacle: NavigationObstacle2D = $NavigationObstacle2D

func _ready() -> void:
    obstacle.radius = 30.0
    obstacle.avoidance_enabled = true
    # Set velocity so agents can predict movement
    obstacle.velocity = Vector2(100, 0)

func _physics_process(_delta: float) -> void:
    obstacle.velocity = velocity  # Keep in sync with actual movement
```

### Static Obstacles (Avoidance Boundaries)

Set `vertices` with an outline array. Acts as a hard boundary that avoidance-enabled agents won't cross:

```gdscript
# Static wall that agents avoid (but doesn't affect pathfinding)
obstacle.vertices = PackedVector2Array([
    Vector2(-50, -50),
    Vector2(50, -50),
    Vector2(50, 50),
    Vector2(-50, 50),
])
obstacle.avoidance_enabled = true
```

**Winding order matters**: Clockwise pushes agents out (wall). Counter-clockwise pushes agents in (containment zone).

Static obstacles only work with agents using **2D avoidance mode** (even in 3D).

### Obstacles for Navmesh Baking

Set `affect_navigation_mesh = true`. The obstacle carves out navmesh during baking:

```gdscript
obstacle.affect_navigation_mesh = true
obstacle.carve_navigation_mesh = true  # Removes navmesh inside the shape
```

This only takes effect at bake time. To dynamically block areas, rebake the navmesh at runtime.

### Dynamic vs Static vs Baking Summary

| Configuration | Affects Avoidance? | Affects Pathfinding? | Can Move? |
|---|---|---|---|
| `radius` > 0 (dynamic) | Yes | No | Yes |
| `vertices` set (static) | Yes | No | No (warp only) |
| `affect_navigation_mesh` = true | No (at runtime) | Yes (at bake time) | N/A |

**Key insight**: Avoidance and pathfinding are separate systems. Obstacles only affect avoidance (runtime dodge behavior). To affect pathfinding, you must modify the navmesh itself (rebake or use projected obstructions).

## Avoidance System (RVO)

Godot uses **RVO2** (Reciprocal Velocity Obstacles) for agent avoidance. Agents predict each other's movement and adjust velocity to avoid collision.

### Enabling Avoidance

On the NavigationAgent:
```gdscript
nav_agent.avoidance_enabled = true
nav_agent.radius = 20.0           # Agent's avoidance radius
nav_agent.max_speed = 200.0       # Max speed for avoidance calculation
nav_agent.neighbor_distance = 500.0
nav_agent.max_neighbors = 10
nav_agent.time_horizon_agents = 1.0     # Seconds to predict agent collisions
nav_agent.time_horizon_obstacles = 0.5  # Seconds to predict obstacle collisions
```

### Avoidance Layers and Masks

Like physics layers, avoidance uses a layer/mask system:
- `avoidance_layers` — which layers this agent/obstacle occupies
- `avoidance_mask` — which layers this agent avoids

```gdscript
# Enemies avoid each other (layer 1) and the player (layer 2)
enemy_agent.avoidance_layers = 1       # I'm on layer 1
enemy_agent.avoidance_mask = 0b11      # I avoid layers 1 and 2

# Player doesn't avoid enemies
player_agent.avoidance_layers = 2      # I'm on layer 2
player_agent.avoidance_mask = 0        # I don't avoid anyone
```

### 3D Avoidance Modes

NavigationAgent3D supports two avoidance modes:

```gdscript
# 2D avoidance (projected onto XZ plane — standard for ground-based agents)
nav_agent.use_3d_avoidance = false

# 3D avoidance (full 3D — flying agents)
nav_agent.use_3d_avoidance = true
```

2D avoidance mode is the default and works for most ground-based games. Static obstacles (vertices-based) only work with 2D avoidance mode.

## Navigation Layers

Both regions and agents have `navigation_layers` bitmasks. This allows different agent types to use different navmeshes:

```gdscript
# Region setup
$NavigationRegion2D.navigation_layers = 0b001  # Ground (layer 1)
$FlyingRegion.navigation_layers = 0b010         # Air (layer 2)
$WaterRegion.navigation_layers = 0b100           # Water (layer 3)

# Agent setup
ground_agent.navigation_layers = 0b001   # Can only walk on ground
flying_agent.navigation_layers = 0b011   # Can use ground and air
aquatic_agent.navigation_layers = 0b100  # Water only
```

### Region Travel Cost and Enter Cost

Fine-tune pathfinding preferences per region:

```gdscript
# Make a swamp region expensive to traverse
$SwampRegion.travel_cost = 3.0   # 3x cost per distance unit
$SwampRegion.enter_cost = 5.0    # One-time cost to enter this region
```

The pathfinder considers these costs and prefers cheaper routes.

## Projected Obstructions (Runtime Navmesh Modification)

Instead of rebaking the entire navmesh, inject obstructions into the source geometry before baking:

```gdscript
# 2D: Add a projected obstruction
var nav_poly := NavigationPolygon.new()
var source_geo := NavigationMeshSourceGeometryData2D.new()
NavigationServer2D.parse_source_geometry_data(nav_poly, source_geo, $RootNode)

# Add obstruction (outline, carve)
var outline := PackedVector2Array([
    Vector2(-50, -50), Vector2(50, -50),
    Vector2(50, 50), Vector2(-50, 50)
])
source_geo.add_projected_obstruction(outline, true)  # true = carve (remove navmesh)

# Rebake with the obstruction
NavigationServer2D.bake_from_source_geometry_data(nav_poly, source_geo)
$NavigationRegion2D.navigation_polygon = nav_poly
```

## Debugging Navigation

### Editor

- Debug → Visible Navigation
- Shows navmesh polygons, edges, agent paths

### Runtime

```gdscript
# Enable debug visualization at runtime
NavigationServer2D.set_debug_enabled(true)
NavigationServer3D.set_debug_enabled(true)
```

### Project Settings

`Project Settings → Debug → Navigation`:
- `enable_edge_connections` — visualize region edge connections
- `enable_geometry_face_random_color` — color regions differently
- `enable_agent_paths` — draw agent paths
- `enable_agent_paths_xray` — draw through geometry (3D)

## Common Patterns

### Patrol Between Waypoints

```gdscript
extends CharacterBody2D

@export var patrol_points: Array[Marker2D] = []
@export var speed: float = 150.0

@onready var nav_agent: NavigationAgent2D = $NavigationAgent2D

var _current_patrol_idx: int = 0

func _ready() -> void:
    await get_tree().physics_frame
    _go_to_next_patrol_point()

func _go_to_next_patrol_point() -> void:
    if patrol_points.is_empty():
        return
    nav_agent.target_position = patrol_points[_current_patrol_idx].global_position
    _current_patrol_idx = (_current_patrol_idx + 1) % patrol_points.size()

func _physics_process(_delta: float) -> void:
    if nav_agent.is_navigation_finished():
        _go_to_next_patrol_point()
        return
    var next_pos: Vector2 = nav_agent.get_next_path_position()
    velocity = global_position.direction_to(next_pos) * speed
    move_and_slide()
```

### Flee from Target

```gdscript
func flee_from(threat_pos: Vector2, flee_distance: float = 300.0) -> void:
    var away_dir: Vector2 = global_position.direction_to(threat_pos) * -1.0
    var flee_target: Vector2 = global_position + away_dir * flee_distance
    # Snap to navmesh
    var map_rid: RID = get_world_2d().navigation_map
    var safe_target: Vector2 = NavigationServer2D.map_get_closest_point(map_rid, flee_target)
    nav_agent.target_position = safe_target
```

## Common Pitfalls

1. **Avoidance ≠ pathfinding**: Obstacles with `radius` only affect avoidance, not path computation. A blocked corridor won't be rerouted around — the agent stalls
2. **Static obstacle winding order**: Wrong winding = agents sucked in instead of pushed out
3. **Link `link_reached` not connected**: Agent reaches the link but doesn't know to teleport/jump. Always connect `link_reached` and handle the traversal
4. **Travel cost of 0**: Sets the region as impassable. Use values ≥ 1.0
5. **Avoidance with few agents**: RVO works best with many agents. For 1–2 agents, manual steering often gives better results
6. **3D static obstacles**: Vertices-based static obstacles only work with 2D avoidance mode, even in 3D scenes
