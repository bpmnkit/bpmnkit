# Set up an external IdP with internal Keycloak — Configure the external identity provider — Configure Management Identity access (optional)

For access to Console, Web Modeler, and Optimize, external IdP users need the corresponding realm roles assigned in Keycloak. The recommended approach is to assign users to groups that have these roles.

**Note**
The hardcoded group mappers in this section grant access to all users authenticating through the external IdP. For more granular access control based on groups or attributes from your external IdP, see the [Keycloak documentation on identity provider mappers](https://www.keycloak.org/docs/latest/server_admin/index.html#_mappers).

#### Verify or create groups

1. In Keycloak Admin Console, navigate to **Groups**.
2. Verify that groups exist for each component (e.g., `Console`, `Optimize`, `Web Modeler`). If not, create them.

#### Assign roles to groups

Ensure each group has the corresponding realm role assigned:

1. Select the group > **Role Mappings** tab.
2. Click **Assign role** and add the role with the same name (e.g., `Console`).

#### Create group mappers

Create mappers to assign federated users to these groups:

1. Navigate to **Identity Providers** > select your IdP > **Mappers** tab.
2. Click **Add mapper** for each component:

| Mapper name               | Mapper type     | Group         |
| ------------------------- | --------------- | ------------- |
| `assign-console-group`    | Hardcoded Group | `Console`     |
| `assign-optimize-group`   | Hardcoded Group | `Optimize`    |
| `assign-webmodeler-group` | Hardcoded Group | `Web Modeler` |

**Tip**
You can also assign roles directly to users in Keycloak, or use [mapping rules in Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/mapping-rules) to map token claims to roles.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-idp-via-internal-keycloak
