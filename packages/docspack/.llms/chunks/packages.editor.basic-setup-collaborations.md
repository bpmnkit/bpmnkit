# @bpmnkit/editor — Basic Setup — Collaborations

The editor edits the primary process (`primaryProcess` from `@bpmnkit/core`: the executable
one) and the diagram that draws it, even when the file lists a partner first, as Flowable
Modeler files can. The canvas shows that process; nodes of other processes are locked. An
edit that would make the document point at another process (deleting every node of the own pool
next to a partner's pool with content) records the one it edited in `primaryProcessId`, saved
as `bpmnkit:primaryProcess` on `<definitions>` only in that case, so the next edit, a Drop room
replaying it and a reload all stay on the own pool. Pools
and lanes are renamed from their header strip (Edit label); their body is canvas, for lasso
and pan.

- A node moved, created or pasted into a lane becomes a member of it (`flowNodeRef`); one
  dropped outside every lane keeps its lane. A drop into a partner's pool or outside the own
  pool is refused; a quick-added node past the pool's right or bottom edge grows the pool.
  A node that crosses an edge of the own pool, or lies over its name strips, grows the pool and
  its lanes on that side (a vertical pool only right and down); growing down or right pushes
  the pools below or beside it, and those beyond them, with their content, and growth up or
  left onto another pool refuses the drop. Lane bands drawn without a pool (auto-layout of a
  laned process that has none) hold their lanes' nodes and grow the same way; data objects
  and nodes in no lane, which auto-layout draws below the bands, move freely outside them.
- Deleting a lane hands its band and nodes to the lane next to it (a lane with child lanes goes
  only with all of them). Deleting a black-box partner removes its message flows and, when it
  is empty and no other pool draws it, its process. The own pool and pools with content cannot
  be deleted.
- Connecting a node to another pool, or to a node in it, draws a message flow with no
  `messageRef`; BPMN's rules for message ends apply. Message flows show their name and are
  renamed like any label. A partner pool's context bar, a black box's or one drawing a process,
  has Connect too, for incoming messages; a connection dropped on such a pool's body docks on the
  pool. A partner's nodes stay locked: no sequence flow starts or ends at them.
- The pool tool wraps a process that has no pool in its first one (a collaboration is added
  and the process is left as it is); with a pool drawn, it adds a black-box partner. A lane's
  or pool's context bar adds a lane above or below it (the first add on a pool makes two),
  and divides a pool without lanes into two or three: its height is split into equal bands
  when each keeps 60px, else it grows by a band per new lane. Child lanes and vertical pools
  are left as they are.
- Pools and lanes are resized by their handles: a lane's edge moves its neighbour's, an outer
  edge moves the pool, and no band shrinks past its nodes or below 60px, so no node changes
  lane. A pool's top and left edge stop at the pool above or beside it; its bottom edge pushes
  the pools below it, the own pool's right edge pushes the pools beside it (a black box's
  stops at them), and a bottom edge moved up pulls what is below up by
  as much, as far as the shapes above it leave room. The own pool is dragged by its header with everything in it; lanes do not drag. The
  space tool widens or deepens the pools and lanes its line crosses (the `space` op).

---
Source: https://bpmnkit.com/docs/packages/editor
