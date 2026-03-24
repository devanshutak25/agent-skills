# aud (Audio)

Audio playback and sound manipulation module. Independent of Blender's data system but interoperable with `bpy.data.sounds`.

## Device

```python
import aud

# Get the default audio device
device = aud.Device()

# Device properties
device.volume = 1.0                    # master volume (0.0–1.0+)
device.listener_location = (0, 0, 0)  # 3D listener position
device.listener_velocity = (0, 0, 0)  # for Doppler effect
device.listener_orientation = (0, 0, -1, 0, 1, 0)  # forward + up vectors

# Thread safety
device.lock()
# ... modify multiple properties atomically ...
device.unlock()
```

## Sound

### Loading and Creating

```python
import aud

# Load from file
sound = aud.Sound.file("/path/to/audio.wav")
# or: sound = aud.Sound("/path/to/audio.wav")

# Generate a sine wave
sine = aud.Sound.sine(440, rate=48000)  # 440 Hz, 48kHz sample rate

# Load into memory for faster playback
buffered = sound.buffer()
```

### Sound Processing Chain

Sound methods return new Sound objects (functional/chainable):

```python
import aud

sound = aud.Sound.file("/path/to/music.mp3")

# Adjust pitch and volume
modified = sound.pitch(1.5).volume(0.8)

# Loop 3 times (-1 for infinite)
looped = sound.loop(3)

# Limit to a time range (seconds)
clipped = sound.limit(start=2.0, end=10.0)

# Fade in/out
faded = sound.fadein(start=0.0, length=1.0).fadeout(start=9.0, length=1.0)

# Delay playback
delayed = sound.delay(2.0)

# Reverse
reversed_sound = sound.reverse()

# Filters
filtered = sound.highpass(frequency=200, Q=0.5)
filtered = sound.lowpass(frequency=5000, Q=0.5)
```

### Sound Methods

| Method | Description |
|---|---|
| `pitch(factor)` | Change pitch (1.0 = normal) |
| `volume(factor)` | Change volume (1.0 = normal) |
| `loop(count)` | Loop count (-1 = infinite) |
| `limit(start, end)` | Trim to time range (seconds) |
| `fadein(start, length)` | Fade in at start time |
| `fadeout(start, length)` | Fade out at start time |
| `delay(time)` | Delay start by seconds |
| `reverse()` | Reverse audio |
| `buffer()` | Load entire sound into memory |
| `highpass(frequency, Q)` | High-pass filter |
| `lowpass(frequency, Q)` | Low-pass filter |

## Playback (Handle)

```python
import aud

device = aud.Device()
sound = aud.Sound.file("/path/to/sound.wav")

# Play returns a Handle
handle = device.play(sound, keep=False)
# keep=True: handle stays valid after sound ends

# Handle properties
handle.volume = 0.5
handle.pitch = 1.0
handle.position = 0.0         # seek position in seconds
handle.loop_count = 0         # additional loops

# Control playback
handle.pause()
handle.resume()
handle.stop()

# Check status
print(handle.status)
# AUD_STATUS_PLAYING, AUD_STATUS_PAUSED, AUD_STATUS_STOPPED, AUD_STATUS_INVALID
```

## Integration with Blender

```python
import bpy
import aud

# bpy.data.sounds holds sound data-blocks
for snd in bpy.data.sounds:
    print(snd.name, snd.filepath)

# Speaker objects reference sounds
speaker = bpy.data.objects["Speaker"]
speaker.data.sound = bpy.data.sounds["MySound"]
speaker.data.volume = 1.0
speaker.data.pitch = 1.0
```

## Common Patterns

### Play a Sound Effect

```python
import aud

device = aud.Device()

def play_sfx(filepath, volume=1.0, pitch=1.0):
    sound = aud.Sound.file(filepath).buffer()
    handle = device.play(sound)
    handle.volume = volume
    handle.pitch = pitch
    return handle
```

### Crossfade Between Sounds

```python
import aud

device = aud.Device()
fade_time = 2.0

sound_a = aud.Sound.file("/path/to/a.wav").fadeout(start=8.0, length=fade_time)
sound_b = aud.Sound.file("/path/to/b.wav").fadein(start=0.0, length=fade_time).delay(8.0)

handle_a = device.play(sound_a)
handle_b = device.play(sound_b)
```

## Gotchas

1. **`aud` is independent of Blender's data system.** Sounds loaded via `aud.Sound` are not `bpy.data.sounds` entries. Use `bpy.data.sounds` for sounds in the blend file; use `aud` for direct audio playback.

2. **Sound methods are non-mutating.** Each method (`.pitch()`, `.volume()`, etc.) returns a new Sound object. Chain them or assign the result.

3. **Handle becomes invalid after sound ends.** Unless `keep=True` is passed to `device.play()`, the handle status becomes `AUD_STATUS_INVALID` when playback finishes.

4. **`buffer()` for repeated playback.** Streaming from disk is fine for music, but for sound effects played frequently, call `.buffer()` to load into memory first.

5. **No built-in MP3 encoding.** `aud` can read MP3 files but writing audio to disk requires external tools. Blender supports WAV/FLAC/OGG output for rendered audio.
