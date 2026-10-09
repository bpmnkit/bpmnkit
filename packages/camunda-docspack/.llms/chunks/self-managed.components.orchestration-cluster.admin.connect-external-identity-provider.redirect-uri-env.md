# Connect Admin to an identity provider — Redirect URI — env

```
CAMUNDA_SECURITY_INITIALIZATION_DEFAULTROLES_ADMIN_USERS_0=<YOUR_USERNAME>
```

1. Replace `<YOUR_USERNAME>` with the username provided by your IdP (matching the value of the claim configured as `username-claim`).
1. Restart your Orchestration Cluster and verify that the chosen user has the Admin Role, for example by visiting `localhost:8080/identity/roles/admin/users`.
1. If the username is shown, continue configuring your own groups, mapping rules, or setting up [authorizations](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations) for other users.

**Tip**
For more details on assigning users to the default roles, see the [corresponding documentation](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview#assign-users-clients-groups-or-mapping-rules-to-roles-via-configuration).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider
