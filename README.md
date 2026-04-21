# @multicloud-io/react-a11y-toolbar

A plug-and-play accessibility toolbar for React. Drop it into any app and give your users 17 one-click accessibility controls — font sizing, contrast modes, reading guides, screen reader enhancements, and more — with settings persisted across sessions. One runtime dependency. Full TypeScript support. RTL-ready. SSR/Next.js compatible.

![Demo of the accessibility toolbar](demo/demo.gif)

**17 features · 4 profiles · Built-in i18n · RTL support · SSR/Next.js ready**

---

## Install

```bash
npm install @multicloud-io/react-a11y-toolbar
```

## Quick Start

```tsx
import { AccessibilityProvider, AccessibilityToolbar } from "@multicloud-io/react-a11y-toolbar";
import "@multicloud-io/react-a11y-toolbar/style.css";

export default function App() {
  return (
    <AccessibilityProvider>
      <YourApp />
      <AccessibilityToolbar locale="en" />
    </AccessibilityProvider>
  );
}
```

---

## What's Included

### Features

Users can toggle any combination of features individually. Settings are saved to `localStorage` and restored on the next visit.

#### Content Adjustments
| Feature | Description |
|---------|-------------|
| Font Size | Step up or down (configurable min/max, default max 1.5×) |
| Readable Font | Switches body text to a high-legibility system font |
| Highlight Titles | Adds a yellow background to all headings |
| Highlight Links | Underlines and highlights all links in blue |

#### Color Adjustments
| Feature | Description |
|---------|-------------|
| Dark Contrast | Dark color palette for low-light environments |
| Light Contrast | High-contrast light color palette |
| High Contrast | Pure black/white with yellow accent colors |
| High Saturation | Increases color saturation to 200% |
| Low Saturation | Reduces color saturation to 20% |
| Monochrome | Converts the page to grayscale |

> Contrast modes (dark/light/high) are mutually exclusive. Saturation modes (high/low) are mutually exclusive.

#### Visual & Navigation Aids
| Feature | Description |
|---------|-------------|
| Reading Guide | A horizontal strip that follows the cursor to guide reading |
| Stop Animations | Disables all CSS animations and transitions |
| Big Cursor | Replaces the cursor with a large circle |
| Hide Images | Hides all images on the page |
| Screen Reader | Adds focus indicators, semantic labels, and text-to-speech |

#### Text Spacing
| Feature | Description |
|---------|-------------|
| Letter Spacing | Increases letter spacing to 0.12em |
| Line Height | Increases line height to 2em |
| Font Weight | Sets body text to bold |

---

### Profiles

Profiles activate a curated set of features with one click. Clicking an active profile deactivates it and resets all features.

| Profile | For | Features Activated |
|---------|-----|--------------------|
| Seizure Safe | Photosensitive users | Stop Animations, Low Saturation |
| Visually Impaired | Low vision | High Contrast, Highlight Links |
| ADHD Friendly | Reducing distraction | Stop Animations, Reading Guide |
| Cognitive & Learning | Reading comprehension | Readable Font, Letter Spacing, Line Height, Highlight Links |

---

## Next.js / SSR

Add the hydration script to prevent flash of unstyled content (FOUC) during server-side rendering:

```tsx
// app/layout.tsx
import { AccessibilityProvider, AccessibilityToolbar, getA11yHydrationScript } from "@multicloud-io/react-a11y-toolbar";
import "@multicloud-io/react-a11y-toolbar/style.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: getA11yHydrationScript() }} />
      </head>
      <body>
        <AccessibilityProvider>
          {children}
          <AccessibilityToolbar locale="en" />
        </AccessibilityProvider>
      </body>
    </html>
  );
}
```

When using a custom `storageKey` or `defaultFontSize`, pass the same values to `getA11yHydrationScript`:

```tsx
<script dangerouslySetInnerHTML={{
  __html: getA11yHydrationScript("my-app-a11y", 1)
}} />
```

---

## Configuration

`AccessibilityProvider` accepts an optional `config` prop:

```tsx
<AccessibilityProvider
  config={{
    storageKey: "my-app-a11y",  // localStorage key (default: "a11y-toolbar")
    defaultFontSize: 1,          // base font size multiplier (default: 1)
    maxFontSize: 2,              // max font size multiplier (default: 1.5)
  }}
>
```

---

## Internationalization (i18n)

The toolbar ships with English strings. Pass a `translations` prop to override any or all keys:

