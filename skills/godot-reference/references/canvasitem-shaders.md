# CanvasItem Shaders (2D)

## Overview

CanvasItem shaders render 2D elements: Sprite2D, AnimatedSprite2D, Control nodes, Polygon2D, Line2D, and any CanvasItem-derived node. Simpler than spatial shaders — two processor functions: `vertex()` and `fragment()`. There's also a `light()` function for custom 2D lighting.

```glsl
shader_type canvas_item;

void vertex() { }    // Transform 2D vertices
void fragment() { }  // Set pixel color
void light() { }     // Custom 2D lighting (optional)
```

## Render Modes

```glsl
shader_type canvas_item;
render_mode blend_add, unshaded;
```

### Blend Modes
- `blend_mix` — Standard alpha blending (default)
- `blend_add` — Additive
- `blend_sub` — Subtractive
- `blend_mul` — Multiply
- `blend_premul_alpha` — Premultiplied alpha
- `blend_disabled` — No blending (writes directly)

### Other
- `unshaded` — Skip 2D lighting entirely
- `light_only` — Only visible where 2D lights illuminate
- `skip_vertex_transform` — Skip engine's canvas transform
- `world_vertex_coords` — Vertices in world space

## Vertex Built-ins

| Built-in | Type | Access | Description |
|---|---|---|---|
| `VERTEX` | vec2 | inout | 2D vertex position |
| `UV` | vec2 | inout | UV coordinates |
| `COLOR` | vec4 | inout | Vertex color (includes node modulate) |
| `POINT_SIZE` | float | out | Point size |
| `MODEL_MATRIX` | mat4 | in | Local → world (2D canvas transform) |
| `CANVAS_MATRIX` | mat4 | in | World → canvas |
| `SCREEN_MATRIX` | mat4 | in | Canvas → screen |
| `INSTANCE_ID` | int | in | Instance index |
| `INSTANCE_CUSTOM` | vec4 | in | Instance custom data (particles) |

## Fragment Built-ins

| Built-in | Type | Access | Description |
|---|---|---|---|
| `COLOR` | vec4 | inout | Pixel color (initialized to vertex color × texture) |
| `NORMAL` | vec3 | out | Normal for 2D lighting (in local space) |
| `NORMAL_MAP` | vec3 | out | Normal map value (tangent-space) |
| `NORMAL_MAP_DEPTH` | float | out | Normal map strength (default 1.0) |
| `UV` | vec2 | in | UV coordinates |
| `TEXTURE` | sampler2D | in | Node's main texture (automatic) |
| `TEXTURE_PIXEL_SIZE` | vec2 | in | 1.0 / texture size in pixels |
| `SCREEN_UV` | vec2 | in | Screen-space UV |
| `SCREEN_PIXEL_SIZE` | vec2 | in | 1.0 / screen size in pixels |
| `FRAGCOORD` | vec4 | in | Window coordinates |
| `LIGHT_VERTEX` | vec3 | out | Override position for light calc |
| `AT_LIGHT_PASS` | bool | in | True during 2D light pass |
| `VERTEX` | vec2 | in | Vertex position |
| `SPECULAR_SHININESS` | vec4 | out | Specular color (rgb) + shininess (a) |

### TEXTURE and COLOR

