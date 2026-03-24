---
name: animejs-web
description: Build animated websites using Anime.js V4, the fast and versatile JavaScript animation library. Use when creating websites with animations, interactive UI effects, scroll-triggered animations, SVG morphing, text animations, draggable elements, or any web project requiring smooth, performant animations. Triggers include requests for animated websites, landing pages with motion, interactive web components, or any mention of Anime.js.
---

# Anime.js Web Development Skill

Build modern, animated websites using Anime.js V4 - a lightweight (~10KB gzipped) yet powerful JavaScript animation library.

## Quick Start

### CDN (simplest)
```html
<script src="https://cdn.jsdelivr.net/npm/animejs/dist/bundles/anime.umd.min.js"></script>
<script>
  const { animate, stagger, createTimeline } = anime;
</script>
```

### ES Modules
```html
<script type="module">
  import { animate, stagger, createTimeline } from 'https://cdn.jsdelivr.net/npm/animejs/dist/bundles/anime.esm.min.js';
</script>
```

## Core API (V4 Syntax)

### Basic Animation
```javascript
import { animate } from 'animejs';

animate('.element', {
  x: 250,              // translateX shorthand
  y: 100,              // translateY shorthand  
  rotate: 360,         // rotation in degrees
  scale: 1.5,
  opacity: 0.5,
  duration: 1000,      // milliseconds
  ease: 'outQuad',     // easing function
  delay: 200,
  loop: true,          // repeat count (true = infinite)
  alternate: true,     // ping-pong animation
});
```

### From/To Values
```javascript
animate('.box', {
  x: { from: -100, to: 100 },
  opacity: { from: 0, to: 1, duration: 500 },
  scale: [0.5, 1],     // shorthand [from, to]
});
```

### Property-Specific Parameters
```javascript
animate('.element', {
  x: { to: 200, duration: 800, ease: 'outElastic' },
  rotate: { to: 360, duration: 1200, ease: 'inOutQuad' },
  opacity: { to: 0.8, duration: 400 },
});
```

## Stagger Animations

Create cascading effects across multiple elements:
```javascript
import { animate, stagger } from 'animejs';

animate('.card', {
  y: [50, 0],
  opacity: [0, 1],
  delay: stagger(100),           // 100ms between each
  duration: 600,
});

// Stagger from center
animate('.grid-item', {
  scale: [0, 1],
  delay: stagger(50, { from: 'center' }),
});

// Grid stagger for ripple effects
animate('.dot', {
  scale: [0, 1],
  delay: stagger(25, { 
    grid: [10, 10], 
    from: 'center' 
  }),
});

// Value staggering
animate('.bar', {
  height: stagger([50, 200]),    // range from 50 to 200
  delay: stagger(50, { ease: 'inOutQuad' }),
});
```

## Timelines

Sequence and synchronize multiple animations:
```javascript
import { createTimeline } from 'animejs';

const tl = createTimeline({
  defaults: { duration: 600, ease: 'outQuad' },
  loop: true,
  alternate: true,
});

tl.add('.box1', { x: 200 })
  .add('.box2', { x: 200 }, '-=300')     // start 300ms before previous ends
  .add('.box3', { x: 200 }, '<')          // start at same time as previous
  .add('.box4', { x: 200 }, '+=200')      // start 200ms after previous ends
  .label('midpoint')                       // create named position
  .add('.box5', { y: 100 }, 'midpoint');  // start at label
```

### Timeline with Stagger
```javascript
const tl = createTimeline();
tl.add('.item', { 
  opacity: [0, 1], 
  y: [20, 0] 
}, stagger(100));  // stagger as position argument
```

## Scroll-Triggered Animations

```javascript
import { animate, onScroll } from 'animejs';

// Trigger on scroll into view
animate('.reveal', {
  y: [50, 0],
  opacity: [0, 1],
  autoplay: onScroll({
    target: '.reveal',
    debug: true,  // shows threshold markers
  }),
});

// Sync animation progress to scroll
animate('.parallax', {
  y: [-100, 100],
  autoplay: onScroll({
    sync: true,  // progress linked to scroll position
  }),
});

// Custom scroll container
animate('.element', {
  x: 200,
  autoplay: onScroll({
    container: '.scroll-container',
  }),
});
```

## SVG Animations

### Path Drawing
```javascript
import { animate, svg } from 'animejs';

const drawable = svg.createDrawable('.path');
animate(drawable, {
  draw: ['0 0', '0 1', '1 1'],  // [start, middle, end]
  duration: 2000,
  ease: 'inOut(3)',
});
```

### Shape Morphing
```javascript
animate('#shape1', {
  d: svg.morphTo('#shape2'),
  duration: 1500,
  ease: 'inOutQuad',
});
```

### Motion Path
```javascript
const { translateX, translateY, rotate } = svg.createMotionPath('.path');
animate('.car', {
  translateX,
  translateY,
  rotate,
  duration: 3000,
});
```

## Text Animations

