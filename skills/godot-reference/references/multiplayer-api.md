# MultiplayerAPI & Multiplayer Architecture

## Core Concepts

Godot's high-level multiplayer sits on top of a pluggable transport layer. The architecture has three layers:

1. **MultiplayerPeer** — handles raw connections (ENet, WebSocket, WebRTC)
2. **MultiplayerAPI** — manages RPCs, authority, signals
3. **Scene replication nodes** — MultiplayerSpawner, MultiplayerSynchronizer

Every node has a `multiplayer` property referencing the active MultiplayerAPI instance.

## Server / Client Setup

### Creating a Server
```gdscript
var peer := ENetMultiplayerPeer.new()

func host_game(port: int, max_clients: int = 32) -> Error:
    var error := peer.create_server(port, max_clients)
    if error != OK:
        return error
    multiplayer.multiplayer_peer = peer
    return OK
```

### Creating a Client
```gdscript
var peer := ENetMultiplayerPeer.new()

func join_game(address: String, port: int) -> Error:
    var error := peer.create_client(address, port)
    if error != OK:
        return error
    multiplayer.multiplayer_peer = peer
    return OK
```

### Disconnecting
```gdscript
func leave_game() -> void:
    multiplayer.multiplayer_peer = null
    # or: peer.close()
```

## Peer IDs

- Server is always **peer ID 1**
- Clients get random positive integers assigned on connect
- `multiplayer.get_unique_id()` — returns local peer ID
- `multiplayer.is_server()` — true if this instance is the server
- `0` is broadcast target (all peers)

## MultiplayerAPI Signals

Connect these to handle connection events:

```gdscript
func _ready() -> void:
    multiplayer.peer_connected.connect(_on_peer_connected)
    multiplayer.peer_disconnected.connect(_on_peer_disconnected)
    multiplayer.connected_to_server.connect(_on_connected_to_server)      # Client only
    multiplayer.connection_failed.connect(_on_connection_failed)            # Client only
    multiplayer.server_disconnected.connect(_on_server_disconnected)        # Client only

func _on_peer_connected(id: int) -> void:
    print("Peer connected: ", id)

func _on_peer_disconnected(id: int) -> void:
    print("Peer disconnected: ", id)

func _on_connected_to_server() -> void:
    print("Connected! My ID: ", multiplayer.get_unique_id())

func _on_connection_failed() -> void:
    print("Connection failed")
    multiplayer.multiplayer_peer = null

func _on_server_disconnected() -> void:
    print("Server disconnected")
    multiplayer.multiplayer_peer = null
```

## Authority

Authority determines who controls a node. Default: server (peer ID 1).

```gdscript
# Set authority — do this on ALL peers at the same time
node.set_multiplayer_authority(peer_id)

# Check authority
if node.is_multiplayer_authority():
    # This peer controls this node
    pass

# Get the authority peer ID
var auth_id: int = node.get_multiplayer_authority()
```

**Best practice**: Set authority in `_enter_tree()` or immediately after instantiation — before `_ready()`. Ensure authority changes happen on all peers simultaneously.

### Common Pattern: Player Ownership
```gdscript
# Player scene — set authority to the owning peer
func _enter_tree() -> void:
    # Node name matches peer ID (convention from MultiplayerSpawner)
    set_multiplayer_authority(name.to_int())
```

## Lobby Pattern

Typical lobby flow for a game:

```gdscript
# lobby.gd — Autoload
extends Node

const PORT := 7000
const MAX_PLAYERS := 4

var players: Dictionary = {}  # peer_id -> player_info

signal player_list_changed

func _ready() -> void:
    multiplayer.peer_connected.connect(_on_peer_connected)
    multiplayer.peer_disconnected.connect(_on_peer_disconnected)
    multiplayer.connected_to_server.connect(_on_connected_to_server)
    multiplayer.server_disconnected.connect(_on_server_disconnected)

func create_game(player_name: String) -> Error:
    var peer := ENetMultiplayerPeer.new()
    var error := peer.create_server(PORT, MAX_PLAYERS)
    if error != OK:
        return error
    multiplayer.multiplayer_peer = peer
    players[1] = {"name": player_name}
    player_list_changed.emit()
    return OK

func join_game(address: String, player_name: String) -> Error:
    var peer := ENetMultiplayerPeer.new()
    var error := peer.create_client(address, PORT)
    if error != OK:
        return error
    multiplayer.multiplayer_peer = peer
    players[multiplayer.get_unique_id()] = {"name": player_name}
    return OK

func _on_peer_connected(id: int) -> void:
    # Send our info to the new peer
    _register_player.rpc_id(id, multiplayer.get_unique_id(), players[multiplayer.get_unique_id()])

func _on_peer_disconnected(id: int) -> void:
    players.erase(id)
    player_list_changed.emit()

func _on_connected_to_server() -> void:
    pass  # Wait for player registration RPCs

func _on_server_disconnected() -> void:
    players.clear()
    multiplayer.multiplayer_peer = null
    player_list_changed.emit()

@rpc("any_peer", "reliable")
func _register_player(id: int, info: Dictionary) -> void:
    players[id] = info
    player_list_changed.emit()
```

## Debugging Multiple Instances

Editor → Debug → Run Multiple Instances → select 2-4. Each instance runs the same scene. Use a lobby menu to let each instance choose server vs client.

## Advanced: Custom MultiplayerAPI

You can assign different MultiplayerAPI instances to different subtrees:

```gdscript
# Run server and client in the same process
var server_api := SceneMultiplayer.new()
var client_api := SceneMultiplayer.new()

get_tree().set_multiplayer(server_api, NodePath("/root/ServerRoot"))
get_tree().set_multiplayer(client_api, NodePath("/root/ClientRoot"))
```

Nodes under `/root/ServerRoot` use the server API; nodes under `/root/ClientRoot` use the client API. Useful for testing but complex to set up correctly.

## Node Path Requirement

Nodes using RPCs that are added via `add_child()` must have consistent NodePaths across all peers. Use readable names:

```gdscript
var player: Node = player_scene.instantiate()
player.name = str(peer_id)  # Consistent name across peers
players_container.add_child(player, true)  # force_readable_name = true
```

Without consistent paths, RPCs silently fail because Godot resolves RPC targets by NodePath.
