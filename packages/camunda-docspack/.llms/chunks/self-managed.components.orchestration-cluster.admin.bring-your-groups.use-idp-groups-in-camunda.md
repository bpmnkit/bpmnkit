# Bring your own groups — Use IdP groups in Camunda

Once `groups-claim` is set, the group IDs extracted from each token can be used anywhere a Camunda group ID can be used. The group ID in the token and the Camunda-side group ID must match **exactly**: comparisons are case-sensitive and treat group IDs as opaque strings.

### Role assignment

Assign IdP groups to Camunda roles to grant every member of that group the role's permissions on sign-in. See [assign users, clients, groups, or mapping rules to roles via configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview#assign-users-clients-groups-or-mapping-rules-to-roles-via-configuration).

### Authorizations

Grant authorizations directly to IdP groups to control access to Camunda resources such as process definitions, decisions, or tenants. See [authorizations](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations).

### Tenant assignment

Add IdP groups to tenants so that every member of that group gains access to the tenant. See [tenants](https://docs.camunda.io/docs/next/components/admin/tenant).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/bring-your-groups
