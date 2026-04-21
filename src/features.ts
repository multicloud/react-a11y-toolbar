export type FeatureId =
  | "readableFont"
  | "highlightTitles"
  | "highlightLinks"
  | "darkContrast"
  | "lightContrast"
  | "highContrast"
  | "highSaturation"
  | "lowSaturation"
  | "monochrome"
  | "readingGuide"
  | "stopAnimations"
  | "bigCursor"
  | "hideImages"
  | "letterSpacing"
  | "lineHeight"
  | "fontWeight"
  | "screenReader";

export type FeatureGroup = "content" | "color" | "navigation" | "spacing";

export type ProfileId =
  | "seizureSafe"
  | "visuallyImpaired"
  | "adhdFriendly"
  | "cognitiveLearning";

export interface FeatureDef {
  id: FeatureId;
  icon: string;
  labelKey: string;
  group: FeatureGroup;
  exclusiveGroup?: "contrast" | "saturation";
}

export const features: FeatureDef[] = [
  // Content adjustments
  { id: "readableFont", icon: "spellcheck", labelKey: "readableFont", group: "content" },
  { id: "highlightTitles", icon: "highlight", labelKey: "highlightTitles", group: "content" },
  { id: "highlightLinks", icon: "link", labelKey: "highlightLinks", group: "content" },
  // Color adjustments
  { id: "darkContrast", icon: "dark_mode", labelKey: "darkContrast", group: "color", exclusiveGroup: "contrast" },
  { id: "lightContrast", icon: "light_mode", labelKey: "lightContrast", group: "color", exclusiveGroup: "contrast" },
  { id: "highContrast", icon: "contrast", labelKey: "highContrast", group: "color", exclusiveGroup: "contrast" },
  { id: "highSaturation", icon: "palette", labelKey: "highSaturation", group: "color", exclusiveGroup: "saturation" },
  { id: "lowSaturation", icon: "invert_colors", labelKey: "lowSaturation", group: "color", exclusiveGroup: "saturation" },
  { id: "monochrome", icon: "filter_b_and_w", labelKey: "monochrome", group: "color" },
  // Navigation aids
  { id: "readingGuide", icon: "horizontal_rule", labelKey: "readingGuide", group: "navigation" },
  { id: "stopAnimations", icon: "motion_photos_off", labelKey: "stopAnimations", group: "navigation" },
  { id: "bigCursor", icon: "mouse", labelKey: "bigCursor", group: "navigation" },
  { id: "hideImages", icon: "hide_image", labelKey: "hideImages", group: "navigation" },
  // Text spacing
  { id: "letterSpacing", icon: "format_letter_spacing", labelKey: "letterSpacing", group: "spacing" },
  { id: "lineHeight", icon: "format_line_spacing", labelKey: "lineHeight", group: "spacing" },
  { id: "fontWeight", icon: "format_bold", labelKey: "fontWeight", group: "spacing" },
  // Assistive tools
  { id: "screenReader", icon: "record_voice_over", labelKey: "screenReader", group: "navigation" },
];

export interface ProfileDef {
  id: ProfileId;
  icon: string;
  labelKey: string;
  descKey: string;
  features: FeatureId[];
}

export const profiles: ProfileDef[] = [
  {
    id: "seizureSafe",
    icon: "flashlight_on",
    labelKey: "seizureSafe",
    descKey: "seizureSafeDesc",
    features: ["stopAnimations", "lowSaturation"],
  },
  {
    id: "visuallyImpaired",
    icon: "visibility",
    labelKey: "visuallyImpaired",
    descKey: "visuallyImpairedDesc",
    features: ["highContrast", "highlightLinks"],
  },
  {
    id: "adhdFriendly",
    icon: "psychology",
    labelKey: "adhdFriendly",
    descKey: "adhdFriendlyDesc",
    features: ["stopAnimations", "readingGuide"],
  },
  {
    id: "cognitiveLearning",
    icon: "menu_book",
    labelKey: "cognitiveLearning",
    descKey: "cognitiveLearningDesc",
    features: ["readableFont", "letterSpacing", "lineHeight", "highlightLinks"],
  },
];

export const featureGroups: { id: FeatureGroup; labelKey: string }[] = [
  { id: "content", labelKey: "contentAdjustments" },
  { id: "color", labelKey: "colorAdjustments" },
  { id: "navigation", labelKey: "navigationAids" },
  { id: "spacing", labelKey: "textSpacing" },
];
