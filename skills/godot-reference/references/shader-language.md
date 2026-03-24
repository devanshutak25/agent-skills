# Godot Shader Language Reference

## Overview

Godot's shading language is based on GLSL ES 3.0 with Godot-specific extensions. All shaders are text files (`.gdshader`) that compile to GPU code. The language is statically typed with C-like syntax.

Every shader begins with a `shader_type` declaration:
```glsl
shader_type spatial;    // 3D objects
shader_type canvas_item; // 2D sprites, UI
shader_type particles;  // GPU particles
shader_type sky;        // Sky rendering
shader_type fog;        // Volumetric fog
```

## Data Types

### Scalars
```glsl
bool b = true;
int i = 42;
uint u = 10u;
float f = 3.14;
```

### Vectors
```glsl
vec2 v2 = vec2(1.0, 2.0);
vec3 v3 = vec3(1.0, 2.0, 3.0);
vec4 v4 = vec4(v3, 1.0);         // construct from smaller + scalar
ivec2 iv = ivec2(1, 2);          // integer vectors
uvec3 uv = uvec3(1u, 2u, 3u);   // unsigned integer vectors
bvec4 bv = bvec4(true, false, true, false);
```

### Swizzling
```glsl
vec3 a = vec3(1.0, 2.0, 3.0);
vec3 b = a.zyx;    // vec3(3.0, 2.0, 1.0)
vec2 c = a.xy;     // vec2(1.0, 2.0)
vec4 d = a.xyzz;   // vec4(1.0, 2.0, 3.0, 3.0)
a.xy = vec2(5.0);  // write swizzle
```

Components: `x/r/s`, `y/g/t`, `z/b/p`, `w/a/q` (all interchangeable).

### Matrices
```glsl
mat2 m2;
mat3 m3;
mat4 m4;
mat2 m = mat2(vec2(1.0, 0.0), vec2(0.0, 1.0));
```

### Samplers (Textures)
```glsl
sampler2D tex;
sampler2DArray tex_arr;
sampler3D vol_tex;
samplerCube cube_tex;
samplerExternalOES ext_tex;  // external textures (Android)
```

### Arrays
```glsl
float arr[3] = { 1.0, 2.0, 3.0 };
vec3 colors[2] = { vec3(1.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) };
int len = arr.length();  // 3
```

Global arrays must be `const` or `uniform`. Uniform arrays cannot have default values.

### Structs
```glsl
struct PointLight {
    vec3 position;
    vec3 color;
    float intensity;
};

void fragment() {
    PointLight light;
    light.position = vec3(0.0);
    light.color = vec3(1.0, 0.0, 0.0);
    light.intensity = 0.5;
}
```

## Constants
```glsl
const float PI = 3.14159265;
const vec3 UP = vec3(0.0, 1.0, 0.0);
```

Constants are slightly faster than uniforms to access. Must be initialized at declaration.

## Precision Modifiers
```glsl
lowp float a;     // ~8-bit, mapped 0-1
mediump float b;  // ~16-bit / half float
highp float c;    // full 32-bit float (default)
```

Mobile GPUs benefit significantly from lower precision in fragment shaders. Desktop GPUs usually ignore precision qualifiers.

## Uniforms

Uniforms are parameters set from GDScript/C# and read-only in the shader:

```glsl
uniform float speed = 1.0;
uniform vec4 tint_color : source_color = vec4(1.0);
uniform sampler2D noise_texture : filter_linear, repeat_enable;
```

### Setting from GDScript
```gdscript
material.set_shader_parameter("speed", 2.5)
material.set_shader_parameter("tint_color", Color.RED)
material.set_shader_parameter("noise_texture", preload("res://noise.tres"))
```

### Uniform Hints

| Hint | Type | Effect |
|---|---|---|
| `source_color` | vec4/vec3 | Color picker, sRGB→linear conversion |
| `hint_range(min, max, step)` | float/int | Slider in inspector |
| `hint_screen_texture` | sampler2D | Reads previously rendered screen |
| `hint_depth_texture` | sampler2D | Reads depth buffer |
| `hint_normal_roughness_texture` | sampler2D | Normal+roughness buffer |
| `hint_default_white` | sampler2D | Default white texture |
| `hint_default_black` | sampler2D | Default black texture |
| `hint_default_transparent` | sampler2D | Default transparent texture |
| `hint_anisotropy` | sampler2D | Anisotropy flowmap |
| `filter_nearest` | sampler | Nearest-neighbor filtering |
| `filter_linear` | sampler | Bilinear filtering |
| `filter_nearest_mipmap` | sampler | Nearest + mipmaps |
| `filter_linear_mipmap` | sampler | Linear + mipmaps |
| `repeat_enable` | sampler | Texture wrapping enabled |
| `repeat_disable` | sampler | Clamp to edge |

Multiple hints combine with commas:
```glsl
uniform sampler2D albedo_tex : source_color, filter_linear_mipmap, repeat_enable;
```

### Global Uniforms

Project-wide uniforms set in Project Settings > Shader Globals. Accessed with `global`:
```glsl
uniform float wind_strength : hint_range(0, 10) = global;
```

Set from code: `RenderingServer.global_shader_parameter_set("wind_strength", 5.0)`

