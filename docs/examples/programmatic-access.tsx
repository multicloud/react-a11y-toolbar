// Example: Programmatic access via useAccessibility hook
import { useAccessibility } from "@multicloud-io/react-a11y-toolbar";

export function AccessibilityStatus() {
  const { settings, fontSize, activeProfile, toggleFeature, resetAll } = useAccessibility();

  return (
    <div>
      <h2>Current Accessibility Settings</h2>
      <ul>
        {Object.entries(settings)
          .filter(([, active]) => active)
          .map(([id]) => (
            <li key={id}>{id}</li>
          ))}
      </ul>
      <p>Font size: {Math.round(fontSize * 100)}%</p>
      {activeProfile && <p>Active profile: {activeProfile}</p>}
      <button onClick={() => toggleFeature("highContrast")}>
        Toggle High Contrast
      </button>
      <button onClick={resetAll}>Reset All</button>
    </div>
  );
}
