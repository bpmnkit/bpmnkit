# Connect an external identity provider — Prerequisites

- Organization admin access to the cluster in Console.
- A cluster on Camunda 8.10.1 or any later version.
- An OIDC-compliant identity provider (for example, Microsoft Entra ID, Okta, Ping Identity, or Keycloak) with administrative access to register a new application, and a public (internet-reachable) issuer URL.


## Step 1: Get the cluster's redirect URI

1. In Console, in the left navigation under **Clusters**, select the cluster.
2. On the **Settings** tab, under **External identity provider**, click **Configure** (or **Edit** if a provider is already configured).
3. Copy the **Redirect URI** shown at the top of the dialog. Copy the entire value, including the query string: it identifies this specific cluster to your IdP.

Keep this dialog open, or copy the redirect URI somewhere safe. You need it in the next step.

---
Source: https://docs.camunda.io/docs/next/components/saas/clusters/connect-external-identity-provider
