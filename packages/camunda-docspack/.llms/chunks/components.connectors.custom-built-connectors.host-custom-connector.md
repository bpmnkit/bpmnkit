# Host custom connectors

Learn how to host a custom connector developed with Connector SDK.

This guide explains how to host your own **Connectors** developed with [Connector SDK](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-sdk).


## Prerequisites

- Ensure you have to have a working Camunda cluster in SaaS or Self-Managed.
- Ensure you have a distribution version of your connector in the form of "fat" `jar` file.

For the purpose of this guide, we will be using a generic [Connector template](https://github.com/camunda/connector-template-outbound)
as a reference. Clone the repository, and execute `mvn clean verify package`.
This produces two JAR files in the `target/` directory. Use `connector-template-0.1.0-SNAPSHOT.jar` (the JAR that bundles all dependencies). Ignore `original-connector-template-0.1.0-SNAPSHOT.jar` (the JAR without dependencies).

In this guide, we will refer to `connector-template-0.1.0-SNAPSHOT.jar` as `connector.jar`.

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/host-custom-connector
