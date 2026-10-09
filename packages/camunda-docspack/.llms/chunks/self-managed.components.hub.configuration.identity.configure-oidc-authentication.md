# Authentication — Configure OIDC authentication

Camunda Hub uses the following settings to validate tokens and identify users:

### application.yaml

```yaml
camunda:
  security:
    authentication:
      oidc:
        issuer-uri: https://keycloak.example.com/auth/realms/camunda-platform
        client-id: web-modeler
        username-claim: oid # optional, default: sub
        audiences: web-modeler-api,web-modeler-public-api # optional
```

### env

| Environment variable                                 | Description                                                                                                                                                                                                                    | Example value                                               | Default value |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ------------- |
| `CAMUNDA_SECURITY_AUTHENTICATION_OIDC_ISSUERURI`     | URL of the token issuer, used for JWT validation. Individual endpoints are fetched from the provider's [well-known configuration endpoint](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig).         | `https://keycloak.example.com/auth/realms/camunda-platform` | -             |
| `CAMUNDA_SECURITY_AUTHENTICATION_OIDC_CLIENTID`      | Client ID of the Camunda Hub application configured in your identity provider.                                                                                                                                                 | `web-modeler`                                               | -             |
| `CAMUNDA_SECURITY_AUTHENTICATION_OIDC_USERNAMECLAIM` | [optional]The JWT claim that identifies a user.                                                                                                                                                                           | `oid`                                                       | `sub`         |
| `CAMUNDA_SECURITY_AUTHENTICATION_OIDC_AUDIENCES`     | [optional]Comma-separated list of accepted audience claim values, used for JWT validation. Includes the audiences for both user access tokens and the [public Camunda Hub API](https://docs.camunda.io/docs/next/apis-tools/hub-api-sm/authentication). | `web-modeler-api,web-modeler-public-api`                    | -             |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/identity
