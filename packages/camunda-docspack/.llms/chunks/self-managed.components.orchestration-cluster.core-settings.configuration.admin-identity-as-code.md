# Admin: Identity as Code

Configure Identity as Code for a Camunda 8 Self-Managed Orchestration Cluster.

This page explains how to configure Identity as Code in the Camunda 8 Self-Managed Orchestration Cluster.
Use Identity as Code to create users, roles, groups, authorizations, mapping rules, and tenants at application start.


## Use cases

Identity as Code simplifies configuring Self-Managed orchestration clusters across multiple stages.
You can create [all identity-related entities](https://docs.camunda.io/docs/next/components/admin/admin-introduction#manage-access) on one stage and then deploy them to other stages without further interaction, reducing the chance of error.

Another use case is local development, where a cluster might be recreated regularly.

After Admin creates an entity, changing its configuration does not update the existing entity.
Admin checks only the ID to decide whether an entity already exists.

When you deploy with Helm, the most reliable approach is to provide Identity as Code settings through [application configs](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs) using `orchestration.extraConfiguration`. The Helm examples below use this pattern so you can apply the same approach consistently across all entity types.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/admin-identity-as-code
