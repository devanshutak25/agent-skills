# Anime.js V4 API Reference

## Module Imports

### Main Module (Full Library ~10KB)
```javascript
import {
  animate,
  createTimeline,
  createTimer,
  createAnimatable,
  createDraggable,
  createScope,
  onScroll,
  stagger,
  spring,
  cubicBezier,
  eases,
  utils,
  svg,
  splitText,
  waapi,
  engine,
} from 'animejs';
```

### Individual Modules (Tree-Shakeable)
```javascript
import { animate } from 'animejs/animation';
import { createTimer } from 'animejs/timer';
import { createTimeline } from 'animejs/timeline';
import { createAnimatable } from 'animejs/animatable';
import { createDraggable } from 'animejs/draggable';
import { createScope } from 'animejs/scope';
import { onScroll } from 'animejs/events';
import { engine } from 'animejs/engine';
import { spring, cubicBezier, eases } from 'animejs/easings';
import { stagger, random, clamp, lerp, mapRange, round, $ } from 'animejs/utils';
import { morphTo, createDrawable, createMotionPath } from 'animejs/svg';
import { splitText } from 'animejs/text';
import { waapi } from 'animejs/waapi';
```

## animate(targets, parameters)

Main animation function. Returns an Animation instance.

### Targets
- CSS selector: `'.class'`, `'#id'`, `'div'`
- DOM Element: `document.querySelector('.el')`
- NodeList: `document.querySelectorAll('.el')`
- Array: `[el1, el2, el3]`
- JavaScript Object: `{ prop: 0 }`

### Animatable Properties

**CSS Transforms (GPU-accelerated, preferred)**
- `x` - translateX (accepts px, %, rem, vw, etc.)
- `y` - translateY
- `z` - translateZ
- `rotate` - rotation in degrees
- `rotateX`, `rotateY`, `rotateZ` - 3D rotations
- `scale` - uniform scale
- `scaleX`, `scaleY`, `scaleZ` - axis-specific scale
- `skewX`, `skewY` - skew transforms
- `perspective` - 3D perspective

**CSS Properties**
- `opacity` - 0 to 1
- `backgroundColor`, `color` - color values
- `borderRadius` - border radius
- `width`, `height` - dimensions (avoid for performance)
- Any CSS property in camelCase

**SVG Attributes**
- `d` - path data (use with svg.morphTo())
- `points` - polygon/polyline points
- `cx`, `cy`, `r` - circle attributes
- `x`, `y`, `width`, `height` - rect attributes
- Any SVG attribute

### Tween Parameters

```javascript
animate('.el', {
  x: 200,                          // simple value
  y: { to: 100 },                  // object syntax
  scale: { from: 0, to: 1 },       // from and to
  rotate: [0, 360],                // array shorthand [from, to]
  opacity: {
    to: 0.5,
    duration: 500,                 // property-specific duration
    delay: 100,                    // property-specific delay
    ease: 'outExpo',               // property-specific ease
  },
});
```

### Playback Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `duration` | Number | 1000 | Duration in ms |
| `delay` | Number/Function | 0 | Delay before start |
| `ease` | String/Function | 'outQuad' | Easing function |
| `loop` | Number/Boolean | false | Loop count (true = infinite) |
| `loopDelay` | Number | 0 | Delay between loops |
| `alternate` | Boolean | false | Reverse on each loop |
| `reversed` | Boolean | false | Play backwards |
| `autoplay` | Boolean/ScrollObserver | true | Auto-start animation |
| `frameRate` | Number | 60 | Target frame rate |
| `playbackRate` | Number | 1 | Speed multiplier |
| `playbackEase` | Function | null | Ease entire animation progress |

### Callbacks

```javascript
animate('.el', {
  x: 200,
  onBegin: (anim) => {},      // First frame
  onUpdate: (anim) => {},     // Every frame
  onRender: (anim) => {},     // When values change
  onLoop: (anim) => {},       // Each loop iteration
  onComplete: (anim) => {},   // Animation ends
  onPause: (anim) => {},      // Animation paused
});
```

