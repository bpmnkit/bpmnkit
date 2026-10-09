# Deploy required dependencies with Kubernetes operators

Deploy the databases (PostgreSQL, Elasticsearch) and OIDC provider (Keycloak) required by Camunda 8 using official Kubernetes operators.

This guide explains how to deploy Camunda 8 infrastructure components using **official Kubernetes operators** as an alternative to the Bitnami subcharts. This approach provides production-grade, officially maintained deployment solutions for PostgreSQL, Elasticsearch, and Keycloak.


## Overview

**Info: New in Camunda 8.8**
Starting with Camunda 8.8, we continue to strengthen our commitment to robust, production-ready deployments based on solid foundations.

As outlined in [our strategy](https://camunda.com/blog/2025/08/changes-to-camunda-helm-sub-charts-what-you-need-to-know/), Camunda reinforces building deployments on solid foundations—primarily managed PostgreSQL and Elasticsearch services, along with external OIDC providers. However, we understand that managed infrastructure components aren't always available in your organization's service catalog.

This guide demonstrates how to integrate these infrastructure components using official Kubernetes operators that don't depend on Bitnami subcharts. These operators are the recommended way to deploy and manage these services in production environments.

**Warning: Support scope**
PostgreSQL, Elasticsearch, and Keycloak are **external dependencies** — they are not Camunda products, regardless of the deployment method used.

- **Camunda support scope**: Camunda supports the **integration and configuration** of these components with the Camunda Helm chart. Camunda does not provide operational support for the infrastructure components themselves.
- **Operator support**: For operational support on infrastructure components, engage the respective project teams or community support channels directly (CloudNativePG, Elastic, Keycloak), or use managed services.

**Note: Bitnami subcharts (Camunda 8.9 and earlier)**
Bitnami subcharts are removed in Camunda 8.10 (Helm chart `15.x`). On Camunda 8.9 and earlier you could continue using them via [Bitnami enterprise images](https://docs.camunda.io/docs/8.9/self-managed/deployment/helm/configure/registry-and-images/install-bitnami-enterprise-images/); migrate to operators or managed services before upgrading to 8.10.

**Tip: Migrating from Bitnami subcharts?**
If you have an existing Camunda deployment using Bitnami subcharts, see the [migration guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/migration-from-bitnami/index) for step-by-step instructions and automated tooling to migrate your data to Kubernetes operators or managed services with minimal downtime.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
