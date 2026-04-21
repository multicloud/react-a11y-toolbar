// Example: Custom translations (Hebrew)
import { AccessibilityProvider, AccessibilityToolbar, getA11yHydrationScript } from "@multicloud-io/react-a11y-toolbar";
import type { AccessibilityTranslations } from "@multicloud-io/react-a11y-toolbar";
import "@multicloud-io/react-a11y-toolbar/style.css";

const heTranslations: Partial<AccessibilityTranslations> = {
  title: "תפריט נגישות",
  openMenu: "פתח תפריט נגישות",
  closeMenu: "סגור תפריט נגישות",
  resetAll: "איפוס הכל",
  close: "סגור",
  contentAdjustments: "התאמות תוכן",
  fontSizeLabel: "גודל גופן",
  increaseFontSize: "הגדל גופן",
  decreaseFontSize: "הקטן גופן",
  readableFont: "גופן קריא",
  highlightTitles: "הדגשת כותרות",
  highlightLinks: "הדגשת קישורים",
  colorAdjustments: "התאמות צבע",
  darkContrast: "ניגודיות כהה",
  lightContrast: "ניגודיות בהירה",
  highContrast: "ניגודיות גבוהה",
  highSaturation: "רוויה גבוהה",
  lowSaturation: "רוויה נמוכה",
  monochrome: "גווני אפור",
  navigationAids: "עזרי ניווט",
  readingGuide: "מדריך קריאה",
  stopAnimations: "עצור אנימציות",
  bigCursor: "סמן גדול",
  hideImages: "הסתר תמונות",
  textSpacing: "מרווח טקסט",
  letterSpacing: "מרווח אותיות",
  lineHeight: "גובה שורה",
  fontWeight: "עובי גופן",
  screenReader: "קורא מסך",
  profiles: "פרופילי נגישות",
  seizureSafe: "בטוח לאפילפסיה",
  seizureSafeDesc: "עוצר אנימציות ומפחית רוויית צבע.",
  visuallyImpaired: "לקוי ראייה",
  visuallyImpairedDesc: "משפר ניגודיות וקריאות לראייה לקויה.",
  adhdFriendly: "ידידותי ל-ADHD",
  adhdFriendlyDesc: "מפחית הסחות דעת לריכוז טוב יותר.",
  cognitiveLearning: "קוגניטיבי ולמידה",
  cognitiveLearningDesc: "כלים מועילים לקריאה והבנה.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <script dangerouslySetInnerHTML={{ __html: getA11yHydrationScript() }} />
      </head>
      <body>
        <AccessibilityProvider>
          {children}
          <AccessibilityToolbar
            locale="he"
            translations={heTranslations}
          />
        </AccessibilityProvider>
      </body>
    </html>
  );
}
