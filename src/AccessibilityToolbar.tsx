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
      // Only debounce; don't cancel ongoing speech — let it finish naturally
      if (hoverTimer) clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => {
        if (!synth.speaking) speakNow(pendingText);
        else {
          // Queue after current utterance ends
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
        className={`fixed bottom-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200 hover:scale-105 ${
          isRtl ? "left-6" : "right-6"
        } bg-blue-600 text-white hover:bg-blue-700`}
      >
        <span className="material-symbols-outlined text-2xl" aria-hidden="true">
          settings_accessibility
        </span>
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-[9999]"
      >
        <DialogBackdrop
          className="fixed inset-0 bg-black/30"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />

        <div className={`fixed inset-y-0 ${isRtl ? "left-0" : "right-0"} flex`}>
          <DialogPanel
            className={`w-full max-w-sm bg-surface-container-lowest shadow-2xl flex flex-col ${
              isRtl ? "rtl" : ""
            }`}
            dir={isRtl ? "rtl" : "ltr"}
          >
            <div className="flex items-center justify-between p-4 border-b border-outline-variant">
              <DialogTitle className="text-lg font-headline font-bold text-primary-container">
                {t.title}
              </DialogTitle>
              <button
                onClick={() => setIsOpen(false)}
                aria-label={t.closeMenu}
                className="p-2 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant"
              >
                <span className="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto a11y-panel p-4 space-y-6">
              <section>
                <h3 className="text-xs font-label font-bold uppercase tracking-widest text-on-tertiary-container mb-3">
                  {t.profiles}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {profiles.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => applyProfile(profile.id)}
                      className={`p-3 rounded-lg border transition-all ${
                        activeProfile === profile.id
                          ? "border-tertiary-fixed-dim bg-tertiary-fixed/20"
                          : "border-outline-variant hover:border-tertiary-fixed-dim hover:bg-surface-container"
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl mb-1 block text-on-tertiary-container" aria-hidden="true">
                        {profile.icon}
                      </span>
                      <span className="text-xs font-bold block text-on-surface leading-tight">
                        {t[profile.labelKey as keyof typeof t]}
                      </span>
                      <span className="text-[10px] text-on-surface-variant leading-snug block mt-1">
                        {t[profile.descKey as keyof typeof t]}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {featureGroups.map((group) => (
                <section key={group.id}>
                  <h3 className="text-xs font-label font-bold uppercase tracking-widest text-on-tertiary-container mb-3">
                    {t[group.labelKey as keyof typeof t]}
                  </h3>
                  <div className="space-y-2">
                    {groupedFeatures[group.id].map((feature) => (
                      <button
                        key={feature.id}
                        onClick={() => toggleFeature(feature.id)}
                        role="switch"
                        aria-checked={settings[feature.id]}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          settings[feature.id]
                            ? "border-tertiary-fixed-dim bg-tertiary-fixed/20"
                            : "border-transparent hover:bg-surface-container"
                        }`}
                      >
                        <span className="material-symbols-outlined text-xl text-on-surface-variant" aria-hidden="true">
                          {feature.icon}
                        </span>
                        <span className="text-sm text-on-surface font-medium flex-1">
                          {t[feature.labelKey as keyof typeof t]}
                        </span>
                        {settings[feature.id] && (
                          <span className="material-symbols-outlined text-lg text-tertiary-fixed-dim" aria-hidden="true">
                            check
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </section>
              ))}

              <section>
                <h3 className="text-xs font-label font-bold uppercase tracking-widest text-on-tertiary-container mb-3">
                  {t.fontSizeLabel}
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFontSize(fontSize - FONT_SIZE_STEP)}
                    disabled={fontSize <= config.defaultFontSize}
                    aria-label={t.decreaseFontSize}
                    className="flex-1 flex items-center justify-center p-3 rounded-lg border border-outline-variant hover:bg-surface-container transition-all disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-lg" aria-hidden="true">text_decrease</span>
                  </button>
                  <span className="text-sm font-label font-bold text-on-surface-variant min-w-[3rem] text-center">
                    {Math.round(fontSize * 100)}%
                  </span>
                  <button
                    onClick={() => setFontSize(fontSize + FONT_SIZE_STEP)}
                    disabled={fontSize >= config.maxFontSize}
                    aria-label={t.increaseFontSize}
                    className="flex-1 flex items-center justify-center p-3 rounded-lg border border-outline-variant hover:bg-surface-container transition-all disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-lg" aria-hidden="true">text_increase</span>
                  </button>
                </div>
              </section>
            </div>

            <div className="p-4 border-t border-outline-variant">
              <button
                onClick={resetAll}
                className="w-full py-3 rounded-lg border-2 border-on-surface-variant/30 text-on-surface-variant font-label font-bold text-sm uppercase tracking-widest hover:bg-surface-container transition-all"
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
