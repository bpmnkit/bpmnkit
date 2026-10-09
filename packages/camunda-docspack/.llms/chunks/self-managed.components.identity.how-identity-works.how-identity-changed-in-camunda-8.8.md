# How identity works in Camunda — How identity changed in Camunda 8.8

Before Camunda 8.8, [Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/overview) (then called just Identity) managed access for every component, including Zeebe, Operate, and Tasklist. Camunda 8.8 split identity management into two subsystems. The [Orchestration Cluster](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#orchestration-cluster) began managing its own authentication and authorization through [Admin](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview) (formerly called Orchestration Cluster Identity). See [Identity, authentication, and authorization](https://docs.camunda.io/docs/next/reference/announcements-release-notes/880/whats-new-in-88#identity) for the full migration details.

Admin becomes the single source of truth for the migrated cluster's roles and authorizations after this change. Existing roles and authorizations carry over automatically during the upgrade, so nothing needs to be recreated. From that point on, manage access to Operate and Tasklist in Admin. Role or authorization changes made in Camunda Hub (then called Console) or Management Identity no longer apply to the migrated cluster.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/identity/how-identity-works
