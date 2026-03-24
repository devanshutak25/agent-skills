# GDScript Async & Coroutines Reference

## await Keyword

`await` pauses function execution until a signal is emitted or a coroutine completes. Any function containing `await` automatically becomes a coroutine.

### Awaiting Signals
```gdscript
# Wait for a signal
await $AnimationPlayer.animation_finished

# Wait for a timer
await get_tree().create_timer(2.0).timeout

# Wait for a button press
await $Button.pressed

# Wait for next frame
await get_tree().process_frame

# Wait for next physics frame
await get_tree().physics_frame
```

### Capturing Signal Parameters
When awaiting a signal that emits parameters, you can capture them:
```gdscript
# Signal: signal damage_dealt(amount: int, target: Node2D)
var result = await damage_dealt
# result is the single parameter if signal has one parameter
# result is an Array if signal has multiple parameters

# Single parameter signal
signal value_changed(new_value: int)
var new_val: int = await value_changed

# Multi-parameter signal — returns Array
signal hit(damage: int, source: Node2D)
var hit_info: Array = await hit
var damage: int = hit_info[0]
var source: Node2D = hit_info[1]
```

### Awaiting Coroutines
```gdscript
func load_level() -> void:
    show_loading_screen()
    await fade_to_black()        # Waits for this coroutine to finish
    change_scene()
    await fade_from_black()
    hide_loading_screen()

func fade_to_black() -> void:
    var tween := create_tween()
    tween.tween_property($ColorRect, "modulate:a", 1.0, 0.5)
    await tween.finished
```

### Return Values from Coroutines
Coroutines can return values. The caller receives the return value via `await`:
```gdscript
func fetch_player_data() -> Dictionary:
    var http := HTTPRequest.new()
    add_child(http)
    http.request("https://api.example.com/player")
    var result: Array = await http.request_completed
    http.queue_free()
    var json := JSON.new()
    json.parse(result[3].get_string_from_utf8())
    return json.data

func _ready() -> void:
    var data: Dictionary = await fetch_player_data()
    print(data)
```

## Coroutine Behavior

### Control Flow
When a function hits `await`, it immediately returns to the caller. The caller can either:
1. **Ignore the return** — execution continues in the caller immediately
2. **`await` the call** — caller also pauses until the coroutine finishes

```gdscript
func _ready() -> void:
    print("1")
    do_async_thing()     # Returns immediately, does NOT wait
    print("2")           # Prints before do_async_thing finishes

func _ready() -> void:
    print("1")
    await do_async_thing()  # Waits for completion
    print("2")              # Prints after do_async_thing finishes

func do_async_thing() -> void:
    await get_tree().create_timer(1.0).timeout
    print("async done")
```

Output without await: `1`, `2`, `async done`
Output with await: `1`, `async done`, `2`

### Coroutine Safety Pitfalls

**Freed nodes**: If the node running a coroutine is freed while awaiting, the coroutine silently stops. No error, no crash — just silent failure:
```gdscript
func attack_sequence() -> void:
    play_animation("windup")
    await get_tree().create_timer(0.5).timeout
    # If this node was freed during the wait, execution stops here
    play_animation("strike")  # Never reached
```

**Guard with is_instance_valid**:
```gdscript
func delayed_action() -> void:
    await get_tree().create_timer(2.0).timeout
    if not is_instance_valid(self):
        return
    # Safe to proceed
    do_something()
```

**Scene tree changes**: After an await, the scene tree may have changed. Nodes may have been reparented, removed, or freed. Always validate assumptions after awaiting:
```gdscript
func chase_target() -> void:
    await get_tree().create_timer(0.1).timeout
    if not is_instance_valid(target):
        return
    if not is_inside_tree():
        return
    position = position.move_toward(target.position, speed)
```

**Signal connected before emission**: If you `await` a signal that was already emitted in the same frame before the await was reached, the await will wait for the *next* emission, not the one that already happened. For one-shot signals emitted during setup, use `call_deferred`:
```gdscript
# Potential issue — signal may emit before await is reached
func _ready() -> void:
    start_operation()          # Might emit operation_done immediately
    await operation_done       # Waits for NEXT emission

# Fix — defer the operation
func _ready() -> void:
    start_operation.call_deferred()
    await operation_done
```

## Common Async Patterns

### Delay / Timer
```gdscript
func spawn_with_delay(delay: float) -> void:
    await get_tree().create_timer(delay).timeout
    spawn_enemy()
```

