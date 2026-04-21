# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build        # compile with tsup → dist/
npm run dev          # watch mode
npm run check:licenses  # verify dependency licenses before publish
```

There are no tests. There is no lint script.

## Architecture

This is a zero-config React component library published as `@multicloud-io/react-a11y-toolbar`. It ships two build targets (CJS + ESM) via tsup and a copied CSS file.

**Source files** (`src/`):

- `features.ts` — single source of truth for all feature IDs, groups, exclusive groups, and profiles. Add/remove features here first; everything else derives from this.
- `AccessibilityContext.tsx` — `AccessibilityProvider` (state, localStorage persistence, DOM side-effects) and `useAccessibility` / `useAccessibilityConfig` hooks. DOM state is applied by toggling `data-a11y-<feature-id>` attributes on `<html>` and setting `font-size` inline.
- `accessibility.css` — all visual effects, keyed off those `data-a11y-*` attributes on `<html>`.
- `hydration.ts` — `getA11yHydrationScript()` returns an inline script string for SSR/Next.js to restore settings before React hydrates (prevents FOUC).
- `defaultTranslations.ts` — English string map; consumers pass `Partial<AccessibilityTranslations>` overrides.
- `AccessibilityToolbar.tsx` — UI layer only. Reads context via hooks, renders the panel using `@headlessui/react` Dialog.
- `index.ts` — public API re-exports.

**Key invariants:**
- Contrast features (`darkContrast`, `lightContrast`, `highContrast`) are mutually exclusive via `exclusiveGroup: "contrast"`. Same for saturation. `toggleFeature` enforces this.
- `mounted` flag in context gates DOM writes to avoid SSR mismatches.
- RTL is detected by checking `locale === "he"`. Extend `langMap` for additional RTL locales.
- The library has **one runtime dependency**: `@headlessui/react`. Keep it that way.

## Publishing

Dual-licensed: AGPL-3.0 for open source, commercial license available. `prepublishOnly` runs license check + build. Run `npm publish --access public` from the repo root.
