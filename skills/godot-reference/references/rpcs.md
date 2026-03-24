# RPCs (Remote Procedure Calls)

## @rpc Annotation

The `@rpc` annotation marks a function as callable over the network. It takes up to 4 optional parameters in any order (except channel, which must be last):

```gdscript
@rpc("mode", "sync", "transfer_mode", channel)
func my_function() -> void:
    pass
```

### Parameter: Mode (Who Can Call)

| Value | Meaning |
|---|---|
| `"authority"` (default) | Only the node's multiplayer authority can call this RPC |
| `"any_peer"` | Any connected peer can call this RPC |

`"authority"` is the default. The authority is the server (peer 1) unless changed via `set_multiplayer_authority()`.

### Parameter: Sync (Local Execution)

| Value | Meaning |
|---|---|
| `"call_remote"` (default) | Execute only on remote peers, NOT on the caller |
| `"call_local"` | Execute on remote peers AND locally on the caller |

**Pitfall**: If the host is also a player and uses `"call_remote"`, the function won't run locally on the host. Use `"call_local"` when the server needs to run the same logic.

### Parameter: Transfer Mode

| Value | Meaning | Use Case |
|---|---|---|
| `"reliable"` (default) | Guaranteed delivery, ordered | Game state changes, chat, events |
| `"unreliable"` | No delivery guarantee, no ordering | Position updates, frequent data |
| `"unreliable_ordered"` | No delivery guarantee, but ordered. Late packets are dropped | Input streams, animation state |

**`unreliable_ordered`** discards packets that arrive after a newer one. If server sends A then B, and client receives B first, A is silently dropped when it arrives later.

### Parameter: Channel (Integer, Must Be Last)

Channels are independent packet streams within the same connection. Reliable messages on one channel don't block another:

```gdscript
@rpc("any_peer", "call_local", "reliable", 1)
func send_chat_message(msg: String) -> void:
    display_message(msg)

@rpc("authority", "call_remote", "unreliable", 2)
func sync_position(pos: Vector3) -> void:
    global_position = pos
```

Channel 0 is the default. Use separate channels for unrelated systems (chat vs gameplay vs audio) to prevent congestion in one system from blocking another.

**Syntax requirement**: The channel integer must be the 4th argument. You must provide all 3 string parameters before it:
```gdscript
# WRONG — channel must be 4th position
@rpc("any_peer", 1)  # Parse error

# RIGHT — fill all 3 string params first
@rpc("any_peer", "call_remote", "reliable", 1)
```

## Calling RPCs

### Broadcast to All Peers
```gdscript
# Call on all remote peers (and locally if call_local)
my_function.rpc()

# With arguments
send_chat_message.rpc("Hello everyone")
sync_position.rpc(global_position)
```

### Call on Specific Peer
```gdscript
# Send to peer with given ID
my_function.rpc_id(target_peer_id)

# Send to server specifically (always ID 1)
request_action.rpc_id(1, action_data)

# Send to specific client from server
notify_client.rpc_id(client_peer_id, data)
```

### Who Called This RPC?
```gdscript
@rpc("any_peer", "reliable")
func request_damage(target_id: int, amount: int) -> void:
    var sender_id: int = multiplayer.get_remote_sender_id()
    # Validate — was this actually the player claiming to attack?
    if sender_id != get_expected_peer(target_id):
        push_warning("Unauthorized RPC from peer ", sender_id)
        return
    apply_damage(target_id, amount)
```

`multiplayer.get_remote_sender_id()` returns 0 when called locally (not from an RPC).

## Common RPC Patterns

### Authority → All Clients (Server Broadcast)
```gdscript
# Server broadcasts game state to all clients
@rpc("authority", "call_local", "reliable")
func update_score(player_id: int, new_score: int) -> void:
    scores[player_id] = new_score
    update_scoreboard_ui()

# Server calls:
update_score.rpc(player_id, score)
```

