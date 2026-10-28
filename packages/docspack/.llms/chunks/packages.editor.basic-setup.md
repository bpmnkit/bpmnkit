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
await editor.loadXML(bpmnXml);
```

A file with flow nodes but no diagram interchange is laid out on load, which fires one
`diagram:change` with the laid-out document; `diagram:load` lists what the file as given does
not draw. A file that draws some of its nodes keeps its layout.

### Collaborations

The editor edits the primary process (`primaryProcess` from `@bpmnkit/core`: the executable
one) and the diagram that draws it, even when the file lists a partner first, as Flowable
Modeler files can. The canvas shows that process; nodes of other processes are locked. Pools
and lanes are renamed from their header strip (Edit label); their body is canvas, for lasso
and pan.

---
Source: https://bpmnkit.com/docs/packages/editor
