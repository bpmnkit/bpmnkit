# On-device generation in Chrome — Embed it

```typescript
import { createAiLocalPlugin } from "@bpmnkit/plugins/ai-local";

const aiLocal = createAiLocalPlugin({
  // First streamed frame: open a new tab.
  openDiagram: (xml, name) => {
    generatedTabId = openTab({ type: "bpmn", xml, name });
  },
  // Later frames and the final result: redraw that tab. Guard on the active
  // tab so a frame never lands in a diagram the user switched to.
  updateDiagram: (defs) => {
    if (getActiveTabId() !== generatedTabId) return;
    editor.loadDefinitions(defs);
    hud.hideOnboarding(); // loadDefinitions does not lift the onboarding overlay
  },
  container: dock.generatePane, // optional; defaults to document.body
  onOpen: () => dock.switchTab("generate"), // optional; runs when the button is clicked
});

// `ready` is true when the model is available or can be downloaded.
if (await aiLocal.ready) {
  dock.setGenerateTabVisible(true);
}

// The button stays hidden until `ready` resolves true; the HUD places it.
const hud = initEditorHud(editor, { generateButton: aiLocal.button });

// Call stop() when the user switches tabs mid-run.
aiLocal.stop();
```

`ready` resolves `true` for the `available`, `downloadable` and `downloading` states, and `false`
otherwise. To serve the feature on your own site, register the origin for the Prompt API origin trial
and add the token in an `origin-trial` meta tag.

---
Source: https://bpmnkit.com/docs/guides/ai-on-device
