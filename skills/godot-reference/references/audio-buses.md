# Audio Buses & Effects

## Bus Architecture

Godot's audio system uses a **bus-based mixing model** — every sound routes through one or more buses before reaching the output device. Buses can have effects, volume control, and route to other buses.

Default layout: a single `Master` bus. The bus layout is saved as `default_bus_layout.tres` in the project root.

### Recommended Bus Structure

```
Master
├── BGM        (background music)
├── SFX        (sound effects)
├── Voice      (dialogue, narration)
└── Ambient    (environmental loops)
```

### Creating Buses

**In Editor**: Bottom panel → Audio tab → click "Add Bus". Rename, set routing (Send to), add effects.

**In Code**:
```gdscript
func create_bus(bus_name: String, send_to: String = "Master") -> void:
    AudioServer.add_bus()
    var idx: int = AudioServer.bus_count - 1
    AudioServer.set_bus_name(idx, bus_name)
    AudioServer.set_bus_send(idx, send_to)
```

### Routing Sounds to Buses

Set the `bus` property on any AudioStreamPlayer:
```gdscript
@onready var sfx_player: AudioStreamPlayer = $SFXPlayer

func _ready() -> void:
    sfx_player.bus = &"SFX"
```

In the Inspector: AudioStreamPlayer → Bus → type the bus name.

## AudioServer API

`AudioServer` is a singleton — no instance needed.

### Volume Control

```gdscript
# Get bus index by name
var sfx_idx: int = AudioServer.get_bus_index("SFX")

# Set volume in dB
AudioServer.set_bus_volume_db(sfx_idx, -6.0)

# Get current volume
var vol: float = AudioServer.get_bus_volume_db(sfx_idx)

# Mute / unmute
AudioServer.set_bus_mute(sfx_idx, true)

# Solo (debug — only this bus plays)
AudioServer.set_bus_solo(sfx_idx, true)

# Bypass all effects on a bus
AudioServer.set_bus_bypass_effects(sfx_idx, true)
```

### Settings Menu Volume Sliders

```gdscript
# Slider emits value_changed(float) with range 0.0–1.0
func _on_sfx_slider_value_changed(value: float) -> void:
    var idx: int = AudioServer.get_bus_index("SFX")
    if value <= 0.01:
        AudioServer.set_bus_mute(idx, true)
    else:
        AudioServer.set_bus_mute(idx, false)
        AudioServer.set_bus_volume_db(idx, linear_to_db(value))
```

### Fading a Bus

```gdscript
func fade_bus(bus_name: String, target_db: float, duration: float = 0.5) -> void:
    var idx: int = AudioServer.get_bus_index(bus_name)
    if idx == -1:
        return
    var current_db: float = AudioServer.get_bus_volume_db(idx)
    var tween := create_tween()
    tween.tween_method(
        func(db: float) -> void: AudioServer.set_bus_volume_db(idx, db),
        current_db,
        target_db,
        duration
    )
```

## Audio Effects

Effects are added to buses — they process all audio passing through that bus. Add in the editor (Audio tab → click "Add Effect" on a bus) or in code.

### Available Effects

| Effect | Purpose |
|---|---|
| `AudioEffectReverb` | Room ambiance, echo |
| `AudioEffectChorus` | Thicker, richer sound |
| `AudioEffectDelay` | Repeat / echo |
| `AudioEffectCompressor` | Normalize dynamic range |
| `AudioEffectLimiter` | Prevent clipping |
| `AudioEffectEQ` / `AudioEffectEQ6` / `AudioEffectEQ10` / `AudioEffectEQ21` | Frequency equalization |
| `AudioEffectLowPassFilter` | Muffle high frequencies |
| `AudioEffectHighPassFilter` | Remove low rumble |
| `AudioEffectBandPassFilter` | Isolate a frequency range |
| `AudioEffectNotchFilter` | Remove a narrow frequency band |
| `AudioEffectDistortion` | Overdrive, clipping |
| `AudioEffectPitchShift` | Change pitch without speed |
| `AudioEffectPhaser` | Sweeping phase effect |
| `AudioEffectAmplify` | Boost/cut volume |
| `AudioEffectPanner` | Stereo pan left/right |
| `AudioEffectStereoEnhance` | Widen stereo field |
| `AudioEffectSpectrumAnalyzer` | Read frequency data (visualizers) |
| `AudioEffectCapture` | Capture raw audio frames |
| `AudioEffectRecord` | Record to AudioStreamWAV |

### Recommended Effect Chain Order

EQ → Compressor → Reverb → Limiter

### Adding Effects in Code

