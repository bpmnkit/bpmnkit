# Wait states — Supported wait state types

Camunda 8.10 tracks the following wait state types:

| Wait state type | Applies to                                                                                                  | Details surfaced                                                                                                        |
| :-------------- | :---------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| Timer           | Intermediate timer catch event                                                                              | Due date, repetitions                                                                                                   |
| Message         | Intermediate message catch event, receive task                                                              | Message name, correlation key                                                                                           |
| Signal          | Intermediate signal catch event                                                                             | Signal name                                                                                                             |
| Conditional     | Intermediate conditional catch event                                                                        | Condition expression, condition events (for example, variable create or update)                                         |
| User task       | User task                                                                                                   | Task key, due date                                                                                                      |
| Job             | Service task, send task, script task, business rule task (when job-based), and execution and task listeners | Job key, job type, job kind, retries, and `listenerEventType` (populated only for listener-type jobs, otherwise `null`) |

Boundary events, event-based gateways, and parallel merging gateways are not tracked in 8.10.

---
Source: https://docs.camunda.io/docs/next/components/wait-states/overview
