import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { FeatureId, ProfileId } from "./features";
import { features, profiles } from "./features";

type FeatureState = Record<FeatureId, boolean>;

interface AccessibilityContextValue {
  settings: FeatureState;
  fontSize: number;
  activeProfile: ProfileId | null;
  mounted: boolean;
  toggleFeature: (id: FeatureId) => void;
  setFontSize: (size: number) => void;
  applyProfile: (id: ProfileId) => void;
  resetAll: () => void;
}

export interface AccessibilityConfig {
  storageKey?: string;
  defaultFontSize?: number;
  maxFontSize?: number;
}

interface AccessibilityProviderProps {
  children: React.ReactNode;
  config?: AccessibilityConfig;
}

const DEFAULT_SETTINGS: FeatureState = Object.fromEntries(features.map((f) => [f.id, false])) as FeatureState;

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);
const AccessibilityConfigContext = createContext<Required<AccessibilityConfig>>({
  storageKey: "a11y-toolbar",
  defaultFontSize: 1,
  maxFontSize: 1.5,
});

function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, "-$1").toLowerCase();
}

function applyToDOM(settings: FeatureState, fontSize: number, defaultFontSize: number) {
  const html = document.documentElement;

  features.forEach((f) => {
    const attr = `data-a11y-${camelToKebab(f.id)}`;
    if (settings[f.id]) {
      html.setAttribute(attr, "");
    } else {
      html.removeAttribute(attr);
    }
  });

  const sizeAttr = "data-a11y-fontsize";
  if (fontSize !== defaultFontSize) {
    html.setAttribute(sizeAttr, String(fontSize));
  } else {
    html.removeAttribute(sizeAttr);
  }

  document.documentElement.style.fontSize = fontSize !== defaultFontSize ? `${fontSize * 100}%` : "";
}

function readStored(
  storageKey: string,
  defaultSettings: FeatureState,
  defaultFontSize: number
): { settings: FeatureState; fontSize: number; activeProfile: ProfileId | null } {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        settings: { ...defaultSettings, ...(parsed.settings || {}) },
        fontSize: parsed.fontSize || defaultFontSize,
        activeProfile: parsed.activeProfile || null,
      };
    }
  } catch {
    // ignore
  }
  return { settings: { ...defaultSettings }, fontSize: defaultFontSize, activeProfile: null };
}

function writeStored(storageKey: string, settings: FeatureState, fontSize: number, activeProfile: ProfileId | null) {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ settings, fontSize, activeProfile }));
  } catch {
    // ignore
  }
}

export function AccessibilityProvider({ children, config }: AccessibilityProviderProps) {
  const resolvedConfig = useMemo(() => ({
    storageKey: config?.storageKey ?? "a11y-toolbar",
    defaultFontSize: config?.defaultFontSize ?? 1,
    maxFontSize: config?.maxFontSize ?? 1.5,
  }), [config?.storageKey, config?.defaultFontSize, config?.maxFontSize]);

  const { storageKey, defaultFontSize, maxFontSize } = resolvedConfig;

  const [settings, setSettings] = useState<FeatureState>({ ...DEFAULT_SETTINGS });
  const [fontSize, setFontSizeState] = useState(defaultFontSize);
  const [activeProfile, setActiveProfile] = useState<ProfileId | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = readStored(storageKey, DEFAULT_SETTINGS, defaultFontSize);
    setSettings(stored.settings);
    setFontSizeState(stored.fontSize);
    setActiveProfile(stored.activeProfile);
    applyToDOM(stored.settings, stored.fontSize, defaultFontSize);
    setMounted(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyToDOM(settings, fontSize, defaultFontSize);
    writeStored(storageKey, settings, fontSize, activeProfile);
  }, [settings, fontSize, activeProfile, mounted, storageKey, defaultFontSize]);

  const toggleFeature = useCallback((id: FeatureId) => {
    setSettings((prev) => {
      const next = { ...prev, [id]: !prev[id] };

      // Handle exclusive groups (contrast, saturation) — only one at a time
      const feature = features.find((f) => f.id === id);
      if (feature?.exclusiveGroup && next[id]) {
        features.forEach((f) => {
          if (f.exclusiveGroup === feature.exclusiveGroup && f.id !== id) {
            next[f.id] = false;
          }
        });
      }

      return next;
    });
    setActiveProfile(null);
  }, []);

  const handleSetFontSize = useCallback((size: number) => {
    setFontSizeState(Math.max(defaultFontSize, Math.min(size, maxFontSize)));
  }, [defaultFontSize, maxFontSize]);

  const applyProfile = useCallback((id: ProfileId) => {
    setActiveProfile((prev) => {
      if (prev === id) {
        setSettings({ ...DEFAULT_SETTINGS });
        return null;
      }
      const profile = profiles.find((p) => p.id === id);
      if (!profile) return prev;
      const next = { ...DEFAULT_SETTINGS };
      profile.features.forEach((fid) => { next[fid] = true; });
      setSettings(next);
      return id;
    });
  }, []);

  const resetAll = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS });
    setFontSizeState(defaultFontSize);
    setActiveProfile(null);
  }, [defaultFontSize]);

  return (
    <AccessibilityConfigContext.Provider value={resolvedConfig}>
      <AccessibilityContext.Provider
        value={{
          settings,
          fontSize,
          activeProfile,
          mounted,
          toggleFeature,
          setFontSize: handleSetFontSize,
          applyProfile,
          resetAll,
        }}
      >
        {children}
      </AccessibilityContext.Provider>
    </AccessibilityConfigContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}

export function useAccessibilityConfig() {
  return useContext(AccessibilityConfigContext);
}
