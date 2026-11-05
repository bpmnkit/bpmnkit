# @bpmnkit/editor — Basic Setup

```typescript
import { BpmnEditor, initEditorHud } from "@bpmnkit/editor";

// Create the editor
const editor = new BpmnEditor({
  container: document.getElementById("editor"),
  theme: "dark",
  persistTheme: true,   // read/write "bpmn-theme" in localStorage
});

// Initialize the HUD (toolbar overlay)
const hud = initEditorHud(editor);

// Load a diagram
editor.load(bpmnXml);
```

A file with flow nodes but no diagram interchange is laid out on load, which fires one
`diagram:change` with the laid-out document; `diagram:load` lists what the file as given does
not draw. A file that draws some of its nodes keeps its layout.

---
Source: https://bpmnkit.com/docs/packages/editor
