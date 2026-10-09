# Set up the Helm chart with an external Microsoft Entra tenant — Configure machine-to-machine (M2M) API access

Job workers, Connectors, and other applications that call the Orchestration Cluster REST or gRPC API without a user present use the OAuth client credentials grant instead of interactive login.

In this section, you register a dedicated Entra application for M2M access and configure a Camunda client to use it.

For the general, provider-agnostic explanation of this flow, see [machine-to-machine (M2M) API access](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider#machine-to-machine-m2m-api-access).

### Register an M2M application in Entra

1. In the Entra ID admin center, [register a new application](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app) for your job worker or Connector. You do not need to configure a redirect URI or a platform type, since this application never redirects a user's browser.
1. On the application's **Overview** page, note the **Client ID**. This value is your M2M client's `clientId`.
1. [Create a new client secret](https://learn.microsoft.com/en-gb/entra/identity-platform/quickstart-register-app?tabs=client-secret#add-credentials) and record the secret **value**.
1. Confirm the application supports the `client_credentials` grant type. This is enabled by default; see [Ensure Entra prerequisites](#ensure-entra-prerequisites).
1. Grant the application access to the Orchestration Cluster API. Reuse the `<oc-app-id>/.default` scope from the Orchestration Cluster app registration, or [expose an API permission](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-configure-app-expose-web-apis) specific to your M2M client and grant admin consent for it.

### Configure the Camunda client

Configure your job worker, Connector runtime, or custom application to request tokens from Entra using client credentials. Camunda clients (the Java client, the Spring Boot starter, and the Connector runtime) read these settings from `CAMUNDA_CLIENT_AUTH_*` environment variables or the equivalent `camunda.client.auth.*` properties:

```
CAMUNDA_CLIENT_AUTH_METHOD=oidc
CAMUNDA_CLIENT_AUTH_CLIENTID=<m2m-app-id>
CAMUNDA_CLIENT_AUTH_CLIENTSECRET=<m2m-app-secret>
CAMUNDA_CLIENT_AUTH_TOKENURL=https://login.microsoftonline.com/<tenant id>/oauth2/v2.0/token
CAMUNDA_CLIENT_AUTH_AUDIENCE=<oc-app-id>
CAMUNDA_CLIENT_AUTH_SCOPE=<oc-app-id>/.default
```

```yaml
camunda:
  client:
    auth:
      method: oidc
      client-id: <m2m-app-id>
      client-secret: <m2m-app-secret>
      token-url: https://login.microsoftonline.com/<tenant id>/oauth2/v2.0/token
      audience: <oc-app-id>
      scope: <oc-app-id>/.default
```

Replace `<oc-app-id>` with the Orchestration Cluster application's client ID from [Create applications in Entra](#create-applications-in-entra), and `<tenant id>` with your Microsoft Entra tenant ID.

**Note**
For the client credentials flow, request the `<oc-app-id>/.default` scope. This tells Entra to issue a token for the statically configured application permissions on the API rather than the delegated permissions used during interactive login.

The Orchestration Cluster identifies this client using the `azp` claim, configured as `clientIdClaim: azp` in [Configure Orchestration Cluster](#configure-orchestration-cluster). By default, requests from this client can only retrieve the cluster topology. To grant it access to other APIs, [configure authorizations](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations) for its client ID.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/microsoft-entra
