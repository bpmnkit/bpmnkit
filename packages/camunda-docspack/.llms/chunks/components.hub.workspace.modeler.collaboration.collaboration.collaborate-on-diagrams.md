# Collaborate with your team — Collaborate on diagrams

### Model a diagram together

When other members open the same diagram as you, the updates on the diagram are sent in real time. You can also see who is in the diagram with you.

### Canvas lock

To prevent conflicts and broken sessions when multiple people open the same diagram, Camunda Hub automatically locks the canvas.

When a member with edit permissions starts editing a diagram, the canvas is automatically locked. While the lock is active, no other members can modify the diagram — this prevents conflicting edits.

Other members can still do the following:

- Open and view the diagram in real time
- Switch [modes](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/collaboration/collaborate-with-modes)
- Navigate the canvas
- Drill down into subprocesses
- Inspect properties and linked assets
- Add comments (if they have permission)

#### Take over editing

If another member with edit permissions needs to continue working, they can take control by clicking the **Take over** button in the canvas lock bar.
This releases the current lock and immediately assigns edit control to the new member.

This approach enables predictable handovers and prevents conflicting edits while keeping the diagram accessible to all viewers.

### Undo/redo management limitations

When collaborating with others on a diagram, you can only undo or redo your own actions until another member makes a change, as the undo/redo history is reset each time another member makes a change.

### Draw other's attention

Whether you are in a presentation or if others are in the same diagram as you are, use the attention grabber pointer to draw attention to a specific part of the diagram. To do this, take the following steps:

1. Switch on the attention grabber pointer from the canvas tools.
   ![attention grabber](../img/attention-grabber.png)

2. Drop the pointer by clicking anywhere on the canvas.
   ![attention grabber](../img/attention-grabber-pointer-pulse.png)

The pointer will pulsate to draw attention and will match your avatar color.
It can also be seen in real-time by others that are looking at the same diagram as you.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/collaboration/collaboration