```gdscript
func add_reverb_to_bus(bus_name: String) -> void:
    var idx: int = AudioServer.get_bus_index(bus_name)
    var reverb := AudioEffectReverb.new()
    reverb.room_size = 0.8
    reverb.damping = 0.5
    reverb.wet = 0.3
    reverb.dry = 0.7
    AudioServer.add_bus_effect(idx, reverb)

func add_lowpass_to_bus(bus_name: String, cutoff_hz: float = 1000.0) -> void:
    var idx: int = AudioServer.get_bus_index(bus_name)
    var lpf := AudioEffectLowPassFilter.new()
    lpf.cutoff_hz = cutoff_hz
    AudioServer.add_bus_effect(idx, lpf)
```

### Removing Effects Safely

Remove by type — index-based removal is fragile if effects are added/removed dynamically:

```gdscript
func remove_effect_by_type(bus_name: String, effect_type: Variant) -> void:
    var idx: int = AudioServer.get_bus_index(bus_name)
    for i in range(AudioServer.get_bus_effect_count(idx) - 1, -1, -1):
        if AudioServer.get_bus_effect(idx, i) is effect_type:
            AudioServer.remove_bus_effect(idx, i)
            return
```

### Tweening Effect Parameters

```gdscript
func tween_reverb_wet(bus_name: String, target_wet: float, duration: float = 1.0) -> void:
    var idx: int = AudioServer.get_bus_index(bus_name)
    for i in range(AudioServer.get_bus_effect_count(idx)):
        var effect: AudioEffect = AudioServer.get_bus_effect(idx, i)
        if effect is AudioEffectReverb:
            var tween := create_tween()
            tween.tween_property(effect, "wet", target_wet, duration)
            return
```

## Dynamic Audio Environments

Switch audio atmosphere by adding/removing effects when the player enters different areas:

```gdscript
func enter_cave() -> void:
    add_reverb_to_bus("SFX")
    add_lowpass_to_bus("Ambient", 2000.0)

func exit_cave() -> void:
    remove_effect_by_type("SFX", AudioEffectReverb)
    remove_effect_by_type("Ambient", AudioEffectLowPassFilter)

func go_underwater() -> void:
    add_lowpass_to_bus("SFX", 800.0)
    add_lowpass_to_bus("BGM", 600.0)

func surface() -> void:
    remove_effect_by_type("SFX", AudioEffectLowPassFilter)
    remove_effect_by_type("BGM", AudioEffectLowPassFilter)
```

## Spectrum Analyzer (Audio Visualizers)

```gdscript
# Add AudioEffectSpectrumAnalyzer to the bus in the editor
# Then read frequency data:

var spectrum: AudioEffectSpectrumAnalyzerInstance

func _ready() -> void:
    var idx: int = AudioServer.get_bus_index("Master")
    spectrum = AudioServer.get_bus_effect_instance(idx, 0) as AudioEffectSpectrumAnalyzerInstance

func _process(_delta: float) -> void:
    if spectrum == null:
        return
    # Get magnitude of a frequency range (returns Vector2: left/right channels)
    var bass: float = spectrum.get_magnitude_for_frequency_range(
        20.0, 200.0
    ).length()
    var mids: float = spectrum.get_magnitude_for_frequency_range(
        200.0, 2000.0
    ).length()
    # Use bass/mids to drive visual effects
```

## Audio Recording

```gdscript
var recorder: AudioEffectRecord
var recording: AudioStreamWAV

func start_recording() -> void:
    var idx: int = AudioServer.get_bus_index("Record")
    recorder = AudioServer.get_bus_effect(idx, 0) as AudioEffectRecord
    recorder.set_recording_active(true)

func stop_recording() -> AudioStreamWAV:
    recorder.set_recording_active(false)
    recording = recorder.get_recording()
    return recording

func save_recording(path: String) -> void:
    recording.save_to_wav(path)
```

## Switching Bus Layouts

For different game states (menu vs gameplay vs cutscene):
```gdscript
var gameplay_layout: AudioBusLayout = preload("res://audio/gameplay_bus_layout.tres")
var menu_layout: AudioBusLayout = preload("res://audio/menu_bus_layout.tres")

func switch_to_gameplay() -> void:
    AudioServer.set_bus_layout(gameplay_layout)

func switch_to_menu() -> void:
    AudioServer.set_bus_layout(menu_layout)
```

**Pitfall**: Switching bus layouts resets all buses. Any runtime-added effects are lost. References to bus indices may become invalid.

## Common Pitfalls

1. **Bus name typo**: `AudioServer.get_bus_index()` returns `-1` for unknown names — always check
2. **Modifying effects by index**: Fragile if effects are added/removed. Search by type instead
3. **Forgetting to route sounds**: Default bus is `"Master"` — won't respect per-category volume
4. **Linear volume on bus**: `set_bus_volume_db()` takes dB, not linear 0–1. Use `linear_to_db()`
5. **Effect instance vs resource**: `get_bus_effect()` returns the resource. `get_bus_effect_instance()` returns the runtime instance (needed for SpectrumAnalyzer)
