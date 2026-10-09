# Logical Tenants — Security

Strong access control mechanisms prevent tenants from accessing each other's data or processes. These controls ensure tenant-level security and maintain data integrity across all environments.


## Example: tenant membership in action

When a user deploys a process model or starts a process instance, the system validates the user's tenant assignments.

For example, assume a user belongs to `Tenant A` but not `Tenant B`:

1. **Deploying a process model**
   - If the user deploys to `Tenant A`, the Orchestration Cluster verifies the assignment. If valid, the model is deployed and all related process instances belong to `Tenant A`.
   - If the user deploys to `Tenant B`, the deployment fails because the user lacks access to that tenant.

2. **Running process instances**
   - When querying process instances, the user only sees instances belonging to `Tenant A`.

This mechanism ensures proper isolation and access control across tenants.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/logical-tenants
