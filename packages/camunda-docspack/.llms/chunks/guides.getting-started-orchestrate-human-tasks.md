# Get started with human task orchestration

For low-code developers using Camunda 8 SaaS, efficiently allocate work through user tasks.

Beginner
Time estimate: 15 minutes

This guide is designed for users who prefer a low-code approach to process automation. You can follow this tutorial using either a local, Self-Managed lightweight setup, or Camunda 8 SaaS.

Camunda 8 allows you to orchestrate processes with human tasks of any complexity. Utilizing [user tasks](https://docs.camunda.io/docs/next/reference/glossary#user-task), you can create and assign tasks to users. Then, users can perform their work and enter the necessary data to drive the business process.

<!--
TODO: When we have one, link to an equivalent course that uses Camunda Hub instead of Web Modeler and Console.

**Note**
If you prefer a video-based learning experience or a more complex example, visit [this Camunda Academy course](https://bit.ly/3PJJocB).
-->

This guide introduces you to the basics of human task orchestration. You will create a simple process to decide on dinner, and drive the process flow according to that decision.

### sm

Have you installed Camunda yet?

### Prerequisites

- [Desktop Modeler](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/install-the-modeler)

### Install and start Camunda 8 Run

1. Download the latest release of Camunda 8 Run for your operating system and architecture. Opening the .tgz file extracts the Camunda 8 Run script into a new directory.
2. Navigate to the new `c8run` directory.
3. Start Camunda 8 Run by running `./start.sh` (or `.\c8run.exe start` on Windows) in your terminal.

When successful, a new Operate window automatically opens.

**Note**
If Camunda 8 Run fails to start, run the [shutdown script](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/install-start#shut-down-camunda-8-run) to end the current processes, then run the start script again.

**Note**
Starting with 8.10.0-alpha2, Camunda 8 Run no longer requires Java to start.
Camunda 8 Run starts with H2 as the default secondary storage. Elasticsearch is still supported but must be explicitly enabled in `c8run/configuration/application.yaml`.

For more information and local configuration options, see the [Camunda 8 Run installation guide](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/install-start).

### saas

Have you signed up for Camunda yet?

---
---

---
Source: https://docs.camunda.io/docs/next/guides/getting-started-orchestrate-human-tasks
