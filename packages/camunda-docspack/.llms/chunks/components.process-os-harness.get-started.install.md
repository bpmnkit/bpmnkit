# Install ProcessOS Harness and configure a project

Learn how to create a configured ProcessOS Harness project with the journey running.


## About

Create a configured ProcessOS Harness project with the journey running. Set up the builder workspace, install ProcessOS Harness into your AI coding agent with c8ctl, and configure your first project with process-scope.md and run.config.yaml.

**Note: prerequisites**
Camunda recommends completing the [organizational setup](https://docs.camunda.io/docs/next/components/process-os-harness/get-started/project-setup) first, and checking the [system requirements](https://docs.camunda.io/docs/next/components/process-os-harness/get-started/system-requirements) before you install.


## (Optional) Understand the builder workspace

The builder workspace is a recommendation for how to keep everything you need in one place. You work in your IDE, and ProcessOS Harness adds governance and review around it.

| Part               | What you use it for                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| IDE                | Hosts the project files, a console, and the AI coding agent. Visual Studio Code is a common choice. |
| AI coding agent    | Does the work in each job, and helps you fix problems at any point.                                 |
| Git                | Stores every project artifact, so changes are reviewable and reversible.                            |
| Governance process | Runs on Camunda alongside your IDE, and tells you what to do next.                                  |
| File viewer        | Opens generated BPMN, DMN, and form files for review.                                               |

---
Source: https://docs.camunda.io/docs/next/components/process-os-harness/get-started/install
