# ProfileCard

> Animated profile card glare with 3D hover effect.

**Category**: Components  
**Docs**: https://reactbits.dev/components/profile-card

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | `"Javi A. Torres"` | Name |
| `title` | `string` | `"Software Engineer"` | Title |
| `handle` | `string` | `"javicodes"` | Handle |
| `status` | `string` | `"Online"` | Status |
| `contactText` | `string` | `"Contact Me"` | Contact Text |
| `avatarUrl` | `string` | `"/path/to/avatar.jpg"` | Avatar Url |
| `showUserInfo` | `boolean` | `true` | Show User Info |
| `enableTilt` | `boolean` | `true` | Enable Tilt |
| `enableMobileTilt` | `boolean` | `false` | Enable Mobile Tilt |
| `onContactClick` | `any` | `() =` | On Contact Click |

## Usage

```jsx
import ProfileCard from './ProfileCard'
  
<ProfileCard
  name="Javi A. Torres"
  title="Software Engineer"
  handle="javicodes"
  status="Online"
  contactText="Contact Me"
  avatarUrl="/path/to/avatar.jpg"
  showUserInfo={true}
  enableTilt={true}
  enableMobileTilt={false}
  onContactClick={() => console.log('Contact clicked')}
/>
```

## Suggested Use Cases

- Product showcases
- Modern web apps
