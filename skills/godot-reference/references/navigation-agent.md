# Navigation Agents

## Overview

`NavigationAgent2D` and `NavigationAgent3D` are helper nodes that handle pathfinding, path following, and avoidance. Attach one as a child of a `CharacterBody2D`/`CharacterBody3D` (or any `Node2D`/`Node3D`).

The agent does **not** move the parent node. It computes a desired velocity — you apply it yourself in `_physics_process`.

**Status**: NavigationAgent is marked as **Experimental** in Godot 4.x. The API may change between minor versions.

## Basic 2D Setup

Scene tree:
```
Enemy (CharacterBody2D)
├── NavigationAgent2D
├── Sprite2D
└── CollisionShape2D
```

```gdscript
extends CharacterBody2D

@export var speed: float = 200.0

@onready var nav_agent: NavigationAgent2D = $NavigationAgent2D

func _ready() -> void:
    # Wait for the navigation map to sync (first physics frame)
    await get_tree().physics_frame
    _set_target(Vector2(500.0, 300.0))

func _set_target(target: Vector2) -> void:
    nav_agent.target_position = target

func _physics_process(_delta: float) -> void:
    if nav_agent.is_navigation_finished():
        return

    var next_pos: Vector2 = nav_agent.get_next_path_position()
    var direction: Vector2 = global_position.direction_to(next_pos)
    velocity = direction * speed
    move_and_slide()
```

## Basic 3D Setup

```gdscript
extends CharacterBody3D

@export var speed: float = 5.0

@onready var nav_agent: NavigationAgent3D = $NavigationAgent3D

func _ready() -> void:
    await get_tree().physics_frame
    nav_agent.target_position = Vector3(10.0, 0.0, -5.0)

func _physics_process(_delta: float) -> void:
    if nav_agent.is_navigation_finished():
        return

    var next_pos: Vector3 = nav_agent.get_next_path_position()
    var direction: Vector3 = global_position.direction_to(next_pos)
    direction.y = 0.0  # Keep movement horizontal
    velocity = direction.normalized() * speed
    move_and_slide()
```

## Key Properties

### Path Following

| Property | Default | Description |
|---|---|---|
| `target_position` | `Vector2/3.ZERO` | Destination. Setting this triggers a new path query |
| `path_desired_distance` | 20.0 (2D) / 1.0 (3D) | Distance to waypoint before advancing to next |
| `target_desired_distance` | 10.0 (2D) / 1.0 (3D) | Distance to final target to consider "reached" |
| `path_max_distance` | 100.0 (2D) / 5.0 (3D) | If agent strays this far from path, recomputes |
| `navigation_layers` | 1 | Bitmask controlling which navmesh layers to use |

### Avoidance (see also `navigation-advanced.md`)

| Property | Default | Description |
|---|---|---|
| `avoidance_enabled` | false | Enable RVO avoidance |
| `radius` | 10.0 (2D) / 0.5 (3D) | Avoidance radius (not pathfinding — only avoidance) |
| `max_speed` | 100.0 (2D) / 1.0 (3D) | Max speed for avoidance calculation |
| `neighbor_distance` | 500.0 (2D) / 50.0 (3D) | How far to look for other agents |
| `max_neighbors` | 10 | Max agents to consider for avoidance |
| `time_horizon_agents` | 1.0 | How far ahead to predict agent collisions (seconds) |
| `time_horizon_obstacles` | 0.0 | How far ahead to predict obstacle collisions |
| `avoidance_layers` | 1 | Which layers this agent occupies |
| `avoidance_mask` | 1 | Which layers this agent avoids |

## Key Methods

```gdscript
# Set destination — triggers path recomputation
nav_agent.target_position = target_pos

# Get next point to move toward
var next: Vector2 = nav_agent.get_next_path_position()

# Check if navigation is done
if nav_agent.is_navigation_finished():
    pass

# Check if target is reachable
if nav_agent.is_target_reachable():
    pass

# Check if target was reached
if nav_agent.is_target_reached():
    pass

# Get the full computed path
var path: PackedVector2Array = nav_agent.get_current_navigation_path()
var current_idx: int = nav_agent.get_current_navigation_path_index()

# Get distance to final target
var dist: float = nav_agent.distance_to_target()

# Get the RID of the closest navigable position to the target
var final_pos: Vector2 = nav_agent.get_final_position()
```

## Key Signals