```tsx
<AccessibilityToolbar
  locale="fr"
  translations={{
    title: "Menu d'accessibilité",
    openMenu: "Ouvrir le menu d'accessibilité",
    resetAll: "Réinitialiser tout",
    // ... override any key
  }}
/>
```

### All translation keys

| Key | Default (English) |
|-----|-------------------|
| `title` | Accessibility Menu |
| `openMenu` | Open accessibility menu |
| `closeMenu` | Close accessibility menu |
| `resetAll` | Reset All |
| `close` | Close |
| `contentAdjustments` | Content Adjustments |
| `fontSizeLabel` | Font Size |
| `increaseFontSize` | Increase Font Size |
| `decreaseFontSize` | Decrease Font Size |
| `readableFont` | Readable Font |
| `highlightTitles` | Highlight Titles |
| `highlightLinks` | Highlight Links |
| `colorAdjustments` | Color Adjustments |
| `darkContrast` | Dark Contrast |
| `lightContrast` | Light Contrast |
| `highContrast` | High Contrast |
| `highSaturation` | High Saturation |
| `lowSaturation` | Low Saturation |
| `monochrome` | Monochrome |
| `navigationAids` | Visual & Navigation Aids |
| `readingGuide` | Reading Guide |
| `stopAnimations` | Stop Animations |
| `bigCursor` | Big Cursor |
| `hideImages` | Hide Images |
| `textSpacing` | Text Spacing |
| `letterSpacing` | Letter Spacing |
| `lineHeight` | Line Height |
| `fontWeight` | Font Weight |
| `screenReader` | Screen Reader |
| `profiles` | Accessibility Profiles |
| `seizureSafe` | Seizure Safe Profile |
| `seizureSafeDesc` | Stops animations and reduces color saturation. |
| `visuallyImpaired` | Visually Impaired Profile |
| `visuallyImpairedDesc` | Enhances contrast and readability for low vision. |
| `adhdFriendly` | ADHD Friendly Profile |
| `adhdFriendlyDesc` | Reduces distractions for better focus. |
| `cognitiveLearning` | Cognitive & Learning Profile |
| `cognitiveLearningDesc` | Helpful tools for reading and comprehension. |

### TypeScript type

```tsx
import type { AccessibilityTranslations } from "@multicloud-io/react-a11y-toolbar";

const heTranslations: Partial<AccessibilityTranslations> = {
  title: "תפריט נגישות",
  openMenu: "פתח תפריט נגישות",
  resetAll: "איפוס הכל",
};
```

---

## RTL Support

Pass any RTL locale to flip the toolbar panel and adjust layout direction. The toolbar detects RTL when `locale === "he"` by default.

```tsx
<AccessibilityToolbar
  locale="he"
  translations={heTranslations}
/>
```

To add additional RTL locales, extend the `langMap` prop and ensure your locale string matches RTL detection logic in your app.

### Custom language map for speech synthesis

The `langMap` prop maps locale codes to BCP 47 language tags used by the Web Speech API:

```tsx
<AccessibilityToolbar
  locale="fr"
  langMap={{ en: "en-US", fr: "fr-FR", he: "he-IL", ar: "ar-SA" }}
  translations={frTranslations}
/>
```

---

## CSS Theming

Import the stylesheet in your app entry point:

```ts
import "@multicloud-io/react-a11y-toolbar/style.css";
```

Override any color with CSS custom properties:

```css
:root {
  --a11y-highlight-bg: #fff3cd;
  --a11y-highlight-color: #000;
  --a11y-link-color: #0066cc;
  --a11y-link-hover-color: #004499;
  --a11y-screen-reader-color: #0050aa;
  --a11y-reading-guide-bg: rgba(0,0,0,0.5);
  --a11y-reading-guide-border: rgba(255,255,255,0.5);
  --a11y-scrollbar-color: #5a4a18;
  --a11y-screen-reader-alt-bg: #fffff0;
  --a11y-screen-reader-alt-color: #222;
  --a11y-screen-reader-alt-border: #999;
  --a11y-screen-reader-landmark-bg: #e0ecff;
}
```

---

## Programmatic Access

Use the `useAccessibility` hook to read or control state from anywhere inside `AccessibilityProvider`:

