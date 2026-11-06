---
"@bpmnkit/core": minor
---

Auto-layout of new diagrams reads more hand-drawn: ~60 px column gaps (wider only where a flow or event label needs room, 100 px beside expanded containers), 60 px row gaps, branch rows that clear only the shapes they sit under, sub-processes aligned on their inner spine, gateway and event labels moved off the flows leaving them, branch conditions placed at the gateway exit, and routes that avoid running along unrelated flows. A participant-less primary process in a collaboration is now stacked below the pools instead of on top of them. `exportSvg` no longer wraps labels that fit their box and no longer draws the collapsed "+" marker on expanded sub-processes. Layouts that keep existing DI are unchanged.
