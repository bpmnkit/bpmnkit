---
"@bpmnkit/docspack": minor
---

Search: a chunk's tags now count as a field of their own, scored after the prose instead of saturated into it, so the page a tag names (`incidents`) ranks above pages that only mention its words. Filler words of a question (`should`, `need`, `happen`, `my`) no longer count towards a match. On the Camunda pack, 17 of 18 eval questions now find their answer in the returned chunks, up from 15.
