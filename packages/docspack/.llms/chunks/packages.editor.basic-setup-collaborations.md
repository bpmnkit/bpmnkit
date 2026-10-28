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

#### Pools and lanes: how to

This version edits **one process with lanes**, its **own pool**, next to **black-box partner
pools**. A partner has no process content: no nodes and no lanes. Editing several pools with
content is not supported yet.

1. **Create the own pool.** On a diagram without pools, pick the pool tool and click the
   canvas: the process is wrapped in its pool.
2. **Select a pool or a lane by its header strip** (the band with its name, on the left of a
   horizontal pool). Clicking its body selects nothing: the body is canvas, for lasso and pan.
   The context bar appears next to the selection.
3. **Add lanes.** On the own pool without lanes, the bar offers *Divide into two lanes* and
   *Divide into three lanes*, and *Add lane above* / *Add lane below* (the first add makes two
   lanes). On a lane of the own pool, *Add lane above* / *Add lane below* add one next to it.
4. **Put nodes in a lane** by drawing, moving or pasting them inside its band.
5. **Add a partner.** With a pool already drawn, the pool tool adds a black-box partner. Its
   bar starts with an info mark whose tooltip says it holds no lanes or nodes, then has
   *Connect* (to draw a message flow to one of your nodes), *Edit label* and *Delete*, and no
   lane actions. Message flows can also start from a node of yours: connect it to the
   partner pool.

---
Source: https://bpmnkit.com/docs/packages/editor
