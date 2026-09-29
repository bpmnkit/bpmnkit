---
"@bpmnkit/core": patch
---

`parseProcessText` recovers the grammar drift seen in real model answers instead of discarding it:

- A node whose kind is missing, such as `start[Order placed]`, keeps its full name and is typed from its id: `start…` becomes a start event, and `end…`, `done…` or `finish…` becomes an end event.
- A name written where the trigger goes, such as `start:order received`, is read as part of the name.
- The synonyms `event`, `parallel`, `exclusive`, `gateway`, `inclusive`, `decision`, `dmn` and `human` are accepted as kinds.

`PROCESS_TEXT_GUIDE` now spells out `rule (DMN decision)` and `catch (wait for message or timer)`.
