---
"@bpmnkit/core": patch
"@bpmnkit/drop": patch
---

`parseProcessText` keeps the structural rules `lintDiagram` checks, whatever the model wrote.

- Every node is on a path from a start event. A task or gateway nothing leads to continues the latest path that stops short of an end event. What is still unreached is left out and reported, and is never drawn as a loose node.
- A gateway with one way in and one way out is removed.
- A task or event with several ways out gets an xor split when its branches are labelled, and a parallel split when they are not.
- Joins match the split they close. A gateway that both joins and splits gets its own join.
- Every decision has one default, and every other branch has a FEEL condition. A branch written in prose gets a condition on a variable named for the gateway's question.
- Unnamed elements are named.
- Only the first blank start event is kept. An event-based gateway with one way out becomes a catch event. A flow from a node to itself is refused, and a loop with no way out gets an exit.
- A branch drawn into a boundary event continues to the path that boundary leads to.
- A loop with no decision loses the flows that close it, so every path ends. A link event in a path becomes a plain event.
- Unlabelled flows from one node that all wait, at least one on a catch event, become a race behind an event-based gateway.

`PROCESS_TEXT_GUIDE` teaches these rules. `pattern/gateway-single-outgoing` no longer flags join gateways.