```gdscript
func _ready() -> void:
    nav_agent.path_changed.connect(_on_path_changed)
    nav_agent.target_reached.connect(_on_target_reached)
    nav_agent.navigation_finished.connect(_on_navigation_finished)
    nav_agent.velocity_computed.connect(_on_velocity_computed)  # Avoidance
    nav_agent.link_reached.connect(_on_link_reached)
    nav_agent.waypoint_reached.connect(_on_waypoint_reached)

func _on_path_changed() -> void:
    print("New path computed")

func _on_target_reached() -> void:
    print("Arrived at target")

func _on_navigation_finished() -> void:
    print("Navigation complete (target reached or unreachable)")

func _on_velocity_computed(safe_velocity: Vector2) -> void:
    # Only fires if avoidance_enabled = true and set_velocity() was called
    velocity = safe_velocity
    move_and_slide()

func _on_link_reached(details: Dictionary) -> void:
    # Fired when the agent reaches a NavigationLink
    print("Link: ", details)

func _on_waypoint_reached(details: Dictionary) -> void:
    # Fired for each waypoint along the path
    print("Waypoint: ", details)
```

## Avoidance Workflow

When `avoidance_enabled = true`, use `set_velocity()` instead of directly applying movement. The agent computes a safe velocity that avoids other agents and emits `velocity_computed`:

```gdscript
extends CharacterBody2D

@export var speed: float = 200.0
@onready var nav_agent: NavigationAgent2D = $NavigationAgent2D

func _ready() -> void:
    nav_agent.avoidance_enabled = true
    nav_agent.max_speed = speed
    nav_agent.velocity_computed.connect(_on_velocity_computed)
    await get_tree().physics_frame
    nav_agent.target_position = Vector2(500.0, 300.0)

func _physics_process(_delta: float) -> void:
    if nav_agent.is_navigation_finished():
        return
    var next_pos: Vector2 = nav_agent.get_next_path_position()
    var desired_vel: Vector2 = global_position.direction_to(next_pos) * speed
    nav_agent.set_velocity(desired_vel)  # Triggers avoidance computation

func _on_velocity_computed(safe_velocity: Vector2) -> void:
    velocity = safe_velocity
    move_and_slide()
```

**Critical**: `velocity_computed` only fires after `set_velocity()` is called. If you forget `set_velocity()`, the signal never fires and the agent never moves.

## Chasing a Moving Target

Update `target_position` every frame (or every N frames for performance):

```gdscript
@export var target_node: Node2D

func _physics_process(_delta: float) -> void:
    if target_node:
        nav_agent.target_position = target_node.global_position

    if nav_agent.is_navigation_finished():
        return

    var next_pos: Vector2 = nav_agent.get_next_path_position()
    velocity = global_position.direction_to(next_pos) * speed
    move_and_slide()
```

The agent internally rate-limits path recomputation, so setting `target_position` every frame is safe — it won't recompute the full path every single frame.

## Path Postprocessing

```gdscript
# Corridors: follow polygon edges (wider but more waypoints)
nav_agent.path_postprocessing = NavigationPathQueryParameters2D.PATH_POSTPROCESSING_CORRIDORFUNNEL

# Edgecentered: waypoints at polygon edge centers
nav_agent.path_postprocessing = NavigationPathQueryParameters2D.PATH_POSTPROCESSING_EDGECENTERED
```

## Navigation Layers

Both agents and regions have `navigation_layers` bitmasks. The agent only pathfinds through regions whose layers match the agent's mask:

```gdscript
# Agent can only use regions on layer 1 and 3
nav_agent.navigation_layers = 0b101  # bits 1 and 3

# Set individual bits
nav_agent.set_navigation_layer_value(1, true)
nav_agent.set_navigation_layer_value(2, false)
nav_agent.set_navigation_layer_value(3, true)
```

Use cases: ground-only agents (layer 1), flying agents (layer 2), vehicles (layer 3).

## First-Frame Timing

The navigation map synchronizes on each physics frame. On `_ready()`, the map hasn't synced yet — paths queried immediately may fail:

```gdscript
func _ready() -> void:
    # WRONG — may fail, navmesh not synced yet
    # nav_agent.target_position = some_target

    # RIGHT — wait one physics frame
    await get_tree().physics_frame
    nav_agent.target_position = some_target
```

Or use `call_deferred`:
```gdscript
func _ready() -> void:
    call_deferred("_set_initial_target")

func _set_initial_target() -> void:
    nav_agent.target_position = some_target
```

## Common Pitfalls

1. **Not waiting for physics frame**: Setting `target_position` in `_ready()` before the map syncs = no path
2. **Avoidance without `set_velocity()`**: `velocity_computed` never fires if you don't call `set_velocity()`
3. **`target_desired_distance` too small**: Agent oscillates around the target. 2D default of 10px is often too large for pixel-art games — tune to your scale
4. **`path_desired_distance` too large**: Agent skips waypoints and cuts corners too aggressively
5. **Forgetting `navigation_layers`**: Agent defaults to layer 1. If your region is on layer 2, the agent can't path through it
6. **Avoidance ≠ pathfinding**: Avoidance only adjusts velocity to dodge nearby agents/obstacles. It does NOT recompute the path around blocked areas. A fully blocked corridor means the agent pushes against the obstacle forever
7. **Moving vertical axis in 3D**: Zero out the Y component of direction when the agent should stay on the ground
