# Particle Shaders

## Overview

Particle shaders run on the GPU for `GPUParticles2D` and `GPUParticles3D`. Unlike other shader types, particle shaders don't draw geometry — they compute particle state (position, velocity, color, etc.) which is then rendered by a separate spatial or canvas_item material.

Particle shaders have two processor functions: `start()` (initialization) and `process()` (per-frame update). State persists between frames.

```glsl
shader_type particles;

void start() {
    // Called when a particle spawns (or restarts)
}

void process() {
    // Called every frame for each active particle
}
```

## Render Modes

```glsl
shader_type particles;
render_mode keep_data;          // Don't clear data on restart
render_mode disable_force;      // Ignore ParticleProcessMaterial force
render_mode disable_velocity;   // Ignore velocity integration
render_mode collision_use_scale; // Use particle scale for collision
```

## start() Built-ins

Called once when a particle first spawns or when it restarts:

| Built-in | Type | Access | Description |
|---|---|---|---|
| `TRANSFORM` | mat4 | inout | Particle transform (position + rotation + scale) |
| `VELOCITY` | vec3 | inout | Initial velocity |
| `COLOR` | vec4 | inout | Particle color (passed to draw shader) |
| `CUSTOM` | vec4 | inout | User-defined data (persists, passed to draw shader) |
| `ACTIVE` | bool | inout | Whether particle is alive |
| `AMOUNT` | uint | in | Total particle count |
| `INDEX` | uint | in | Particle index [0, AMOUNT) |
| `NUMBER` | uint | in | Sequential emission number |
| `LIFETIME` | float | in | Particle lifetime in seconds |
| `DELTA` | float | in | Frame delta |
| `TIME` | float | in | Global time |
| `EMISSION_TRANSFORM` | mat4 | in | Emitter's global transform |
| `SEED` | uint | in | Random seed for this particle |
| `AMOUNT_RATIO` | float | in | Ratio of particles to emit (0..1) |
| `RESTART_POSITION` | bool | in | True if position should reset (sub-particles) |
| `RESTART_ROT_SCALE` | bool | in | True if rotation/scale should reset |
| `RESTART_VELOCITY` | bool | in | True if velocity should reset |
| `RESTART_COLOR` | bool | in | True if color should reset |
| `RESTART_CUSTOM` | bool | in | True if custom data should reset |
| `USERDATA1`–`USERDATA6` | vec4 | in | Per-particle user data from ParticleProcessMaterial |

## process() Built-ins

Called every frame for each active particle. Same built-ins as `start()` plus:

| Built-in | Type | Access | Description |
|---|---|---|---|
| `COLLISION_NORMAL` | vec3 | in | Normal at collision point |
| `COLLISION_DEPTH` | float | in | Penetration depth |
| `COLLIDED` | bool | in | True if particle collided this frame |

## Random Number Generation

Use the built-in hash function for deterministic randomness:
```glsl
// Generate random float [0, 1]
float rand_from_seed(inout uint seed) {
    seed = (seed * 747796405u + 2891336453u);
    uint word = ((seed >> ((seed >> 28u) + 4u)) ^ seed) * 277803737u;
    return float((word >> 22u) ^ word) / 4294967295.0;
}

void start() {
    uint seed = SEED;
    float r = rand_from_seed(seed);
    // ...
}
```

Or use the simpler approach with INDEX:
```glsl
float rand = fract(sin(float(INDEX) * 12.9898) * 43758.5453);
```

## Sub-Particle Emission

Emit child particles from within `process()`:
```glsl
void process() {
    if (COLLIDED) {
        // Emit 3 spark sub-particles on collision
        for (int i = 0; i < 3; i++) {
            emit_subparticle(
                TRANSFORM,                           // transform
                reflect(VELOCITY, COLLISION_NORMAL),  // velocity
                vec4(1.0, 0.5, 0.0, 1.0),           // color
                vec4(0.0),                            // custom
                FLAG_EMIT_POSITION | FLAG_EMIT_ROT_SCALE | FLAG_EMIT_VELOCITY | FLAG_EMIT_COLOR
            );
        }
    }
}
```

