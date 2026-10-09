# Property reference — Security — `camunda.security.authentication.oidc.assertion.keystore`

Configuration of the keystore used to build the client assertion for Bearer JWT client authentication.

**Note**
These properties apply only when `camunda.security.authentication.oidc.client-authentication-method` is set to `private_key_jwt`.

| Property                                                               | Description                                                       | Default value | Overridable per Physical Tenant |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------- | :------------------------------ |
| `camunda.security.authentication.oidc.assertion.keystore.path`         | Path to the `PKCS12` keystore.                                    |               | Yes                             |
| `camunda.security.authentication.oidc.assertion.keystore.password`     | Keystore password.                                                |               | Yes                             |
| `camunda.security.authentication.oidc.assertion.keystore.key-alias`    | Alias of the private key to be used to sign the client assertion. |               | Yes                             |
| `camunda.security.authentication.oidc.assertion.keystore.key-password` | Password of the private key.                                      |               | Yes                             |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