### Client → Server (Request)
```gdscript
# Client sends input/request to server
@rpc("any_peer", "reliable")
func request_fire(direction: Vector2) -> void:
    if not multiplayer.is_server():
        return
    var sender: int = multiplayer.get_remote_sender_id()
    # Server validates and processes
    spawn_bullet(sender, direction)
```

### Server → Specific Client
```gdscript
# Server sends private data to one client
@rpc("authority", "reliable")
func receive_hand(cards: Array[int]) -> void:
    my_hand = cards
    update_hand_ui()

# Server calls for specific player:
receive_hand.rpc_id(player_peer_id, dealt_cards)
```

### Bidirectional Chat
```gdscript
@rpc("any_peer", "call_local", "reliable")
func send_message(sender_name: String, text: String) -> void:
    if multiplayer.is_server():
        # Server rebroadcasts to all
        send_message.rpc(sender_name, text)
    chat_log.append({"sender": sender_name, "text": text})
    update_chat_ui()
```

## Server-Authoritative Validation

Always validate client RPCs on the server:

```gdscript
@rpc("any_peer", "reliable")
func request_move(target_pos: Vector2) -> void:
    if not multiplayer.is_server():
        return

    var sender_id: int = multiplayer.get_remote_sender_id()
    var player: CharacterBody2D = get_player(sender_id)
    if player == null:
        return

    # Validate: is the target position reachable?
    var distance: float = player.global_position.distance_to(target_pos)
    if distance > MAX_MOVE_DISTANCE:
        push_warning("Player %d tried to move too far" % sender_id)
        return

    player.global_position = target_pos
    # Broadcast the validated position to all clients
    confirm_move.rpc(sender_id, target_pos)
```

**Rule**: Never trust client data. Always validate on the server before applying changes.

## RPC Argument Limitations

- Arguments must be Variant-compatible types
- Cannot send Node references (security risk — could allow remote code execution)
- Cannot send Resources directly
- Send indices, IDs, or paths instead of object references:

```gdscript
# WRONG — can't send nodes
@rpc("any_peer", "reliable")
func use_item(item: Node) -> void:
    pass

# RIGHT — send the identifier
@rpc("any_peer", "reliable")
func use_item(item_index: int) -> void:
    var item: Node = inventory.get_child(item_index)
    item.activate()
```

## RPC Configuration via Code

Alternative to `@rpc` annotation — configure at runtime:

```gdscript
func _ready() -> void:
    my_function.rpc_config({
        "rpc_mode": MultiplayerAPI.RPC_MODE_ANY_PEER,
        "call_local": true,
        "transfer_mode": MultiplayerPeer.TRANSFER_MODE_RELIABLE,
        "channel": 0,
    })
```

This is rarely needed — the annotation is cleaner. Use `rpc_config` when you need to change RPC configuration dynamically.

## C# RPCs

```csharp
[Rpc(MultiplayerApi.RpcMode.AnyPeer, CallLocal = true, TransferMode = MultiplayerPeer.TransferModeEnum.Reliable)]
public void SendChatMessage(string message)
{
    DisplayMessage(message);
}

// Calling
Rpc(MethodName.SendChatMessage, "Hello");
RpcId(targetPeerId, MethodName.SendChatMessage, "Hello");
```

## Common Pitfalls

1. **"Trying to call an RPC via a multiplayer peer which is not connected"**: The `multiplayer_peer` is not set or connection hasn't completed. Wait for `connected_to_server` signal before calling RPCs.

2. **RPC silently does nothing**: Node paths don't match across peers. Ensure spawned nodes have identical names and tree positions on all peers.

3. **`call_remote` not executing on host**: If the host is also a player, use `call_local` so the function runs locally too.

4. **Authority mismatch**: An `"authority"` RPC called by a non-authority peer is silently dropped. Use `"any_peer"` for client-to-server requests.

5. **Channel must be 4th**: `@rpc("any_peer", 1)` fails. Must have 3 string args before the channel int.
