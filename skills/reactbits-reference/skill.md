---
description: >-
  Reference for ReactBits — 122 animated, interactive React components by David Haz.
  Auto-triggers when building React UI with animated text, scroll effects, cursor effects,
  interactive cards, backgrounds, particles, glassmorphism, 3D effects, hover interactions,
  page transitions. Also on keywords: "animated", "interactive", "eye-catching", "cool-looking"
  React components, or explicit "ReactBits"/"react-bits" mentions.
---

# ReactBits Reference

[ReactBits](https://reactbits.dev) — 122 animated, interactive React components. Copy-paste model: install deps, copy component file, import and use.

## Quick Selection Guide

| You want... | Category | Top picks |
|---|---|---|
| Animated headlines / hero text | Text Animations | SplitText, BlurText, GlitchText, DecryptedText |
| Scroll-triggered text | Text Animations | ScrollFloat, ScrollReveal, ScrollVelocity |
| Typewriter / rotating text | Text Animations | TextType, RotatingText, Shuffle |
| Number counters | Text Animations | CountUp |
| Custom cursor effects | Animations | BlobCursor, SplashCursor, GhostCursor, Crosshair |
| Scroll entrance animations | Animations | AnimatedContent, FadeContent, GradualBlur |
| Decorative borders | Animations | StarBorder, ElectricBorder |
| Hover card effects | Animations | GlareHover, PixelTransition, StickerPeel |
| macOS-style dock | Components | Dock |
| Card layouts / galleries | Components | Stack, Carousel, Masonry, CircularGallery |
| Navigation menus | Components | FlowingMenu, GooeyNav, PillNav, BubbleMenu |
| Glassmorphism | Components | FluidGlass, GlassSurface, GlassIcons |
| 3D interactive cards | Components | TiltedCard, ProfileCard, DecayCard, Lanyard |
| Animated backgrounds | Backgrounds | Aurora, Silk, Particles, Hyperspeed |
| Shader / WebGL backgrounds | Backgrounds | LiquidChrome, Iridescence, Balatro, Plasma |
| Grid backgrounds | Backgrounds | DotGrid, GridDistortion, GridMotion, Squares |
| Retro / terminal look | Backgrounds | LetterGlitch, FaultyTerminal, Dither |

## Text Animations

| Component | Description | Deps | Best For |
|---|---|---|---|
| [ASCIIText](text-animations/ascii-text.md) | Renders text with an animated ASCII background for a retro feel. | three | text |
| [BlurText](text-animations/blur-text.md) | Text starts blurred then crisply resolves for a soft-focus reveal effect. | motion | text, entrances |
| [CircularText](text-animations/circular-text.md) | Layouts characters around a circle with optional rotation animation. | motion | text |
| [CountUp](text-animations/count-up.md) | Animated number counter supporting formatting and decimals. | motion | text |
| [CurvedLoop](text-animations/curved-loop.md) | Flowing looping text path along a customizable curve with drag interaction. | none | text, looping |
| [DecryptedText](text-animations/decrypted-text.md) | Hacker-style decryption cycling random glyphs until resolving to real text. | motion | text |
| [FallingText](text-animations/falling-text.md) | Characters fall with gravity + bounce creating a playful entrance. | matter-js | text, entrances |
| [FuzzyText](text-animations/fuzzy-text.md) | Vibrating fuzzy text with controllable hover intensity. | none | hover, text |
| [GlitchText](text-animations/glitch-text.md) | RGB split and distortion glitch effect with jitter effects. | none | text |
| [GradientText](text-animations/gradient-text.md) | Animated gradient sweep across live text with speed and color control. | none | text |
| [RotatingText](text-animations/rotating-text.md) | Cycles through multiple phrases with 3D rotate / flip transitions. | motion | 3D, text |
| [ScrambledText](text-animations/scrambled-text.md) | Detects cursor position and applies a distortion effect to text. | gsap | cursor, text |
| [ScrollFloat](text-animations/scroll-float.md) | Text gently floats / parallax shifts on scroll. | gsap | scroll, text |
| [ScrollReveal](text-animations/scroll-reveal.md) | Text gently unblurs and reveals on scroll. | gsap | scroll, text, entrances |
| [ScrollVelocity](text-animations/scroll-velocity.md) | Text marquee animatio - speed and distortion scale with user's scroll velocity. | motion | scroll, text, looping |
| [ShinyText](text-animations/shiny-text.md) | Metallic sheen sweeps across text producing a reflective highlight. | motion | text |
| [SplitText](text-animations/split-text.md) | Splits text into characters / words for staggered entrance animation. | gsap @gsap/react | text, entrances |
| [TextCursor](text-animations/text-cursor.md) | Make any text element follow your cursor, leaving a trail of copies behind it. | motion | cursor, text |
| [TextPressure](text-animations/text-pressure.md) | Characters scale / warp interactively based on pointer pressure zone. | none | cursor, text |
| [TextType](text-animations/text-type.md) | Typewriter effect with blinking cursor and adjustable typing cadence. | gsap | cursor, text |
| [TrueFocus](text-animations/true-focus.md) | Applies dynamic blur / clarity based over a series of words in order. | motion | text |
| [VariableProximity](text-animations/variable-proximity.md) | Letter styling changes continuously with pointer distance mapping. | motion | cursor, text |
| [Shuffle](text-animations/shuffle.md) | Animated text reveal where characters shuffle before settling. | gsap @gsap/react | text, entrances |

## Animations

| Component | Description | Deps | Best For |
|---|---|---|---|
| [AnimatedContent](animations/animated-content.md) | Wrapper that animates any children on scroll or mount with configurable direction, distance, duration, easing and disappear options. | gsap | scroll |
| [BlobCursor](animations/blob-cursor.md) | Organic blob cursor that smoothly follows the pointer with inertia and elastic morphing. | gsap | cursor |
| [ClickSpark](animations/click-spark.md) | Creates particle spark bursts at click position. | none | particles |
| [Crosshair](animations/crosshair.md) | Custom crosshair cursor with tracking, and link hover effects. | gsap | hover, cursor |
| [Cubes](animations/cubes.md) | 3D rotating cube cluster. Supports auto-rotation or hover interaction. | gsap | hover, 3D |
| [ElectricBorder](animations/electric-border.md) | Jittery electric energy border with animated arcs, glow and adjustable intensity. | none | borders |
| [FadeContent](animations/fade-content.md) | Simple directional fade / slide entrance / exit wrapper with threshold-based activation. | none | entrances |
| [GlareHover](animations/glare-hover.md) | Adds a realistic moving glare highlight on hover over any element. | none | hover |
| [GradualBlur](animations/gradual-blur.md) | Progressively un-blurs content based on scroll or trigger creating a cinematic reveal. | mathjs | scroll, entrances |
| [GhostCursor](animations/ghost-cursor.md) | Semi-transparent ghost cursor that smoothly follows the real cursor with a trailing effect. | three | cursor |
| [ImageTrail](animations/image-trail.md) | Cursor-based image trail with several built-in variants. | gsap | cursor |
| [LogoLoop](animations/logo-loop.md) | Continuously looping marquee of brand or tech logos with seamless repeat and hover pause. | none | hover, looping |
| [Magnet](animations/magnet.md) | Elements magnetically ease toward the cursor then settle back with spring physics. | none | cursor |
| [MagnetLines](animations/magnet-lines.md) | Animated field lines bend toward the cursor. | none | cursor |
| [MetaBalls](animations/meta-balls.md) | Liquid metaball blobs that merge and separate with smooth implicit surface animation. | ogl | shaders |
| [MetallicPaint](animations/metallic-paint.md) | Liquid metallic paint shader which can be applied to SVG elements. | none | shaders |
| [Noise](animations/noise.md) | Animated film grain / noise overlay adding subtle texture and motion. | none | effects |
| [PixelTrail](animations/pixel-trail.md) | Pixelated cursor trail emitting fading squares with retro digital feel. | three @react-three/fiber @react-three/drei | cursor |
| [PixelTransition](animations/pixel-transition.md) | Pixel dissolve transition for content reveal on hover. | gsap | hover, entrances |
| [Ribbons](animations/ribbons.md) | Flowing responsive ribbons/cursor trail driven by physics and pointer motion. | ogl | cursor |
| [ShapeBlur](animations/shape-blur.md) | Morphing blurred geometric shape. The effect occurs on hover. | three | hover |
| [SplashCursor](animations/splash-cursor.md) | Liquid splash burst at cursor with curling ripples and waves. | none | cursor, shaders |
| [StarBorder](animations/star-border.md) | Animated star / sparkle border orbiting content with twinkle pulses. | none | borders |
| [StickerPeel](animations/sticker-peel.md) | Sticker corner lift + peel interaction using 3D transform and shadow depth. | none | 3D |
| [TargetCursor](animations/target-cursor.md) | A cursor follow animation with 4 corners that lock onto targets. | gsap | cursor |
| [LaserFlow](animations/laser-flow.md) | Dynamic laser light that flows onto a surface, customizable effect. | three | effects |
| [Antigravity](animations/antigravity.md) | 3D antigravity particle field that repels from the cursor with smooth motion. | three @react-three/fiber | cursor, 3D, particles |
| [OrbitImages](animations/orbit-images.md) | SVG Path customizable orbiting images effect | motion | effects |

## Components

| Component | Description | Deps | Best For |
|---|---|---|---|
| [AnimatedList](components/animated-list.md) | List items enter with staggered motion variants for polished reveals. | motion | entrances |
| [BounceCards](components/bounce-cards.md) | Cards bounce that bounce in on mount. | gsap | cards |
| [BubbleMenu](components/bubble-menu.md) | Floating circular expanding menu with staggered item reveal. | gsap | navigation, entrances |
| [CardNav](components/card-nav.md) | Expandable navigation bar with card panels revealing nested links. | gsap | cards, navigation, entrances |
| [CardSwap](components/card-swap.md) | Cards animate position swapping with smooth layout transitions. | gsap | cards |
| [Carousel](components/carousel.md) | Responsive carousel with touch gestures, looping and transitions. | motion | galleries, looping |
| [ChromaGrid](components/chroma-grid.md) | A responsive grid of grayscale tiles. Hovering the grid reaveals their colors. | gsap | hover, grids |
| [CircularGallery](components/circular-gallery.md) | Circular orbit gallery rotating images. | ogl | galleries |
| [Counter](components/counter.md) | Flexible animated counter supporting increments + easing. | motion | UI |
| [DecayCard](components/decay-card.md) | Hover parallax effect that disintegrates the content of a card. | gsap | hover, cards |
| [Dock](components/dock.md) | macOS style magnifying dock with proximity scaling of icons. | motion | navigation |
| [DomeGallery](components/dome-gallery.md) | Immersive 3D dome gallery projecting images on a hemispheric surface. | @use-gesture/react | galleries, 3D |
| [ElasticSlider](components/elastic-slider.md) | Slider handle stretches elastically then snaps with spring physics. | motion | UI |
| [FlowingMenu](components/flowing-menu.md) | Liquid flowing active indicator glides between menu items. | gsap | navigation, shaders |
| [FluidGlass](components/fluid-glass.md) | Glassmorphism container with animated liquid distortion refraction. | three @react-three/fiber @react-three/drei maath | glassmorphism, shaders |
| [FlyingPosters](components/flying-posters.md) | 3D posters rotate on scroll infinitely. | ogl | scroll, 3D |
| [Folder](components/folder.md) | Interactive folder opens to reveal nested content smooth motion. | none | entrances |
| [GlassIcons](components/glass-icons.md) | Icon set styled with frosted glass blur. | none | glassmorphism |
| [GlassSurface](components/glass-surface.md) | Advanced Apple-style glass surface with real-time distortion + lighting. | none | glassmorphism |
| [GooeyNav](components/gooey-nav.md) | Navigation indicator morphs with gooey blob transitions between items. | none | navigation |
| [InfiniteMenu](components/infinite-menu.md) | Horizontally looping menu effect that scrolls endlessly with seamless wrap. | gl-matrix | scroll, navigation, looping |
| [Lanyard](components/lanyard.md) | Swinging 3D lanyard / badge card with realistic inertial motion. | three meshline @react-three/fiber @react-three/drei @react-three/rapier | cards, 3D |
| [MagicBento](components/magic-bento.md) | Interactive bento grid tiles expand + animate with various options. | gsap | grids |
| [Masonry](components/masonry.md) | Responsive masonry layout with animated reflow + gaps optimization. | gsap | UI |
| [ModelViewer](components/model-viewer.md) | Three.js model viewer with orbit controls and lighting presets. | three @react-three/fiber @react-three/drei | UI |
| [PillNav](components/pill-nav.md) | Minimal pill nav with sliding active highlight + smooth easing. | gsap | navigation |
| [PixelCard](components/pixel-card.md) | Card content revealed through pixel expansion transition. | none | cards, entrances |
| [ProfileCard](components/profile-card.md) | Animated profile card glare with 3D hover effect. | none | hover, cards, 3D |
| [ScrollStack](components/scroll-stack.md) | Overlapping card stack reveals on scroll with depth layering. | lenis | scroll, cards, entrances |
| [SpotlightCard](components/spotlight-card.md) | Dynamic spotlight follows cursor casting gradient illumination. | none | cursor |
| [Stack](components/stack.md) | Layered stack with swipe animations, autoplay and smooth transitions. | motion | UI |
| [Stepper](components/stepper.md) | Animated multi-step progress indicator with active state transitions. | motion | UI |
| [TiltedCard](components/tilted-card.md) | 3D perspective tilt card reacting to pointer. | motion | cursor, cards, 3D |
| [StaggeredMenu](components/staggered-menu.md) | Menu with staggered item animations and smooth transitions on open/close. | gsap | navigation |
| [ReflectiveCard](components/reflective-card.md) | Card with dynamic webcam reflection and glare effects that respond to cursor movement. | lucide-react | cursor, cards |

## Backgrounds

| Component | Description | Deps | Best For |
|---|---|---|---|
| [Aurora](backgrounds/aurora.md) | Flowing aurora gradient background. | ogl | backgrounds |
| [Balatro](backgrounds/balatro.md) | The balatro shader, fully customizalbe and interactive. | ogl | shaders |
| [Ballpit](backgrounds/ballpit.md) | Physics ball pit simulation with bouncing colorful spheres. | three | backgrounds |
| [Beams](backgrounds/beams.md) | Crossing animated ribbons with customizable properties. | three @react-three/fiber @react-three/drei | backgrounds |
| [ColorBends](backgrounds/color-bends.md) | Vibrant color bends with smooth flowing animation. | three | backgrounds |
| [DarkVeil](backgrounds/dark-veil.md) | Subtle dark background with a smooth animation and postprocessing. | ogl | backgrounds |
| [Dither](backgrounds/dither.md) | Retro dithered noise shader background. | three postprocessing @react-three/fiber @react-three/postprocessing | shaders |
| [DotGrid](backgrounds/dot-grid.md) | Animated dot grid with cursor interactions. | gsap | cursor, grids |
| [FaultyTerminal](backgrounds/faulty-terminal.md) | Terminal CRT scanline squares effect with flicker + noise. | ogl | backgrounds |
| [Galaxy](backgrounds/galaxy.md) | Parallax realistic starfield with pointer interactions. | ogl | cursor |
| [GradientBlinds](backgrounds/gradient-blinds.md) | Layered gradient blinds with spotlight and noise distortion. | ogl | backgrounds |
| [Grainient](backgrounds/grainient.md) | Grainy gradient swirls with soft wave distortion. | ogl | backgrounds |
| [GridScan](backgrounds/grid-scan.md) | Animated grid room 3D scan effect and cool interactions. | three face-api.js | 3D, grids |
| [GridDistortion](backgrounds/grid-distortion.md) | Warped grid mesh distorts smoothly reacting to cursor. | three | cursor, grids |
| [GridMotion](backgrounds/grid-motion.md) | Perspective moving grid lines based on cusror position. | gsap | 3D, grids |
| [Hyperspeed](backgrounds/hyperspeed.md) | Animated lines continuously moving to simulate hyperspace travel on click hold. | three postprocessing | backgrounds |
| [Iridescence](backgrounds/iridescence.md) | Slick iridescent shader with shifting waves. | ogl | shaders |
| [LetterGlitch](backgrounds/letter-glitch.md) | Matrix style letter animation. | none | backgrounds |
| [LightRays](backgrounds/light-rays.md) | Volumetric light rays/beams with customizable direction. | ogl | backgrounds |
| [Lightning](backgrounds/lightning.md) | Procedural lightning bolts with branching and glow flicker. | none | borders |
| [LiquidChrome](backgrounds/liquid-chrome.md) | Liquid metallic chrome shader with flowing reflective surface. | ogl | shaders |
| [Orb](backgrounds/orb.md) | Floating energy orb with customizable hover effect. | ogl | hover |
| [Particles](backgrounds/particles.md) | Configurable particle system. | ogl | particles |
| [PixelBlast](backgrounds/pixel-blast.md) | Exploding pixel particle bursts with optional liquid postprocessing. | three postprocessing | particles, shaders |
| [Plasma](backgrounds/plasma.md) | Organic plasma gradients swirl + morph with smooth turbulence. | ogl | backgrounds |
| [Prism](backgrounds/prism.md) | Rotating prism with configurable intensity, size, and colors. | ogl | backgrounds |
| [PrismaticBurst](backgrounds/prismatic-burst.md) | Burst of light rays with controllable color, distortion, amount. | ogl | backgrounds |
| [RippleGrid](backgrounds/ripple-grid.md) | A grid that continuously animates with a ripple effect. | ogl | grids |
| [Silk](backgrounds/silk.md) | Smooth waves background with soft lighting. | none | backgrounds |
| [Squares](backgrounds/squares.md) | Animated squares with scaling + direction customization. | none | backgrounds |
| [Threads](backgrounds/threads.md) | Animated pattern of lines forming a fabric-like motion. | ogl | backgrounds |
| [Waves](backgrounds/waves.md) | Layered lines that form smooth wave patterns with animation. | none | backgrounds |
| [LiquidEther](backgrounds/liquid-ether.md) | Interactive liquid shader with flowing distortion and customizable colors. | three | shaders |
| [FloatingLines](backgrounds/floating-lines.md) | 3D floating lines that react to cursor movement. | three | cursor, 3D |
| [LightPillar](backgrounds/light-pillar.md) | Vertical pillar of light with glow effects. | three | borders |
| [PixelSnow](backgrounds/pixel-snow.md) | Falling pixelated snow effect with customizable density and speed. | three | backgrounds |

## Loading Rules

- Load at most 5 component files per query
- Prefer components matching user's existing deps (gsap, motion, three, ogl)
- When recommending, load the 2-3 most relevant files
- For backgrounds, check if user needs WebGL/shader support

## Integration Notes

- **Install model**: Copy-paste. Install deps, copy component file, import and use
- **Variants**: Most support JS+CSS, JS+Tailwind, TS+CSS, TS+Tailwind
- **Common deps**: `gsap`, `motion` (Framer Motion), `ogl`, `three`, `@react-three/fiber`
- **Not an npm package**: Components are copied individually, not installed via npm
- **Live demos**: Each component links to reactbits.dev for demos and full source
