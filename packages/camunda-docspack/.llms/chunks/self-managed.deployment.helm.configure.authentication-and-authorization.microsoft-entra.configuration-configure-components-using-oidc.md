# Set up the Helm chart with an external Microsoft Entra tenant — Configuration — Configure components using OIDC

With the OIDC clients and cluster secrets in place, configure OAuth and OIDC for the components. You can skip components you don’t plan to run. Keep in mind that the Orchestration Cluster and Connectors are enabled by default, so you must explicitly disable them if not needed.

#### Global configuration

Start with the following global configuration, which provides defaults for all components:

```yaml
global:
  identity:
    auth:
      enabled: true
      issuer: https://login.microsoftonline.com/<tenant id>/v2.0
      issuerBackendUrl: https://login.microsoftonline.com/<tenant id>/v2.0
      authUrl: https://login.microsoftonline.com/<tenant id>/oauth2/v2.0/authorize
      tokenUrl: https://login.microsoftonline.com/<tenant id>/oauth2/v2.0/token
      jwksUrl: https://login.microsoftonline.com/<tenant id>/discovery/v2.0/keys
      type: "MICROSOFT"
  security:
    authentication:
      method: oidc
```

Replace `<tenant id>` with your Microsoft Entra tenant ID.
You’ll use this convention throughout the rest of this guide.

#### Configure Orchestration Cluster

Add the following configuration for the Orchestration Cluster:

```yaml
orchestration:
  security:
    authentication:
      oidc:
        clientId: "<oc-app-id>"
        audience: "<oc-app-id>"
        usernameClaim: preferred_username
        clientIdClaim: azp
        preferUsernameClaim: true
        redirectUrl: "<OC_URL>"
        scope:
          - openid
          - profile
          - offline_access
          - "<oc-app-id>/.default"
        secret:
          existingSecret: "entra-credentials"
          existingSecretKey: "orchestration-cluster-client-secret"
    initialization:
      defaultRoles:
        admin:
          users:
            - "<the email address of your initial admin user>"
        connectors:
          clients:
            - "<oc-app-id>"
  env:
    - name: CAMUNDA_SECURITY_AUTHENTICATION_OIDC_USER_INFO_ENABLED
      value: "false"
    - name: SERVER_MAX_HTTP_REQUEST_HEADER_SIZE
      value: "65536"
```

Replace `<OC_URL>` with the base URL of the Orchestration Cluster as it will be reachable from your users’ browsers.
For local deployment, this is `http://localhost:8080`.

The two environment variables above are both required with Entra. Neither has a dedicated Helm value, so both are passed through `orchestration.env` as Spring Boot properties (`camunda.security.authentication.oidc.user-info-enabled` and `server.max-http-request-header-size`).

`CAMUNDA_SECURITY_AUTHENTICATION_OIDC_USER_INFO_ENABLED` must be `false`. By default, the Orchestration Cluster calls the OIDC userinfo endpoint after authentication to augment token claims. Entra hosts its userinfo endpoint on Microsoft Graph (`graph.microsoft.com/oidc/userinfo`) rather than on the authorization server, and it requires a Graph API access token instead of the OIDC access token Camunda holds, so the call fails. Setting this variable to `false` tells the Orchestration Cluster to rely on the claims already present in the token. This is also Microsoft's recommendation, since the ID token is a superset of what userinfo returns.

`SERVER_MAX_HTTP_REQUEST_HEADER_SIZE` raises the maximum header size to 64 KB. Microsoft's authorization codes are longer than those issued by most other providers. Combined with session cookies from an existing session, the total HTTP header size can exceed Tomcat's 8 KB default, which causes a plain Tomcat HTTP 400 error page before Spring Security processes the request. See [Request header is too large](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/troubleshooting-oidc#request-header-is-too-large) if you hit this after deploying.

`usernameClaim` defines which claim in the access token identifies the user.
`clientIdClaim` defines which claim identifies the calling client.
By default:

- `preferred_username` carries the user’s email address.
- `azp` carries the client ID in Entra.

You can adjust these values if your organization uses different claim mappings.
For more information, see the [Orchestration Cluster OIDC configuration guide](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider#step-1-configure-the-oidc-client-id-claim).

**Note: Username display in Web Modeler (Helm)**
With Helm defaults, usernames are typically resolved from `preferred_username`. If you want Web Modeler to use the `name` claim instead (for example, to show display names), set `CAMUNDA_IDENTITY_USERNAMECLAIM=name` for the Web Modeler `restapi` environment.

See [Identity/Keycloak configuration](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#identity--keycloak).

#### Configure Connectors

Add the following configuration for Connectors:

```yaml
connectors:
  security:
    authentication:
      oidc:
        clientId: "<oc-app-id>"
        audience: "<oc-app-id>"
        tokenScope: "<oc-app-id>/.default"
        secret:
          existingSecret: "entra-credentials"
          existingSecretKey: "orchestration-cluster-client-secret"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/microsoft-entra