```tsx
import { useAccessibility } from "@multicloud-io/react-a11y-toolbar";

function MyComponent() {
  const { settings, fontSize, toggleFeature, resetAll } = useAccessibility();

  return (
    <div>
      <p>High contrast: {settings.highContrast ? "on" : "off"}</p>
      <button onClick={() => toggleFeature("highContrast")}>Toggle</button>
      <button onClick={resetAll}>Reset</button>
    </div>
  );
}
```

---

## API Reference

### `<AccessibilityProvider>`
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `config` | `AccessibilityConfig` | — | Optional configuration object |
| `children` | `ReactNode` | — | Required |

### `AccessibilityConfig`
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `storageKey` | `string` | `"a11y-toolbar"` | localStorage key |
| `defaultFontSize` | `number` | `1` | Base font size multiplier |
| `maxFontSize` | `number` | `1.5` | Maximum font size multiplier |

### `<AccessibilityToolbar>`
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `locale` | `string` | `"en"` | Current locale code |
| `translations` | `Partial<AccessibilityTranslations>` | — | Override any translation string |
| `langMap` | `Record<string, string>` | `{ en: "en-US", he: "he-IL" }` | Locale to BCP 47 map for speech synthesis |

### `getA11yHydrationScript(storageKey?, defaultFontSize?)`

Returns an inline script string that restores accessibility settings from localStorage before React hydrates, preventing FOUC.

| Param | Type | Default |
|-------|------|---------|
| `storageKey` | `string` | `"a11y-toolbar"` |
| `defaultFontSize` | `number` | `1` |

### `useAccessibility()`

Returns the accessibility context value. Must be used inside `<AccessibilityProvider>`.

| Field | Type | Description |
|-------|------|-------------|
| `settings` | `Record<FeatureId, boolean>` | Current feature states |
| `fontSize` | `number` | Current font size multiplier |
| `activeProfile` | `ProfileId \| null` | Currently active profile |
| `mounted` | `boolean` | True after hydration |
| `toggleFeature` | `(id: FeatureId) => void` | Toggle a feature on/off |
| `setFontSize` | `(size: number) => void` | Set font size |
| `applyProfile` | `(id: ProfileId) => void` | Apply a profile (toggle to deactivate) |
| `resetAll` | `() => void` | Reset all settings |

---

## License

`@multicloud-io/react-a11y-toolbar` is **dual-licensed**:

### Open-source license: AGPL-3.0

For open-source projects, personal use, internal tooling, non-commercial use, academic use, and any project willing to comply with the [GNU Affero General Public License, version 3](LICENSE), you may use this library free of charge under the AGPL-3.0. In short, AGPL-3.0 requires that if you distribute this library — or operate a modified version as a network service — you make the complete corresponding source code of your combined work available under AGPL-3.0.

If you're not sure whether AGPL-3.0 works for your project, a good starting rule of thumb: **if you don't want the code you ship on top of this library to be released under AGPL-3.0, you need a commercial license.** You should, of course, confirm with your own legal counsel.

### Commercial license

For organizations that cannot or do not want to comply with AGPL-3.0 — typically closed-source commercial products, SaaS offerings that don't wish to open-source their application, and most proprietary use — a separate commercial license is available. See [`COMMERCIAL-LICENSE.md`](COMMERCIAL-LICENSE.md) for terms and contact information.

---

### Important: This is a tool, not a compliance product

`@multicloud-io/react-a11y-toolbar` helps developers build more accessible interfaces. It does **not** guarantee that your application complies with the ADA, the European Accessibility Act (EAA), WCAG, Section 508, the Israeli Equal Rights for Persons with Disabilities Law, or any other accessibility law, regulation, or standard. Compliance depends on how the library is used, the rest of your application, real-world testing with assistive technologies, and jurisdiction-specific interpretation. Please read [`NOTICE.md`](NOTICE.md) in full before relying on this library for any regulated use case, and consult qualified legal and accessibility professionals for your specific situation.

---

### Why AGPL-3.0 and not MIT?

Maintaining a high-quality accessibility library is real work, and we think companies shipping commercial products with it should share some of that cost. AGPL-3.0 keeps the library fully free and open for developers, hobbyists, non-commercial projects, and organizations happy to comply with AGPL. Commercial users who can't comply — which is most companies shipping proprietary software — can purchase a commercial license. That revenue funds ongoing development, testing with assistive technologies, and keeping up with evolving accessibility standards.

### Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Contributions are welcome and require signing a Contributor License Agreement (CLA) — this supports the dual-licensing model above.
