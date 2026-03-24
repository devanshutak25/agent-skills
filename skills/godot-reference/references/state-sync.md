# MultiplayerSynchronizer & MultiplayerSpawner

## Overview

Godot 4 provides two high-level replication nodes that handle most networking boilerplate:

- **MultiplayerSpawner** — replicates node creation/deletion across peers
- **MultiplayerSynchronizer** — replicates property changes across peers

Both operate based on authority — only the authority peer's state is replicated to others.

## MultiplayerSpawner

### Setup
1. Add a MultiplayerSpawner node to your scene
2. Set `spawn_path` — the node under which spawned scenes will be added as children
3. Add scenes to the **Auto Spawn List** in the Inspector

### How It Works
When the authority (server by default) adds a child to `spawn_path` that matches a scene in the Auto Spawn List, the spawner automatically instantiates that scene on all other peers.

Similarly, when the authority removes (frees) a spawned node, it's removed on all peers.

### Basic Usage
```gdscript
# Level scene tree:
# Level (Node)
#   ├── MultiplayerSpawner (spawn_path = "Players")
#   ├── Players (Node)
#   └── World (Node2D)

# Configure spawner in editor:
# - spawn_path: "Players"
# - Auto Spawn List: [player.tscn]

# Server-side spawning:
func spawn_player(peer_id: int) -> void:
    var player: CharacterBody2D = player_scene.instantiate()
    player.name = str(peer_id)  # Name must be consistent across peers
    $Players.add_child(player, true)  # force_readable_name

# Server-side despawning:
func remove_player(peer_id: int) -> void:
    var player: Node = $Players.get_node_or_null(str(peer_id))
    if player:
        player.queue_free()
```

### Custom Spawn Function

For more control (e.g., setting authority, initial state), use `spawn_function`:

```gdscript
@onready var spawner: MultiplayerSpawner = $MultiplayerSpawner

func _ready() -> void:
    spawner.spawn_function = _custom_spawn

func spawn_player(peer_id: int) -> void:
    # spawn() sends the argument to all peers via spawn_function
    spawner.spawn(peer_id)

func _custom_spawn(peer_id: int) -> Node:
    var player: CharacterBody2D = player_scene.instantiate()
    player.name = str(peer_id)
    # Set authority to the owning peer
    player.set_multiplayer_authority(peer_id)
    return player
```

The value passed to `spawner.spawn()` is forwarded to `spawn_function` on all peers — server and clients. The returned node is added to `spawn_path` automatically.

### spawn_limit

Restrict how many nodes can be spawned:
```gdscript
spawner.spawn_limit = 1  # Only 1 active spawned node (e.g., one level)
```

### Mid-Game Join

When a new client connects, the spawner automatically replicates all currently spawned nodes to the new peer. No manual handling needed.

## MultiplayerSynchronizer

### Setup
1. Add a MultiplayerSynchronizer as a child of the node to sync
2. Set `root_path` (defaults to parent node)
3. Open the **Replication** tab at the bottom of the editor
4. Add properties to sync

### Replication Modes

Each property can be configured with a replication mode:

| Mode | Behavior |
|---|---|
| **Spawn** | Sent once when the node is first replicated (via MultiplayerSpawner) |
| **Always** | Sent every sync interval, even if unchanged |
| **On Change** | Sent only when the value differs from last sync |
| **Never** (Watch) | Not synchronized, but available for delta compression reference |

**Recommendation**: Use "On Change" for most properties. Use "Always" only for rapidly changing values (like position) where you need every update. Use "Spawn" for initial config (player color, name).

### Sync Intervals

```gdscript
# Per-synchronizer interval (seconds)
synchronizer.replication_interval = 0.05  # 20 Hz

# Delta interval for "On Change" properties
synchronizer.delta_interval = 0.1  # 10 Hz
```

Default: syncs every frame. Set a fixed interval for consistent tick rates.

### Example: Player Sync

```
Player (CharacterBody2D)
├── MultiplayerSynchronizer
│   └── Replication config:
│       ├── position → Always
│       ├── velocity → Always
│       └── player_color → Spawn
├── Sprite2D
└── CollisionShape2D
```

