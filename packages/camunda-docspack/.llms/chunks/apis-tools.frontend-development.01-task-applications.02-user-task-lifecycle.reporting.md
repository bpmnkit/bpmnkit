# User task lifecycle — Reporting

Use lifecycle events to build audit logs or productivity reports.

### Task lifecycle reporting in Optimize

Optimize supports task productivity reports but currently measures only assigned vs. unassigned time.

It does not calculate:

- **Idle time:** Time a task was open (time to `start`).
- **Net working time:** Time during which a task was processed from a custom `start` action to completion, excluding time between custom `pause` and `resume` actions.

### Export task lifecycle information

Use user task listeners and job workers to send lifecycle event data to external systems such as analytics or monitoring tools.

---
Source: https://docs.camunda.io/docs/next/apis-tools/frontend-development/01-task-applications/02-user-task-lifecycle
