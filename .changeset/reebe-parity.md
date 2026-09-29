---
"@bpmnkit/reebe": patch
"@bpmnkit/cli": patch
---

Reebe: accept the Camunda 8 v2 `processDefinitionId` when creating an instance and `name` when publishing or correlating a message; the embedded (SQLite) server now opens message subscriptions, creates user tasks without candidate groups or users, and expires messages, resolves incidents and completes batch operations (it used `NOW()`, which SQLite lacks); new `--grpc-port` / `REEBE_GRPC_PORT` so REST can take 26500. `casen reebe start` passes `--grpc-port` through, and its missing-binary hint builds the embedded server.
