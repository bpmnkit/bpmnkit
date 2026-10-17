# Glossary — U

### User task

A user task is used to model work that needs to be done by a human and is assisted by a workflow engine or software application. This differs from [manual tasks](#manual-task), which are not assisted by external tooling.

With 8.7, Camunda offers job worker-based user tasks managed by Camunda, also known as Camunda user tasks (and formerly known as Zeebe user tasks). Note that you may still see references of **Zeebe user tasks** in your XML, but this is the same thing as Camunda user tasks.

Camunda recommends using Camunda user tasks in your process definitions. From 8.7, **job-worker** user tasks are available for querying, but Web Modeler (pre-8.10), Camunda Hub (8.10+), and Desktop Modeler automatically apply the **Camunda user task** and show a warning message for each job worker user task.

- [User tasks](https://docs.camunda.io/docs/next/components/modeler/bpmn/user-tasks/user-tasks)
- [Migrate to Camunda user tasks](https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-user-tasks)

### User task listener

A user task listener allows users to execute custom logic in response to specific user task lifecycle events, such as assigning or completing a task. User task listeners are attached to BPMN user tasks and facilitate validation, custom task assignment, and other operations during user task execution. They operate similarly to [job workers](#job-worker), leveraging the same infrastructure for processing external logic.

- [User task listeners](https://docs.camunda.io/docs/next/components/concepts/user-task-listeners)

---
Source: https://docs.camunda.io/docs/next/reference/glossary