### Animation Sequence
```gdscript
func play_cutscene() -> void:
    $AnimationPlayer.play(&"intro")
    await $AnimationPlayer.animation_finished
    $AnimationPlayer.play(&"dialogue")
    await $AnimationPlayer.animation_finished
    $AnimationPlayer.play(&"outro")
    await $AnimationPlayer.animation_finished
    emit_signal(&"cutscene_finished")
```

### Wait for Any of Multiple Signals
GDScript has no built-in `await_any`. Workaround with a helper signal:
```gdscript
signal _any_completed

func wait_for_first() -> void:
    $Timer.timeout.connect(func(): _any_completed.emit(), CONNECT_ONE_SHOT)
    $Button.pressed.connect(func(): _any_completed.emit(), CONNECT_ONE_SHOT)
    await _any_completed
    # One of them fired — clean up the other connections if needed
```

### Wait for All Signals
```gdscript
func wait_for_all(signals: Array[Signal]) -> void:
    var remaining := signals.size()
    var all_done_signal := Signal()  # Can't do this directly
    
    # Practical approach — await each in sequence
    for sig in signals:
        await sig
    
    # Or use a counter pattern
    var count := 0
    for sig in signals:
        sig.connect(func():
            count += 1
        , CONNECT_ONE_SHOT)
    
    while count < signals.size():
        await get_tree().process_frame
```

### Async Resource Loading
```gdscript
func load_scene_async(path: String) -> PackedScene:
    ResourceLoader.load_threaded_request(path)
    while true:
        var status := ResourceLoader.load_threaded_get_status(path)
        match status:
            ResourceLoader.THREAD_LOAD_IN_PROGRESS:
                # Update loading bar
                var progress: Array = []
                ResourceLoader.load_threaded_get_status(path, progress)
                loading_bar.value = progress[0] * 100.0
                await get_tree().process_frame
            ResourceLoader.THREAD_LOAD_LOADED:
                return ResourceLoader.load_threaded_get(path)
            _:
                push_error("Failed to load: " + path)
                return null
```

## Threading

For CPU-intensive work that would block the game, use `Thread`. Threads are separate from coroutines — they run on actual OS threads.

```gdscript
var _thread: Thread

func _ready() -> void:
    _thread = Thread.new()
    _thread.start(_heavy_computation)

func _heavy_computation() -> void:
    # Runs on a separate thread
    var result := 0
    for i in 1_000_000:
        result += i
    # IMPORTANT: Cannot call scene tree or node methods from a thread
    # Use call_deferred to safely interact with the main thread
    call_deferred("_on_computation_done", result)

func _on_computation_done(result: int) -> void:
    print("Result: ", result)

func _exit_tree() -> void:
    if _thread:
        _thread.wait_to_finish()  # Always wait before freeing
```

### Thread Safety Rules
- **Never** access or modify scene tree nodes from a background thread
- **Never** call methods on nodes from a background thread
- Use `call_deferred()` or `Callable.call_deferred()` to marshal work back to the main thread
- Use `Mutex` for shared data between threads
- Use `Semaphore` for thread synchronization

```gdscript
var _mutex := Mutex.new()
var _shared_data: Array = []

func _thread_function() -> void:
    var local_result := expensive_calculation()
    _mutex.lock()
    _shared_data.append(local_result)
    _mutex.unlock()

func _process(_delta: float) -> void:
    _mutex.lock()
    if not _shared_data.is_empty():
        var data = _shared_data.pop_front()
        process_result(data)
    _mutex.unlock()
```

### WorkerThreadPool
For simpler thread management, use the built-in `WorkerThreadPool`:
```gdscript
func start_work() -> void:
    var task_id := WorkerThreadPool.add_task(_do_work)
    # Later, check if done:
    # WorkerThreadPool.is_task_completed(task_id)
    # WorkerThreadPool.wait_for_task_completion(task_id)  # Blocks!

func _do_work() -> void:
    # Heavy work here
    pass
```

Group tasks for parallel iteration:
```gdscript
func process_chunks() -> void:
    var group_id := WorkerThreadPool.add_group_task(
        _process_chunk, chunk_count
    )
    # Wait for all chunks
    WorkerThreadPool.wait_for_group_task_completion(group_id)

func _process_chunk(index: int) -> void:
    # Process chunk at index — runs on worker thread
    pass
```
