# Set up an external IdP with internal Keycloak — Configure the external identity provider — Configure identity provider mappers

After adding the identity provider, configure mappers in the **Camunda realm** (default: `camunda-platform`) to import user attributes and assign users to a group for authorization.

**Tip**
For details on Keycloak identity provider mappers, see the [Keycloak documentation on identity broker mappers](https://www.keycloak.org/docs/latest/server_admin/index.html#_mappers).

#### Create attribute mappers

Attribute mappers import user profile information from the external IdP into Keycloak user accounts.

In Keycloak Admin Console, navigate to **Identity Providers** > select your IdP > **Mappers** tab.

Create attribute mappers to import user profile information:

| Name        | Mapper type        | Claim         | User attribute |
| ----------- | ------------------ | ------------- | -------------- |
| `email`     | Attribute Importer | `email`       | `email`        |
| `firstName` | Attribute Importer | `given_name`  | `firstName`    |
| `lastName`  | Attribute Importer | `family_name` | `lastName`     |

#### Create username mapper

The username mapper determines how Keycloak assigns usernames to federated users based on claims from the external IdP.

Create a username mapper:

- **Name**: `username`
- **Mapper Type**: Username Template Importer
- **Template**: `${CLAIM.preferred_username}`

#### Create group for external IdP users

Navigate to **Groups** > **Create group** and create a group:

- **Name**: `external-idp-users`

#### Assign users to the group

The hardcoded group mapper automatically assigns all users authenticating through this IdP to a specified group. This group membership is then included in the user's access token.

Create a mapper to assign federated users to this group:

- **Name**: `assign-external-idp-group`
- **Mapper Type**: Hardcoded Group
- **Group**: `external-idp-users`

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-idp-via-internal-keycloak
