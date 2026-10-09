# Connect Camunda to Ping Identity (PingFederate or PingOne) — Create OAuth/OIDC applications in Ping

The [generic OIDC provider guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider#create-oidc-clients) lists the six clients Camunda needs. Create each one as follows.

### pingfederate

For each confidential client (Management Identity, Optimize, Orchestration Cluster, Web Modeler API):

1. Go to **Applications > OAuth Clients > Create Client**.
2. Set a descriptive **Client ID** (for example, `camunda-identity`).
3. Under **Client Authentication**, select **Client Secret** and generate a secret. Record the value.
4. Under **Redirect URIs**, add the component's redirect URI from the [redirect URI table](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider#redirect-uri-table). Skip this for Web Modeler API, which uses client credentials only.
5. Under **Grant Types**, select **Authorization Code** (skip for Web Modeler API; select **Client Credentials** instead).
6. Under **Scopes Allowed**, add `openid`, `profile`, `email`, `offline_access`.
7. Save the client.

For the two public clients (Web Modeler UI, Console), create a client the same way but without a client secret, using whichever public/PKCE client type your PingFederate version supports.

### pingone

For each confidential client:

1. Go to **Connections > Applications > Add Application > OIDC Web App**.
2. Set the application name and save.
3. Under **Configuration**, set the redirect URI from the [redirect URI table](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider#redirect-uri-table).
4. Under **Resources**, grant the `openid`, `profile`, and `email` scopes.
5. Under **Configuration > Token Endpoint Auth Method**, select **Client Secret Post** or **Client Secret Basic**.
6. Note the **Client ID** and **Client Secret** from the **Configuration** tab.

For Web Modeler API, add a **Worker** (machine-to-machine) application instead, and note its client ID and secret.

For the two public clients, add an application using PingOne's public/native client type.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/ping-identity
