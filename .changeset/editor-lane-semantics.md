---
"@bpmnkit/editor": minor
---

Lane refs follow the drawing on move, create, paste and quick add; drops into a partner pool or outside the own pool are refused and quick add or the space tool grows the pool (`move` op gains `grow`). Lanes and black-box pools can be deleted, with their message flows, associations and empty process; the own pool and pools with content cannot. Connecting across pools adds a message flow; message edges re-dock on move and resize, and message flows can be renamed. Locked nodes are no longer offered Connect, quick add or Annotation.
