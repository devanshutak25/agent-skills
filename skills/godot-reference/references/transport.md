# Network Transport

## Transport Options

All transports implement `MultiplayerPeer` and are interchangeable — swap the peer without changing game logic.

| Transport | Class | Topology | Use Case |
|---|---|---|---|
| **ENet** | `ENetMultiplayerPeer` | Client-server or mesh | Default choice, LAN/WAN games |
| **WebSocket** | `WebSocketMultiplayerPeer` | Client-server | HTML5/web exports, browser-based |
| **WebRTC** | `WebRTCMultiplayerPeer` | Peer-to-peer | Browser P2P, NAT traversal |

## ENet (Default)

ENet is a thin UDP networking library with optional reliability. It's Godot's default and best-supported transport.

### Client-Server
```gdscript
# Server
var peer := ENetMultiplayerPeer.new()
peer.create_server(7000, 32)  # port, max_clients
multiplayer.multiplayer_peer = peer

# Client
var peer := ENetMultiplayerPeer.new()
peer.create_client("192.168.1.100", 7000)
multiplayer.multiplayer_peer = peer
```

### Mesh (Peer-to-Peer via ENet)
```gdscript
var peer := ENetMultiplayerPeer.new()
peer.create_mesh(my_unique_id)
multiplayer.multiplayer_peer = peer

# Add each remote peer manually
var conn := ENetConnection.new()
conn.create_host(1)
conn.connect_to_host(remote_address, remote_port)
# After EVENT_CONNECT:
peer.add_mesh_peer(remote_peer_id, conn)
```

Mesh mode requires a signaling server to exchange addresses. Each peer connects directly to every other peer.

### ENet Configuration

Access the underlying `ENetConnection` for fine-tuning:

```gdscript
var host: ENetConnection = peer.get_host()

# Bandwidth limits (bytes/sec, 0 = unlimited)
host.bandwidth_limit(0, 0)

# Compression
host.compress(ENetConnection.COMPRESS_RANGE_CODER)

# DTLS encryption
host.dtls_server_setup(load("res://key.key"), load("res://cert.crt"))
# Client:
host.dtls_client_setup("server_hostname")
```

### Per-Peer Access
```gdscript
# Get the ENetPacketPeer for a specific connected peer
var enet_peer: ENetPacketPeer = peer.get_peer(remote_peer_id)

# Round-trip time (latency)
var rtt: float = enet_peer.get_statistic(ENetPacketPeer.PEER_ROUND_TRIP_TIME)

# Throttle configuration
enet_peer.set_timeout(5000, 30000, 60000)  # limit, min, max (ms)
```

## WebSocket

WebSocket transport works over TCP and is required for HTML5/web exports since browsers cannot use raw UDP.

### Server
```gdscript
var peer := WebSocketMultiplayerPeer.new()
peer.create_server(7000)
multiplayer.multiplayer_peer = peer

# With TLS
peer.create_server(7000, "*", TLSOptions.server(
    load("res://key.key"),
    load("res://cert.crt")
))
```

### Client
```gdscript
var peer := WebSocketMultiplayerPeer.new()
peer.create_client("ws://192.168.1.100:7000")
multiplayer.multiplayer_peer = peer

# With TLS
peer.create_client("wss://example.com:7000", TLSOptions.client())
```

### Limitations
- All transfers are reliable+ordered (TCP underneath)
- Higher latency than ENet
- `unreliable` and `unreliable_ordered` transfer modes still function but don't gain the UDP benefits
- Good for turn-based games, lobbies, chat; less ideal for fast-paced action

### Raw WebSocket (Non-Multiplayer)

For custom protocols or connecting to external WebSocket servers:

```gdscript
var ws := WebSocketPeer.new()

func _ready() -> void:
    ws.connect_to_url("wss://echo.websocket.org")

func _process(_delta: float) -> void:
    ws.poll()
    var state: WebSocketPeer.State = ws.get_ready_state()

    if state == WebSocketPeer.STATE_OPEN:
        while ws.get_available_packet_count() > 0:
            var packet: PackedByteArray = ws.get_packet()
            print("Received: ", packet.get_string_from_utf8())

    elif state == WebSocketPeer.STATE_CLOSED:
        var code: int = ws.get_close_code()
        print("Connection closed: ", code)
        set_process(false)
```

