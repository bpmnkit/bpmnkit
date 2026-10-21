# On-device generation in Chrome — Embed it

```typescript
import { createAiLocalPlugin } from "@bpmnkit/plugins/ai-local";

const aiLocal = createAiLocalPlugin({
  // First streamed frame: open a new tab.
  openDiagram: (xml, name) => openTab({ type: "bpmn", xml, name }),
  // Later frames and the final result: redraw that tab.
  updateDiagram: (defs) => editor.loadDefinitions(defs),
  container: dock.generatePane, // optional; defaults to document.body
  onOpen: () => dock.switchTab("generate"), // optional; runs when the button is clicked
});

// `ready` is true when the model is available or can be downloaded.
if (await aiLocal.ready) {
  dock.setGenerateTabVisible(true);
  hud.append(aiLocal.button);
}

// Call stop() when the user switches tabs mid-run.
aiLocal.stop();
```

`ready` resolves `true` for the `available`, `downloadable` and `downloading` states, and `false`
otherwise. To serve the feature on your own site, register the origin for the Prompt API origin trial
and add the token in an `origin-trial` meta tag.

---
Source: https://bpmnkit.com/docs/guides/ai-on-device
