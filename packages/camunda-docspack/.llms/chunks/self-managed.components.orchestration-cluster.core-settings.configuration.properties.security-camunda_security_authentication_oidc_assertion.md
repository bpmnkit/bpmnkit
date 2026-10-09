# Property reference — Security — `CAMUNDA_SECURITY_AUTHENTICATION_OIDC_ASSERTION`

Configuration options for the client assertion used in Bearer JWT client authentication.

**Note**
These properties apply only when `CAMUNDA_SECURITY_AUTHENTICATION_OIDC_CLIENTAUTHENTICATIONMETHOD` is set to `private_key_jwt`.
The `key` value refers to the private key ID used to sign the client assertion JWT.

| Property                                                            | Description                                                                | Default value | Overridable per Physical Tenant |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------- | :------------------------------ |
| `CAMUNDA_SECURITY_AUTHENTICATION_OIDC_ASSERTION_KIDSOURCE`          | Source for generating the key ID. Options: `CERTIFICATE`, `PUBLIC_KEY`.    | `PUBLIC_KEY`  | Yes                             |
| `CAMUNDA_SECURITY_AUTHENTICATION_OIDC_ASSERTION_KIDDIGESTALGORITHM` | Hash algorithm used to generate the key ID. Options: `SHA256`, `SHA1`.     | `SHA256`      | Yes                             |
| `CAMUNDA_SECURITY_AUTHENTICATION_OIDC_ASSERTION_KIDENCODING`        | Key ID encoding. Options: `BASE64URL`, `HEX`.                              | `BASE64URL`   | Yes                             |
| `CAMUNDA_SECURITY_AUTHENTICATION_OIDC_ASSERTION_KIDCASE`            | Key ID case. Only applicable to `HEX` encoding. Options: `UPPER`, `LOWER`. |               | Yes                             |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
