# Set up an external IdP with internal Keycloak — Configure the external identity provider — Configure Orchestration Cluster Admin

External IdP users can authenticate, but still require authorization to access Camunda components.

Log in to **Orchestration Cluster Admin** as an administrator.

#### Grant component access

Grant access to Orchestration Cluster components for the external IdP users group:

1. Navigate to **Authorizations** > select **Component** > **Create authorization**.
2. Configure the authorization:
   - **Owner type**: `Group`
   - **Owner ID**: `external-idp-users`
   - **Resource ID**: `*`
   - **Permissions**: `ACCESS`

#### Grant additional permissions (optional)

Grant additional permissions as needed. For example, to allow users to view processes and complete tasks:

| Resource type      | Resource ID | Permissions                                                          |
| ------------------ | ----------- | -------------------------------------------------------------------- |
| Process definition | `*`         | `READ_PROCESS_DEFINITION`, `READ_PROCESS_INSTANCE`, `READ_USER_TASK` |
| User task          | `*`         | `UPDATE_USER_TASK`                                                   |

**Info**
For more details, see [Configure Orchestration Cluster authorizations](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-idp-via-internal-keycloak
