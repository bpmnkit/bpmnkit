# Implement the Camunda solution — Validate with the test layers

ProcessOS Harness generates three layers of tests. They answer different questions, and none of them replaces the others.

| Layer             | What it validates                                                                                                   | Runtime               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Process tests     | BPMN orchestration: routing, sequencing, and error handling. All service tasks are mocked, and no real workers run. | Camunda engine        |
| Integration tests | Real job workers and connectors, with mocking as a last resort.                                                     | Camunda engine        |
| Worker unit tests | A worker's internal business logic and edge cases.                                                                  | Plain Java, no engine |

Process tests aim for complete BPMN element coverage, so every gateway branch, end event, and error boundary is exercised.

Integration tests come in three increasing scopes. A single-element test probes one task, connector, or DMN table with no mocking. A segment test runs from the start to a checkpoint, mocking user tasks only. An end-to-end test runs the full process with no mocking, for pre-release confidence.

Worker unit tests call the method annotated with `@JobWorker` directly as plain Java, using mocks. They need no Camunda runtime, no Docker, and no process context, which makes them the cheap way to cover logic edge cases.

---
Source: https://docs.camunda.io/docs/next/components/process-os-harness/run-a-project/phases/3-implementation
