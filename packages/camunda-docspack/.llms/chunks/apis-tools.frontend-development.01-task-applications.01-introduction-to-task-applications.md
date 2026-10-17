# Introduction to task applications

Task applications are the interface between humans and Camunda processes to orchestrate human work.

Task applications are the interface between humans and Camunda processes to orchestrate human work. Learn key concepts of the architecture of task applications before you build your own.


## What are task applications?

Task applications are end-user applications that allow humans to perform work orchestrated with a process. A [user task](https://docs.camunda.io/docs/next/components/modeler/bpmn/user-tasks/user-tasks#user-task-forms) (for [human task orchestration](https://docs.camunda.io/docs/next/guides/getting-started-orchestrate-human-tasks)) represents a single **work item** to be performed by an individual or a group, whether the preceding step ran automatically or an [AI agent](https://docs.camunda.io/docs/next/reference/glossary#ai-agent) escalated it for human input. The jobs of a task application include:

- Listing available tasks and allowing users to select a task to work on.
- Providing filter and search options for users so they can more easily find the right next task to work on.
- Presenting the selected task and an interface for completing the task, usually via a form.
- Providing an interface to create new tasks, e.g. by starting a new process.
- Provide insight into the progress of work tasks, including processes and cases.
- Aggregate information so users and their managers can assess the impact on process goals, such as KPIs and SLAs.
- Ensure tasks are visible only to authorized users.

Task applications play a key role in the orchestration of business processes. They enable the orchestration of processes that still contain manual work without automating each process step in advance. This unlocks the potential for continuous improvement and for identifying opportunities for process optimization and automation.

**Tip**
Not sure if you should use Camunda Tasklist, build your custom task application, or use a third-party application? Read the [guide to understand human task management](https://docs.camunda.io/docs/next/components/best-practices/architecture/understanding-human-tasks-management#deciding-about-your-task-list-frontend) first.

---
Source: https://docs.camunda.io/docs/next/apis-tools/frontend-development/01-task-applications/01-introduction-to-task-applications
