# Audio Playback

## Player Node Types

| Node | Use Case |
|---|---|
| `AudioStreamPlayer` | Non-positional (UI sounds, music, narration) |
| `AudioStreamPlayer2D` | 2D positional (footsteps, explosions in 2D) |
| `AudioStreamPlayer3D` | 3D positional with attenuation, panning, Doppler |

All three share the same core API: `play()`, `stop()`, `seek()`, `stream`, `volume_db`, `pitch_scale`, `bus`, `playing`, `stream_paused`, `finished` signal.

## Audio Formats

| Format | Type | Loop Support | BPM/Beat | Best For |
|---|---|---|---|---|
| WAV | Uncompressed / IMA-ADPCM | Yes (import settings) | No | SFX, short clips |
| OGG Vorbis | Compressed | Yes (import settings) | Yes | Music, long audio |
| MP3 | Compressed | Yes (import settings) | Yes (4.3+) | Music (OGG preferred) |

**Recommendation**: WAV for sound effects (low latency, small files for short clips). OGG for music (good compression, loop point support, BPM metadata).

### Import Settings

Select an audio file in FileSystem → Import tab:
- **Loop**: Enable/disable looping, set loop offset
- **BPM** (OGG/MP3): Set beats per minute for beat-synced systems
- **Force Mono**: Convert stereo to mono (saves memory, better for positional audio)

## Basic Playback

```gdscript
@onready var sfx_player: AudioStreamPlayer = $SFXPlayer
@onready var music_player: AudioStreamPlayer = $MusicPlayer

func _ready() -> void:
    # Play a preloaded stream
    sfx_player.stream = preload("res://audio/sfx/jump.wav")
    sfx_player.play()

    # Play music with fade-in
    music_player.stream = preload("res://audio/music/theme.ogg")
    music_player.volume_db = -80.0
    music_player.play()
    var tween := create_tween()
    tween.tween_property(music_player, "volume_db", 0.0, 2.0)
```

## Volume

Audio volume uses **decibels** (dB), not linear scale:
- `0 dB` = full volume (no change)
- `-6 dB` ≈ half perceived loudness
- `-80 dB` = effectively silent
- `+6 dB` = double perceived loudness (risk of clipping)

```gdscript
# Convert linear (0.0–1.0) to dB for sliders
sfx_player.volume_db = linear_to_db(0.5)  # ≈ -6 dB

# Convert dB back to linear
var linear_vol: float = db_to_linear(sfx_player.volume_db)
```

## One-Shot SFX Pattern

For fire-and-forget sounds, spawn a player and auto-free it:

```gdscript
func play_sfx(stream: AudioStream, bus: StringName = &"SFX") -> void:
    var player := AudioStreamPlayer.new()
    player.stream = stream
    player.bus = bus
    add_child(player)
    player.play()
    player.finished.connect(player.queue_free)
```

For positional SFX:
```gdscript
func play_sfx_2d(stream: AudioStream, pos: Vector2, bus: StringName = &"SFX") -> void:
    var player := AudioStreamPlayer2D.new()
    player.stream = stream
    player.bus = bus
    player.global_position = pos
    add_child(player)
    player.play()
    player.finished.connect(player.queue_free)
```

## AudioStream Types

### AudioStreamRandomizer
Plays a random stream from a pool. Useful for footsteps, impacts — avoids repetitive sounds:
```gdscript
# Set up in Inspector: add multiple WAV files to the stream pool
# Randomizer handles pitch/volume variation per-play
@export var footstep_randomizer: AudioStreamRandomizer
```

### AudioStreamPlaylist (4.3+)
Plays a sequence of tracks — sequential or shuffled:
```gdscript
# Created in Inspector on an AudioStreamPlayer
# Add streams, set shuffle/loop, tracks play one after another
```

### AudioStreamInteractive (4.3+)
Multiple tracks with a transition table for adaptive music. Transitions can respect beat/bar boundaries:
```gdscript
# Set up entirely in Inspector:
# 1. Add clips to the stream list
# 2. Define transition table (which clip → which clip)
# 3. Set transition type (immediate, next beat, next bar, fade)
# 4. Switch clips at runtime:
var playback := music_player.get_stream_playback() as AudioStreamPlaybackInteractive
playback.switch_to_clip(1)  # Switch to clip index 1
```

### AudioStreamSynchronized (4.3+)
Plays multiple streams in perfect sync (e.g., layered music that fades stems in/out):
```gdscript
# Set up in Inspector: add synchronized streams
# Each stream can be independently volume-controlled
```

### AudioStreamGenerator
Generates audio procedurally from code (synthesizers, custom effects):
```gdscript
var playback: AudioStreamGeneratorPlayback

func _ready() -> void:
    var generator := AudioStreamGenerator.new()
    generator.mix_rate = 44100.0
    $AudioStreamPlayer.stream = generator
    $AudioStreamPlayer.play()
    playback = $AudioStreamPlayer.get_stream_playback()

func _process(_delta: float) -> void:
    # Push frames (Vector2 = left/right channels)
    while playback.get_frames_available() > 0:
        var frame := Vector2(sin(_phase), sin(_phase))
        playback.push_frame(frame)
        _phase += TAU * 440.0 / 44100.0  # 440 Hz sine wave
```

## Polyphony (max_polyphony)

All player nodes support `max_polyphony` — how many overlapping instances of the stream can play simultaneously. Default is 1. When exceeded, the oldest playback is cut:

```gdscript
@onready var sfx: AudioStreamPlayer = $SFX
func _ready() -> void:
    sfx.max_polyphony = 4  # Allow 4 overlapping plays
```

For rapid-fire sounds (gunshots, footsteps), set this to 3–8.

## Pitch Variation

```gdscript
# Fixed pitch
sfx_player.pitch_scale = 1.2  # 20% higher pitch, also plays faster

# Random pitch per play (manual)
sfx_player.pitch_scale = randf_range(0.9, 1.1)
sfx_player.play()
```

`AudioStreamRandomizer` has built-in random pitch/volume range — preferred for SFX variation.

## Awaiting Audio Completion

```gdscript
func play_and_wait(player: AudioStreamPlayer) -> void:
    player.play()
    await player.finished
    print("Audio finished")
```

## Common Pitfalls

1. **Playing before stream is set**: `play()` on a null stream does nothing silently
2. **Volume slider using linear scale**: Use `linear_to_db()` / `db_to_linear()` — never assign linear 0.0–1.0 directly to `volume_db`
3. **Forgetting to set bus**: Default bus is `"Master"` — SFX/music won't respect per-category volume unless routed to the right bus
4. **WAV for music**: Large file sizes. Use OGG for anything over a few seconds
5. **Stereo SFX for positional audio**: Positional players work best with mono sources. Stereo files lose spatial positioning
6. **max_polyphony = 1 for rapid sounds**: Causes audible cutting. Increase for overlapping SFX
