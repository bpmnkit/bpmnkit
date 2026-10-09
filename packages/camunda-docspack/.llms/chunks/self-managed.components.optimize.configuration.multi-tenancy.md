# Multi-tenancy

Learn about the supported multi-tenancy scenarios.

Camunda 8 Self-Managed only

**Note**
This page describes logical tenants for Optimize. For strong physical isolation of separate teams or organizations within a single cluster, see [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants). If you run one Optimize instance per Physical Tenant behind a shared Management Identity, see [Optimize and Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/optimize#known-limitation-logical-tenants-with-the-same-id-across-physical-tenants) for a limitation with reusing the same logical tenant ID across tenants.

Multi-tenancy is the ability of Camunda 8 to serve multiple distinct [tenants](https://docs.camunda.io/docs/next/self-managed/components/management-identity/manage-tenants) or
clients within a single installation.

From version 8.3 onwards, Optimize has been enhanced to support multi-tenancy for Self-Managed setups. More information about
the feature can be found in the [multi-tenancy concepts](https://docs.camunda.io/docs/next/components/concepts/multi-tenancy).

Optimize imports the relevant tenant information from Zeebe records and retrieves each user's tenant authorizations from Identity, so that the logged-in users only have access to the data on tenants that they are authorized to see in Identity. Because tenant authorizations are cached in Optimize to improve performance, there could be a delay until any changes made to tenant authorizations in Identity are visible in Optimize.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/multi-tenancy
