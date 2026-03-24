# Shader Recipes

## 2D Recipes

### Sprite Outline
```glsl
shader_type canvas_item;
uniform vec4 outline_color : source_color = vec4(0.0, 0.0, 0.0, 1.0);
uniform float width : hint_range(0.0, 10.0) = 1.0;

void fragment() {
    vec2 ps = TEXTURE_PIXEL_SIZE * width;
    float a = texture(TEXTURE, UV).a;
    float outline = 0.0;
    outline = max(outline, texture(TEXTURE, UV + vec2(ps.x, 0.0)).a);
    outline = max(outline, texture(TEXTURE, UV + vec2(-ps.x, 0.0)).a);
    outline = max(outline, texture(TEXTURE, UV + vec2(0.0, ps.y)).a);
    outline = max(outline, texture(TEXTURE, UV + vec2(0.0, -ps.y)).a);
    // Diagonals for smoother outline:
    outline = max(outline, texture(TEXTURE, UV + vec2(ps.x, ps.y)).a);
    outline = max(outline, texture(TEXTURE, UV + vec2(-ps.x, ps.y)).a);
    outline = max(outline, texture(TEXTURE, UV + vec2(ps.x, -ps.y)).a);
    outline = max(outline, texture(TEXTURE, UV + vec2(-ps.x, -ps.y)).a);

    vec4 tex = texture(TEXTURE, UV);
    if (tex.a < 0.1 && outline > 0.1) {
        COLOR = outline_color;
    } else {
        COLOR = tex * COLOR;
    }
}
```
**Note**: Requires texture with transparent padding around sprite (expand Region in Sprite2D or use atlas margin).

### Dissolve
```glsl
shader_type canvas_item;
uniform sampler2D dissolve_noise : filter_linear;
uniform float progress : hint_range(0.0, 1.0) = 0.0;
uniform float edge_width : hint_range(0.0, 0.2) = 0.05;
uniform vec4 edge_color : source_color = vec4(1.0, 0.3, 0.0, 1.0);

void fragment() {
    float n = texture(dissolve_noise, UV).r;
    if (n < progress) { discard; }
    if (n < progress + edge_width) {
        COLOR.rgb = edge_color.rgb;
    }
}
```

### Flash White (Hit Effect)
```glsl
shader_type canvas_item;
uniform float flash : hint_range(0.0, 1.0) = 0.0;
void fragment() { COLOR.rgb = mix(COLOR.rgb, vec3(1.0), flash); }
```

### Color Replace
```glsl
shader_type canvas_item;
uniform vec4 target_color : source_color = vec4(1.0, 0.0, 0.0, 1.0);
uniform vec4 replace_color : source_color = vec4(0.0, 0.0, 1.0, 1.0);
uniform float threshold : hint_range(0.0, 1.0) = 0.1;

void fragment() {
    if (distance(COLOR.rgb, target_color.rgb) < threshold) {
        COLOR.rgb = replace_color.rgb;
    }
}
```

### CRT / Scanline Effect
```glsl
shader_type canvas_item;
uniform float scanline_opacity : hint_range(0.0, 1.0) = 0.3;
uniform float scanline_count = 200.0;
uniform float vignette_strength : hint_range(0.0, 1.0) = 0.4;

void fragment() {
    vec3 col = texture(TEXTURE, UV).rgb;
    // Scanlines
    float scanline = sin(UV.y * scanline_count * PI) * 0.5 + 0.5;
    col *= 1.0 - scanline_opacity * (1.0 - scanline);
    // Vignette
    vec2 center = UV - 0.5;
    float vignette = 1.0 - dot(center, center) * vignette_strength * 4.0;
    col *= vignette;
    COLOR = vec4(col, 1.0);
}
```

### Pixelation (Sprite)
```glsl
shader_type canvas_item;
uniform float pixel_size : hint_range(1.0, 64.0) = 4.0;
void fragment() {
    vec2 size = vec2(textureSize(TEXTURE, 0));
    vec2 uv = floor(UV * size / pixel_size) * pixel_size / size;
    COLOR = texture(TEXTURE, uv);
}
```

