# Spatial Shaders Reference (3D)

## Structure

```glsl
shader_type spatial;
render_mode blend_mix, depth_draw_opaque, cull_back;  // optional

// uniforms
// varyings

void vertex() { }    // Per-vertex processing
void fragment() { }  // Per-pixel material setup
void light() { }     // Per-pixel-per-light processing
```

## Render Modes

### Blending
```glsl
blend_mix              // Alpha blending (default)
blend_add              // Additive
blend_sub              // Subtractive
blend_mul              // Multiplicative
blend_premul_alpha     // Pre-multiplied alpha
```

### Depth
```glsl
depth_draw_opaque      // Write depth for opaque only (default)
depth_draw_always       // Always write depth
depth_draw_never        // Never write depth
depth_prepass_alpha     // Depth prepass for alpha
depth_test_disabled     // Skip depth test
```

### Culling
```glsl
cull_back              // Back-face culling (default)
cull_front             // Front-face culling
cull_disabled          // No culling (double-sided)
```

### Shading
```glsl
unshaded               // No lighting — fragment outputs final color directly
wireframe              // Wireframe rendering
diffuse_burley         // Burley diffuse (default)
diffuse_lambert        // Lambert diffuse
diffuse_lambert_wrap   // Wrapped Lambert
diffuse_toon           // Toon/cel diffuse
specular_schlick_ggx   // Schlick GGX specular (default)
specular_toon          // Toon specular
specular_disabled      // No specular
```

### Vertex
```glsl
vertex_lighting        // Per-vertex lighting (faster, lower quality)
skip_vertex_transform  // Manual vertex transform
world_vertex_coords    // VERTEX/NORMAL in world space instead of model space
```

### Other
```glsl
shadows_disabled       // Don't cast shadows
ambient_light_disabled // Ignore ambient light
fog_disabled           // Ignore fog
```

Combine: `render_mode unshaded, cull_disabled, blend_add;`

## Vertex Built-ins

```glsl
void vertex() {
    // Geometry (inout — model space by default)
    VERTEX;              // vec3  — vertex position
    NORMAL;              // vec3  — vertex normal
    TANGENT;             // vec3  — vertex tangent
    BINORMAL;            // vec3  — vertex binormal
    UV;                  // vec2  — primary UV
    UV2;                 // vec2  — secondary UV (lightmaps)
    COLOR;               // vec4  — vertex color

    // Matrices (in)
    MODEL_MATRIX;        // mat4  — model → world
    MODEL_NORMAL_MATRIX; // mat3  — normal model → world
    VIEW_MATRIX;         // mat4  — world → view
    INV_VIEW_MATRIX;     // mat4  — view → world
    PROJECTION_MATRIX;   // mat4  — view → clip
    INV_PROJECTION_MATRIX; // mat4 — clip → view
    MODELVIEW_MATRIX;    // mat4  — model → view (prefer for float precision)
    MODELVIEW_NORMAL_MATRIX; // mat3 — normal model → view

    // Camera (in)
    MAIN_CAM_INV_VIEW_MATRIX; // mat4 — main camera inverse view
    NODE_POSITION_WORLD; // vec3  — node origin in world space
    NODE_POSITION_VIEW;  // vec3  — node origin in view space
    CAMERA_POSITION_WORLD; // vec3 — camera position world
    CAMERA_DIRECTION_WORLD; // vec3 — camera forward direction
    CAMERA_VISIBLE_LAYERS; // uint — camera cull mask
    EYE_OFFSET;          // vec3  — VR eye offset

    // Instance (in)
    INSTANCE_ID;         // int   — instance index
    INSTANCE_CUSTOM;     // vec4  — custom per-instance data

    // Output overrides
    POSITION;            // vec4  — clip-space override (bypasses projection)
    POINT_SIZE;          // float — point sprite size
}
```

### Disable Built-in Transform
```glsl
shader_type spatial;
render_mode skip_vertex_transform;

void vertex() {
    VERTEX = (MODELVIEW_MATRIX * vec4(VERTEX, 1.0)).xyz;
    NORMAL = (MODELVIEW_NORMAL_MATRIX * NORMAL);
}
```

### World-Space Vertices
```glsl
shader_type spatial;
render_mode world_vertex_coords;

void vertex() {
    // VERTEX and NORMAL are now in world space
    VERTEX.y += sin(VERTEX.x * 2.0 + TIME) * 0.5;
}
```

## Fragment Built-ins

