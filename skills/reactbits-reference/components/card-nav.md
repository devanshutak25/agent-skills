# CardNav

> Expandable navigation bar with card panels revealing nested links.

**Category**: Components  
**Docs**: https://reactbits.dev/components/card-nav

## Dependencies

```bash
npm install gsap
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `logo` | `any` | `logo` | Logo |
| `logoAlt` | `string` | `"Company Logo"` | Logo Alt |
| `items` | `any` | `items` | Items array |
| `baseColor` | `string` | `"#fff"` | Base Color |
| `menuColor` | `string` | `"#000"` | Menu Color |
| `buttonBgColor` | `string` | `"#111"` | Button Bg Color |
| `buttonTextColor` | `string` | `"#fff"` | Button Text Color |
| `ease` | `string` | `"power3.out"` | Easing function |

## Usage

```jsx
import CardNav from './CardNav'
import logo from './logo.svg';

const App = () => {
  const items = [
    {
      label: "About",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [
        { label: "Company", ariaLabel: "About Company" },
        { label: "Careers", ariaLabel: "About Careers" }
      ]
    },
    {
      label: "Projects", 
      bgColor: "#170D27",
      textColor: "#fff",
      links: [
        { label: "Featured", ariaLabel: "Featured Projects" },
        { label: "Case Studies", ariaLabel: "Project Case Studies" }
      ]
    },
    {
      label: "Contact",
      bgColor: "#271E37", 
      textColor: "#fff",
      links: [
        { label: "Email", ariaLabel: "Email us" },
        { label: "Twitter", ariaLabel: "Twitter" },
        { label: "LinkedIn", ariaLabel: "LinkedIn" }
      ]
    }
  ];

  return (
    <CardNav
      logo={logo}
      logoAlt="Company Logo"
      items={items}
      baseColor="#fff"
      menuColor="#000"
      buttonBgColor="#111"
      buttonTextColor="#fff"
      ease="power3.out"
    />
  );
};
```

## Suggested Use Cases

- App navigation
- Product showcases
- Modern web apps
