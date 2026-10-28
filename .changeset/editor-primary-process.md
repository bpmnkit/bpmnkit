---
"@bpmnkit/editor": minor
---

Edits land in the primary process (the executable one) and the diagram that draws it, wherever the file lists them, and the canvas shows that process. Pools, lanes and collaboration annotations can be renamed in place; their body is canvas rather than a draggable shape. An op that changes nothing adds no undo step. A document with flow nodes but no diagram interchange is laid out on load and fires one `diagram:change`; `diagram:load` carries its DI warnings.