```glsl
void fragment() {
    // Inputs (in)
    VERTEX;              // vec3  — view-space position
    FRAGCOORD;           // vec4  — gl_FragCoord (window coords, .z = depth)
    FRONT_FACING;        // bool  — true if front face
    UV;                  // vec2  — primary UV
    UV2;                 // vec2  — secondary UV
    COLOR;               // vec4  — vertex color (interpolated)
    VIEW;                // vec3  — normalized view direction (view space)
    SCREEN_UV;           // vec2  — screen UV (0-1)

    // Matrices (in) — same as vertex
    MODEL_MATRIX; VIEW_MATRIX; INV_VIEW_MATRIX;
    PROJECTION_MATRIX; INV_PROJECTION_MATRIX;
    MAIN_CAM_INV_VIEW_MATRIX;
    NODE_POSITION_WORLD; NODE_POSITION_VIEW;
    CAMERA_POSITION_WORLD; CAMERA_DIRECTION_WORLD;
    CAMERA_VISIBLE_LAYERS;

    // PBR Material Outputs (inout)
    ALBEDO;              // vec3  — base color (default vec3(1.0))
    ALPHA;               // float — opacity (writing triggers transparent pipeline)
    ALPHA_SCISSOR_THRESHOLD; // float — alpha cutoff threshold
    ALPHA_HASH_SCALE;    // float — hash dithering scale
    ALPHA_ANTIALIASING_EDGE; // float — AA edge
    ALPHA_TEXTURE_COORDINATE; // vec2 — UV for hash/AA
    METALLIC;            // float — 0 = dielectric, 1 = metal
    SPECULAR;            // float — specular amount (default 0.5)
    ROUGHNESS;           // float — 0 = mirror, 1 = rough
    EMISSION;            // vec3  — emissive color
    NORMAL;              // vec3  — surface normal (view space, inout)
    NORMAL_MAP;          // vec3  — normal map value (tangent space, auto-converted)
    NORMAL_MAP_DEPTH;    // float — normal map strength (default 1.0)
    BACKLIGHT;           // vec3  — subsurface backlight color
    RIM;                 // float — rim lighting amount
    RIM_TINT;            // float — rim tint (0 = white, 1 = albedo)
    CLEARCOAT;           // float — clearcoat intensity
    CLEARCOAT_ROUGHNESS; // float — clearcoat roughness
    ANISOTROPY;          // float — anisotropy amount
    ANISOTROPY_FLOW;     // vec2  — anisotropy direction
    AO;                  // float — ambient occlusion
    AO_LIGHT_AFFECT;     // float — AO influence on direct light
    SSS_STRENGTH;        // float — subsurface scattering strength
    SSS_TRANSMITTANCE_COLOR; // vec4 — SSS transmittance
    SSS_TRANSMITTANCE_DEPTH; // float — SSS depth
    SSS_TRANSMITTANCE_BOOST; // float — SSS boost

    // Depth override
    DEPTH;               // float — custom depth (0-1), must set for ALL branches if used

    // FOG (inout)
    FOG;                 // vec4  — fog contribution
}
```

### Writing ALPHA Triggers Transparency

If any branch writes to `ALPHA`, the object enters the transparent pipeline (sorted back-to-front, no depth pre-pass by default). Use `ALPHA_SCISSOR_THRESHOLD` for hard cutouts:

```glsl
void fragment() {
    vec4 tex = texture(albedo_tex, UV);
    ALBEDO = tex.rgb;
    ALPHA = tex.a;
    ALPHA_SCISSOR_THRESHOLD = 0.5;  // Hard cutoff — stays in opaque pipeline
}
```

## Light Built-ins

Called per pixel per light. If not defined, Godot uses PBR lighting based on fragment outputs.

```glsl
void light() {
    // Inputs (in)
    NORMAL;              // vec3  — surface normal (view space)
    VIEW;                // vec3  — view direction
    LIGHT;               // vec3  — light direction (toward light)
    LIGHT_COLOR;         // vec3  — light color × energy
    ATTENUATION;         // float — distance + shadow attenuation
    METALLIC;            // float — from fragment
    ROUGHNESS;           // float — from fragment
    ALBEDO;              // vec3  — from fragment
    BACKLIGHT;           // vec3  — from fragment
    AO;                  // float — from fragment
    ALPHA;               // float — from fragment (inout)
    LIGHT_IS_DIRECTIONAL; // bool — true for DirectionalLight3D

    // Outputs (inout — add to, don't overwrite)
    DIFFUSE_LIGHT;       // vec3  — accumulated diffuse
    SPECULAR_LIGHT;      // vec3  — accumulated specular
}
```

