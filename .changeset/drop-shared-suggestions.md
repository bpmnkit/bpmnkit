---
"@bpmnkit/drop": minor
---

AI proposals can be shared on their threads as suggested changes (migration `0010_comment_suggestions`, `POST/PATCH /drop/api/suggestions/…`, listed with the comments). A suggestion stores its change script, never a description: every reviewer's preview is worked out again against their own document, without asking the AI. Whoever holds the baton can apply it, which replies on its threads and records it applied. Its author can withdraw it.