### Animation Instance Properties

```javascript
const anim = animate('.el', { x: 200 });

anim.progress      // 0-1 progress
anim.currentTime   // Current time in ms
anim.duration      // Total duration
anim.paused        // Boolean
anim.reversed      // Boolean
anim.completed     // Boolean
anim.targets       // Array of targets
```

### Animation Instance Methods

```javascript
anim.play()        // Play forward
anim.pause()       // Pause
anim.resume()      // Resume current direction
anim.reverse()     // Play backward
anim.restart()     // Restart from beginning
anim.seek(time)    // Seek to time (ms or '%')
anim.complete()    // Jump to end
anim.cancel()      // Cancel without completing
anim.revert()      // Restore original styles
anim.reset()       // Reset to initial state
anim.stretch(ms)   // Change duration
anim.refresh()     // Recalculate values
```

## createTimeline(parameters)

Create sequenced animations.

```javascript
const tl = createTimeline({
  defaults: {
    duration: 500,
    ease: 'outQuad',
  },
  loop: 2,
  alternate: true,
  autoplay: true,
});
```

### Timeline Methods

```javascript
// Add animation
tl.add(targets, parameters, position);

// Set values instantly
tl.set(targets, { opacity: 0 }, position);

// Add label
tl.label('labelName', position);

// Call function
tl.call(() => console.log('called'), position);

// Sync another timeline
tl.sync(otherTimeline, position);
```

### Time Positions

| Format | Description |
|--------|-------------|
| `500` | Absolute time (ms from start) |
| `'+=200'` | 200ms after previous ends |
| `'-=200'` | 200ms before previous ends |
| `'<'` | Same start as previous |
| `'<+=100'` | 100ms after previous starts |
| `'labelName'` | At label position |
| `'labelName+=100'` | 100ms after label |
| `stagger(100)` | Staggered positions |

## stagger(value, parameters)

Create staggered delays or values.

```javascript
// Time staggering
delay: stagger(100)                    // 0, 100, 200, 300...
delay: stagger(100, { start: 500 })    // 500, 600, 700...
delay: stagger(100, { from: 'center' }) // center-out
delay: stagger(100, { from: 'last' })   // reverse
delay: stagger(100, { from: 5 })        // from index 5
delay: stagger(100, { reversed: true }) // reversed order

// Value staggering
scale: stagger([0.5, 1.5])             // range 0.5 to 1.5
x: stagger('1rem')                     // 0rem, 1rem, 2rem...

// Grid staggering
delay: stagger(50, {
  grid: [10, 10],
  from: 'center',
  axis: 'x',       // 'x', 'y', or both
})

// Eased staggering
delay: stagger(100, { ease: 'inOutQuad' })
```

## onScroll(parameters)

Scroll-triggered animations.

```javascript
animate('.el', {
  x: 200,
  autoplay: onScroll({
    target: '.el',           // Element to observe
    container: window,       // Scroll container
    axis: 'y',               // 'x' or 'y'
    debug: true,             // Show threshold markers
    repeat: true,            // Repeat on re-enter
    sync: true,              // Link progress to scroll
    
    // Threshold callbacks
    onEnter: (obs) => {},
    onLeave: (obs) => {},
    onEnterForward: (obs) => {},
    onEnterBackward: (obs) => {},
    onLeaveForward: (obs) => {},
    onLeaveBackward: (obs) => {},
    onUpdate: (obs) => {},
  }),
});
```

## createDraggable(targets, parameters)

Make elements draggable.

```javascript
const drag = createDraggable('.el', {
  x: true,                    // Enable x-axis
  y: true,                    // Enable y-axis
  container: '.bounds',       // Constraint container
  containerPadding: 20,       // Padding from edges
  snap: 50,                   // Snap to grid
  trigger: '.handle',         // Drag handle
  cursor: 'grab',             // Cursor style
  
  // Physics
  releaseEase: spring({ stiffness: 200 }),
  releaseMass: 1,
  releaseStiffness: 200,
  releaseDamping: 20,
  velocityMultiplier: 1,
  
  // Callbacks
  onGrab: (drag) => {},
  onDrag: (drag) => {},
  onRelease: (drag) => {},
  onSnap: (drag) => {},
  onSettle: (drag) => {},
  onUpdate: (drag) => {},
});

// Methods
drag.setX(100);
drag.setY(100);
drag.disable();
drag.enable();
drag.stop();
drag.reset();
drag.revert();
```