### Water Reflection (2D)
```glsl
shader_type canvas_item;
uniform sampler2D screen_texture : hint_screen_texture;
uniform float wave_speed = 2.0;
uniform float wave_strength = 0.01;
uniform float wave_frequency = 20.0;

void fragment() {
    vec2 uv = SCREEN_UV;
    uv.x += sin(uv.y * wave_frequency + TIME * wave_speed) * wave_strength;
    vec3 col = texture(screen_texture, uv).rgb;
    col *= vec3(0.5, 0.7, 1.0); // water tint
    COLOR = vec4(col, 0.8);
}
```

### Circular Wipe Transition
```glsl
shader_type canvas_item;
uniform float progress : hint_range(0.0, 1.0) = 0.0;
uniform vec2 center = vec2(0.5);

void fragment() {
    float dist = distance(UV, center);
    float max_dist = distance(vec2(0.0), center); // corner distance
    if (dist > progress * max_dist * 1.5) {
        COLOR.a = 0.0;
    }
}
```

## 3D Recipes

### Toon / Cel Shading
```glsl
shader_type spatial;
render_mode diffuse_toon, specular_toon;
uniform vec4 albedo : source_color = vec4(1.0);
uniform float bands : hint_range(1.0, 10.0) = 3.0;

void fragment() { ALBEDO = albedo.rgb; ROUGHNESS = 1.0; }
void light() {
    float NdotL = clamp(dot(NORMAL, LIGHT), 0.0, 1.0);
    float stepped = floor(NdotL * bands) / bands;
    DIFFUSE_LIGHT += stepped * ATTENUATION * LIGHT_COLOR;
}
```

### Fresnel / Force Field
```glsl
shader_type spatial;
render_mode blend_add, cull_disabled, unshaded;
uniform vec4 fresnel_color : source_color = vec4(0.0, 0.5, 1.0, 1.0);
uniform float power : hint_range(0.1, 10.0) = 3.0;

void fragment() {
    float f = pow(1.0 - abs(dot(NORMAL, VIEW)), power);
    ALBEDO = fresnel_color.rgb;
    ALPHA = f * fresnel_color.a;
}
```

### Hologram
```glsl
shader_type spatial;
render_mode blend_add, cull_disabled, unshaded;
uniform vec4 color : source_color = vec4(0.0, 1.0, 0.8, 1.0);
uniform float scanline_speed = 3.0;
uniform float scanline_count = 50.0;
uniform float flicker_speed = 8.0;

void fragment() {
    float scanline = sin((UV.y + TIME * scanline_speed * 0.01) * scanline_count * TAU) * 0.5 + 0.5;
    float flicker = sin(TIME * flicker_speed) * 0.1 + 0.9;
    float fresnel = pow(1.0 - dot(NORMAL, VIEW), 2.0);
    ALBEDO = color.rgb;
    ALPHA = (0.3 + fresnel * 0.7) * scanline * flicker;
}
```

### Dissolve (3D)
```glsl
shader_type spatial;
uniform sampler2D noise_tex : filter_linear;
uniform float progress : hint_range(0.0, 1.0) = 0.0;
uniform float edge : hint_range(0.0, 0.2) = 0.05;
uniform vec4 edge_color : source_color = vec4(1.0, 0.3, 0.0, 1.0);

void fragment() {
    float n = texture(noise_tex, UV).r;
    ALPHA_SCISSOR_THRESHOLD = 0.5;
    if (n < progress) { ALPHA = 0.0; }
    else if (n < progress + edge) {
        EMISSION = edge_color.rgb * 3.0;
        ALBEDO = edge_color.rgb;
    } else {
        ALBEDO = vec3(0.5);
    }
    ALPHA = n < progress ? 0.0 : 1.0;
}
```

### Triplanar Mapping
```glsl
shader_type spatial;
render_mode world_vertex_coords;
uniform sampler2D albedo_tex : source_color, filter_linear_mipmap, repeat_enable;
uniform float scale = 1.0;
varying vec3 world_pos;
varying vec3 world_normal;

void vertex() {
    world_pos = VERTEX;
    world_normal = NORMAL;
}
void fragment() {
    vec3 n = abs(normalize(world_normal));
    n = pow(n, vec3(4.0)); // sharpen blend
    n /= (n.x + n.y + n.z);
    vec3 x_proj = texture(albedo_tex, world_pos.yz * scale).rgb;
    vec3 y_proj = texture(albedo_tex, world_pos.xz * scale).rgb;
    vec3 z_proj = texture(albedo_tex, world_pos.xy * scale).rgb;
    ALBEDO = x_proj * n.x + y_proj * n.y + z_proj * n.z;
}
```

