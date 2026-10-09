# Configure Logical Tenants in Helm chart

Learn how to configure Logical Tenants, the lightweight tenant-ID based multi-tenancy model, in Camunda 8.

**Note**
This page describes Logical Tenants, the lightweight tenant-ID based multi-tenancy model. For strong physical isolation of separate teams or organizations within a single cluster, see [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants).

Logical Tenants let you isolate users, data, and workloads across tenants (for example, business units, departments, or customers) within the same Camunda 8 cluster. This ensures separation while reducing infrastructure overhead by running multiple tenants on a shared installation.

This page explains how to configure Logical Tenants in both Management Identity and [Orchestration Cluster Admin](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview). It also shows the defaults, how to enable or enforce tenant checks, and how to resolve common issues.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configure-logical-tenants
