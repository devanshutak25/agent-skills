# Spatial / Positional Audio

## AudioStreamPlayer2D

Plays audio with position-based panning and distance attenuation in 2D. The listener is the current `Camera2D` (or the viewport center if no camera).

### Key Properties

| Property | Default | Description |
|---|---|---|
| `max_distance` | 2000.0 | Beyond this distance, sound is silent |
| `attenuation` | 1.0 | Rolloff curve exponent. 1.0 = linear, higher = faster falloff |
| `panning_strength` | 1.0 | 0.0 = no stereo panning, 1.0 = full left/right panning |
| `max_polyphony` | 1 | Simultaneous overlapping plays |
| `bus` | `"Master"` | Audio bus routing |
| `area_mask` | 1 | Which Area2D audio buses affect this player |

### Basic 2D Positional Audio

```gdscript
extends Node2D

@onready var audio: AudioStreamPlayer2D = $AudioStreamPlayer2D

func _ready() -> void:
    audio.stream = preload("res://audio/sfx/fire_crackle.ogg")
    audio.max_distance = 500.0
    audio.attenuation = 1.5  # Slightly faster than linear falloff
    audio.bus = &"SFX"
    audio.play()
```

### Area2D Audio Bus Override

An `Area2D` can redirect audio passing through it to a different bus — useful for rooms with reverb:

```gdscript
# On the Area2D node:
# Inspector → Audio Bus Override = true
# Inspector → Audio Bus Name = "CaveReverb"

# Any AudioStreamPlayer2D whose area_mask includes this Area2D's layer
# will route through "CaveReverb" while the listener is inside the area
```

## AudioStreamPlayer3D

Full 3D spatial audio with attenuation models, Doppler effect, emission angle, and low-pass filtering.

### Key Properties

| Property | Default | Description |
|---|---|---|
| `unit_size` | 10.0 | Distance (meters) at which volume halves |
| `max_distance` | 0.0 | Max audible distance (0 = no limit, linear cutoff) |
| `max_db` | 3.0 | Maximum volume boost when very close |
| `attenuation_model` | `INVERSE_DISTANCE` | Rolloff model |
| `attenuation_filter_cutoff_hz` | 5000.0 | Low-pass filter for distant sounds (set 20500 to disable) |
| `attenuation_filter_db` | -24.0 | How much the filter affects volume |
| `emission_angle_enabled` | false | Directional audio cone |
| `emission_angle_degrees` | 45.0 | Cone half-angle for full volume |
| `emission_angle_filter_attenuation_db` | -12.0 | Volume reduction outside cone |
| `doppler_tracking` | `DISABLED` | Doppler effect mode |
| `panning_strength` | 1.0 | Stereo panning amount |
| `max_polyphony` | 1 | Simultaneous overlapping plays |

### Attenuation Models

| Model | Enum | Behavior |
|---|---|---|
| Inverse Distance | `ATTENUATION_INVERSE_DISTANCE` | Linear falloff. Predictable, good default |
| Inverse Square | `ATTENUATION_INVERSE_SQUARE_DISTANCE` | Realistic. Sound drops quickly then fades slowly |
| Logarithmic | `ATTENUATION_LOGARITHMIC` | Most realistic. Best for large outdoor spaces |
| Disabled | `ATTENUATION_DISABLED` | No distance attenuation. Still pans spatially |

### Unit Size Guidelines

| Scene Type | `unit_size` | `max_distance` |
|---|---|---|
| Small room | 2.0 | 10.0 |
| Medium indoor | 5.0 | 25.0 |
| Outdoor field | 10.0 | 50.0 |
| Large open world | 20.0 | 100.0+ |

### Basic 3D Setup

```gdscript
extends Node3D

@onready var audio: AudioStreamPlayer3D = $AudioStreamPlayer3D

func _ready() -> void:
    audio.stream = preload("res://audio/sfx/engine_loop.ogg")
    audio.unit_size = 10.0
    audio.max_distance = 50.0
    audio.attenuation_model = AudioStreamPlayer3D.ATTENUATION_INVERSE_SQUARE_DISTANCE
    audio.bus = &"SFX"
    audio.play()
```

### Directional Audio (Emission Angle)

Makes the sound louder when facing the listener, quieter from behind — useful for speakers, sirens, characters talking:

```gdscript
audio.emission_angle_enabled = true
audio.emission_angle_degrees = 60.0  # Full volume within 60° cone
audio.emission_angle_filter_attenuation_db = -20.0  # -20 dB outside cone
```

### Doppler Effect

Simulates pitch shift from moving sound sources (approaching = higher pitch, receding = lower):

```gdscript
audio.doppler_tracking = AudioStreamPlayer3D.DOPPLER_TRACKING_PHYSICS_STEP
```

| Mode | When |
|---|---|
| `DOPPLER_TRACKING_DISABLED` | No Doppler |
| `DOPPLER_TRACKING_IDLE_STEP` | Calculated per `_process` frame |
| `DOPPLER_TRACKING_PHYSICS_STEP` | Calculated per `_physics_process` frame (recommended — more stable) |

