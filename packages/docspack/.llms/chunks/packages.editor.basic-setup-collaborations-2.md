# @bpmnkit/editor — Basic Setup — Collaborations (2)

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

Not offered: lanes on a partner pool, child lanes from the bar, lanes on a vertical pool, and
dragging a lane. Lanes are resized by their edges instead.

---
Source: https://bpmnkit.com/docs/packages/editor