**Flags** for `emit_subparticle()`:
- `FLAG_EMIT_POSITION` — use provided position
- `FLAG_EMIT_ROT_SCALE` — use provided rotation/scale
- `FLAG_EMIT_VELOCITY` — use provided velocity
- `FLAG_EMIT_COLOR` — use provided color
- `FLAG_EMIT_CUSTOM` — use provided custom data

If a flag is not set, the sub-particle uses the value computed by its own `start()` function.

## Common Examples

### Simple Gravity + Spread
```glsl
shader_type particles;

uniform float spread = 2.0;
uniform vec3 gravity = vec3(0.0, -9.8, 0.0);

void start() {
    uint seed = SEED;
    float angle = rand_from_seed(seed) * TAU;
    float radius = rand_from_seed(seed) * spread;
    VELOCITY = vec3(cos(angle) * radius, 5.0, sin(angle) * radius);
    COLOR = vec4(1.0, 0.8, 0.3, 1.0);
    TRANSFORM = EMISSION_TRANSFORM;
    TRANSFORM[3].xyz = EMISSION_TRANSFORM[3].xyz;
}

void process() {
    VELOCITY += gravity * DELTA;
    // Fade out over lifetime
    float life_ratio = 1.0 - (float(INDEX) / float(AMOUNT));
    COLOR.a = 1.0 - smoothstep(0.7, 1.0, life_ratio);
}
```

### Orbit Around Emitter
```glsl
shader_type particles;

uniform float orbit_radius = 2.0;
uniform float orbit_speed = 1.0;

void start() {
    CUSTOM.x = float(INDEX) / float(AMOUNT) * TAU; // phase offset
}

void process() {
    float angle = CUSTOM.x + TIME * orbit_speed;
    TRANSFORM[3].x = cos(angle) * orbit_radius;
    TRANSFORM[3].z = sin(angle) * orbit_radius;
    VELOCITY = vec3(0.0); // disable velocity integration
}
```

### Trail-Like Particle
```glsl
shader_type particles;
render_mode disable_velocity;

uniform float trail_length = 5.0;

void start() {
    float offset = float(INDEX) / float(AMOUNT) * trail_length;
    TRANSFORM[3].xyz = EMISSION_TRANSFORM[3].xyz;
    CUSTOM.x = offset; // store offset
}

void process() {
    // Each particle follows emitter with a delay
    float t = CUSTOM.x / trail_length;
    COLOR.a = 1.0 - t; // fade along trail
}
```

## Accessing Particle Data in Draw Shader

The rendering material (spatial or canvas_item) on the GPUParticles node receives:

| Variable | Source | Description |
|---|---|---|
| `COLOR` | Particle COLOR | Vertex color |
| `INSTANCE_CUSTOM` | Particle CUSTOM | Custom data (in vertex shader) |
| `INSTANCE_ID` | INDEX | Particle index |
| `TRANSFORM` | Particle TRANSFORM | Instance transform |

Example spatial shader reading particle custom data:
```glsl
shader_type spatial;
render_mode unshaded;

void vertex() {
    // INSTANCE_CUSTOM.x could be particle age/phase
    COLOR.a = 1.0 - INSTANCE_CUSTOM.x;
}

void fragment() {
    ALBEDO = COLOR.rgb;
    ALPHA = COLOR.a;
}
```

## Pitfalls

- Particle shaders maintain state — variables persist between frames. If you don't reset something in `start()`, it keeps its value from the last lifetime.
- `TRANSFORM` contains position, rotation, and scale. Setting position alone: `TRANSFORM[3].xyz = my_position;`
- `emit_subparticle()` requires a sub-emitter set on the GPUParticles node.
- `VELOCITY` integration is automatic unless `disable_velocity` render mode is used. If you set position directly in `process()`, use `disable_velocity`.
- The `AMOUNT` and `INDEX` values are based on the total particle pool, not currently visible particles.
- Particle shaders don't support `discard` — use `ACTIVE = false` instead to kill a particle.
