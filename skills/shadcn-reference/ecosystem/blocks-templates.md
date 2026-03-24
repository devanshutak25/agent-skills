# shadcn/ui Blocks & Templates

## Official Blocks
- **URL**: ui.shadcn.com/blocks
- **What**: Pre-built page sections using shadcn/ui components
- **Categories**: Dashboard, Authentication, Settings, Sidebar layouts
- **Install**: `npx shadcn@latest add <block-name>`

### Available Block Categories
| Category | Examples |
|----------|---------|
| Dashboard | Dashboard with charts, stats cards, recent activity |
| Authentication | Login, register, forgot password, two-factor |
| Settings | Profile settings, account settings, appearance |
| Sidebar | Sidebar with navigation, collapsible groups |
| Music | Music player layout (demo) |
| Mail | Email client layout (demo) |
| Tasks | Task management layout (demo) |
| Forms | Multi-step forms, settings forms |
| Cards | Pricing cards, feature cards, stat cards |

### Using Blocks
```bash
# List available blocks
npx shadcn@latest add --list

# Add a specific block
npx shadcn@latest add dashboard-01

# Blocks install to the configured components directory
```

## Community Block Collections

### ShadcnBlocks
- **URL**: shadcnblocks.com
- **Count**: 1350+ blocks
- **Categories**: Hero, Features, Pricing, Testimonials, CTA, FAQ, Footer, Header, Stats, Team, Blog, Contact
- **License**: Free + Premium tiers
- **Install**: Copy JSX from site

### Shadcn Studio
- **URL**: shadcn.studio
- **Description**: Visual theme editor and block builder
- **Features**: Live theme customization, export CSS variables, preview with real components

### ibelick/background-snippets
- **URL**: bg.ibelick.com
- **Description**: Background pattern/gradient snippets
- **Patterns**: Grids, dots, gradients, animated backgrounds

## Starter Templates

### Next.js Templates
| Template | Description |
|----------|-------------|
| `create-next-app` with shadcn | `npx create-next-app -e https://github.com/shadcn/next-template` |
| Taxonomy | Full-featured app with auth, blog, dashboard |
| shadcn/ui + Next.js 14 | Official starter: `npx shadcn@latest init` in Next.js project |

### SaaS Boilerplates
| Template | Stack | Features |
|----------|-------|----------|
| next-saas-starter | Next.js + shadcn + Drizzle | Auth, billing, dashboard |
| Shipfast | Next.js + shadcn | Stripe, auth, SEO, emails |
| Precedent | Next.js + shadcn + Prisma | Auth, analytics, blog |
| Taxonomy | Next.js + shadcn + Prisma + Auth.js | Full CMS + dashboard |

### Admin Dashboard Templates
| Template | Description |
|----------|-------------|
| shadcn-admin | Full admin dashboard template |
| shadcn-dashboard | Minimal dashboard starter |
| next-shadcn-dashboard-starter | Next.js + shadcn dashboard |

### Portfolio/Landing Templates
| Template | Type |
|----------|------|
| Portfolio | Developer portfolio with shadcn |
| Landing page | Marketing landing page |
| Blog | MDX blog with shadcn components |

## Building Custom Blocks

### Registry Block Definition
```json
{
  "name": "login-01",
  "type": "registry:block",
  "description": "A login form with email and password.",
  "dependencies": ["@/components/ui/button", "@/components/ui/input", "@/components/ui/label", "@/components/ui/card"],
  "files": [
    {
      "path": "blocks/login-01.tsx",
      "type": "registry:component"
    }
  ]
}
```
