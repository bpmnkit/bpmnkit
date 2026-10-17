# Wait states

A high-level overview of wait states in Camunda 8.

A wait state describes what an active process element instance is waiting for before it can continue, so you can tell expected waiting from a stalled instance.


## What wait states show

When you inspect an active element, Camunda surfaces the wait state and its details. For example, the message a receive task expects or the due date of a timer.

Wait states remain a subset of active instances, not a new top-level state. Camunda surfaces this information at the element instance level.

Use wait states to:

- **Distinguish healthy waiting from stalled execution:** Determine whether an instance is waiting as designed or needs intervention.
- **Detect worker availability issues early:** See whether a job is waiting for activation or is already in progress, and for how long.
- **Speed up troubleshooting:** See what an instance is waiting for without digging into logs.

---
Source: https://docs.camunda.io/docs/next/components/wait-states/overview
