# Animation Libraries

## Decision Matrix

| Library | Bundle | Approach | Best For |
|---------|--------|----------|----------|
| **Motion** (Framer Motion) | ~18 kB | Declarative, spring-based | Most React animations |
| **React Spring** | ~16 kB | Spring physics | Physics-based, natural feel |
| **GSAP** | ~25 kB | Imperative timeline | Complex sequences, scroll animations |
| **auto-animate** | ~2 kB | Zero-config | Simple list/layout transitions |

---

## Motion (formerly Framer Motion) — Recommended

```bash
npm install motion
```

### Basic Animation
```tsx
import { motion } from 'motion/react';

function FadeIn({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

### Variants (Choreography)
```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function List({ items }: { items: Item[] }) {
  return (
    <motion.ul variants={container} initial="hidden" animate="show">
      {items.map(i => (
        <motion.li key={i.id} variants={item}>{i.name}</motion.li>
      ))}
    </motion.ul>
  );
}
```

### Layout Animations
```tsx
// Automatic layout animation when position/size changes
<motion.div layout>
  {isExpanded ? <FullContent /> : <Preview />}
</motion.div>

// Shared layout between components
<motion.div layoutId="card-image">
  <img src={image} />
</motion.div>
```

### Gestures
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  drag
  dragConstraints={{ left: 0, right: 300 }}
>
  Drag me
</motion.button>
```

### AnimatePresence (Exit Animations)
```tsx
import { AnimatePresence, motion } from 'motion/react';

function Notifications({ items }: { items: Notification[] }) {
  return (
    <AnimatePresence>
      {items.map(item => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
        >
          {item.message}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
```

### Scroll Animations
```tsx
import { useScroll, useTransform, motion } from 'motion/react';

function ParallaxHero() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <motion.div style={{ y, opacity }}>
      <h1>Hero Content</h1>
    </motion.div>
  );
}
```

---

## React Spring

```bash
npm install @react-spring/web
```

```tsx
import { useSpring, animated } from '@react-spring/web';

function AnimatedCard({ isVisible }: { isVisible: boolean }) {
  const styles = useSpring({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
    config: { tension: 280, friction: 60 },
  });

  return <animated.div style={styles}>Content</animated.div>;
}
```

### useTrail (Staggered)
```tsx
import { useTrail, animated } from '@react-spring/web';

function StaggeredList({ items }: { items: string[] }) {
  const trail = useTrail(items.length, {
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
  });

  return trail.map((style, i) => (
    <animated.div key={i} style={style}>{items[i]}</animated.div>
  ));
}
```

**Pick React Spring when:** Natural, physics-based feel is important (e.g., draggable cards, bouncy interactions).

---

## auto-animate

```bash
npm install @formkit/auto-animate
```

```tsx
import { useAutoAnimate } from '@formkit/auto-animate/react';

function TodoList({ items }: { items: Todo[] }) {
  const [parent] = useAutoAnimate(); // That's it — add, remove, reorder animated

  return (
    <ul ref={parent}>
      {items.map(item => (
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  );
}
```

**Pick auto-animate when:** Quick list/layout animations with zero config. 2 kB, no learning curve.

---

## GSAP

```bash
npm install gsap @gsap/react
```

```tsx
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

function AnimatedSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.card', {
      y: 100,
      opacity: 0,
      stagger: 0.2,
      duration: 0.8,
      ease: 'power3.out',
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
      <div className="card">Card 1</div>
      <div className="card">Card 2</div>
    </div>
  );
}
```

**Pick GSAP when:** Complex timelines, scroll-triggered sequences, high-performance canvas/SVG animation.

---

## CSS vs JS Animation

| Use CSS | Use JS (Motion/Spring) |
|---------|----------------------|
| Simple hover/focus transitions | Layout animations |
| Keyframe animations | Gesture-based (drag, swipe) |
| Performance-critical (GPU) | Exit animations |
| No React state involved | Orchestrated sequences |
| `transition`, `@keyframes` | Spring physics |
