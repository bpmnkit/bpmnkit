---
"@bpmnkit/core": minor
---

New `parseProcessText(text)`, `createProcessTextStream()` and `PROCESS_TEXT_GUIDE` add a line format for a language model to write a new process in, for example `a[start Placed] > b[user Check order] > c[end Done]`. It costs about a quarter of the output tokens of minified compact JSON, and it can be drawn while it streams.

The parser never throws, and its result always expands. It generates flow ids, joins branches that meet at a task, marks the lone unconditioned branch of a split as the default, and adds missing start and end events. It reports every line it could not use.
