import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE_DIR = 'G:/Personal/claude/skills/21st-dev-reference';
const API_BASE = 'https://21st.dev/api/r';

// ============================================================
// CATEGORY DEFINITIONS
// ============================================================

const MARKETING_CATEGORIES = [
  { name: 'Heroes', slug: 'hero', file: 'heroes.md', desc: 'Hero sections for landing pages — animated headlines, CTAs, background effects, and product showcases' },
  { name: 'Features', slug: 'feature', file: 'features.md', desc: 'Feature sections showcasing product capabilities with grids, cards, and interactive layouts' },
  { name: 'Testimonials', slug: 'testimonial', file: 'testimonials.md', desc: 'Customer testimonial sections with carousels, cards, quotes, and social proof layouts' },
  { name: 'Pricing Sections', slug: 'pricing', file: 'pricing-sections.md', desc: 'Pricing tables, comparison cards, and plan selection components' },
  { name: 'Calls to Action', slug: 'cta', file: 'calls-to-action.md', desc: 'CTA sections with eye-catching buttons, banners, and conversion-focused layouts' },
  { name: 'Footers', slug: 'footer', file: 'footers.md', desc: 'Page footers with navigation links, social media, newsletters, and branding' },
  { name: 'Backgrounds', slug: 'background', file: 'backgrounds.md', desc: 'Animated and decorative backgrounds — beams, grids, particles, gradients, and noise effects' },
  { name: 'Navigation Menus', slug: 'navigation-menu', file: 'navigation-menus.md', desc: 'Navigation bars, floating navbars, mega menus, and responsive header navigation' },
  { name: 'Announcements', slug: 'announcement', file: 'announcements.md', desc: 'Announcement banners, notification bars, and sticky promotional sections' },
  { name: 'Clients', slug: 'client', file: 'clients.md', desc: 'Client logo sections, partner showcases, and trust badge displays' },
  { name: 'Comparisons', slug: 'comparison', file: 'comparisons.md', desc: 'Before/after comparisons, feature comparison tables, and slider comparisons' },
  { name: 'Docks', slug: 'dock', file: 'docks.md', desc: 'macOS-style docks, floating action bars, and app launcher components' },
  { name: 'Hooks', slug: 'hook', file: 'hooks.md', desc: 'Custom React hooks for animations, scroll tracking, media queries, and UI state' },
  { name: 'Images', slug: 'image', file: 'images.md', desc: 'Image galleries, sliders, lightboxes, zoom effects, and image comparison tools' },
  { name: 'Maps', slug: 'map', file: 'maps.md', desc: '3D globes, world maps, interactive map components, and location visualizations' },
  { name: 'Scroll Areas', slug: 'scroll-area', file: 'scroll-areas.md', desc: 'Scroll-driven animations, parallax sections, sticky scroll reveals, and infinite scroll' },
  { name: 'Texts', slug: 'text', file: 'texts.md', desc: 'Animated text effects — typewriters, text reveals, gradient text, flip words, and kinetic typography' },
  { name: 'Videos', slug: 'video', file: 'videos.md', desc: 'Video players, hero video dialogs, background videos, and video showcases' },
];

