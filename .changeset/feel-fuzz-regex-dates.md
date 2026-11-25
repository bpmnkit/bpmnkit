---
"@bpmnkit/feel": patch
---

`extract` with an empty match no longer splits a surrogate pair; a `]` right after `[` or `[^` is a literal (so `[]` is an invalid pattern, as in Java); a scaled years-months duration past i64 months is null; dates and date-times before year 1 no longer come out 400 years early.
