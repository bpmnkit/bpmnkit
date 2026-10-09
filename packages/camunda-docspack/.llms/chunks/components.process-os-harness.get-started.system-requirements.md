# System requirements

Learn about the system requirements for running ProcessOS Harness.


## Requirements

ProcessOS Harness requires the following:

- A Camunda cluster to run the [governance process](#governance-process).
- A [Git-compatible version control system](#project-version-control) to store your projects.
- A supported [AI coding agent](#ai-coding-agent) to do the re-engineering work.
- A [builder client](#builder-client) with local tooling, where the agent runs.

![System overview: the builder client hosts the AI coding agent and a local Camunda server, syncs status with the ProcessOS governance process on the enterprise Camunda server, uses VCS and an AI platform, and generates a ProcessOS solution deployed back to the enterprise Camunda server.](../img/process-os-system-requirements.excalidraw.svg)

**Note**
Agentic tooling is flexible by nature, so ProcessOS Harness may run on more systems than the ones listed here. These are the configurations Camunda currently tests, and the goal is to keep ProcessOS Harness independent of any specific AI coding agent or AI platform.

---
Source: https://docs.camunda.io/docs/next/components/process-os-harness/get-started/system-requirements
