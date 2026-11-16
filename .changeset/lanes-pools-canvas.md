---
"@bpmnkit/canvas": minor
---

Message flows show their name and have a wide hit path. A named message flow without label bounds gets a label beside its longest segment, as tall as the name wraps (`edgeLabelBounds`). An edge end that already lies on a rectangle's border is drawn where the diagram interchange puts it, so an orthogonal message flow into a wide pool is no longer drawn diagonally.
