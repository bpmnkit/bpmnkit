# Install Camunda for production with Helm

Install Camunda 8 Self-Managed on Kubernetes using Helm chart with production-ready configuration.

This is a **scenario-based, production-focused, step-by-step guide** for setting up the [Camunda Helm chart](https://artifacthub.io/packages/helm/camunda/camunda-platform). It provides a resilient baseline for most production use cases.

This is a single production install guide with database options in one flow:

- **Non-SQL secondary storage** (Elasticsearch/OpenSearch)
- **RDBMS secondary storage** (for supported components)

AWS examples are used where helpful, but the flow applies to other [supported Kubernetes distributions](https://docs.camunda.io/docs/next/reference/supported-environments#deployment-options) with equivalent services.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index
