# Special OIDC configuration cases — Use the Bearer JWT client authentication method

In environments that require additional security, you can configure the Orchestration Cluster backend to use the Bearer JWT client authentication method, **private key JWT**, instead of the standard client ID and secret method.

With this approach, no client secret is used as a credential. Instead, a client assertion JWT is generated and signed using the client’s certificate.
For more details on the private key JWT authentication method, refer to [OAuth 2.0 Private Key JWT](https://oauth.net/private-key-jwt/).

The OIDC client credentials flow continues to operate normally, the only difference is the type of client credentials used to authenticate with the IdP. Consult your IdP’s documentation for instructions on configuring private key JWT. For example, see [Keycloak documentation](https://www.keycloak.org/securing-apps/authz-client#_client_authentication_with_signed_jwt).

Below is the minimal required client credential configuration when using the private key JWT method. Note the absence of `clientSecret`:

```yaml
camunda:
  security:
    authentication:
      oidc:
        clientId: <YOUR_CLIENTID>
        clientAuthenticationMethod: private_key_jwt
        assertion:
          keystore:
            path: <YOUR_KEYSTORE_LOCATION>
            password: <YOUR_KEYSTORE_LOCATION>
            keyAlias: <YOUR_PRIVATE_KEY_ALIAS>
            keyPassword: <YOUR_PRIVATE_KEY_PASSWORD>
```

A comprehensive list of available configuration properties can be found in [OIDC configuration reference](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#camundasecurityauthenticationoidc).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/special-oidc-cases
