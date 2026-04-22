import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useAccessibility, useAccessibilityConfig } from "./AccessibilityContext";
import { features, profiles, featureGroups } from "./features";
import type { FeatureGroup } from "./features";
import { defaultTranslations } from "./defaultTranslations";
import type { AccessibilityTranslations } from "./defaultTranslations";

interface AccessibilityToolbarProps {
  locale?: string;
  translations?: Partial<AccessibilityTranslations>;
  langMap?: Record<string, string>;
}

const DEFAULT_LANG_MAP: Record<string, string> = { en: "en-US", he: "he-IL" };
const FONT_SIZE_STEP = 0.1;
const READING_GUIDE_OFFSET = 30;
const HOVER_DEBOUNCE_MS = 400;
const KEEP_ALIVE_INTERVAL_MS = 5000;
const READABLE_SELECTORS = "a, button, input, select, textarea, h1, h2, h3, h4, h5, h6, p, li, label, img";

export function AccessibilityToolbar({ locale = "en", translations, langMap }: AccessibilityToolbarProps) {
  const t = { ...defaultTranslations, ...translations };
  const config = useAccessibilityConfig();
  const { settings, fontSize, activeProfile, mounted, toggleFeature, setFontSize, applyProfile, resetAll } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    if (!settings.readingGuide) return;
    const handler = (e: MouseEvent) => setMouseY(e.clientY - READING_GUIDE_OFFSET);
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [settings.readingGuide]);

  useEffect(() => {
    if (!settings.screenReader) {
      window.speechSynthesis?.cancel();
      return;
    }

    const synth = window.speechSynthesis;
    const resolvedLangMap = langMap ?? DEFAULT_LANG_MAP;
    const lang = resolvedLangMap[locale] ?? locale;
    let lastEl: Element | null = null;
    let hoverTimer: ReturnType<typeof setTimeout> | null = null;
    let pendingText = "";

    function getLabel(el: Element): string {
      return (
        el.getAttribute("aria-label") ||
        (el.tagName === "IMG" ? el.getAttribute("alt") : null) ||
        el.getAttribute("title") ||
        (el as HTMLElement).innerText?.trim().slice(0, 200) ||
        ""
      );
    }

    function speakNow(text: string) {
      if (!text) return;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1;
      synth.speak(utterance);
    }

    function onFocus(e: FocusEvent) {
      const el = e.target instanceof Element ? e.target : null;
      if (!el || el === lastEl) return;
      lastEl = el;
      if (hoverTimer) clearTimeout(hoverTimer);
      speakNow(getLabel(el));
    }

    function onMouseOver(e: MouseEvent) {
      const el = e.target instanceof Element ? e.target.closest(READABLE_SELECTORS) : null;
      if (!el || el === lastEl) return;
      lastEl = el;
      pendingText = getLabel(el);
      if (hoverTimer) clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => {
        if (!synth.speaking) speakNow(pendingText);
        else {
          const u = new SpeechSynthesisUtterance(pendingText);
          u.lang = lang;
          u.rate = 1;
          synth.speak(u);
        }
      }, HOVER_DEBOUNCE_MS);
    }

    // Chrome bug: speechSynthesis pauses itself after ~15s
    const keepAlive = setInterval(() => {
      if (synth.paused) synth.resume();
    }, KEEP_ALIVE_INTERVAL_MS);

    document.addEventListener("focusin", onFocus);
    document.addEventListener("mouseover", onMouseOver);
    return () => {
      if (hoverTimer) clearTimeout(hoverTimer);
      clearInterval(keepAlive);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("mouseover", onMouseOver);
      synth.cancel();
    };
  }, [settings.screenReader, locale, langMap]);

  const groupedFeatures = useMemo(() => {
    const groups: Record<FeatureGroup, typeof features> = { content: [], color: [], navigation: [], spacing: [] };
    features.forEach((f) => groups[f.group].push(f));
    return groups;
  }, []);

  const isRtl = locale === "he";
  const dir = isRtl ? "rtl" : "ltr";

  if (!mounted) return null;

  return (
    <>
      {settings.readingGuide && (
        <div
          className="a11y-reading-guide"
          style={{ top: `${mouseY}px` }}
          aria-hidden="true"
        />
      )}

      <button
        onClick={() => setIsOpen(true)}
        aria-label={t.openMenu}
        className={`a11y-trigger-btn a11y-trigger-btn--${dir}`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "1.5rem" }} aria-hidden="true">
          settings_accessibility
        </span>
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        style={{ position: "relative", zIndex: 9999 }}
      >
        <DialogBackdrop
          className="a11y-dialog-backdrop"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)" }}
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />

        <div className={`a11y-dialog-positioner a11y-dialog-positioner--${dir}`}>
          <DialogPanel
            className="a11y-dialog-panel"
            dir={dir}
          >
            <div className="a11y-panel-header">
              <DialogTitle as="h2" className="a11y-panel-title">
                {t.title}
              </DialogTitle>
              <button
                onClick={() => setIsOpen(false)}
                aria-label={t.closeMenu}
                className="a11y-panel-close-btn"
              >
                <span className="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            </div>

            <div className="a11y-panel-body a11y-panel">
              <section className="a11y-section">
                <h3 className="a11y-section-heading">{t.profiles}</h3>
                <div className="a11y-profiles-grid">
                  {profiles.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => applyProfile(profile.id)}
                      className={`a11y-profile-btn${activeProfile === profile.id ? " a11y-profile-btn--active" : ""}`}
                    >
                      <span className="material-symbols-outlined a11y-profile-icon" aria-hidden="true">
                        {profile.icon}
                      </span>
                      <span className="a11y-profile-label">
                        {t[profile.labelKey as keyof typeof t]}
                      </span>
                      <span className="a11y-profile-desc">
                        {t[profile.descKey as keyof typeof t]}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {featureGroups.map((group) => (
                <section key={group.id} className="a11y-section">
                  <h3 className="a11y-section-heading">
                    {t[group.labelKey as keyof typeof t]}
                  </h3>
                  <div className="a11y-feature-list">
                    {groupedFeatures[group.id].map((feature) => (
                      <button
                        key={feature.id}
                        onClick={() => toggleFeature(feature.id)}
                        role="switch"
                        aria-checked={settings[feature.id]}
                        className={`a11y-feature-btn${settings[feature.id] ? " a11y-feature-btn--active" : ""}`}
                      >
                        <span className="material-symbols-outlined a11y-feature-icon" aria-hidden="true">
                          {feature.icon}
                        </span>
                        <span className="a11y-feature-label">
                          {t[feature.labelKey as keyof typeof t]}
                        </span>
                        {settings[feature.id] && (
                          <span className="material-symbols-outlined a11y-feature-check" aria-hidden="true">
                            check
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </section>
              ))}

              <section className="a11y-section">
                <h3 className="a11y-section-heading">{t.fontSizeLabel}</h3>
                <div className="a11y-font-controls">
                  <button
                    onClick={() => setFontSize(fontSize - FONT_SIZE_STEP)}
                    disabled={fontSize <= config.defaultFontSize}
                    aria-label={t.decreaseFontSize}
                    className="a11y-font-btn"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "1.125rem" }} aria-hidden="true">text_decrease</span>
                  </button>
                  <span className="a11y-font-size-display">
                    {Math.round(fontSize * 100)}%
                  </span>
                  <button
                    onClick={() => setFontSize(fontSize + FONT_SIZE_STEP)}
                    disabled={fontSize >= config.maxFontSize}
                    aria-label={t.increaseFontSize}
                    className="a11y-font-btn"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "1.125rem" }} aria-hidden="true">text_increase</span>
                  </button>
                </div>
              </section>
            </div>

            <div className="a11y-panel-footer">
              <button
                onClick={resetAll}
                className="a11y-reset-btn"
              >
                {t.resetAll}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
