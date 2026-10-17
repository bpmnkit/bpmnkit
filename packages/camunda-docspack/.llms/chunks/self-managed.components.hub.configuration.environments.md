# Environments and Physical Tenants

Configure how Camunda Hub Self-Managed creates environments from your clusters and Physical Tenants, and how it determines their status.

Camunda Hub creates the [environments](https://docs.camunda.io/docs/next/components/concepts/environments) of your organization from the clusters in its configuration. An environment appears only if its cluster is in your configuration. For how an environment maps to a cluster or to a Physical Tenant, and how Camunda Hub names it, see [how an environment maps to infrastructure](https://docs.camunda.io/docs/next/components/concepts/environments#how-an-environment-maps-to-infrastructure).

Camunda Hub reads the cluster configuration once at startup on every instance, so after you change it, perform a rolling restart.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/environments