### Lambertian Lighting
```glsl
void light() {
    float NdotL = max(dot(NORMAL, LIGHT), 0.0);
    DIFFUSE_LIGHT += LIGHT_COLOR * ATTENUATION * NdotL / PI;
}
```

### Toon Lighting
```glsl
void light() {
    float NdotL = dot(NORMAL, LIGHT);
    float intensity = smoothstep(0.0, 0.01, NdotL);
    DIFFUSE_LIGHT += LIGHT_COLOR * ATTENUATION * intensity;
}
```

## Screen Texture and Depth

```glsl
uniform sampler2D screen_texture : hint_screen_texture, filter_linear_mipmap;
uniform sampler2D depth_texture : hint_depth_texture;

void fragment() {
    // Screen color behind this object
    vec3 screen = texture(screen_texture, SCREEN_UV).rgb;

    // Linearize depth
    float raw_depth = texture(depth_texture, SCREEN_UV).x;
    vec3 ndc = vec3(SCREEN_UV * 2.0 - 1.0, raw_depth);
    vec4 view_coords = INV_PROJECTION_MATRIX * vec4(ndc, 1.0);
    view_coords.xyz /= view_coords.w;
    float linear_depth = -view_coords.z;

    // Depth of this fragment
    float this_depth = -VERTEX.z;

    // Depth difference (for soft edges, water foam, etc.)
    float depth_diff = linear_depth - this_depth;
}
```

**Note**: `hint_screen_texture` only captures opaque geometry. Transparent objects rendered afterward are not included.

## Common 3D Shader Recipes

### Fresnel / Rim Glow
```glsl
shader_type spatial;

uniform vec4 fresnel_color : source_color = vec4(0.0, 0.5, 1.0, 1.0);
uniform float fresnel_power : hint_range(0.0, 10.0) = 3.0;

void fragment() {
    float fresnel = pow(1.0 - dot(NORMAL, VIEW), fresnel_power);
    ALBEDO = vec3(0.0);
    EMISSION = fresnel_color.rgb * fresnel;
}
```

### Triplanar Mapping
```glsl
shader_type spatial;
render_mode world_vertex_coords;

uniform sampler2D albedo_tex : source_color, repeat_enable;
uniform float tex_scale = 1.0;

varying vec3 world_pos;
varying vec3 world_normal;

void vertex() {
    world_pos = VERTEX;
    world_normal = NORMAL;
}

void fragment() {
    vec3 n = abs(normalize(world_normal));
    n = pow(n, vec3(4.0));
    n /= (n.x + n.y + n.z);

    vec3 xp = texture(albedo_tex, world_pos.yz * tex_scale).rgb;
    vec3 yp = texture(albedo_tex, world_pos.xz * tex_scale).rgb;
    vec3 zp = texture(albedo_tex, world_pos.xy * tex_scale).rgb;

    ALBEDO = xp * n.x + yp * n.y + zp * n.z;
}
```

### Dissolve (3D)
```glsl
shader_type spatial;
render_mode cull_disabled;

uniform float dissolve : hint_range(0.0, 1.0) = 0.0;
uniform float edge_width : hint_range(0.0, 0.1) = 0.03;
uniform vec4 edge_color : source_color = vec4(1.0, 0.5, 0.0, 1.0);
uniform sampler2D noise_tex;

void fragment() {
    float noise = texture(noise_tex, UV).r;
    if (noise < dissolve) {
        discard;
    }
    float edge = 1.0 - smoothstep(0.0, edge_width, noise - dissolve);
    ALBEDO = mix(vec3(0.5), edge_color.rgb, edge);
    EMISSION = edge_color.rgb * edge * 3.0;
}
```

### Hologram
```glsl
shader_type spatial;
render_mode blend_add, cull_disabled, unshaded;

uniform vec4 holo_color : source_color = vec4(0.0, 0.8, 1.0, 1.0);
uniform float scan_speed = 2.0;
uniform float line_density = 50.0;

void fragment() {
    float fresnel = pow(1.0 - dot(NORMAL, VIEW), 2.0);
    float scanline = step(0.5, fract(VERTEX.y * line_density + TIME * scan_speed));
    ALBEDO = holo_color.rgb;
    ALPHA = fresnel * (0.3 + scanline * 0.7) * holo_color.a;
}
```

