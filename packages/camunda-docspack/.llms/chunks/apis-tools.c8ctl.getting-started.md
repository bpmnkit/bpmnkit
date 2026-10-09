# c8ctl CLI

Use the c8ctl CLI to inspect your Camunda 8 clusters, deploy resources, and manage process automation from the terminal.

<!-- This page is maintained in the c8ctl repository (https://github.com/camunda/c8ctl, in docs/) and
     is synced to camunda-docs automatically. Do not edit it in camunda-docs — changes will be
     overwritten. Edit the source in the c8ctl repo instead. -->


## About

`c8ctl` is a minimal-dependency CLI for Camunda 8. It is built on top of the [`@camunda8/orchestration-cluster-api`](https://www.npmjs.com/package/@camunda8/orchestration-cluster-api) TypeScript SDK and provides two equivalent bin aliases: `c8ctl` and `c8`.

`c8ctl` is designed for developers who need fast, scriptable access to a Camunda 8 cluster during development and testing. It supports both Camunda 8 SaaS and Self-Managed environments.

Use `c8ctl` to:

- Inspect running clusters — list process instances, user tasks, incidents, and jobs.
- Deploy BPMN, DMN, and form resources, optionally watching for file changes.
- Manage profiles for multiple clusters, including profiles imported from Camunda Modeler.
- Extend the CLI with custom plugins.

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/getting-started