## SVG Functions

```javascript
import { svg } from 'animejs';

// Shape morphing
animate('#path', {
  d: svg.morphTo('#targetPath', precision),
});

// Path drawing
const drawable = svg.createDrawable('path', start, end);
animate(drawable, {
  draw: ['0 0', '0 1', '1 1'],  // start, middle, end
});

// Motion path
const motion = svg.createMotionPath('.path');
animate('.el', {
  translateX: motion.translateX,
  translateY: motion.translateY,
  rotate: motion.rotate,
});
```

## Text Splitting

```javascript
import { splitText } from 'animejs';

const split = splitText('.text', {
  lines: true,           // Split into lines
  words: true,           // Split into words
  chars: true,           // Split into characters
  debug: false,          // Show boundaries
  includeSpaces: false,  // Include space chars
  accessible: true,      // Add aria-label
  
  // Wrap options
  lines: { wrap: 'div', class: 'line' },
  words: { wrap: 'span', class: 'word' },
  chars: { wrap: 'span', class: 'char', clone: true },
});

// Access split elements
split.lines   // Array of line elements
split.words   // Array of word elements
split.chars   // Array of character elements

// Methods
split.revert();   // Restore original HTML
split.refresh();  // Re-split after DOM changes
```

## Utility Functions

```javascript
import { utils } from 'animejs';

// DOM
utils.$('.selector')              // Query all
utils.get(el, 'translateX')       // Get CSS value
utils.set(el, { x: 100 })         // Set CSS values
utils.remove(targets)             // Remove from animations
utils.cleanInlineStyles(targets)  // Remove inline styles

// Math
utils.random(min, max, decimals)  // Random number
utils.clamp(min, value, max)      // Clamp value
utils.snap(value, step)           // Snap to step
utils.wrap(min, max, value)       // Wrap around range
utils.lerp(start, end, progress)  // Linear interpolation
utils.damp(a, b, lambda, dt)      // Damped lerp
utils.mapRange(inMin, inMax, outMin, outMax, value)

// Formatting
utils.round(value, decimals)      // Round to decimals
utils.roundPad(value, decimals)   // Round with padding
utils.padStart(str, length, char) // Pad start
utils.padEnd(str, length, char)   // Pad end

// Conversion
utils.degToRad(degrees)           // Degrees to radians
utils.radToDeg(radians)           // Radians to degrees

// Random utilities
utils.createSeededRandom(seed)    // Seeded random generator
utils.randomPick(array)           // Random array item
utils.shuffle(array)              // Shuffle array
```

## Engine Control

```javascript
import { engine } from 'animejs';

// Global settings
engine.timeUnit = 'ms';           // 'ms' or 's'
engine.speed = 1;                 // Global speed multiplier
engine.fps = 60;                  // Target FPS
engine.precision = 4;             // Decimal precision
engine.pauseOnDocumentHidden = true;

// Manual updates
engine.useDefaultMainLoop = false;
engine.update();                  // Manual tick
engine.pause();                   // Pause all
engine.resume();                  // Resume all
```

## WAAPI (Web Animation API)

Lighter (~3KB) alternative using native browser animations.

```javascript
import { waapi } from 'animejs';

const anim = waapi.animate('.el', {
  x: 200,
  rotate: 360,
  duration: 1000,
  ease: spring({ bounce: 0.3 }),
  persist: true,  // Keep styles after animation
});
```

Supports most animate() parameters but with some limitations:
- No `onUpdate`, `onRender`, `onLoop` callbacks
- No `composition` parameter
- No JavaScript object animation
- Limited to CSS properties
