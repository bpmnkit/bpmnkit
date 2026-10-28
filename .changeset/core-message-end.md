---
"@bpmnkit/core": minor
---

Export `messageEndProblem`, `nameFromId` and `writableMessageLabel`. `primaryProcess` keeps the user's process once it is emptied: among empty processes it prefers those not marked `isExecutable="false"`, then the one with the largest pool.