The `TEXTURE` sampler automatically binds to whatever texture the node uses (Sprite2D's texture, etc.). `COLOR` in `fragment()` is pre-initialized to `vertex_color * texture(TEXTURE, UV)`. You can modify it or overwrite it entirely:

```glsl
void fragment() {
    // COLOR is already texture * vertex_color
    COLOR.rgb = mix(COLOR.rgb, vec3(1.0, 0.0, 0.0), 0.5); // tint red
}
```

Or read the texture yourself:
```glsl
void fragment() {
    vec4 tex = texture(TEXTURE, UV);
    COLOR = vec4(tex.rgb * 0.5, tex.a); // darken
}
```

## Light Built-ins

Called once per 2D light per pixel. Only runs when Light2D nodes affect this CanvasItem.

| Built-in | Type | Access | Description |
|---|---|---|---|
| `LIGHT_COLOR` | vec4 | in | Light color × energy |
| `LIGHT_POSITION` | vec3 | in | Light position in canvas space |
| `LIGHT_DIRECTION` | vec3 | in | Light direction (for directional) |
| `LIGHT_ENERGY` | float | in | Light energy |
| `LIGHT_IS_DIRECTIONAL` | bool | in | True for DirectionalLight2D |
| `LIGHT` | vec4 | out | Final light contribution |
| `SHADOW_MODULATE` | vec4 | in | Shadow color |
| `NORMAL` | vec3 | in | From fragment |
| `COLOR` | vec4 | in | From fragment |
| `TEXTURE` | sampler2D | in | Node's texture |
| `UV` | vec2 | in | UV |
| `SCREEN_UV` | vec2 | in | Screen UV |
| `SPECULAR_SHININESS` | vec4 | in | From fragment |

## Screen Reading in 2D

```glsl
shader_type canvas_item;

uniform sampler2D screen_texture : hint_screen_texture, filter_linear;

void fragment() {
    vec3 screen = texture(screen_texture, SCREEN_UV).rgb;
    COLOR.rgb = screen;
}
```

**Important**: In 2D, screen reading requires a `BackBufferCopy` node as a parent/ancestor to explicitly copy the screen at that point. Without it, `hint_screen_texture` may produce incorrect results or show nothing.

BackBufferCopy modes:
- **Viewport** — copies entire viewport (expensive but reliable)
- **Rect** — copies only a rectangular region (more efficient)

## Common Examples

### Flash White (Damage Effect)
```glsl
shader_type canvas_item;

uniform float flash_amount : hint_range(0.0, 1.0) = 0.0;

void fragment() {
    COLOR.rgb = mix(COLOR.rgb, vec3(1.0), flash_amount);
}
```

### Grayscale
```glsl
shader_type canvas_item;

uniform float amount : hint_range(0.0, 1.0) = 1.0;

void fragment() {
    float gray = dot(COLOR.rgb, vec3(0.299, 0.587, 0.114));
    COLOR.rgb = mix(COLOR.rgb, vec3(gray), amount);
}
```

### Outline (Sprite)
```glsl
shader_type canvas_item;

uniform vec4 outline_color : source_color = vec4(0.0, 0.0, 0.0, 1.0);
uniform float outline_width : hint_range(0.0, 10.0) = 1.0;

void fragment() {
    vec4 col = texture(TEXTURE, UV);
    if (col.a < 0.5) {
        // Check neighboring pixels
        float w = outline_width * TEXTURE_PIXEL_SIZE.x;
        float h = outline_width * TEXTURE_PIXEL_SIZE.y;
        float a = texture(TEXTURE, UV + vec2(w, 0.0)).a;
        a = max(a, texture(TEXTURE, UV + vec2(-w, 0.0)).a);
        a = max(a, texture(TEXTURE, UV + vec2(0.0, h)).a);
        a = max(a, texture(TEXTURE, UV + vec2(0.0, -h)).a);
        if (a > 0.5) {
            COLOR = outline_color;
        } else {
            COLOR = vec4(0.0);
        }
    } else {
        COLOR = col;
    }
}
```

### Dissolve
```glsl
shader_type canvas_item;

uniform sampler2D noise_tex : filter_linear;
uniform float dissolve_amount : hint_range(0.0, 1.0) = 0.0;
uniform vec4 edge_color : source_color = vec4(1.0, 0.5, 0.0, 1.0);
uniform float edge_width : hint_range(0.0, 0.1) = 0.02;

void fragment() {
    float noise = texture(noise_tex, UV).r;
    if (noise < dissolve_amount) {
        discard;
    }
    if (noise < dissolve_amount + edge_width) {
        COLOR.rgb = edge_color.rgb;
    }
}
```

### Chromatic Aberration (Screen Effect)
```glsl
shader_type canvas_item;

uniform sampler2D screen_texture : hint_screen_texture;
uniform float strength : hint_range(0.0, 10.0) = 2.0;

void fragment() {
    vec2 offset = strength * SCREEN_PIXEL_SIZE;
    float r = texture(screen_texture, SCREEN_UV + vec2(offset.x, 0.0)).r;
    float g = texture(screen_texture, SCREEN_UV).g;
    float b = texture(screen_texture, SCREEN_UV - vec2(offset.x, 0.0)).b;
    COLOR = vec4(r, g, b, 1.0);
}
```

### Wave / Distortion
```glsl
shader_type canvas_item;

uniform float wave_amplitude = 5.0;
uniform float wave_frequency = 10.0;
uniform float wave_speed = 2.0;

void vertex() {
    VERTEX.y += sin(VERTEX.x * wave_frequency + TIME * wave_speed) * wave_amplitude;
}
```

### Pixelation
```glsl
shader_type canvas_item;

uniform float pixel_size : hint_range(1.0, 32.0) = 4.0;

void fragment() {
    vec2 size = vec2(textureSize(TEXTURE, 0));
    vec2 uv = floor(UV * size / pixel_size) * pixel_size / size;
    COLOR = texture(TEXTURE, uv);
}
```

## AT_LIGHT_PASS Usage

Use `AT_LIGHT_PASS` to apply different effects during the base pass vs the light pass:

```glsl
void fragment() {
    if (AT_LIGHT_PASS) {
        // Only during 2D light rendering
        COLOR.rgb *= 1.5; // boost brightness under lights
    } else {
        // Normal rendering
        COLOR = texture(TEXTURE, UV);
    }
}
```

## Applying to Full Screen

To apply a canvas_item shader as a full-screen post-process:
1. Add a `ColorRect` covering the entire viewport
2. Set its material to a `ShaderMaterial` with the shader
3. Add a `BackBufferCopy` node as a sibling above it (for screen reading)

Or use a `SubViewport` + `TextureRect` pipeline for more control.

## Pitfalls

- `BackBufferCopy` is required for `hint_screen_texture` in 2D — unlike 3D where screen capture is automatic
- `COLOR` in fragment is pre-multiplied with vertex color and texture — if you read `TEXTURE` manually, multiply vertex `COLOR` yourself
- 2D normal maps require Light2D nodes in the scene to have any visible effect
- `discard` prevents batching of CanvasItem draws on some platforms
