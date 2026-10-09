# Connect Camunda to any OIDC provider — Configure Camunda components — Configure Orchestration Cluster

Add configuration for the Orchestration Cluster (Zeebe, Operate, Tasklist, Identity):

```yaml
orchestration:
  enabled: true

  security:
    authentication:
      method: oidc
      oidc:
        clientId: <orchestration-client-id>
        audience: <orchestration-audience>
        redirectUrl: <orchestration-base-url>
        secret:
          existingSecret: oidc-credentials
          existingSecretKey: orchestration-client-secret
        # Claim mapping - uncomment and adjust if your provider doesn't use defaults
        # usernameClaim: <user-claim-name>  # Default: preferred_username
        # clientIdClaim: <client-claim-name>  # Default: client_id

    authorizations:
      enabled: true

    initialization:
      defaultRoles:
        admin:
          users:
            - <admin-user-claim-value>
        connectors:
          clients:
            - <orchestration-client-id>
```

#### Orchestration-specific parameters

| Parameter       | Description                        | Value                                                                                                                      |
| --------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `clientId`      | Orchestration client ID            | From your provider                                                                                                         |
| `audience`      | Expected audience in tokens        | The unique value you assigned in [Assign a unique audience to each component](#assign-a-unique-audience-to-each-component) |
| `redirectUrl`   | Full URL for Orchestration Cluster | `http://localhost:8080` (local) or `https://your-domain.com/orchestration` (Ingress)                                       |
| `usernameClaim` | Claim identifying users            | Default: `preferred_username`. Override if your provider uses `email`, `sub`, or another claim                             |
| `clientIdClaim` | Claim identifying clients          | Default: `client_id`. Override if your provider uses `azp` or another claim                                                |

**Note: Username display in Web Modeler (Helm)**
In Helm deployments, the default OIDC username claim is `preferred_username`, which often maps to an email address.

If you want Web Modeler to display usernames based on a different claim (for example `name`), set `CAMUNDA_IDENTITY_USERNAMECLAIM=name` for the Web Modeler `restapi` environment.

For available Web Modeler environment variables, see [Identity/Keycloak configuration](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#identity--keycloak).

#### Default roles

- `admin.users`: List of user claim values that should have admin access.
- `connectors.clients`: List of client IDs that should have Connectors role (typically the orchestration client ID itself).

**Note**
The admin user specified in `defaultRoles.admin.users` should match the value used for `initialClaimValue` in Management Identity configuration, so that the same user has admin access to both Management Identity and the Orchestration Cluster.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider
