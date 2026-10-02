---
"@bpmnkit/docspack": minor
"@bpmnkit/camunda-docspack": patch
---

Better ranking. A line repeated in at least 5% of a pack's chunks no longer counts towards a match: API digest metadata such as `Consistency: eventual.` had made "consistency" almost unsearchable. Sections merged into one chunk now keep their headings as tags. `ask` lists the next five matches by id, and `ask <chunk-id>` returns that one chunk. `answer()` returns them as `more`.
