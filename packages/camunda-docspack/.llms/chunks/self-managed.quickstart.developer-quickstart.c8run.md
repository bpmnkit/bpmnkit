# Developer quickstart – Camunda 8 Run

A quickstart guide for developers to deploy and run Camunda 8 Self-Managed locally with Camunda 8 Run, including setup, configuration, and key components.

**Note**
Camunda 8 Run provides a lightweight, self-managed environment for local development and prototyping. It is not intended for production use.

For production deployments, install the Orchestration Cluster manually as a Java application.
For detailed steps, see the [manual installation](https://docs.camunda.io/docs/next/self-managed/deployment/manual/install) guide.

Camunda 8 Run is a local distribution of Camunda 8 that bundles the Camunda 8 runtime, core services, startup scripts, and a launcher application for Windows, macOS, and Linux.

Camunda 8 Run enables you to run the [Orchestration Cluster](https://docs.camunda.io/docs/next/reference/glossary#orchestration-cluster) with minimal configuration. It is intended for developers who want to model BPMN diagrams, deploy them, and interact with running [process instances](https://docs.camunda.io/docs/next/reference/glossary#process-instance) in a simple environment.

Camunda 8 Run includes the following:

- Orchestration Cluster
- [Connectors](https://docs.camunda.io/docs/next/reference/glossary#connector)
- H2 (default [secondary storage](https://docs.camunda.io/docs/next/reference/glossary#secondary-storage) for Camunda 8 Run)

Camunda 8 Run also supports document storage and management with [document handling](https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/overview).

**Note**
For the latest list of supported relational databases and versions, see the
[RDBMS version support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy).

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run
