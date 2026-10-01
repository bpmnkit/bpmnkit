---
"@bpmnkit/drop": minor
---

AI changes from review comments (closed beta). While editing a BPMN drop, "Apply with AI" on an open comment thread, or on all of them, asks the model named by the new `AI_FEEDBACK_MODEL` var to make the change the threads ask for. The page shows the proposal first: a preview, the changes per thread, and removals, conditions and job types to look at closely. Apply makes one undoable edit, then replies on each answered thread and resolves it. New route `POST /drop/api/ai-edit/:shareId/:filename`, with the same passcode, Turnstile pass, budget, hourly cap and cache as describe-to-diagram. `bench:generate --feedback` compares models on 11 review cases.