### Instance Uniforms (4.0+)

Per-instance values without creating a new material:
```glsl
instance uniform vec4 instance_color : source_color = vec4(1.0);
```

Set in GDScript on a specific MeshInstance3D:
```gdscript
mesh_instance.set_instance_shader_parameter("instance_color", Color.RED)
```

## Varyings

Transfer data between shader stages (vertex → fragment → light):

```glsl
varying vec3 world_normal;
varying vec2 custom_uv;

void vertex() {
    world_normal = NORMAL;
    custom_uv = UV * 2.0;
}

void fragment() {
    ALBEDO = vec3(custom_uv, 0.0);
    NORMAL_MAP = world_normal;  // example usage
}
```

### Interpolation Qualifiers
```glsl
varying flat vec3 flat_color;     // no interpolation (constant per primitive)
varying smooth vec3 smooth_color; // default, perspective-correct interpolation
```

**Note**: In Godot 4, varyings can pass from fragment → light as well (not just vertex → fragment).

## Control Flow

```glsl
// if/else
if (x > 0.0) {
    // ...
} else if (x < -1.0) {
    // ...
} else {
    // ...
}

// Ternary
float result = condition ? a : b;

// for loop
for (int i = 0; i < 10; i++) { }

// while loop
while (condition) { }

// do-while
do { } while (condition);

// switch
switch (mode) {
    case 0:
        // ...
        break;
    case 1:
        // ...
        break;
    default:
        break;
}

// discard (fragment only — discards the pixel)
if (ALBEDO.a < 0.5) {
    discard;
}
```

## Functions

```glsl
float my_func(float a, float b) {
    return a + b;
}

// Qualifiers
void modify(inout vec3 v) { v *= 2.0; }  // read-write
void output(out vec3 v) { v = vec3(1.0); } // write-only
void read(in vec3 v) { /* read-only, default */ }

// Array returns (4.0+)
vec3[2] get_pair() {
    return vec3[2](vec3(1.0), vec3(0.0));
}
```

Functions must be defined above (before) any code that calls them.

## Preprocessor

```glsl
#define MY_CONSTANT 1.0
#define USE_FEATURE

#ifdef USE_FEATURE
    // compiled when USE_FEATURE is defined
#endif

#ifndef SOME_THING
    // compiled when SOME_THING is NOT defined
#endif

#if RENDERER_COMPATIBILITY
    // Compatibility renderer (4.4+)
#elif RENDERER_FORWARD_PLUS
    // Forward+ renderer (4.4+)
#elif RENDERER_MOBILE
    // Mobile renderer (4.4+)
#endif

// Include other shader files
#include "res://shaders/utils.gdshaderinc"
```

Include files use `.gdshaderinc` extension. Max include depth: 25.

## Built-in Functions (Common)

### Math
`abs`, `sign`, `floor`, `ceil`, `round`, `trunc`, `fract`, `mod`, `min`, `max`, `clamp`, `mix` (lerp), `step`, `smoothstep`, `sqrt`, `inversesqrt`, `pow`, `exp`, `exp2`, `log`, `log2`

### Trigonometry
`sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `sinh`, `cosh`, `tanh`, `radians`, `degrees`

### Vector
`length`, `distance`, `dot`, `cross`, `normalize`, `reflect`, `refract`, `faceforward`

### Texture
`texture(sampler, uv)`, `textureLod(sampler, uv, lod)`, `textureSize(sampler, lod)`, `texelFetch(sampler, ivec2, lod)`, `textureGrad(sampler, uv, dPdx, dPdy)`

### Comparison / Logical
`lessThan`, `greaterThan`, `equal`, `notEqual`, `any`, `all`, `not`

### Derivative (fragment only)
`dFdx`, `dFdy`, `fwidth`

### Bit Operations (int/uint)
`&`, `|`, `^`, `~`, `<<`, `>>`

## Global Built-ins (All Shader Types)

```glsl
TIME       // float — seconds since engine start, wraps at 3600s
PI         // float — 3.14159265358979
TAU        // float — 6.28318530717959
E          // float — 2.71828182845905
```

## Applying Shaders

### In Editor
1. Select node → Inspector → Material → New ShaderMaterial
2. ShaderMaterial → Shader → New Shader (or load `.gdshader`)
3. Edit shader in the built-in shader editor (bottom panel)

### From GDScript
```gdscript
var mat := ShaderMaterial.new()
mat.shader = preload("res://shaders/my_shader.gdshader")
mat.set_shader_parameter("speed", 2.0)
sprite.material = mat

# Per-instance: unique material per node
sprite.material = sprite.material.duplicate()
```

## Pitfalls

1. **Uninitialized local variables**: Contain garbage. Always initialize.
2. **Uniform limit**: ~65536 bytes (4096 vec4s) per shader. Use textures for large data.
3. **GDScript int/float are 64-bit, shader int/float are 32-bit**: Precision loss possible.
4. **No error on type mismatch**: `set_shader_parameter()` silently fails with wrong types.
5. **`discard` is expensive**: Prevents early depth test optimization on some GPUs.
6. **`hint_screen_texture` in 3D**: Only captures opaque geometry, not transparent objects rendered later.
