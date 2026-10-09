# Initialize tenants for Optimize

Learn how to configure Management Identity with initial tenants for Optimize.

**Note**
This page describes **logical tenants** for Optimize. For strong physical isolation of separate teams or organizations within a single cluster, see [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants), including the [Optimize deployment guidance](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index#optimize-deployment).

Configure initial [tenants](https://docs.camunda.io/docs/next/components/concepts/multi-tenancy) for Optimize in Camunda 8 Self-Managed.


## About Optimize tenants

Tenants managed within Management Identity only apply to [Optimize](https://docs.camunda.io/docs/next/self-managed/components/optimize/overview). Furthermore, they're only effective when the following conditions are met:

- You've [enabled multi-tenancy checks for your Orchestration Cluster](https://docs.camunda.io/docs/next/components/admin/tenant).
- Your tenants have the same identifiers in Orchestration Cluster Admin and Management Identity.

In this guide, you'll learn how to initialize tenants in your app configuration.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/initialize-tenants
