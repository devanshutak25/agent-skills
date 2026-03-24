---
name: godot-reference
description: >
  Comprehensive Godot Engine 4.x development reference covering GDScript, C#, 2D, 3D,
  physics, shaders, UI, animation, audio, networking, navigation, tilemaps, and more.
  Use this skill whenever the user mentions Godot, GDScript, Godot Engine, game development
  with Godot, or references any Godot-specific classes (Node2D, CharacterBody3D, Control,
  TileMapLayer, AnimationTree, MultiplayerAPI, etc.). Also trigger when the user asks about
  game development topics and their project context indicates Godot usage — even if they
  don't say "Godot" explicitly. Covers Godot 4.5 and 4.6. Handles writing new code,
  debugging existing projects, explaining API behavior, and providing architectural guidance.
---

# Godot Engine 4.x Development Reference

Targets **Godot 4.5** and **Godot 4.6**. Covers both **GDScript** and **C#**.

When a query touches a specific topic, read **only** the relevant reference file(s) listed below before responding. Do not load files speculatively — load the minimum set needed to answer the question well.

If a query spans multiple topics (e.g. "CharacterBody3D with AnimationTree"), load the relevant file from each topic area.

## General Principles

These apply to all Godot work regardless of topic:

- Godot uses a **node/scene composition model**, not deep class inheritance. Prefer composition over inheritance.
- Every node has a **lifecycle**: `_init()` → `_enter_tree()` → `_ready()` → `_process()` / `_physics_process()` → `_exit_tree()`.
- The scene tree processes nodes **top-down** for `_process` and `_physics_process`.
- Use **signals** for decoupled communication between nodes. Avoid direct references where possible.
- Resources are **shared by default** when loaded via `load()` / `preload()`. Use `resource.duplicate()` or `ResourceLoader.load("...", "", ResourceLoader.CACHE_MODE_IGNORE)` for unique copies.
- `res://` is the read-only project root. `user://` is the writable user data directory.
- Use **@export** to expose properties to the editor. Use **@onready** for node references resolved at `_ready()`.
- Prefer **StringName** (`&"name"`) over plain strings for signals, node paths, and input actions — they're interned and faster to compare.
- All physics queries and body movement must happen in `_physics_process()`, not `_process()`.
- **4.6 note**: When something changed between 4.5 and 4.6, it is called out inline in the relevant reference file.

## Routing Table

Use this table to decide which file(s) to read. Match the user's query to the most specific category.

### GDScript Language
| Query is about... | Read |
|---|---|
| Syntax, variables, functions, control flow, classes, enums, lambdas | `references/gdscript-syntax.md` |
| Type hints, static typing, typed arrays/dictionaries/signals | `references/gdscript-typing.md` |
| @export, @onready, @tool, @icon, annotations | `references/gdscript-annotations.md` |
| await, coroutines, signals as awaitables, threading | `references/gdscript-async.md` |
| Design patterns, idioms, best practices, anti-patterns | `references/gdscript-patterns.md` |

### C#
| Query is about... | Read |
|---|---|
| C# setup, project structure, naming, Godot C# API | `references/csharp-basics.md` |
| Signals in C#, events, connecting/disconnecting | `references/csharp-signals-events.md` |
| GDScript ↔ C# interop, Variant, Callable, mixed projects | `references/csharp-interop.md` |

### Scene Architecture
| Query is about... | Read |
|---|---|
| Node lifecycle, _ready/_process order, scene tree | `references/node-lifecycle.md` |
| PackedScene, instantiation, scene switching, scene inheritance | `references/scenes-instantiation.md` |
| Signals: declaration, connecting, custom, typed | `references/signals-system.md` |
| Autoloads, singletons, groups, composition patterns | `references/autoloads-groups.md` |

### Input
| Query is about... | Read |
|---|---|
| InputMap, actions, deadzone, strength | `references/input-actions.md` |
| Gamepad, joystick, vibration | `references/gamepad-input.md` |
| Mouse, touch, gestures | `references/mouse-touch.md` |

### Physics — 2D
| Query is about... | Read |
|---|---|
| CharacterBody2D, RigidBody2D, move_and_slide, forces, slopes, platforms | `references/characterbody2d.md` |
| Area2D, collision shapes, layers/masks, raycasting | `references/collision2d.md` |
| Joint2D types, constraints | `references/joints-2d.md` |

### Physics — 3D
| Query is about... | Read |
|---|---|
| CharacterBody3D, RigidBody3D, move_and_slide, forces, slopes, stairs | `references/characterbody3d.md` |
| Area3D, collision shapes, layers/masks, raycasting | `references/collision3d.md` |
| Joint3D types, constraints | `references/joints-3d.md` |

### Rendering — 2D
| Query is about... | Read |
|---|---|
| Sprite2D, AnimatedSprite2D, CanvasItem, z-index | `references/sprites-canvasitem.md` |
| Custom draw, CanvasItem drawing primitives | `references/canvas-drawing-2d.md` |
| GPUParticles2D, CPUParticles2D | `references/particles-2d.md` |
| Camera2D, smoothing, limits, zoom, screen shake | `references/camera-2d.md` |

### Rendering — 3D
| Query is about... | Read |
|---|---|
| MeshInstance3D, StandardMaterial3D, ShaderMaterial | `references/meshes-materials.md` |
| Lights, shadows, baked/dynamic GI | `references/lighting-3d.md` |
| WorldEnvironment, Camera3D, Sky, fog, post-processing | `references/environment-3d.md` |
| GPUParticles3D, trails, sub-emitters | `references/particles-3d.md` |

