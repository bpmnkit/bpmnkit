# Clients — Manage clients in Self-Managed with OIDC authentication

To configure a client application in a [Self-Managed environment with OIDC](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider), complete the following two steps:

1. Register your client application with your identity provider to obtain client credentials.
2. Configure authorizations for the client in the Orchestration Cluster Admin to grant the necessary permissions.

After completing these steps, your client application can then authenticate with your IdP, obtain an access token, and use that token to make authorized API calls to the Camunda 8 orchestration cluster.

### Prerequisites

Your Orchestration Cluster must be [configured to use a token claim as the client id](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider#step-1-configure-the-oidc-client-id-claim).

### Step 1: Create client credentials in your IdP

Before configuring access in the Orchestration Cluster, you must register your client application in your OIDC-compatible identity provider (for example, EntraID, Keycloak, Okta).

During the registration process, your identity provider will provide you with a **Client ID** and a **Client Secret**. Your application will use these credentials to authenticate and obtain an access token.

### Step 2: Configure authorizations in Admin

Once you have your client credentials, you can configure the required permissions in the Admin component of your cluster. Log in to Admin and choose one of the following methods to grant authorizations.

#### Authorization based on client ID

This method is suitable when your client application requires a fixed set of permissions. Follow [the steps on how to create authorizations](https://docs.camunda.io/docs/next/components/admin/authorization#create-an-authorization-in-admin) with the following specifics:

- As the **Owner type**, select `Client`.
- In the **Owner ID** field, enter the **Client ID** that matches your client's value for the configured client id claim.

You can also assign the client to existing [groups](https://docs.camunda.io/docs/next/components/admin/group) or [roles](https://docs.camunda.io/docs/next/components/admin/role) to inherit their permissions.

#### Flexible authorization based on JWT claims with mapping rules

This method is ideal when you need to dynamically assign permissions based on claims in the OIDC access token, such as scopes or custom claims.

1. [Create a mapping rule](https://docs.camunda.io/docs/next/components/admin/mapping-rules#add-a-mapping-rule) that matches a claim from your client's access token.
2. [Create authorizations](https://docs.camunda.io/docs/next/components/admin/authorization#create-an-authorization-in-admin) for the mapping rule with the following specifics:
   - As the **Owner type**, select `Mapping Rule`.
   - In the **Owner ID** field, enter the **Mapping Rule ID** that you chose in the previous step.

Alternatively, you can assign the mapping rule to [groups](https://docs.camunda.io/docs/next/components/admin/group) or [roles](https://docs.camunda.io/docs/next/components/admin/role) to inherit their permissions.

Any client that authenticates with a token matching the criteria of the mapping rule will be granted the associated permissions.

---
Source: https://docs.camunda.io/docs/next/components/admin/client
