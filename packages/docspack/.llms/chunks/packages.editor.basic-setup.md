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

- A node moved, created or pasted into a lane becomes a member of it (`flowNodeRef`); one
  dropped outside every lane keeps its lane. A drop into a partner's pool or outside the own
  pool is refused; a quick-added node past the pool's right or bottom edge grows the pool.
- Deleting a lane hands its band and nodes to the lane next to it (a lane with child lanes goes
  only with all of them). Deleting a black-box partner removes its message flows and, when it
  is empty and no other pool draws it, its process. The own pool and pools with content cannot
  be deleted.
- Connecting a node to another pool, or to a node in it, draws a message flow with no
  `messageRef`; BPMN's rules for message ends apply. Message flows show their name and are
  renamed like any label. A black box's context bar has Connect too, for incoming messages.
- The pool tool wraps a process that has no pool in its first one (a collaboration is added
  and the process is left as it is); with a pool drawn, it adds a black-box partner. A lane's
  or pool's context bar adds a lane above or below it (the first add on a pool makes two),
  and divides a pool without lanes into two or three. Child lanes and vertical pools are left
  as they are.
- Pools and lanes are resized by their handles: a lane's edge moves its neighbour's, an outer
  edge moves the pool, and no band shrinks past its nodes or below 60px, so no node changes
  lane. The own pool is dragged by its header with everything in it; lanes do not drag. The
  space tool widens or deepens the pools and lanes its line crosses (the `space` op).

```typescript
editor.addLane("Lane_sales", "below");   // id of the new lane, or null when refused
editor.divideLanes("Participant_1", 3);  // one undo step
```

---
Source: https://bpmnkit.com/docs/packages/editor
