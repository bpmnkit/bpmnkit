---
"@bpmnkit/core": patch
"@bpmnkit/editor": patch
---

Process text fixes: `writeProcessText` writes a timer's `after=<ISO duration>` (it was dropped, so a written timer read back without its wait), and a change script reads `after=` and applies it to a new or restated timer; `feel=` on a conditional event is its condition (it was ignored with a problem); kind words are own keys, so `constructor`, `__proto__` or `toString` no longer read as a kind; `createProcessTextStream` no longer drops a boundary drawn from its host (`t > w[boundary:timer …]`) and its path from later frames and `end()`. `expand` maps a job worker's `response` to a `resultVariable` named like an `Object.prototype` member (`constructor`, `toString`).
