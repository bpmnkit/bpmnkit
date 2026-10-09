# Configure component configuration

Learn how to configure individual Camunda components in Helm charts.

This page explains how to configure Camunda components in Helm charts.

For most use cases, use `<componentName>.extraConfiguration` to add or override properties while keeping the chart-provided defaults. Use `<componentName>.configuration` only when you intentionally want to replace the entire default application configuration file.

For the complete list of configuration options per component, see the [Self-Managed Components documentation](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/overview) (this is where each component documents its supported application configuration).


## Prerequisites

- A deployed Camunda Helm chart release.
- Access to the `values.yaml` file.
- Basic understanding of Spring Boot configuration (`application.yaml` or `application.properties`).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs
