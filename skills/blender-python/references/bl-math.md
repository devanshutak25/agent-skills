# bl_math

Scalar math utility functions. For vector/matrix math see [mathutils](mathutils.md). For geometry operations see [mathutils-geometry](mathutils-geometry.md).

## Functions

### clamp

```python
import bl_math

# Clamp a value to a range
result = bl_math.clamp(value, min=0.0, max=1.0)

bl_math.clamp(1.5)          # 1.0
bl_math.clamp(-0.5)         # 0.0
bl_math.clamp(0.7)          # 0.7
bl_math.clamp(15, 0, 10)    # 10
bl_math.clamp(-5, 0, 10)    # 0
```

### lerp

```python
import bl_math

# Linear interpolation between two values
result = bl_math.lerp(a, b, factor)

bl_math.lerp(0, 10, 0.5)    # 5.0
bl_math.lerp(0, 10, 0.0)    # 0.0
bl_math.lerp(0, 10, 1.0)    # 10.0
bl_math.lerp(0, 10, 0.25)   # 2.5

# factor can exceed [0, 1] for extrapolation
bl_math.lerp(0, 10, 1.5)    # 15.0
```

### smoothstep

```python
import bl_math

# Hermite smooth interpolation (ease in/out)
result = bl_math.smoothstep(a, b, x)

# Equivalent to: t = clamp((x-a)/(b-a), 0, 1); return t*t*(3-2*t)
bl_math.smoothstep(0, 1, 0.0)   # 0.0
bl_math.smoothstep(0, 1, 0.5)   # 0.5
bl_math.smoothstep(0, 1, 0.25)  # ~0.15625
bl_math.smoothstep(0, 1, 1.0)   # 1.0

# Useful for smooth transitions
bl_math.smoothstep(0, 10, 3)    # smooth curve between 0 and 10
```

### pingpong

```python
import bl_math

# Bounce a value back and forth within [0, scale]
result = bl_math.pingpong(value, scale)

bl_math.pingpong(0.5, 1.0)   # 0.5
bl_math.pingpong(1.5, 1.0)   # 0.5 (bounced back)
bl_math.pingpong(2.5, 1.0)   # 0.5 (bounced forward again)
bl_math.pingpong(3.0, 2.0)   # 1.0
```

### round_to_even

```python
import bl_math

# Banker's rounding (round half to even)
result = bl_math.round_to_even(value)

bl_math.round_to_even(0.5)   # 0
bl_math.round_to_even(1.5)   # 2
bl_math.round_to_even(2.5)   # 2
bl_math.round_to_even(3.5)   # 4
bl_math.round_to_even(2.3)   # 2
bl_math.round_to_even(2.7)   # 3
```

## Function Reference

| Function | Signature | Description |
|---|---|---|
| `clamp` | `(value, min=0.0, max=1.0)` | Clamp value to [min, max] |
| `lerp` | `(a, b, factor)` | Linear interpolation: `a + (b - a) * factor` |
| `smoothstep` | `(a, b, x)` | Hermite interpolation, clamped to [0, 1] |
| `pingpong` | `(value, scale)` | Bounce value within [0, scale] |
| `round_to_even` | `(value)` | Banker's rounding (round half to nearest even) |

## Common Patterns

### Smooth Animation Factor

```python
import bl_math

# Create smooth ease-in/ease-out factor from linear progress
frame = 50
start_frame = 1
end_frame = 100

linear = (frame - start_frame) / (end_frame - start_frame)
smooth = bl_math.smoothstep(0, 1, linear)
```

### Clamped Lerp

```python
import bl_math

# Interpolate with clamped factor
def clamped_lerp(a, b, factor):
    return bl_math.lerp(a, b, bl_math.clamp(factor))
```

## Gotchas

1. **`bl_math` is for scalars only.** Use `mathutils.Vector.lerp()` for vector interpolation. `bl_math.lerp` only works with single float values.

2. **`smoothstep` parameter order.** The signature is `(a, b, x)` where `a` and `b` define the range and `x` is the input value. This differs from GLSL's `smoothstep(edge0, edge1, x)` only in naming.

3. **`lerp` doesn't clamp.** `bl_math.lerp` allows factor outside [0, 1] for extrapolation. Wrap with `clamp` if you need bounded results.

4. **`round_to_even` differs from Python's `round()`.** Python's built-in `round()` also uses banker's rounding, so `bl_math.round_to_even` gives the same result. It exists mainly for consistency with C-side code.
