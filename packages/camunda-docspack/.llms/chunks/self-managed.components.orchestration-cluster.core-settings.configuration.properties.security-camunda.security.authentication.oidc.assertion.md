# Property reference — Security — `camunda.security.authentication.oidc.assertion`

Configuration options for the client assertion used in Bearer JWT client authentication.

**Note**
These properties apply only when `camunda.security.authentication.oidc.client-authentication-method` is set to `private_key_jwt`.
The `key` value refers to the private key ID used to sign the client assertion JWT.

| Property                                                              | Description                                                                | Default value | Overridable per Physical Tenant |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------- | :------------------------------ |
| `camunda.security.authentication.oidc.assertion.kid-source`           | Source for generating the key ID. Options: `CERTIFICATE`, `PUBLIC_KEY`.    | `PUBLIC_KEY`  | Yes                             |
| `camunda.security.authentication.oidc.assertion.kid-digest-algorithm` | Hash algorithm used to generate the key ID. Options: `SHA256`, `SHA1`.     | `SHA256`      | Yes                             |
| `camunda.security.authentication.oidc.assertion.kid-encoding`         | Key ID encoding. Options: `BASE64URL`, `HEX`.                              | `BASE64URL`   | Yes                             |
| `camunda.security.authentication.oidc.assertion.kid-case`             | Key ID case. Only applicable to `HEX` encoding. Options: `UPPER`, `LOWER`. |               | Yes                             |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
