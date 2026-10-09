# Bring your own groups

Use groups from your external OIDC Identity Provider for authorization, role, and tenant assignment in Camunda 8 Self-Managed.

When Camunda 8 Self-Managed is configured with OpenID Connect (OIDC), the Orchestration Cluster can read a configurable claim from each token and treat its values as Camunda group IDs. This lets you use groups that already exist in your identity provider (IdP) as the basis for Camunda's authorization, role, and tenant assignment.

**Note**
This feature is Self-Managed only. Bring your own groups (external IdP groups) is not available in Camunda 8 SaaS.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/bring-your-groups
