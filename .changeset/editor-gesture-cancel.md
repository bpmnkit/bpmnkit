---
"@bpmnkit/editor": patch
---

Escape and a pointercancel take back every gesture's preview the same way: Escape no longer leaves the rubber band, the connection ghost or a dragged segment on screen, and neither leaves the resize outline behind. New callback `cancelResize` on the state machine's `Callbacks`.
