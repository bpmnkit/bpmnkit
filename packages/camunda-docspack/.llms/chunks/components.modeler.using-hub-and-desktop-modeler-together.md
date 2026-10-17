# Using Camunda Hub and Desktop Modeler together

Understand the implications of using Camunda Hub and Desktop Modeler for modeling process diagrams.

[Camunda Hub](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/index) and [Desktop Modeler](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/index) are both tools for designing [BPMN](https://docs.camunda.io/docs/next/components/modeler/bpmn/bpmn) diagrams, but they serve different purposes and shine in different scenarios.

Camunda Hub is great for collaborative, cloud-based process modeling. It allows teams to work together in real-time, manage versions and project snapshots, and store models centrally. It's especially useful when working in distributed teams or when you need tight integration with a remotely hosted Camunda 8 cluster — whether it's Camunda SaaS or your own self-managed environment.

Desktop Modeler, on the other hand, is ideal for local development, technical modeling, and full offline control. Among other features, it supports advanced customization, scripting, and deployment to local Camunda 8 runtimes (like Camunda 8 Run), making it a go-to tool for developers working on executable processes.

Using both tools together allows you to combine the best of both worlds:

- Start collaboratively in Camunda Hub, capturing business requirements and designing high-level processes with stakeholders.
- Then switch to Desktop Modeler for more technical refinement, such as adding execution details, scripts, or testing locally.

This workflow bridges the gap between business users and developers, ensuring smooth handoffs and better alignment across the team.

<!-- TODO: update Desktop Modeler to "Project" and camunda-project.json when ready -->

When using [Git sync](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/git-sync) to keep your project in sync between a Camunda Hub workspace and your local environment, there are a few considerations to ensure both modelers interpret the project (and its `.process-application` file) consistently.

---
Source: https://docs.camunda.io/docs/next/components/modeler/using-hub-and-desktop-modeler-together
