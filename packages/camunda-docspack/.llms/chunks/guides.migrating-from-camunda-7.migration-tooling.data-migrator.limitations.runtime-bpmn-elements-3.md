# Limitations — Runtime — BPMN elements (3)

#### Event subprocesses

- Event subprocesses with interrupting start events can cause unexpected behavior during migration if triggered at the wrong moment. This includes timer, message, and signal start events.
- What can go wrong:
  - A task that already ran in Camunda 7 might run again in Camunda 8.
  - The process might end up in the wrong state after migration — for example, being one step behind what you see in Camunda 7.
- When could it happen:
  - This can occur when a process instance is already inside an event subprocess in Camunda 7, and the start event of that same subprocess is accidentally triggered again in Camunda 8 during migration.
- How to prevent it:
  - Don't correlate messages or send signals during migration.
  - Temporarily adjust timer start events in event subprocesses to ensure they do not trigger during migration (see the section on timer events for more details).
  - If above suggestions are not feasible in your use case make sure service tasks are idempotent — so repeating them does not cause issues.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/limitations