const UI_CATEGORIES = [
  { name: 'Accordions', slug: 'accordion', file: 'accordions.md', desc: 'Expandable content panels with smooth animations and nested sections' },
  { name: 'Alerts', slug: 'alert', file: 'alerts.md', desc: 'Status alerts, info banners, warning messages, and notification panels' },
  { name: 'Alert Dialogs', slug: 'alert-dialog', file: 'alert-dialogs.md', desc: 'Confirmation dialogs requiring user action before proceeding' },
  { name: 'Avatars', slug: 'avatar', file: 'avatars.md', desc: 'User avatars, avatar groups, status indicators, and profile images' },
  { name: 'Badges', slug: 'badge', file: 'badges.md', desc: 'Status badges, count indicators, labels, and tag components' },
  { name: 'Breadcrumbs', slug: 'breadcrumb', file: 'breadcrumbs.md', desc: 'Navigation breadcrumbs showing page hierarchy and location' },
  { name: 'Buttons', slug: 'button', file: 'buttons.md', desc: 'Button variants — animated, gradient, loading states, icon buttons, and social login buttons' },
  { name: 'Calendars', slug: 'calendar', file: 'calendars.md', desc: 'Calendar components, date displays, event calendars, and booking widgets' },
  { name: 'Cards', slug: 'card', file: 'cards.md', desc: 'Content cards — 3D effects, hover animations, spotlight effects, bento grids, and expandable cards' },
  { name: 'Carousels', slug: 'carousel', file: 'carousels.md', desc: 'Image and content carousels with swipe, autoplay, and custom transitions' },
  { name: 'Charts', slug: 'chart', file: 'charts.md', desc: 'Data visualization components — bar, line, pie, area charts, and dashboards' },
  { name: 'Checkboxes', slug: 'checkbox', file: 'checkboxes.md', desc: 'Checkbox variants with animations, custom styles, and indeterminate states' },
  { name: 'Comboboxes', slug: 'combobox', file: 'comboboxes.md', desc: 'Searchable dropdown selects with autocomplete and filtering' },
  { name: 'Commands', slug: 'command', file: 'commands.md', desc: 'Command palette / cmd+K components for search and quick actions' },
  { name: 'Context Menus', slug: 'context-menu', file: 'context-menus.md', desc: 'Right-click context menus with nested submenus and keyboard navigation' },
  { name: 'Data Tables', slug: 'data-table', file: 'data-tables.md', desc: 'Feature-rich tables with sorting, filtering, pagination, and row selection' },
  { name: 'Date Pickers', slug: 'date-picker', file: 'date-pickers.md', desc: 'Date and date-range picker components with calendar integration' },
  { name: 'Dialogs', slug: 'dialog', file: 'dialogs.md', desc: 'Modal dialog windows for forms, confirmations, and content overlays' },
  { name: 'Drawers', slug: 'drawer', file: 'drawers.md', desc: 'Slide-out drawer panels from edges of the screen' },
  { name: 'Dropdown Menus', slug: 'dropdown-menu', file: 'dropdown-menus.md', desc: 'Dropdown menus with icons, keyboard shortcuts, and nested submenus' },
  { name: 'File Uploads', slug: 'file-upload', file: 'file-uploads.md', desc: 'Drag-and-drop file upload zones, progress indicators, and file previews' },
  { name: 'Forms', slug: 'form', file: 'forms.md', desc: 'Form layouts, signup forms, multi-step forms, and form validation patterns' },
  { name: 'Hover Cards', slug: 'hover-card', file: 'hover-cards.md', desc: 'Cards that appear on hover showing preview content or user profiles' },
  { name: 'Inputs', slug: 'input', file: 'inputs.md', desc: 'Text inputs — animated placeholders, floating labels, search bars, and vanishing inputs' },
  { name: 'Input OTP', slug: 'input-otp', file: 'input-otp.md', desc: 'One-time password input fields with auto-focus and paste support' },
  { name: 'Marquees', slug: 'marquee', file: 'marquees.md', desc: 'Scrolling marquee components for logos, testimonials, and infinite scrolling content' },
  { name: 'Modals', slug: 'modal', file: 'modals.md', desc: 'Modal overlays with animations, custom layouts, and stacked modals' },
  { name: 'Pagination', slug: 'pagination', file: 'pagination.md', desc: 'Page navigation components with numbered pages, prev/next, and load more' },
  { name: 'Popovers', slug: 'popover', file: 'popovers.md', desc: 'Floating content panels triggered by click with rich content support' },
  { name: 'Progress', slug: 'progress', file: 'progress.md', desc: 'Progress bars, loading indicators, step progress, and circular progress' },
  { name: 'Radio Groups', slug: 'radio-group', file: 'radio-groups.md', desc: 'Radio button groups with custom styles, cards, and visual selection' },
  { name: 'Selects', slug: 'select', file: 'selects.md', desc: 'Select dropdowns with search, multi-select, grouped options, and custom rendering' },
  { name: 'Sheets', slug: 'sheet', file: 'sheets.md', desc: 'Bottom sheets and side panels that slide in from screen edges' },
  { name: 'Sidebars', slug: 'sidebar', file: 'sidebars.md', desc: 'Application sidebars with collapsible sections, icons, and responsive behavior' },
  { name: 'Skeletons', slug: 'skeleton', file: 'skeletons.md', desc: 'Loading skeleton placeholders that mimic content layout while data loads' },
  { name: 'Sliders', slug: 'slider', file: 'sliders.md', desc: 'Range sliders, dual-thumb sliders, and value input sliders' },
  { name: 'Switches', slug: 'switch', file: 'switches.md', desc: 'Toggle switch components with animations and custom themes' },
  { name: 'Tables', slug: 'table', file: 'tables.md', desc: 'Styled tables with headers, striping, and responsive layouts' },
  { name: 'Tabs', slug: 'tabs', file: 'tabs.md', desc: 'Tab navigation with animated indicators, vertical tabs, and icon tabs' },
  { name: 'Toasts', slug: 'toast', file: 'toasts.md', desc: 'Toast notification components with actions, auto-dismiss, and stacking' },
  { name: 'Toggles', slug: 'toggle', file: 'toggles.md', desc: 'Toggle buttons and toggle groups for binary and multi-option selection' },
  { name: 'Tooltips', slug: 'tooltip', file: 'tooltips.md', desc: 'Hover tooltips with custom content, positioning, and animations' },
];

// ============================================================
// KNOWN COMPONENT SLUGS → CATEGORY MAPPING
// ============================================================