### Shaders
| Query is about... | Read |
|---|---|
| Shader language syntax, uniforms, varyings, built-in functions | `references/shader-language.md` |
| 3D spatial shaders (vertex/fragment/light) | `references/spatial-shaders.md` |
| 2D canvas_item shaders | `references/canvasitem-shaders.md` |
| Particle shaders (custom particle behavior) | `references/particle-shaders.md` |
| Common shader recipes (outline, dissolve, toon, water, etc.) | `references/shader-recipes.md` |

### Tilemaps
| Query is about... | Read |
|---|---|
| TileSet setup, tile sources, physics/nav/custom data layers | `references/tileset-creation.md` |
| TileMapLayer, placing tiles, patterns, scenes-as-tiles | `references/tilemaplayer.md` |
| Terrain system, terrain sets, peering bits, autotile | `references/terrain-autotile.md` |

### UI
| Query is about... | Read |
|---|---|
| Control layout, anchors, offsets, size flags, containers | `references/control-layout.md` |
| Theme, StyleBox, fonts, theme overrides | `references/themes-styling.md` |
| Specific UI nodes (Button, Label, LineEdit, RichTextLabel, etc.) | `references/ui-nodes.md` |
| Popups, windows, dialogs | `references/popups-dialogs.md` |

### Animation
| Query is about... | Read |
|---|---|
| AnimationPlayer, keyframes, tracks | `references/animation-player.md` |
| AnimationTree, state machines, blend trees | `references/animation-tree.md` |
| Tween, chaining, easing | `references/tweens.md` |
| Skeleton2D/3D, bones, IK, retargeting | `references/skeletal-animation.md` |

### Audio
| Query is about... | Read |
|---|---|
| AudioStreamPlayer, streams, playback | `references/audio-playback.md` |
| AudioServer, buses, effects | `references/audio-buses.md` |
| Spatial/3D audio, attenuation, Doppler | `references/spatial-audio.md` |

### Navigation
| Query is about... | Read |
|---|---|
| NavigationMesh/Polygon, NavigationRegion, baking | `references/navigation-mesh.md` |
| NavigationAgent2D/3D, pathfinding, callbacks | `references/navigation-agent.md` |
| Nav layers, links, obstacles, avoidance | `references/navigation-advanced.md` |

### Networking
| Query is about... | Read |
|---|---|
| MultiplayerAPI, MultiplayerPeer, authority, server/client | `references/multiplayer-api.md` |
| @rpc annotation, call modes, channels, transfer modes | `references/rpcs.md` |
| MultiplayerSynchronizer, MultiplayerSpawner, replication | `references/state-sync.md` |
| ENet, WebSocket, WebRTC, custom transport | `references/transport.md` |

### Resources & I/O
| Query is about... | Read |
|---|---|
| Resource class, custom resources, sub-resources, UID | `references/resources.md` |
| Save/load patterns, JSON, ConfigFile | `references/save-load.md` |
| FileAccess, DirAccess, path handling | `references/file-io.md` |

### Export & Deployment
| Query is about... | Read |
|---|---|
| Export templates, presets, feature tags | `references/export-basics.md` |
| Windows/macOS/Linux/Android/iOS/Web platform specifics | `references/platform-specifics.md` |
| Profiler, batching, LOD, occlusion, performance | `references/optimization.md` |

### Class Quick Reference
| Query is about... | Read |
|---|---|
| Core classes (Node, Object, Resource, SceneTree, etc.) | `references/classes-core.md` |
| 2D node classes | `references/classes-2d.md` |
| 3D node classes | `references/classes-3d.md` |
| UI/Control classes | `references/classes-ui.md` |
| Utility classes (Timer, Tween, HTTPRequest, OS, Engine, etc.) | `references/classes-utility.md` |

## Multi-File Loading Rules

1. **Simple question** (e.g. "how do I tween a property") → load **1 file** (`references/tweens.md`).
2. **Cross-topic question** (e.g. "CharacterBody2D with raycasting and animation") → load **2-3 files** from different sections.
3. **Architecture question** (e.g. "how should I structure a multiplayer platformer") → load the most relevant architecture files: `references/autoloads-groups.md` + topic-specific files as needed.
4. **Class lookup** (e.g. "what properties does Area3D have") → load the relevant `classes-*.md` file. If the question is also about *how* to use the class, load the topic file too.
5. **"What changed in 4.6"** → load the relevant topic file(s) — version changes are documented inline.
6. **Never load more than 5 files** for a single query. If a question seems to require more, answer from the most relevant 3-5 and note what was omitted.

## Code Style Conventions

When writing code for the user, follow these conventions unless they specify otherwise:

### GDScript
- Use **static typing** everywhere: `var speed: float = 200.0`
- Use **type inference** where unambiguous: `var position := Vector2.ZERO`
- Prefer `@onready var` over `get_node()` in `_ready()`
- Use **StringName** for signals and input actions: `&"jump"`, `&"body_entered"`
- Use **snake_case** for variables/functions, **PascalCase** for classes/nodes
- Signal declarations: `signal health_changed(new_health: int)`
- Prefer `is_on_floor()` checks inside `_physics_process()`, not `_process()`

### C#
- Follow **Godot C# naming**: PascalCase for properties/methods matching Godot API
- Use **[Export]** attribute instead of @export
- Use **partial classes** for Godot node scripts
- Signal declarations use **[Signal] delegate** pattern
- Null-check node references; C# doesn't have `@onready` — use `GetNode<T>()` in `_Ready()`

### Both Languages
- Always handle the **null/invalid case** for node lookups and resource loads
- Provide complete, runnable code — no placeholders or partial snippets
- Include comments only for non-obvious logic
- When showing a fix for a bug, show the corrected code and briefly explain what was wrong
