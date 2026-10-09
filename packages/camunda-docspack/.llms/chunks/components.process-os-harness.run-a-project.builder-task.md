# Builder task

Learn how ProcessOS Harness builder tasks guide work between Camunda, your AI coding agent, and Git to ensure flexible, auditable project execution.


## About

A builder task is a unit of work that is executed in the AI coding agent. Each builder task runs as a job, with a skill doing the main work and the builder overseeing, judging, and revising it.

This shape gives every task three properties at once:

- **Guidance:** The governance process tells you what to do.
- **Auditability:** Camunda and Git record what happened.
- **Flexibility:** You can do whatever else the job needs.

Builder tasks are service tasks in the governance process, so Camunda handles them as jobs like any other service task. ProcessOS Harness contains skills to manage these jobs.

![A builder task represented as a service task in the ProcessOS Harness BPMN model in Camunda Modeler.](../img/builder-task-in-modeler.png)

---
Source: https://docs.camunda.io/docs/next/components/process-os-harness/run-a-project/builder-task