## WebRTC

WebRTC enables true peer-to-peer connections, including NAT traversal via STUN/TURN servers. Requires a signaling server to exchange offers/answers.

### Setup Flow
1. Create `WebRTCPeerConnection` for each remote peer
2. Exchange SDP offers/answers via a signaling server
3. Exchange ICE candidates via the signaling server
4. Once connected, wrap in `WebRTCMultiplayerPeer`

```gdscript
var rtc_peer := WebRTCMultiplayerPeer.new()

func start_webrtc(my_id: int) -> void:
    rtc_peer.create_mesh(my_id)
    multiplayer.multiplayer_peer = rtc_peer

func add_remote_peer(remote_id: int) -> void:
    var conn := WebRTCPeerConnection.new()
    conn.initialize({
        "iceServers": [
            {"urls": ["stun:stun.l.google.com:19302"]}
        ]
    })
    conn.session_description_created.connect(
        func(type: String, sdp: String):
            conn.set_local_description(type, sdp)
            # Send type + sdp to remote peer via signaling server
    )
    conn.ice_candidate_created.connect(
        func(media: String, index: int, candidate: String):
            # Send candidate to remote peer via signaling server
    )
    rtc_peer.add_peer(conn, remote_id)

    if my_id < remote_id:
        conn.create_offer()

# When receiving SDP from signaling server:
func on_remote_sdp(remote_id: int, type: String, sdp: String) -> void:
    rtc_peer.get_peer(remote_id).connection.set_remote_description(type, sdp)

# When receiving ICE candidate from signaling server:
func on_remote_ice(remote_id: int, media: String, index: int, candidate: String) -> void:
    rtc_peer.get_peer(remote_id).connection.add_ice_candidate(media, index, candidate)
```

### WebRTC Limitations
- Requires external signaling server (Godot doesn't provide one)
- STUN servers are needed for NAT traversal (free public ones exist)
- TURN servers needed for restrictive NATs (require hosting)
- More complex setup than ENet
- WebRTC GDExtension plugin required for non-web platforms

## Choosing a Transport

| Requirement | Recommended |
|---|---|
| Desktop LAN game | ENet |
| Desktop WAN game | ENet (with port forwarding or relay) |
| HTML5 / browser export | WebSocket or WebRTC |
| Browser peer-to-peer | WebRTC |
| Cross-platform (desktop + web) | WebSocket (simplest), or WebRTC (better latency) |
| Dedicated server | ENet or WebSocket |
| Turn-based game | Any (WebSocket is fine) |
| Fast-paced action | ENet (lowest latency) |

## HTTPRequest (Non-Multiplayer)

For REST APIs, leaderboards, authentication — not real-time multiplayer:

```gdscript
@onready var http: HTTPRequest = $HTTPRequest

func _ready() -> void:
    http.request_completed.connect(_on_request_completed)
    http.request("https://api.example.com/scores")

func _on_request_completed(
    result: int, response_code: int,
    headers: PackedStringArray, body: PackedByteArray
) -> void:
    if response_code == 200:
        var json: Dictionary = JSON.parse_string(body.get_string_from_utf8())
        print(json)
```

## Common Networking Architecture Tips

1. **Separate transport from game logic**: Write game code against the generic MultiplayerAPI. Swap transports by changing only the peer creation code.

2. **Compression**: Enable ENet compression (`COMPRESS_RANGE_CODER`) for bandwidth savings.

3. **Port forwarding**: ENet requires UDP port forwarding for WAN play. WebSocket uses TCP. WebRTC handles NAT traversal via STUN/TURN.

4. **Encryption**: Use DTLS with ENet or WSS with WebSocket for production. Never send sensitive data unencrypted.

5. **Dedicated servers**: Export with `--headless` flag. Disable rendering, audio, and input processing on the server.