**Requirement**: The AudioStreamPlayer3D node must actually move in the scene tree. Doppler is computed from frame-to-frame position delta.

### Distance-Based Low-Pass Filter

By default, distant sounds get muffled via an automatic low-pass filter. This is controlled by `attenuation_filter_cutoff_hz`:

```gdscript
# Lower = more muffled at distance
audio.attenuation_filter_cutoff_hz = 3000.0
audio.attenuation_filter_db = -24.0  # Strength of the filter

# Disable distance filtering entirely
audio.attenuation_filter_cutoff_hz = 20500.0
```

## AudioListener3D

By default, the current `Camera3D` acts as the 3D audio listener. For third-person games where the camera orbits at a distance, audio centered on the camera feels wrong. Use `AudioListener3D` to decouple the listener from the camera:

```gdscript
# Scene tree:
# Player (CharacterBody3D)
#   ├── AudioListener3D    ← placed at player position
#   └── ...
# CameraRig
#   └── Camera3D           ← orbiting camera

# On the AudioListener3D:
func _ready() -> void:
    make_current()  # This node is now the active listener
```

Only one listener can be active at a time per viewport. Call `make_current()` to switch.

### AudioListener2D

Same concept for 2D. By default the viewport center or current `Camera2D` is the listener. Add `AudioListener2D` to override:

```gdscript
# Child of the player node
$AudioListener2D.make_current()
```

## Area-Based Audio Zones (3D)

`Area3D` nodes can override audio bus routing and apply reverb based on spatial zones:

### Setting Up Reverb Zones

1. Create an `Area3D` with a `CollisionShape3D` defining the zone
2. In the Area3D Inspector:
   - **Audio Bus Override** → `true`, set bus name (e.g., `"CaveReverb"`)
   - **Reverb Bus** → Enable, set reverb bus name, uniformity, area amount

```gdscript
# Area3D properties for reverb zone
# reverb_bus_enabled = true
# reverb_bus_name = &"Reverb"
# reverb_bus_amount = 0.5    # Mix between direct and reverb (0=dry, 1=full reverb)
# reverb_bus_uniformity = 0.5 # 0=position-based reverb, 1=uniform reverb
```

The `AudioStreamPlayer3D` must have its `area_mask` set to include the layer of the `Area3D` for the override to take effect.

### Multiple Overlapping Zones

When an AudioStreamPlayer3D is inside multiple overlapping Area3D zones, the closest Area3D (by volume center) takes priority for bus override. Reverb contributions blend.

## Audio Manager Pattern

A singleton autoload that manages all audio playback:

```gdscript
# audio_manager.gd — register as Autoload
extends Node

const SFX_BUS := &"SFX"
const BGM_BUS := &"BGM"

var _bgm_player: AudioStreamPlayer
var _sfx_pool: Array[AudioStreamPlayer] = []
const SFX_POOL_SIZE: int = 8

func _ready() -> void:
    _bgm_player = AudioStreamPlayer.new()
    _bgm_player.bus = BGM_BUS
    add_child(_bgm_player)

    for i in SFX_POOL_SIZE:
        var player := AudioStreamPlayer.new()
        player.bus = SFX_BUS
        add_child(player)
        _sfx_pool.append(player)

func play_bgm(stream: AudioStream, fade_duration: float = 1.0) -> void:
    if _bgm_player.stream == stream and _bgm_player.playing:
        return
    if _bgm_player.playing:
        var tween := create_tween()
        tween.tween_property(_bgm_player, "volume_db", -80.0, fade_duration)
        await tween.finished
    _bgm_player.stream = stream
    _bgm_player.volume_db = -80.0
    _bgm_player.play()
    var fade_in := create_tween()
    fade_in.tween_property(_bgm_player, "volume_db", 0.0, fade_duration)

func play_sfx(stream: AudioStream) -> void:
    for player in _sfx_pool:
        if not player.playing:
            player.stream = stream
            player.play()
            return
    # All busy — steal oldest
    _sfx_pool[0].stream = stream
    _sfx_pool[0].play()

func set_bus_volume(bus_name: String, linear: float) -> void:
    var idx: int = AudioServer.get_bus_index(bus_name)
    if idx == -1:
        return
    AudioServer.set_bus_mute(idx, linear <= 0.01)
    AudioServer.set_bus_volume_db(idx, linear_to_db(clampf(linear, 0.001, 1.0)))
```

## Common Pitfalls

1. **Stereo files for positional audio**: Use mono sources. Stereo streams bypass spatialization
2. **`max_distance = 0`** on AudioStreamPlayer3D: Means no distance limit — sound never goes silent, wastes CPU
3. **Forgetting `area_mask`**: AudioStreamPlayer3D ignores Area3D overrides unless its `area_mask` includes the area's layer
4. **Doppler without movement**: The node must physically move between frames. Teleporting (setting position directly) causes a single-frame pitch spike
5. **Camera as listener in TPS**: Audio anchored to an orbiting camera sounds wrong. Use `AudioListener3D` on the player
6. **`unit_size` too large**: Sound is audible at unrealistic distances. Start small, increase until it feels right
