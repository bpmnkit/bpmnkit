# Gateway configuration — Configuration — zeebe.gateway.cluster.security.authentication.identity

**Note**
The Zeebe configuration properties for Camunda Identity are deprecated as of version `8.4.0`. Use the dedicated
Camunda Identity properties or the [corresponding environment variables](https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/configuration-variables#core-configuration).

| Field            | Description                                                                                                                                                                                          | Example value                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| issuerBackendUrl | The URL to the auth provider backend, used to validate tokens. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_SECURITY_AUTHENTICATION_IDENTITY_ISSUERBACKENDURL`. | http://keycloak:18080/auth/realms/camunda-platform |
| audience         | The required audience of the auth token. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_SECURITY_AUTHENTICATION_IDENTITY_AUDIENCE`.                               | zeebe-api                                          |
| type             | The identity auth type to apply, one of `keycloak` or `auth0`. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_SECURITY_AUTHENTICATION_IDENTITY_TYPE`.             | keycloak                                           |
| baseUrl          | The URL to the Identity instance. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_SECURITY_AUTHENTICATION_IDENTITY_BASEURL`.                                       | http://identity:8084                               |

#### YAML snippet

```yaml
security:
  authentication:
    mode: identity
    identity:
      issuerBackendUrl: http://keycloak:18080/auth/realms/camunda-platform
      audience: zeebe-api
      type: keycloak
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway
