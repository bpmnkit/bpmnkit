---
"@bpmnkit/editor": minor
---

Pools, lanes and black boxes can be resized (lanes balance with their neighbour and keep their nodes), the own pool is dragged with its lanes and content, and the space tool emits a new `space` op that grows the pools and lanes it crosses. Copy and Duplicate of only swimlanes keep the clipboard; `color` and `labelPosition` refuse other processes' nodes.
