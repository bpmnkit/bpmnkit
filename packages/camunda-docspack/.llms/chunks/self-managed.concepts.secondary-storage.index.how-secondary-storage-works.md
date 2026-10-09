# Secondary storage — How secondary storage works

The Zeebe Broker executes workflow instances and stores state in primary storage. Exporters running as part of Zeebe write orchestration data to the configured secondary storage backend and can write to multiple targets when needed. Operate, Tasklist, and Admin use the Orchestration Cluster API, which reads from the configured secondary storage backend.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index
