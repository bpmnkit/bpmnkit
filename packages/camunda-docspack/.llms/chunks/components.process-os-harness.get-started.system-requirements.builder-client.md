# System requirements — Builder client

The AI coding agent runs on the builder's own computer.

| Requirement                   | Details                                                                      |
| ----------------------------- | ---------------------------------------------------------------------------- |
| c8ctl                         | The Camunda 8 CLI, used to deploy and manage Camunda resources and clusters. |
| Operating system              | Windows (via WSL), macOS, or Unix.                                           |
| AI coding agent               | Installed locally.                                                           |
| Camunda                       | A local cluster started with `c8run`, used to validate generated solutions.  |
| Node.js                       | Version 22.18.0 or later.                                                    |
| Git and GitHub CLI            | `git`, and the `gh` CLI for the GitHub discovery specialist.                 |
| Maven (For Java Workers only) | Latest stable release.                                                       |
| Camunda Modeler               | For editing BPMN and DMN files during review.                                |

---
Source: https://docs.camunda.io/docs/next/components/process-os-harness/get-started/system-requirements
