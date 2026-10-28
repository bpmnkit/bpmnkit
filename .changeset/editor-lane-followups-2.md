---
"@bpmnkit/editor": patch
---

A partner pool that draws a process offers Connect on its context bar and menu, as a black box does, so a message flow can start at the pool; its nodes stay locked. A connection dropped on the body of a partner pool with lanes now ends at the pool instead of being refused. The space tool works on a diagram with a vertical pool: only a line that crosses the vertical pool is refused; one it passes moves the pool whole or leaves it. Adding a lane no longer leaves a flow kinked when a node straddles the new band's line: the flow moves whole or is routed again, so its segments stay horizontal and vertical. The same holds for the space tool and for a pool growing or resized down, and a flow routed again goes round the pools and lanes as they are after the edit, not as they were.