### Water Surface
```glsl
shader_type spatial;

uniform sampler2D normal_map_a : hint_normal, repeat_enable;
uniform sampler2D normal_map_b : hint_normal, repeat_enable;
uniform sampler2D screen_texture : hint_screen_texture, filter_linear;
uniform sampler2D depth_texture : hint_depth_texture;
uniform vec4 water_color : source_color = vec4(0.1, 0.3, 0.5, 0.8);
uniform float wave_speed = 0.03;
uniform float distortion = 0.02;

void fragment() {
    // Dual normal map scrolling
    vec2 uv_a = UV + TIME * vec2(wave_speed, wave_speed * 0.7);
    vec2 uv_b = UV + TIME * vec2(-wave_speed * 0.5, wave_speed);
    vec3 normal_a = texture(normal_map_a, uv_a).rgb;
    vec3 normal_b = texture(normal_map_b, uv_b).rgb;
    vec3 combined_normal = normalize(normal_a + normal_b - 1.0);

    NORMAL_MAP = combined_normal;
    NORMAL_MAP_DEPTH = 0.5;

    // Refraction
    vec2 refracted_uv = SCREEN_UV + combined_normal.xy * distortion;
    vec3 refracted = texture(screen_texture, refracted_uv).rgb;

    // Depth-based foam/edge
    float raw_depth = texture(depth_texture, SCREEN_UV).x;
    vec4 view_pos = INV_PROJECTION_MATRIX * vec4(SCREEN_UV * 2.0 - 1.0, raw_depth, 1.0);
    view_pos.xyz /= view_pos.w;
    float depth_diff = -view_pos.z - (-VERTEX.z);
    float edge = 1.0 - clamp(depth_diff * 2.0, 0.0, 1.0);

    ALBEDO = mix(refracted, water_color.rgb, water_color.a) + vec3(edge * 0.3);
    ROUGHNESS = 0.05;
    METALLIC = 0.0;
    SPECULAR = 0.5;
    ALPHA = water_color.a + edge * 0.2;
}
```

### Vertex Displacement (Wind)
```glsl
shader_type spatial;

uniform float wind_strength = 0.5;
uniform float wind_speed = 2.0;
uniform vec3 wind_direction = vec3(1.0, 0.0, 0.0);

void vertex() {
    float displacement = sin(VERTEX.x * 2.0 + TIME * wind_speed) * wind_strength;
    displacement *= UV.y;  // More displacement at top (UV.y = 1)
    VERTEX += normalize(wind_direction) * displacement;
}
```

### Intersection Highlight (Force Field)
```glsl
shader_type spatial;
render_mode blend_add, cull_disabled, unshaded;

uniform sampler2D depth_texture : hint_depth_texture;
uniform vec4 glow_color : source_color = vec4(0.0, 1.0, 0.5, 1.0);
uniform float edge_thickness : hint_range(0.0, 1.0) = 0.1;

void fragment() {
    float raw_depth = texture(depth_texture, SCREEN_UV).x;
    vec4 view_pos = INV_PROJECTION_MATRIX * vec4(SCREEN_UV * 2.0 - 1.0, raw_depth, 1.0);
    view_pos.xyz /= view_pos.w;
    float depth_diff = -view_pos.z - (-VERTEX.z);
    float edge = 1.0 - smoothstep(0.0, edge_thickness, depth_diff);

    float fresnel = pow(1.0 - dot(NORMAL, VIEW), 3.0);
    ALBEDO = glow_color.rgb;
    ALPHA = max(edge, fresnel) * glow_color.a;
}
```

## Post-Processing Setup (3D)

### Method: ColorRect in CanvasLayer
```
CanvasLayer (layer = 100)
  └── ColorRect (full screen, Anchors → Full Rect)
        └── ShaderMaterial (shader_type canvas_item)
```

```glsl
shader_type canvas_item;

uniform sampler2D screen_texture : hint_screen_texture, filter_linear;

void fragment() {
    vec3 color = texture(screen_texture, SCREEN_UV).rgb;
    // Apply post-processing (e.g. vignette, color grading)
    COLOR = vec4(color, 1.0);
}
```

## Converting StandardMaterial3D to Shader

In editor: select material → Material dropdown → "Convert to ShaderMaterial". Generates equivalent shader code. Useful as a starting point for custom effects.

## C# Equivalent

```csharp
var mat = new ShaderMaterial();
mat.Shader = GD.Load<Shader>("res://shaders/water.gdshader");
mat.SetShaderParameter("water_color", new Color(0.1f, 0.3f, 0.5f, 0.8f));
mat.SetShaderParameter("wave_speed", 0.03f);
meshInstance.MaterialOverride = mat;
```
