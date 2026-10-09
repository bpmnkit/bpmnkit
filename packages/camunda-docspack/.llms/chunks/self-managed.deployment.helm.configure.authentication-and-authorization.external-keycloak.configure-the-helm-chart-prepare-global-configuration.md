# Set up the Helm chart with an external Keycloak instance — Configure the Helm chart — Prepare global configuration

Start with the following global configuration, which provides shared defaults across the deployment:

```yaml
global:
  identity:
    auth:
      enabled: true
      publicIssuerUrl: <KEYCLOAK_URL>/realms/<realm>
      issuerBackendUrl: <KEYCLOAK_URL>/realms/<realm>
      authUrl: <KEYCLOAK_URL>/realms/<realm>/protocol/openid-connect/auth
      tokenUrl: <KEYCLOAK_URL>/realms/<realm>/protocol/openid-connect/token
      jwksUrl: <KEYCLOAK_URL>/realms/<realm>/protocol/openid-connect/certs
  security:
    authentication:
      method: oidc
```

Replace `KEYCLOAK_URL` with your Keycloak base URL (in the format `<protocol>://<host/ip>:<port>/<context-path>`).

**Info**
In some setups, Keycloak is accessible through different URLs from within the cluster and from the user’s browser. This can happen, for example, if you deployed Keycloak inside your Kubernetes cluster but didn’t expose it under a domain name that’s accessible both internally and externally.

In this case:

- Set `global.identity.auth.publicIssuerUrl` and `global.identity.auth.authUrl` to the URL reachable from users' browsers.
- Set the remaining values to the URL reachable from within the cluster.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-keycloak