### Water Surface
```glsl
shader_type spatial;
render_mode blend_mix, cull_disabled;
uniform sampler2D normal_map_a : hint_default_white, repeat_enable;
uniform sampler2D normal_map_b : hint_default_white, repeat_enable;
uniform vec4 water_color : source_color = vec4(0.1, 0.3, 0.5, 0.8);
uniform float wave_speed = 0.02;
uniform float normal_strength = 0.5;

void fragment() {
    vec2 uv_a = UV + TIME * vec2(wave_speed, wave_speed * 0.7);
    vec2 uv_b = UV * 1.3 - TIME * vec2(wave_speed * 0.8, wave_speed);
    vec3 n_a = texture(normal_map_a, uv_a).rgb;
    vec3 n_b = texture(normal_map_b, uv_b).rgb;
    NORMAL_MAP = mix(n_a, n_b, 0.5);
    NORMAL_MAP_DEPTH = normal_strength;
    ALBEDO = water_color.rgb;
    ALPHA = water_color.a;
    METALLIC = 0.0;
    ROUGHNESS = 0.05;
}
```

### Rim + Emission Pulse
```glsl
shader_type spatial;
uniform vec4 base_color : source_color = vec4(0.2, 0.2, 0.2, 1.0);
uniform vec4 rim_color : source_color = vec4(1.0, 0.0, 0.0, 1.0);
uniform float rim_power = 3.0;
uniform float pulse_speed = 2.0;

void fragment() {
    ALBEDO = base_color.rgb;
    float f = pow(1.0 - dot(NORMAL, VIEW), rim_power);
    float pulse = sin(TIME * pulse_speed) * 0.5 + 0.5;
    EMISSION = rim_color.rgb * f * pulse * 2.0;
}
```

## Post-Processing (Full-Screen)

Apply via ColorRect (2D) or MeshInstance3D quad:

### Vignette
```glsl
shader_type canvas_item;
uniform sampler2D screen_texture : hint_screen_texture;
uniform float strength : hint_range(0.0, 2.0) = 0.5;
void fragment() {
    vec3 col = texture(screen_texture, SCREEN_UV).rgb;
    vec2 uv = SCREEN_UV - 0.5;
    col *= 1.0 - dot(uv, uv) * strength * 4.0;
    COLOR = vec4(col, 1.0);
}
```

### Blur (Box)
```glsl
shader_type canvas_item;
uniform sampler2D screen_texture : hint_screen_texture;
uniform float blur_amount : hint_range(0.0, 5.0) = 1.0;
void fragment() {
    vec2 ps = SCREEN_PIXEL_SIZE * blur_amount;
    vec3 col = vec3(0.0);
    for (int x = -2; x <= 2; x++) {
        for (int y = -2; y <= 2; y++) {
            col += texture(screen_texture, SCREEN_UV + vec2(float(x), float(y)) * ps).rgb;
        }
    }
    COLOR = vec4(col / 25.0, 1.0);
}
```

### Color Grading (Simple)
```glsl
shader_type canvas_item;
uniform sampler2D screen_texture : hint_screen_texture;
uniform float brightness : hint_range(-1.0, 1.0) = 0.0;
uniform float contrast : hint_range(0.0, 3.0) = 1.0;
uniform float saturation : hint_range(0.0, 3.0) = 1.0;

void fragment() {
    vec3 col = texture(screen_texture, SCREEN_UV).rgb;
    col += brightness;
    col = (col - 0.5) * contrast + 0.5;
    float gray = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(gray), col, saturation);
    COLOR = vec4(clamp(col, 0.0, 1.0), 1.0);
}
```

## Applying Shader Recipes

### From Editor
1. Select node → Inspector → Material → New ShaderMaterial
2. ShaderMaterial → Shader → New Shader
3. Paste recipe code
4. Adjust uniform parameters in the ShaderMaterial section of Inspector

### From GDScript (Runtime)
```gdscript
var mat := ShaderMaterial.new()
mat.shader = preload("res://shaders/dissolve.gdshader")
mat.set_shader_parameter("progress", 0.0)
sprite.material = mat

# Animate dissolve
var tween := create_tween()
tween.tween_property(mat, "shader_parameter/progress", 1.0, 1.5)
```

### Per-Instance Materials
```gdscript
# Each node gets its own material copy — different parameter values
sprite.material = sprite.material.duplicate()
sprite.material.set_shader_parameter("flash", 1.0)
```
