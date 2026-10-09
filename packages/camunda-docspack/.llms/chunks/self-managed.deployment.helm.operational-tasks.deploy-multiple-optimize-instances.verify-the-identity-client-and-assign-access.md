# Deploy multiple Optimize instances with Helm — Verify the Identity client and assign access

Management Identity creates the `optimize-team-b` confidential client from `identity.clients` when the platform release starts.

1. Open the Keycloak Admin Console for the `camunda-platform` realm.
1. Open **Clients > optimize-team-b**.
1. Confirm the valid redirect URI is `https://<host>/optimize-team-b/api/authentication/callback`.
1. Confirm the client is confidential and uses the expected client secret.
1. Open Management Identity at `https://<host>/identity`.
1. For each user who needs Optimize access, open **Users > user > Assigned roles > Assign roles**, and assign the **Optimize** role. For details, see [assign a role to a user](https://docs.camunda.io/docs/next/self-managed/components/management-identity/application-user-group-role-management/manage-roles#assign-a-role-to-a-user).

**Warning: Authorization limitation**
The distinct client IDs and secrets separate the two applications' OIDC registrations, but they don't separate user authorization. Both clients request the `optimize-api` audience, and the single `Optimize` role grants access to that audience.

Any user with the `Optimize` role can authenticate to both Optimize instances. Don't use this pattern when Team A must be prevented from accessing Team B's Optimize instance.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/deploy-multiple-optimize-instances
