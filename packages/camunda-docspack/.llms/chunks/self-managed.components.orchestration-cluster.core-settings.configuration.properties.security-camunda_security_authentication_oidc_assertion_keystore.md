# Property reference — Security — `CAMUNDA_SECURITY_AUTHENTICATION_OIDC_ASSERTION_KEYSTORE`

Configuration of the keystore used to build the client assertion for Bearer JWT client authentication.

**Note**
These properties apply only when `CAMUNDA_SECURITY_AUTHENTICATION_OIDC_CLIENTAUTHENTICATIONMETHOD` is set to `private_key_jwt`.

| Property                                                              | Description                                                       | Default value | Overridable per Physical Tenant |
| --------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------- | :------------------------------ |
| `CAMUNDA_SECURITY_AUTHENTICATION_OIDC_ASSERTION_KEYSTORE_PATH`        | Path to the `PKCS12` keystore.                                    |               | Yes                             |
| `CAMUNDA_SECURITY_AUTHENTICATION_OIDC_ASSERTION_KEYSTORE_PASSWORD`    | Keystore password.                                                |               | Yes                             |
| `CAMUNDA_SECURITY_AUTHENTICATION_OIDC_ASSERTION_KEYSTORE_KEYALIAS`    | Alias of the private key to be used to sign the client assertion. |               | Yes                             |
| `CAMUNDA_SECURITY_AUTHENTICATION_OIDC_ASSERTION_KEYSTORE_KEYPASSWORD` | Password of the private key.                                      |               | Yes                             |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