const COMPONENT_REGISTRY = [
  // === ACETERNITY UI ===
  { author: 'aceternity', slug: '3d-card-effect', category: 'card' },
  { author: 'aceternity', slug: 'animated-testimonials', category: 'testimonial' },
  { author: 'aceternity', slug: 'apple-cards-carousel', category: 'carousel' },
  { author: 'aceternity', slug: 'aurora-background', category: 'background' },
  { author: 'aceternity', slug: 'background-beams', category: 'background' },
  { author: 'aceternity', slug: 'background-beams-with-collision', category: 'background' },
  { author: 'aceternity', slug: 'background-boxes', category: 'background' },
  { author: 'aceternity', slug: 'background-gradient', category: 'background' },
  { author: 'aceternity', slug: 'background-gradient-animation', category: 'background' },
  { author: 'aceternity', slug: 'background-lines', category: 'background' },
  { author: 'aceternity', slug: 'background-ripple-effect', category: 'background' },
  { author: 'aceternity', slug: 'bento-grid', category: 'card' },
  { author: 'aceternity', slug: 'canvas-reveal-effect', category: 'background' },
  { author: 'aceternity', slug: 'card-hover-effect', category: 'card' },
  { author: 'aceternity', slug: 'card-spotlight', category: 'card' },
  { author: 'aceternity', slug: 'card-stack', category: 'card' },
  { author: 'aceternity', slug: 'carousel', category: 'carousel' },
  { author: 'aceternity', slug: 'code-block', category: 'chart' },
  { author: 'aceternity', slug: 'colourful-text', category: 'text' },
  { author: 'aceternity', slug: 'compare', category: 'comparison' },
  { author: 'aceternity', slug: 'container-scroll-animation', category: 'scroll-area' },
  { author: 'aceternity', slug: 'container-text-flip', category: 'text' },
  { author: 'aceternity', slug: 'direction-aware-hover', category: 'hover-card' },
  { author: 'aceternity', slug: 'draggable-card', category: 'card' },
  { author: 'aceternity', slug: 'evervault-card', category: 'card' },
  { author: 'aceternity', slug: 'expandable-cards', category: 'card' },
  { author: 'aceternity', slug: 'file-upload', category: 'file-upload' },
  { author: 'aceternity', slug: 'flip-words', category: 'text' },
  { author: 'aceternity', slug: 'floating-dock', category: 'dock' },
  { author: 'aceternity', slug: 'floating-navbar', category: 'navigation-menu' },
  { author: 'aceternity', slug: 'focus-cards', category: 'card' },
  { author: 'aceternity', slug: 'following-pointer', category: 'hook' },
  { author: 'aceternity', slug: 'github-globe', category: 'map' },
  { author: 'aceternity', slug: 'glare-card', category: 'card' },
  { author: 'aceternity', slug: 'glowing-effect', category: 'background' },
  { author: 'aceternity', slug: 'google-gemini-effect', category: 'background' },
  { author: 'aceternity', slug: 'grid-and-dot-backgrounds', category: 'background' },
  { author: 'aceternity', slug: 'hero-highlight', category: 'hero' },
  { author: 'aceternity', slug: 'hero-parallax', category: 'hero' },
  { author: 'aceternity', slug: 'hover-border-gradient', category: 'button' },
  { author: 'aceternity', slug: 'images-slider', category: 'image' },
  { author: 'aceternity', slug: 'infinite-moving-cards', category: 'marquee' },
  { author: 'aceternity', slug: 'lamp-section-header', category: 'hero' },
  { author: 'aceternity', slug: 'layout-grid', category: 'card' },
  { author: 'aceternity', slug: 'lens', category: 'image' },
  { author: 'aceternity', slug: 'link-preview', category: 'hover-card' },
  { author: 'aceternity', slug: 'macbook-scroll', category: 'scroll-area' },
  { author: 'aceternity', slug: 'meteor-effect', category: 'background' },
  { author: 'aceternity', slug: 'moving-border', category: 'button' },
  { author: 'aceternity', slug: 'multi-step-loader', category: 'progress' },
  { author: 'aceternity', slug: 'navbar-menu', category: 'navigation-menu' },
  { author: 'aceternity', slug: 'parallax-grid-scroll', category: 'scroll-area' },
  { author: 'aceternity', slug: 'placeholders-and-vanish-input', category: 'input' },
  { author: 'aceternity', slug: 'shooting-stars', category: 'background' },
  { author: 'aceternity', slug: 'sidebar', category: 'sidebar' },
  { author: 'aceternity', slug: 'signup-form', category: 'form' },
  { author: 'aceternity', slug: 'sparkles', category: 'background' },
  { author: 'aceternity', slug: 'spotlight', category: 'background' },
  { author: 'aceternity', slug: 'spotlight-new', category: 'background' },
  { author: 'aceternity', slug: 'sticky-banner', category: 'announcement' },
  { author: 'aceternity', slug: 'sticky-scroll-reveal', category: 'scroll-area' },
  { author: 'aceternity', slug: 'svg-mask-effect', category: 'background' },
  { author: 'aceternity', slug: 'animated-tabs', category: 'tabs' },
  { author: 'aceternity', slug: 'text-generate-effect', category: 'text' },
  { author: 'aceternity', slug: 'text-hover-effect', category: 'text' },
  { author: 'aceternity', slug: 'text-reveal-card', category: 'text' },
  { author: 'aceternity', slug: 'timeline', category: 'progress' },
  { author: 'aceternity', slug: 'tooltip-card', category: 'tooltip' },
  { author: 'aceternity', slug: 'tracing-beam', category: 'scroll-area' },
  { author: 'aceternity', slug: 'typewriter-effect', category: 'text' },
  { author: 'aceternity', slug: 'vortex-background', category: 'background' },
  { author: 'aceternity', slug: 'wavy-background', category: 'background' },
  { author: 'aceternity', slug: 'wobble-card', category: 'card' },
  { author: 'aceternity', slug: 'world-map', category: 'map' },
  { author: 'aceternity', slug: '3d-marquee', category: 'marquee' },
  { author: 'aceternity', slug: 'animated-modal', category: 'modal' },
  { author: 'aceternity', slug: 'animated-tooltip', category: 'tooltip' },
  { author: 'aceternity', slug: 'resizable-navbar', category: 'navigation-menu' },
  { author: 'aceternity', slug: 'stateful-button', category: 'button' },
  { author: 'aceternity', slug: '3d-animated-pin', category: 'map' },
  { author: 'aceternity', slug: 'ascii-art', category: 'text' },
  { author: 'aceternity', slug: 'canvas-text', category: 'text' },
  { author: 'aceternity', slug: '3d-globe', category: 'map' },
  { author: 'aceternity', slug: 'dotted-glow-background', category: 'background' },
  { author: 'aceternity', slug: 'encrypted-text', category: 'text' },
  { author: 'aceternity', slug: 'images-badge', category: 'badge' },
  { author: 'aceternity', slug: 'keyboard', category: 'input' },
  { author: 'aceternity', slug: 'noise-background', category: 'background' },
  { author: 'aceternity', slug: 'loaders', category: 'progress' },
  { author: 'aceternity', slug: 'comet-card', category: 'card' },
  { author: 'aceternity', slug: 'container-cover', category: 'hero' },
  { author: 'aceternity', slug: 'layout-text-flip', category: 'text' },
  { author: 'aceternity', slug: 'dither-shader', category: 'background' },
  { author: 'aceternity', slug: 'scales', category: 'background' },
  { author: 'aceternity', slug: 'webcam-pixel-grid', category: 'background' },
  { author: 'aceternity', slug: 'pointer-highlight', category: 'background' },
  { author: 'aceternity', slug: 'pixelated-canvas', category: 'background' },

  // === MAGIC UI ===
  { author: 'magicui', slug: 'marquee', category: 'marquee' },
  { author: 'magicui', slug: 'dock', category: 'dock' },
  { author: 'magicui', slug: 'globe', category: 'map' },
  { author: 'magicui', slug: 'shimmer-button', category: 'button' },
  { author: 'magicui', slug: 'animated-beam', category: 'background' },
  { author: 'magicui', slug: 'bento-grid', category: 'card' },
  { author: 'magicui', slug: 'border-beam', category: 'card' },
  { author: 'magicui', slug: 'magic-card', category: 'card' },
  { author: 'magicui', slug: 'meteors', category: 'background' },
  { author: 'magicui', slug: 'number-ticker', category: 'text' },
  { author: 'magicui', slug: 'ripple', category: 'background' },
  { author: 'magicui', slug: 'word-rotate', category: 'text' },
  { author: 'magicui', slug: 'text-reveal', category: 'text' },
  { author: 'magicui', slug: 'particles', category: 'background' },
  { author: 'magicui', slug: 'hero-video-dialog', category: 'video' },

  // === FROM search_results.json (HEROES) ===
  { author: 'serafimcloud', slug: 'animated-hero', category: 'hero' },
  { author: 'mikolajdobrucki', slug: 'hero-section', category: 'hero' },
  { author: 'ohmfordev', slug: 'hero', category: 'hero' },
  { author: 'kinfe123', slug: 'hero-section-dark', category: 'hero' },
  { author: 'ayushmxxn', slug: 'feature-section', category: 'feature' },
  { author: 'serafimcloud', slug: 'hero-with-mockup', category: 'hero' },
  { author: 'Codehagen', slug: 'hero-pill', category: 'hero' },
  { author: 'Codehagen', slug: 'expandable-card', category: 'card' },
  { author: 'Codehagen', slug: 'hero', category: 'hero' },
  { author: 'tommyjepsen', slug: 'hero-with-group-of-images-text-and-two-buttons', category: 'hero' },
  { author: 'kokonutd', slug: 'shape-landing-hero', category: 'hero' },
  { author: 'originui', slug: 'hero-pill', category: 'hero' },
  { author: 'Codehagen', slug: 'hero-badge', category: 'hero' },
  { author: 'tommyjepsen', slug: 'hero-with-image-text-and-two-buttons', category: 'hero' },

  // === ADDITIONAL POPULAR COMPONENTS (guessed) ===
  // Origin UI
  { author: 'originui', slug: 'button', category: 'button' },
  { author: 'originui', slug: 'input', category: 'input' },
  { author: 'originui', slug: 'select', category: 'select' },
  { author: 'originui', slug: 'badge', category: 'badge' },
  { author: 'originui', slug: 'card', category: 'card' },
  { author: 'originui', slug: 'dialog', category: 'dialog' },
  { author: 'originui', slug: 'tabs', category: 'tabs' },
  { author: 'originui', slug: 'toast', category: 'toast' },
  { author: 'originui', slug: 'avatar', category: 'avatar' },
  { author: 'originui', slug: 'alert', category: 'alert' },
  { author: 'originui', slug: 'accordion', category: 'accordion' },
  { author: 'originui', slug: 'checkbox', category: 'checkbox' },
  { author: 'originui', slug: 'slider', category: 'slider' },
  { author: 'originui', slug: 'switch', category: 'switch' },
  { author: 'originui', slug: 'progress', category: 'progress' },
  { author: 'originui', slug: 'pagination', category: 'pagination' },
  { author: 'originui', slug: 'breadcrumb', category: 'breadcrumb' },
  { author: 'originui', slug: 'dropdown-menu', category: 'dropdown-menu' },
  { author: 'originui', slug: 'sidebar', category: 'sidebar' },
  { author: 'originui', slug: 'table', category: 'table' },
  { author: 'originui', slug: 'calendar', category: 'calendar' },
  { author: 'originui', slug: 'date-picker', category: 'date-picker' },
  { author: 'originui', slug: 'form', category: 'form' },
  { author: 'originui', slug: 'textarea', category: 'input' },
  { author: 'originui', slug: 'radio-group', category: 'radio-group' },
  { author: 'originui', slug: 'tooltip', category: 'tooltip' },
  { author: 'originui', slug: 'popover', category: 'popover' },

  // Serafimcloud
  { author: 'serafimcloud', slug: 'pricing', category: 'pricing' },
  { author: 'serafimcloud', slug: 'testimonial', category: 'testimonial' },
  { author: 'serafimcloud', slug: 'footer', category: 'footer' },
  { author: 'serafimcloud', slug: 'feature', category: 'feature' },
  { author: 'serafimcloud', slug: 'cta', category: 'cta' },
  { author: 'serafimcloud', slug: 'navbar', category: 'navigation-menu' },

  // Prism UI / Codehagen
  { author: 'Codehagen', slug: 'pricing', category: 'pricing' },
  { author: 'Codehagen', slug: 'testimonial', category: 'testimonial' },
  { author: 'Codehagen', slug: 'feature', category: 'feature' },
  { author: 'Codehagen', slug: 'footer', category: 'footer' },
  { author: 'Codehagen', slug: 'cta', category: 'cta' },
  { author: 'Codehagen', slug: 'navbar', category: 'navigation-menu' },
  { author: 'Codehagen', slug: 'comparison', category: 'comparison' },
  { author: 'Codehagen', slug: 'announcement', category: 'announcement' },
  { author: 'Codehagen', slug: 'client', category: 'client' },
];

