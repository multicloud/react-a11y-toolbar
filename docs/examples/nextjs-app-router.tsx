"use client";

// Example: Next.js App Router integration
// File: app/layout.tsx

import { AccessibilityProvider, AccessibilityToolbar, getA11yHydrationScript } from "@multicloud-io/react-a11y-toolbar";
import "@multicloud-io/react-a11y-toolbar/style.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Restore accessibility settings before React hydrates to prevent FOUC */}
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
