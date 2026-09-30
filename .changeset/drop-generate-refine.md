---
"@bpmnkit/core": minor
"@bpmnkit/drop": minor
---

Describe-to-diagram: change a draft by asking, and answer the parser's guesses.

- `parseProcessText` returns `questions`: the guesses it had to make that only the reader can confirm. These are a made-up condition variable, a default branch it picked, branches it put in parallel, a question answered one way only, a task left out, a loop exit it added, and an event given a message trigger. Each has ready answers where there are any, and a `draft` to finish, all written as change requests. New type `ProcessTextQuestion`.
- Drop: once drawn, a draft takes change requests. `POST /drop/api/generate` accepts `{ description, diagram, change }`, and the model writes the whole diagram again with the change made. The page lists the parser's questions under the diagram, sends an answer as a change, and can undo each change.
- `bench:generate --edits` measures changes on 10 cases, including how much of the draft each answer keeps.