// ============================================================
// API FETCH UTILITIES
// ============================================================

async function fetchComponent(author, slug) {
  try {
    const res = await fetch(`${API_BASE}/${author}/${slug}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      name: data.name || slug,
      author,
      slug,
      description: extractDescription(data),
      dependencies: data.dependencies || [],
      registryDeps: data.registry_dependencies || [],
      sourcePreview: data.files?.[0]?.content?.substring(0, 500) || '',
    };
  } catch {
    return null;
  }
}

function extractDescription(data) {
  // Try to get description from the component data
  if (data.description) return data.description;

  // Try to extract from source code comments or props
  const source = data.files?.[0]?.content || '';

  // Look for JSDoc comment
  const jsdocMatch = source.match(/\/\*\*\s*\n\s*\*\s*(.+?)(?:\n|\*\/)/);
  if (jsdocMatch) return jsdocMatch[1].trim();

  // Generate from name
  const name = data.name || data.component_slug || '';
  return `${name.replace(/-/g, ' ')} component`;
}

async function batchFetch(components, concurrency = 10) {
  const results = [];
  for (let i = 0; i < components.length; i += concurrency) {
    const batch = components.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(c => fetchComponent(c.author, c.slug))
    );
    results.push(...batchResults.map((r, idx) => ({
      ...batch[idx],
      data: r
    })));

    // Progress
    const done = Math.min(i + concurrency, components.length);
    process.stdout.write(`\rFetched ${done}/${components.length} components...`);

    // Small delay between batches
    if (i + concurrency < components.length) {
      await new Promise(r => setTimeout(r, 300));
    }
  }
  console.log(' Done!');
  return results;
}

// ============================================================
// MARKDOWN GENERATION
// ============================================================

function generateCategoryMarkdown(cat, type, components) {
  const browsePath = type === 'marketing' ? cat.slug : cat.slug;
  const lines = [];

  lines.push(`# ${cat.name}`);
  lines.push('');
  lines.push(`> ${cat.desc}`);
  lines.push('');
  lines.push(`**Browse**: https://21st.dev/s/${browsePath}`);
  lines.push('');

  // Top components table
  if (components.length > 0) {
    lines.push('## Top Components');
    lines.push('');
    lines.push('| Component | Author | Description | Deps | Install |');
    lines.push('|-----------|--------|-------------|------|---------|');

    for (const comp of components.slice(0, 8)) {
      const name = comp.data?.name || comp.slug;
      const desc = comp.data?.description || `${comp.slug.replace(/-/g, ' ')} component`;
      const deps = comp.data?.dependencies?.join(', ') || '-';
      const install = `\`npx shadcn@latest add "https://21st.dev/r/${comp.author}/${comp.slug}"\``;
      lines.push(`| ${name} | ${comp.author} | ${truncate(desc, 60)} | ${truncate(deps, 30)} | ${install} |`);
    }
    lines.push('');
  } else {
    lines.push('## Components');
    lines.push('');
    lines.push(`Browse the full collection at https://21st.dev/s/${browsePath}`);
    lines.push('');
    lines.push('Install any component with:');
    lines.push('```');
    lines.push(`npx shadcn@latest add "https://21st.dev/r/{author}/{component-slug}"`);
    lines.push('```');
    lines.push('');
  }

  // When to use
  lines.push('## When to Use');
  lines.push('');
  const useCases = getUseCases(cat);
  for (const uc of useCases) {
    lines.push(`- ${uc}`);
  }
  lines.push('');

  // Related categories
  const related = getRelatedCategories(cat, type);
  if (related.length > 0) {
    lines.push('## Related Categories');
    lines.push('');
    for (const rel of related) {
      const relType = rel.type === 'marketing' ? 'marketing' : 'ui';
      const prefix = type === relType ? '' : `../${relType}/`;
      lines.push(`- [${rel.name}](${prefix}${rel.file})`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function truncate(str, maxLen) {
  if (!str) return '-';
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen - 3) + '...';
}

function getUseCases(cat) {
  const useCaseMap = {
    // Marketing
    'hero': ['Landing page above-the-fold sections', 'Product launch pages with animated headlines', 'SaaS homepage hero with CTA buttons'],
    'feature': ['Product feature showcases with icon grids', 'Bento-style feature layouts', 'Feature comparison sections'],
    'testimonial': ['Customer review carousels', 'Social proof sections on landing pages', 'Case study highlight cards'],
    'pricing': ['SaaS pricing tier comparison tables', 'Monthly/annual toggle pricing cards', 'Feature-gated plan displays'],
    'cta': ['Newsletter signup sections', 'Trial/demo request banners', 'Conversion-focused call-to-action blocks'],
    'footer': ['Site-wide footer with link columns', 'Footer with newsletter and social links', 'Minimal copyright footers'],
    'background': ['Animated page backgrounds with particles or beams', 'Gradient mesh backgrounds', 'Grid/dot pattern decorations'],
    'navigation-menu': ['Responsive navbar with dropdowns', 'Floating/sticky navigation bars', 'Mega menu navigation headers'],
    'announcement': ['Top-of-page promotional banners', 'Product update notification bars', 'Sticky announcement ribbons'],
    'client': ['Logo carousel showcasing partners or clients', 'Trust badges and partnership displays', '"Used by" brand logo grids'],
    'comparison': ['Before/after image sliders', 'Feature comparison tables', 'Plan vs plan comparison layouts'],
    'dock': ['macOS-style floating dock navigation', 'App launcher toolbars', 'Floating action button groups'],
    'hook': ['Scroll position tracking hooks', 'Responsive breakpoint hooks', 'Animation timing hooks'],
    'image': ['Image galleries with lightbox', 'Before/after image comparison', 'Zoom and lens effects on images'],
    'map': ['Interactive 3D globe visualizations', 'World map with location pins', 'Geographic data displays'],
    'scroll-area': ['Parallax scroll sections', 'Scroll-triggered reveal animations', 'Sticky content with scrolling panels'],
    'text': ['Animated typewriter headlines', 'Text reveal and fade-in effects', 'Gradient and colorful text animations'],
    'video': ['Hero sections with video backgrounds', 'Video dialog/modal players', 'Product demo video showcases'],
    // UI
    'accordion': ['FAQ sections with expandable answers', 'Settings panels with collapsible groups', 'Content-heavy pages needing space optimization'],
    'alert': ['System status notifications', 'Form validation error messages', 'Success/warning/info banners'],
    'alert-dialog': ['Delete confirmation prompts', 'Unsaved changes warnings', 'Critical action confirmations'],
    'avatar': ['User profile displays in nav/comments', 'Team member lists with photos', 'Avatar groups showing collaborators'],
    'badge': ['Status indicators on items', 'Notification count badges', 'Category or tag labels'],
    'breadcrumb': ['Multi-level page navigation trails', 'E-commerce category browsing', 'Documentation section indicators'],
    'button': ['Primary action buttons with animations', 'Social login buttons', 'Loading/success state buttons'],
    'calendar': ['Date selection in booking systems', 'Event calendar displays', 'Scheduling interfaces'],
    'card': ['Product or content display cards', '3D hover effect showcase cards', 'Dashboard metric cards'],
    'carousel': ['Image galleries and slideshows', 'Testimonial carousels', 'Product showcase sliders'],
    'chart': ['Dashboard data visualizations', 'Analytics and reporting displays', 'Real-time data monitoring'],
    'checkbox': ['Multi-select option lists', 'Terms and conditions agreements', 'Settings toggle checkboxes'],
    'combobox': ['Searchable dropdown selectors', 'Tag input with suggestions', 'Country/city selection fields'],
    'command': ['Cmd+K search palette', 'Quick action launchers', 'Application-wide search interfaces'],
    'context-menu': ['Right-click action menus', 'File/item management options', 'Custom editor context menus'],
    'data-table': ['Admin dashboards with sortable data', 'Product inventory tables', 'User management lists'],
    'date-picker': ['Booking date selection', 'Date range filters', 'Event scheduling date inputs'],
    'dialog': ['Form entry modals', 'Detail view overlays', 'Settings/preference dialogs'],
    'drawer': ['Mobile navigation panels', 'Cart/preview side panels', 'Detail drawers on desktop'],
    'dropdown-menu': ['User account menus', 'Action menus for list items', 'Sort/filter option menus'],
    'file-upload': ['Document upload zones', 'Image upload with preview', 'Multi-file drag-and-drop areas'],
    'form': ['User registration/login forms', 'Multi-step onboarding flows', 'Settings and profile edit forms'],
    'hover-card': ['User profile preview on hover', 'Link preview tooltips', 'Content snippet previews'],
    'input': ['Search bars with animated placeholders', 'Form text inputs with validation', 'Vanishing placeholder inputs'],
    'input-otp': ['Two-factor authentication code entry', 'Phone verification inputs', 'Invite code entry fields'],
    'marquee': ['Client logo scrolling banners', 'Testimonial scrolling strips', 'Feature highlight tickers'],
    'modal': ['Full-featured modal dialogs', 'Image/video lightbox modals', 'Stacked modal workflows'],
    'pagination': ['Search result page navigation', 'Table data pagination', 'Blog post list pagination'],
    'popover': ['Rich content tooltips', 'Filter option panels', 'Color picker popover panels'],
    'progress': ['File upload progress bars', 'Multi-step form progress indicators', 'Loading state visualizations'],
    'radio-group': ['Single-selection option groups', 'Plan/tier selection cards', 'Survey answer choices'],
    'select': ['Dropdown option selectors', 'Multi-select with chips', 'Grouped option selectors'],
    'sheet': ['Mobile bottom sheets', 'Settings side panels', 'Quick action sheets'],
    'sidebar': ['App navigation sidebars', 'Dashboard side menus', 'Collapsible file tree sidebars'],
    'skeleton': ['Content loading placeholders', 'Card/list skeleton screens', 'Dashboard loading states'],
    'slider': ['Price range selectors', 'Volume/brightness controls', 'Image size adjustments'],
    'switch': ['Feature toggles in settings', 'Dark mode switches', 'Notification preference toggles'],
    'table': ['Styled data tables', 'Pricing comparison tables', 'Simple content tables'],
    'tabs': ['Content section navigation', 'Settings category tabs', 'Dashboard view switchers'],
    'toast': ['Action success notifications', 'Error alert toasts', 'Undo action notifications'],
    'toggle': ['View mode toggles (grid/list)', 'Feature on/off toggles', 'Text formatting toggles'],
    'tooltip': ['Icon button explanations', 'Truncated text hover reveals', 'Feature hint tooltips'],
  };
  return useCaseMap[cat.slug] || ['Browse the category for available components'];
}

function getRelatedCategories(cat, type) {
  const allCats = [...MARKETING_CATEGORIES.map(c => ({...c, type: 'marketing'})),
                   ...UI_CATEGORIES.map(c => ({...c, type: 'ui'}))];

  const relatedMap = {
    // Marketing
    'hero': ['background', 'text', 'button', 'cta'],
    'feature': ['card', 'hero', 'comparison'],
    'testimonial': ['carousel', 'card', 'marquee'],
    'pricing': ['comparison', 'card', 'cta'],
    'cta': ['hero', 'button', 'form'],
    'footer': ['navigation-menu', 'form'],
    'background': ['hero', 'card'],
    'navigation-menu': ['sidebar', 'dropdown-menu', 'dock'],
    'announcement': ['badge', 'toast', 'cta'],
    'client': ['marquee', 'carousel', 'image'],
    'comparison': ['pricing', 'slider', 'image'],
    'dock': ['navigation-menu', 'sidebar', 'tooltip'],
    'hook': ['scroll-area', 'background'],
    'image': ['carousel', 'card', 'comparison'],
    'map': ['background', 'hero'],
    'scroll-area': ['hero', 'card', 'text'],
    'text': ['hero', 'button'],
    'video': ['hero', 'dialog', 'modal'],
    // UI
    'accordion': ['tabs', 'card'],
    'alert': ['toast', 'badge', 'alert-dialog'],
    'alert-dialog': ['dialog', 'alert', 'modal'],
    'avatar': ['badge', 'card', 'hover-card'],
    'badge': ['avatar', 'button', 'announcement'],
    'breadcrumb': ['navigation-menu', 'tabs'],
    'button': ['badge', 'toggle', 'form'],
    'calendar': ['date-picker', 'form'],
    'card': ['carousel', 'hover-card', 'feature'],
    'carousel': ['card', 'image', 'testimonial'],
    'chart': ['card', 'data-table', 'progress'],
    'checkbox': ['form', 'switch', 'radio-group'],
    'combobox': ['select', 'command', 'input'],
    'command': ['combobox', 'input', 'dialog'],
    'context-menu': ['dropdown-menu', 'popover'],
    'data-table': ['table', 'pagination', 'select'],
    'date-picker': ['calendar', 'popover', 'form'],
    'dialog': ['modal', 'drawer', 'sheet'],
    'drawer': ['sheet', 'dialog', 'sidebar'],
    'dropdown-menu': ['context-menu', 'popover', 'select'],
    'file-upload': ['form', 'progress', 'input'],
    'form': ['input', 'select', 'button', 'checkbox'],
    'hover-card': ['tooltip', 'popover', 'card'],
    'input': ['form', 'combobox', 'input-otp'],
    'input-otp': ['input', 'form'],
    'marquee': ['carousel', 'client', 'testimonial'],
    'modal': ['dialog', 'drawer', 'sheet'],
    'pagination': ['data-table', 'button'],
    'popover': ['tooltip', 'hover-card', 'dropdown-menu'],
    'progress': ['skeleton', 'chart'],
    'radio-group': ['checkbox', 'select', 'form'],
    'select': ['combobox', 'dropdown-menu', 'radio-group'],
    'sheet': ['drawer', 'dialog', 'sidebar'],
    'sidebar': ['navigation-menu', 'drawer', 'sheet'],
    'skeleton': ['progress', 'card'],
    'slider': ['input', 'form', 'progress'],
    'switch': ['toggle', 'checkbox', 'form'],
    'table': ['data-table', 'card'],
    'tabs': ['accordion', 'navigation-menu'],
    'toast': ['alert', 'badge'],
    'toggle': ['switch', 'button', 'tabs'],
    'tooltip': ['hover-card', 'popover'],
  };

  const relatedSlugs = relatedMap[cat.slug] || [];
  return relatedSlugs.map(slug => allCats.find(c => c.slug === slug)).filter(Boolean).slice(0, 4);
}

function generateSkillMd(marketingCats, uiCats, allResults) {
  // Build component counts per category
  const catCounts = {};
  const topPicks = {};
  for (const r of allResults) {
    if (r.data) {
      if (!catCounts[r.category]) catCounts[r.category] = 0;
      catCounts[r.category]++;
      if (!topPicks[r.category]) topPicks[r.category] = r.data.name || r.slug;
    }
  }

  const lines = [];

  lines.push(`---`);
  lines.push(`description: "21st.dev component reference — 60 categories of shadcn/ui-compatible React components for landing pages, dashboards, and applications"`);
  lines.push(`trigger: Auto-fires when user builds React UI and mentions shadcn components, landing pages, marketing sections, hero sections, pricing pages, testimonials, or asks for pre-built UI components. Also on keywords "21st.dev", "shadcn component", "pre-built section", "landing page component". Does NOT trigger on ReactBits (separate skill).`);
  lines.push(`---`);
  lines.push('');
  lines.push('# 21st.dev Component Reference');
  lines.push('');
  lines.push('> Community registry of thousands of React UI components — shadcn/ui-compatible, Tailwind CSS + Radix UI');
  lines.push('');
  lines.push('## Platform Overview');
  lines.push('');
  lines.push('- **What**: Open marketplace for React UI components (anyone can publish)');
  lines.push('- **Stack**: React, TypeScript, Tailwind CSS, Radix UI — fully shadcn/ui-compatible');
  lines.push('- **Key Publishers**: Aceternity UI, Magic UI, Origin UI, Prism UI, serafimcloud');
  lines.push('- **Install any component**:');
  lines.push('  ```');
  lines.push('  npx shadcn@latest add "https://21st.dev/r/{author}/{component-slug}"');
  lines.push('  ```');
  lines.push('');
  lines.push('## Quick Selection Guide');
  lines.push('');
  lines.push('| Need | Browse | Try First |');
  lines.push('|------|--------|-----------|');
  lines.push('| Landing page hero | [Heroes](marketing/heroes.md) | `aceternity/hero-parallax`, `serafimcloud/animated-hero` |');
  lines.push('| Animated backgrounds | [Backgrounds](marketing/backgrounds.md) | `aceternity/aurora-background`, `aceternity/background-beams` |');
  lines.push('| Pricing table | [Pricing](marketing/pricing-sections.md) | Browse category for latest options |');
  lines.push('| Testimonials section | [Testimonials](marketing/testimonials.md) | `aceternity/animated-testimonials` |');
  lines.push('| Animated text effects | [Texts](marketing/texts.md) | `aceternity/typewriter-effect`, `aceternity/flip-words` |');
  lines.push('| Navigation bar | [Nav Menus](marketing/navigation-menus.md) | `aceternity/floating-navbar`, `aceternity/navbar-menu` |');
  lines.push('| Feature showcase | [Features](marketing/features.md) | Browse category for bento grids and feature sections |');
  lines.push('| Fancy cards | [Cards](ui/cards.md) | `aceternity/3d-card-effect`, `magicui/magic-card` |');
  lines.push('| Button variants | [Buttons](ui/buttons.md) | `magicui/shimmer-button`, `aceternity/moving-border` |');
  lines.push('| Command palette | [Commands](ui/commands.md) | Browse category for cmd+K implementations |');
  lines.push('| Data table | [Data Tables](ui/data-tables.md) | Browse category for sortable/filterable tables |');
  lines.push('| Sidebar nav | [Sidebars](ui/sidebars.md) | `aceternity/sidebar` |');
  lines.push('| Scrolling logos | [Marquees](ui/marquees.md) | `magicui/marquee`, `aceternity/infinite-moving-cards` |');
  lines.push('| 3D globe | [Maps](marketing/maps.md) | `magicui/globe`, `aceternity/github-globe` |');
  lines.push('| macOS dock | [Docks](marketing/docks.md) | `aceternity/floating-dock`, `magicui/dock` |');
  lines.push('');

  // Marketing Blocks table
  lines.push('## Marketing Blocks (18 categories)');
  lines.push('');
  lines.push('| Category | Description | Known Components | Top Pick |');
  lines.push('|----------|-------------|-----------------|----------|');
  for (const cat of marketingCats) {
    const count = catCounts[cat.slug] || 0;
    const pick = topPicks[cat.slug] || 'Browse category';
    lines.push(`| [${cat.name}](marketing/${cat.file}) | ${truncate(cat.desc, 55)} | ${count} verified | ${pick} |`);
  }
  lines.push('');

  // UI Components table
  lines.push('## UI Components (42 categories)');
  lines.push('');
  lines.push('| Category | Description | Known Components | Top Pick |');
  lines.push('|----------|-------------|-----------------|----------|');
  for (const cat of uiCats) {
    const count = catCounts[cat.slug] || 0;
    const pick = topPicks[cat.slug] || 'Browse category';
    lines.push(`| [${cat.name}](ui/${cat.file}) | ${truncate(cat.desc, 55)} | ${count} verified | ${pick} |`);
  }
  lines.push('');

  // Loading rules
  lines.push('## Loading Rules');
  lines.push('');
  lines.push('- Load **max 5 category files** per user query to keep context focused');
  lines.push('- Start with the Quick Selection Guide above to identify the right categories');
  lines.push('- For broad requests ("build a landing page"), load: heroes + features + pricing + testimonials + footers');
  lines.push('- For specific requests ("I need a button"), load only that category file');
  lines.push('- Always provide the `npx shadcn@latest add` install command');
  lines.push('');

  // Integration notes
  lines.push('## Integration Notes');
  lines.push('');
  lines.push('- All components are **shadcn/ui-compatible** — they install into your `components/ui/` directory');
  lines.push('- Requires: React 18+, Tailwind CSS, TypeScript (recommended)');
  lines.push('- Common dependencies: `framer-motion`, `lucide-react`, `@radix-ui/*`');
  lines.push('- After install: import from `@/components/ui/{component-name}`');
  lines.push('- Some components need additional setup (e.g., Tailwind config for animations)');
  lines.push('- The `npx shadcn@latest add` command handles dependency installation automatically');
  lines.push('');

  return lines.join('\n');
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('=== 21st.dev Reference Skill Builder ===\n');

  // 1. Create directories
  mkdirSync(join(BASE_DIR, 'marketing'), { recursive: true });
  mkdirSync(join(BASE_DIR, 'ui'), { recursive: true });
  console.log('Directories created.\n');

  // 2. Deduplicate component registry
  const seen = new Set();
  const uniqueComponents = COMPONENT_REGISTRY.filter(c => {
    const key = `${c.author}/${c.slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  console.log(`${uniqueComponents.length} unique components to fetch.\n`);

  // 3. Batch fetch from registry API
  console.log('Fetching component data from registry API...');
  const results = await batchFetch(uniqueComponents);

  // Stats
  const found = results.filter(r => r.data).length;
  const notFound = results.filter(r => !r.data).length;
  console.log(`\nResults: ${found} found, ${notFound} not found\n`);

  // 4. Group results by category
  const byCategory = {};
  for (const r of results) {
    if (!byCategory[r.category]) byCategory[r.category] = [];
    if (r.data) byCategory[r.category].push(r);
  }

  // 5. Generate marketing category files
  console.log('Generating marketing category files...');
  for (const cat of MARKETING_CATEGORIES) {
    const components = byCategory[cat.slug] || [];
    const md = generateCategoryMarkdown(cat, 'marketing', components);
    writeFileSync(join(BASE_DIR, 'marketing', cat.file), md);
  }
  console.log(`  ${MARKETING_CATEGORIES.length} marketing files written.`);

  // 6. Generate UI category files
  console.log('Generating UI category files...');
  for (const cat of UI_CATEGORIES) {
    const components = byCategory[cat.slug] || [];
    const md = generateCategoryMarkdown(cat, 'ui', components);
    writeFileSync(join(BASE_DIR, 'ui', cat.file), md);
  }
  console.log(`  ${UI_CATEGORIES.length} UI files written.`);

  // 7. Generate skill.md
  console.log('Generating skill.md...');
  const skillMd = generateSkillMd(MARKETING_CATEGORIES, UI_CATEGORIES, results);
  writeFileSync(join(BASE_DIR, 'skill.md'), skillMd);
  console.log('  skill.md written.\n');

  // 8. Summary
  const totalFiles = 1 + MARKETING_CATEGORIES.length + UI_CATEGORIES.length;
  console.log(`=== COMPLETE ===`);
  console.log(`Total files: ${totalFiles}`);
  console.log(`Categories: ${MARKETING_CATEGORIES.length} marketing + ${UI_CATEGORIES.length} UI = ${MARKETING_CATEGORIES.length + UI_CATEGORIES.length}`);
  console.log(`Components fetched: ${found}/${uniqueComponents.length}`);

  // Category coverage
  const coveredCats = Object.keys(byCategory).filter(k => byCategory[k].length > 0);
  const allCatSlugs = [...MARKETING_CATEGORIES, ...UI_CATEGORIES].map(c => c.slug);
  const uncoveredCats = allCatSlugs.filter(s => !coveredCats.includes(s));
  console.log(`Categories with components: ${coveredCats.length}/${allCatSlugs.length}`);
  if (uncoveredCats.length > 0) {
    console.log(`Categories without components: ${uncoveredCats.join(', ')}`);
  }
}

main().catch(console.error);