```javascript
import { animate, splitText, stagger } from 'animejs';

// Split text into animatable parts
const split = splitText('.heading', {
  chars: true,
  words: { wrap: 'span' },
  lines: true,
});

// Animate characters
animate(split.chars, {
  y: [20, 0],
  opacity: [0, 1],
  delay: stagger(30),
  ease: 'outExpo',
});

// Animate words
animate(split.words, {
  rotateX: [-90, 0],
  opacity: [0, 1],
  delay: stagger(100, { from: 'center' }),
});
```

## Draggable Elements

```javascript
import { createDraggable, spring } from 'animejs';

const draggable = createDraggable('.draggable', {
  x: true,
  y: true,
  container: '.bounds',
  snap: 50,  // snap to 50px grid
  releaseEase: spring({ stiffness: 200, damping: 20 }),
  onDrag: (d) => console.log(d.x, d.y),
  onRelease: (d) => console.log('released'),
});
```

## Easing Functions

### Built-in Eases
```javascript
// Power eases: in, out, inOut, outIn + (power)
ease: 'outQuad'      // out(2)
ease: 'inOutCubic'   // inOut(3)
ease: 'out(4)'       // outQuart
ease: 'inOut(1.5)'   // custom power

// Elastic, bounce, back
ease: 'outElastic'
ease: 'inOutBounce'
ease: 'outBack'
```

### Spring Physics
```javascript
import { animate, spring } from 'animejs';

animate('.element', {
  x: 200,
  ease: spring({ 
    bounce: 0.5,      // 0-1, perceived bounciness
    duration: 600     // target duration
  }),
});

// Physics-based spring
animate('.element', {
  x: 200,
  ease: spring({
    mass: 1,
    stiffness: 100,
    damping: 10,
    velocity: 0,
  }),
});
```

### Custom Cubic Bézier
```javascript
import { cubicBezier } from 'animejs';

animate('.element', {
  x: 200,
  ease: cubicBezier(0.7, 0.1, 0.5, 0.9),
});
```

## Animation Controls

```javascript
const anim = animate('.element', { x: 200, autoplay: false });

anim.play();       // play forward
anim.pause();      // pause
anim.resume();     // resume in current direction
anim.reverse();    // play backward
anim.restart();    // restart from beginning
anim.seek(500);    // seek to 500ms
anim.seek('50%');  // seek to 50%
anim.complete();   // jump to end
anim.revert();     // restore original styles
```

## Callbacks

```javascript
animate('.element', {
  x: 200,
  onBegin: (anim) => console.log('started'),
  onUpdate: (anim) => console.log(anim.progress),
  onComplete: (anim) => console.log('finished'),
  onLoop: (anim) => console.log('loop iteration'),
});

// Promise-based
animate('.element', { x: 200 })
  .then(anim => console.log('complete'));
```

## Utility Functions

```javascript
import { utils } from 'animejs';

// DOM selection
const elements = utils.$('.selector');

// Get/Set values
const currentX = utils.get('.el', 'translateX');
utils.set('.el', { opacity: 0.5, x: 100 });

// Math utilities
utils.random(0, 100);
utils.clamp(0, value, 100);
utils.lerp(start, end, progress);
utils.mapRange(0, 100, 0, 1, value);
utils.round(value, 2);  // 2 decimal places
```

## WAAPI (Web Animations API) Mode

Lighter alternative (~3KB) using native browser animations:
```javascript
import { waapi, spring } from 'animejs';

waapi.animate('.element', {
  x: 200,
  rotate: 360,
  ease: spring({ bounce: 0.3 }),
  duration: 1000,
});
```

## Responsive Animations with Scope

```javascript
import { createScope, animate } from 'animejs';

const scope = createScope({
  root: '.container',
  mediaQueries: {
    mobile: '(max-width: 768px)',
    desktop: '(min-width: 769px)',
  },
});

scope.add(({ matches }) => {
  animate('.element', {
    x: matches.mobile ? 100 : 300,
    duration: matches.mobile ? 400 : 800,
  });
});
```

## Common Patterns

### Fade In on Load
```javascript
animate('.hero', {
  opacity: [0, 1],
  y: [30, 0],
  duration: 800,
  ease: 'outQuad',
});
```

### Hover Effect
```javascript
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    animate(card, { scale: 1.05, duration: 200 });
  });
  card.addEventListener('mouseleave', () => {
    animate(card, { scale: 1, duration: 200 });
  });
});
```

### Loading Spinner
```javascript
animate('.spinner', {
  rotate: 360,
  duration: 1000,
  ease: 'linear',
  loop: true,
});
```

### Staggered List Reveal
```javascript
animate('.list-item', {
  opacity: [0, 1],
  x: [-20, 0],
  delay: stagger(50),
  ease: 'outQuad',
});
```

## Performance Tips

1. Prefer `x`, `y`, `scale`, `rotate`, `opacity` - GPU-accelerated
2. Avoid animating `width`, `height`, `top`, `left` - causes layout thrashing
3. Use `will-change: transform` CSS for heavy animations
4. Use WAAPI mode for simpler animations - smaller bundle
5. Import only needed modules for tree-shaking

## Reference Files

For detailed API documentation, see:
- `references/api-reference.md` - Complete API with all parameters and module imports
- `references/easing-reference.md` - All easing functions and spring physics details
