# Configure Physical Tenants in Helm chart

Learn how to configure Physical Tenants in Camunda 8 using the Helm chart.

**Note**
This page describes Physical Tenants, the strong isolation model for separate teams or organizations within a single orchestration cluster. For the lightweight, tenant-ID based model, see [Logical Tenants](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configure-logical-tenants).

The Helm chart does not expose a dedicated `physicalTenants.*` values schema. Configure Physical Tenants by passing the same `camunda.physical-tenants.<tenant-key>.*` properties documented in the [configuration reference](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/configuration-reference), either as a raw `application.yaml` block, as a standalone extra configuration file, or as environment variables.

This page covers delivery: how to get tenant configuration into the Orchestration Cluster pod. Declaring a tenant also changes the shape of your deployment, because each tenant needs its own Optimize release and its own index prefixes, and adding or removing one is an ordered operation across several releases. For that, see [configure Physical Tenants across releases](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configure-physical-tenants
