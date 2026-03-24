# Anime.js V4 Easing Reference

## Built-in Easing Functions

### Power Eases

The default easing is `'outQuad'` (equivalent to `'out(2)'`).

| Name | Equivalent | Description |
|------|------------|-------------|
| `'in'` | `'in(2)'` | Accelerate (ease-in) |
| `'out'` | `'out(2)'` | Decelerate (ease-out) |
| `'inOut'` | `'inOut(2)'` | Accelerate then decelerate |
| `'outIn'` | `'outIn(2)'` | Decelerate then accelerate |

### Parameterized Power

Use a number parameter to control the curve intensity:

```javascript
'in(1.5)'     // Gentle ease-in
'out(2)'      // outQuad
'out(3)'      // outCubic
'out(4)'      // outQuart
'out(5)'      // outQuint
'inOut(3)'    // inOutCubic
```

### Named Eases

Classic easing function names (shorthand for power eases):

| Name | Equivalent |
|------|------------|
| `'inQuad'` | `'in(2)'` |
| `'outQuad'` | `'out(2)'` |
| `'inOutQuad'` | `'inOut(2)'` |
| `'inCubic'` | `'in(3)'` |
| `'outCubic'` | `'out(3)'` |
| `'inOutCubic'` | `'inOut(3)'` |
| `'inQuart'` | `'in(4)'` |
| `'outQuart'` | `'out(4)'` |
| `'inOutQuart'` | `'inOut(4)'` |
| `'inQuint'` | `'in(5)'` |
| `'outQuint'` | `'out(5)'` |
| `'inOutQuint'` | `'inOut(5)'` |

### Special Eases

| Name | Description |
|------|-------------|
| `'linear'` | No easing, constant speed |
| `'inSine'` | Sinusoidal ease-in |
| `'outSine'` | Sinusoidal ease-out |
| `'inOutSine'` | Sinusoidal ease-in-out |
| `'inExpo'` | Exponential ease-in |
| `'outExpo'` | Exponential ease-out |
| `'inOutExpo'` | Exponential ease-in-out |
| `'inCirc'` | Circular ease-in |
| `'outCirc'` | Circular ease-out |
| `'inOutCirc'` | Circular ease-in-out |
| `'inBack'` | Overshoots then returns (ease-in) |
| `'outBack'` | Overshoots then settles (ease-out) |
| `'inOutBack'` | Overshoots both ends |
| `'inElastic'` | Elastic bounce (ease-in) |
| `'outElastic'` | Elastic bounce (ease-out) |
| `'inOutElastic'` | Elastic bounce both ends |
| `'inBounce'` | Bouncing ball (ease-in) |
| `'outBounce'` | Bouncing ball (ease-out) |
| `'inOutBounce'` | Bouncing both ends |

### Linear with Points

CSS-style linear easing with control points:

```javascript
'linear(0, 0.25, 75%, 1)'
'linear(0, 0.5 25%, 1)'
```

### Steps Easing

Discrete stepped animation:

```javascript
'steps(5)'              // 5 steps, jump at end
'steps(5, start)'       // Jump at start
'steps(5, end)'         // Jump at end (default)
```

### Irregular Easing

Random stepped easing:

```javascript
import { irregular } from 'animejs';

ease: irregular(10, 0.5)  // 10 steps, 0.5 randomness
```

## Spring Physics

Springs create natural, physics-based motion.

### Perceived Parameters (Recommended)

Intuitive controls based on Apple's SwiftUI spring model:

```javascript
import { spring } from 'animejs';

animate('.el', {
  x: 200,
  ease: spring({
    bounce: 0.5,       // 0-1: bounciness (0 = no bounce)
    duration: 600,     // Target settle duration in ms
  }),
});
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `bounce` | Number | 0 | Bounciness, 0 (none) to 1 (very bouncy) |
| `duration` | Number | auto | Target duration in ms |

### Physics Parameters

Direct control over spring physics:

```javascript
animate('.el', {
  x: 200,
  ease: spring({
    mass: 1,           // Object mass
    stiffness: 100,    // Spring stiffness
    damping: 10,       // Friction/resistance
    velocity: 0,       // Initial velocity
  }),
});
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `mass` | Number | 1 | Mass of the object |
| `stiffness` | Number | 100 | Spring tension |
| `damping` | Number | 10 | Resistance/friction |
| `velocity` | Number | 0 | Initial velocity |

**Note:** When using physics parameters, animation `duration` is calculated automatically based on when the spring settles.

### Spring Presets

Common spring configurations:

```javascript
// Snappy UI interaction
spring({ bounce: 0.2, duration: 300 })

// Bouncy entrance
spring({ bounce: 0.5, duration: 600 })

// Very bouncy
spring({ bounce: 0.8, duration: 800 })

// No bounce, smooth settle
spring({ bounce: 0, duration: 400 })

// Physics-based snappy
spring({ stiffness: 200, damping: 20 })

// Physics-based bouncy
spring({ stiffness: 100, damping: 8 })
```

## Cubic Bézier

Custom curves using control points:

```javascript
import { cubicBezier } from 'animejs';

animate('.el', {
  x: 200,
  ease: cubicBezier(0.25, 0.1, 0.25, 1.0),  // [x1, y1, x2, y2]
});
```

Common CSS cubic-bezier equivalents:

| Name | Values |
|------|--------|
| ease | `(0.25, 0.1, 0.25, 1.0)` |
| ease-in | `(0.42, 0, 1.0, 1.0)` |
| ease-out | `(0, 0, 0.58, 1.0)` |
| ease-in-out | `(0.42, 0, 0.58, 1.0)` |

## Custom Easing Functions

Create your own easing function:

```javascript
animate('.el', {
  x: 200,
  ease: t => t * t,  // Custom quadratic ease-in
});
```

The function receives `t` (0 to 1) and should return a value (typically 0 to 1, but can overshoot for elastic effects).

```javascript
// Custom bounce
ease: t => {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
}
```

## Easing in Stagger

Apply easing to stagger distribution:

```javascript
import { animate, stagger } from 'animejs';

animate('.el', {
  x: 200,
  delay: stagger(100, { 
    ease: 'inOutQuad'  // Delays follow ease curve
  }),
  scale: stagger([0.5, 1.5], {
    ease: 'outExpo'    // Values follow ease curve
  }),
});
```

## Playback Ease

Ease the entire animation's progress:

```javascript
animate('.el', {
  x: 200,
  duration: 1000,
  ease: 'outQuad',           // Tween ease
  playbackEase: 'inOutSine', // Overall progress ease
});
```

## Accessing Eases Programmatically

```javascript
import { eases } from 'animejs';

// Get ease function
const outQuad = eases.outQuad;
const custom = eases.out(3);

// Use in animation
animate('.el', {
  x: 200,
  ease: eases.inOutCubic,
});
```

## Visual Easing Editor

Use the official Anime.js easing editor to visualize and generate easings:
https://animejs.com/easing-editor/
