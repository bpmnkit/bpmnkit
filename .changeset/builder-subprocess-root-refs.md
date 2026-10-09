---
"@bpmnkit/core": patch
---

Builder: error, message, signal and escalation options on events inside sub-process content (sub-processes, transactions, ad-hoc and event sub-processes, and branches inside them, at any depth) now create root definitions and reference them by id instead of emitting dangling `*Ref` attributes.
