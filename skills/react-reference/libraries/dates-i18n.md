# Dates & Internationalization

## Dates

| Library | Bundle | Mutable | Best For |
|---------|--------|---------|----------|
| **date-fns** | Tree-shakeable (~2 kB per fn) | No (pure functions) | Most projects |
| **dayjs** | ~2 kB | No (immutable) | Drop-in Moment replacement |
| **Temporal API** | Native (Stage 3) | No | Future — not yet in browsers |

### date-fns
```bash
npm install date-fns
```

```tsx
import { format, formatDistanceToNow, parseISO, addDays, isAfter } from 'date-fns';

format(new Date(), 'MMM d, yyyy');              // "Mar 3, 2026"
format(new Date(), 'EEEE, MMMM do');            // "Tuesday, March 3rd"
formatDistanceToNow(parseISO('2026-01-01'));     // "2 months ago"
addDays(new Date(), 7);                          // 7 days from now
isAfter(dateA, dateB);                           // boolean comparison
```

### dayjs
```bash
npm install dayjs
```

```tsx
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

dayjs().format('MMM D, YYYY');       // "Mar 3, 2026"
dayjs('2026-01-01').fromNow();       // "2 months ago"
dayjs().add(7, 'day').toDate();      // 7 days from now
dayjs().isBefore(dayjs('2027-01-01')); // true
```

### Temporal API (Future)
```tsx
// Stage 3 TC39 — not yet in browsers, polyfill available
// Will replace Date entirely

Temporal.Now.plainDateISO();                    // 2026-03-03
Temporal.PlainDate.from('2026-03-03');
Temporal.Duration.from({ hours: 1, minutes: 30 });
```

---

## Internationalization (i18n)

| Library | Bundle | Framework | Best For |
|---------|--------|-----------|----------|
| **react-intl** (FormatJS) | ~15 kB | React | ICU message format, rich formatting |
| **i18next + react-i18next** | ~20 kB | Framework-agnostic | Feature-rich, plugins, namespaces |
| **next-intl** | ~10 kB | Next.js | Next.js App Router, type-safe |
| **Lingui** | ~5 kB | React | Macro-based, small bundle |

### next-intl (Next.js)
```bash
npm install next-intl
```

```tsx
// messages/en.json
{
  "HomePage": {
    "title": "Welcome to {name}",
    "items": "{count, plural, =0 {No items} one {# item} other {# items}}"
  }
}

// app/[locale]/page.tsx
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('HomePage');
  return (
    <h1>{t('title', { name: 'My App' })}</h1>
    <p>{t('items', { count: 5 })}</p>
  );
}
```

### react-i18next
```bash
npm install i18next react-i18next i18next-http-backend i18next-browser-languagedetector
```

```tsx
// i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: { greeting: 'Hello, {{name}}!' } },
    es: { translation: { greeting: '¡Hola, {{name}}!' } },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// Component
import { useTranslation } from 'react-i18next';

function Greeting() {
  const { t, i18n } = useTranslation();
  return (
    <div>
      <p>{t('greeting', { name: 'World' })}</p>
      <button onClick={() => i18n.changeLanguage('es')}>Español</button>
    </div>
  );
}
```

### react-intl (FormatJS)
```bash
npm install react-intl
```

```tsx
import { IntlProvider, FormattedMessage, FormattedNumber, FormattedDate } from 'react-intl';

function App() {
  return (
    <IntlProvider locale="en" messages={messages}>
      <FormattedMessage id="greeting" values={{ name: 'World' }} />
      <FormattedNumber value={1000} style="currency" currency="USD" />
      <FormattedDate value={new Date()} year="numeric" month="long" day="numeric" />
    </IntlProvider>
  );
}
```

---

## Number & Currency Formatting

```tsx
// Native Intl API — no library needed
new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(19.99);
// "$19.99"

new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(19.99);
// "19,99 €"

new Intl.NumberFormat('en', { notation: 'compact' }).format(1500000);
// "1.5M"
```

---

## Choosing Guide

```
Next.js App Router?              → next-intl
Feature-rich, plugin ecosystem?  → i18next
ICU message format, rich text?   → react-intl
Smallest bundle?                 → Lingui
Dates: most projects?            → date-fns
Dates: tiny bundle?              → dayjs
```
