# Configure Logical Tenants in Helm chart — End-to-end example: assign users to a tenant via mapping rules

Enabling tenant checks controls whether tenant membership is enforced, but doesn't assign anyone to a tenant. To assign users automatically as they log in (rather than one by one), combine a tenant with a mapping rule.

**Scenario:** Users whose access token contains the `groups` claim with value `finance-team` should automatically get access to a `finance` tenant.

1. Enable multi-tenancy checks in the Orchestration Cluster Admin, as shown above.
2. [Create the `finance` tenant](https://docs.camunda.io/docs/next/components/admin/tenant#create-a-tenant).
3. [Create a mapping rule](https://docs.camunda.io/docs/next/components/admin/mapping-rules#create-a-mapping-rule) matching the claim:
   - **Claim name**: `groups`
   - **Claim value**: `finance-team`
4. [Assign the mapping rule to the `finance` tenant](https://docs.camunda.io/docs/next/components/admin/tenant#assign-mapping-rules-to-a-tenant).

Once assigned, any user or client presenting a token with `groups` containing `finance-team` is automatically treated as a member of the `finance` tenant, without a manual per-user assignment step.

This uses mapping rules in the Orchestration Cluster Admin, which are distinct from [mapping rules in Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/mapping-rules) (which instead control access to Console, Optimize, and Web Modeler). See [mapping rules](https://docs.camunda.io/docs/next/components/concepts/access-control/mapping-rules) for how the two relate.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configure-logical-tenants