```gdscript
# player.gd
extends CharacterBody2D

@export var player_color: Color = Color.WHITE  # Spawn-synced
var speed: float = 200.0

func _enter_tree() -> void:
    set_multiplayer_authority(name.to_int())

func _ready() -> void:
    $Sprite2D.modulate = player_color
    if not is_multiplayer_authority():
        # Don't process input for remote players
        set_physics_process(false)

func _physics_process(delta: float) -> void:
    var direction: Vector2 = Input.get_vector(&"left", &"right", &"up", &"down")
    velocity = direction * speed
    move_and_slide()
```

The synchronizer handles sending `position` and `velocity` to all peers automatically.

## Two-Synchronizer Pattern

Best practice for server-authoritative games — separate server state from player input:

```
Player (CharacterBody2D)
├── ServerSynchronizer (MultiplayerSynchronizer, authority: server)
│   └── Syncs: position, velocity, health
├── PlayerInput (MultiplayerSynchronizer, authority: owning peer)
│   └── Syncs: input_direction, jump_pressed
├── Sprite2D
└── CollisionShape2D
```

```gdscript
# player_input.gd — attached to PlayerInput synchronizer
extends MultiplayerSynchronizer

@export var input_direction := Vector2.ZERO
@export var jump_pressed := false

func _ready() -> void:
    if get_multiplayer_authority() != multiplayer.get_unique_id():
        set_process(false)

func _process(_delta: float) -> void:
    input_direction = Input.get_vector(&"left", &"right", &"up", &"down")
    jump_pressed = Input.is_action_just_pressed(&"jump")
```

```gdscript
# player.gd — reads input from the synced PlayerInput
extends CharacterBody2D

@export var player_id: int = 1 :
    set(id):
        player_id = id
        $PlayerInput.set_multiplayer_authority(id)

@onready var input: MultiplayerSynchronizer = $PlayerInput

func _physics_process(delta: float) -> void:
    # Server reads synced input and applies physics
    velocity = input.input_direction * SPEED
    if input.jump_pressed and is_on_floor():
        velocity.y = JUMP_VELOCITY
    velocity.y += gravity * delta
    move_and_slide()
```

This way:
- Client sends **only input** (small, hard to cheat with)
- Server computes **all movement** (authoritative)
- ServerSynchronizer sends results back to all clients

## Visibility

Control which peers can see synchronized/spawned nodes:

```gdscript
# Disable public visibility (default: everyone sees everything)
synchronizer.public_visibility = false

# Show to specific peer
synchronizer.set_visibility_for(peer_id, true)

# Hide from specific peer
synchronizer.set_visibility_for(peer_id, false)
```

### Visibility Filter

For dynamic visibility (e.g., fog of war):

```gdscript
func _ready() -> void:
    synchronizer.visibility_update_mode = MultiplayerSynchronizer.VISIBILITY_PROCESS_IDLE
    synchronizer.add_visibility_filter(_visibility_check)

func _visibility_check(peer_id: int) -> bool:
    var peer_player: Node2D = get_player_node(peer_id)
    if peer_player == null:
        return false
    return global_position.distance_to(peer_player.global_position) < VIEW_DISTANCE
```

**Important**: Visibility only works on synchronizers that have authority. If you use the two-synchronizer pattern, apply visibility settings to both synchronizers.

## What Cannot Be Synchronized

- Object/node references (only values)
- Resource instances (send paths or IDs instead)
- Signals
- Methods/callables

Send identifiers and reconstruct references locally.

## Common Pitfalls

1. **Spawner authority**: The spawner must have authority (server by default) to replicate spawns. Setting authority on the spawned *node* is fine, but the spawner itself must remain server-authoritative.

2. **Name consistency**: Spawned nodes must have identical names on all peers. Use `add_child(node, true)` for force-readable names.

3. **Spawn properties not applied**: If you change authority in `_enter_tree()`, spawn-synced properties may not apply correctly. Use `spawn_function` for reliable initial state.

4. **Sync interval too fast**: Syncing every frame wastes bandwidth. Set `replication_interval` to match your game's tick rate (0.05 = 20Hz is common).

5. **Visibility on wrong synchronizer**: In the two-synchronizer pattern, both need visibility configured. If only one has visibility, the other still broadcasts to all peers.
