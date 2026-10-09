# Configuration variables — License configuration

See [licensing](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/licensing).


## OIDC configuration

Claims are name/value pairs used to represent an individual identity. Configure your initial claim and value to match the claim used with your OIDC provider.

For example, to use your Microsoft Entra unique account ID, set `IDENTITY_INITIAL_CLAIM_NAME` to `oid`, and `IDENTITY_INITIAL_CLAIM_VALUE` to the ID.

**Caution**
Once set, you cannot update your initial claim name and value using environment or Helm values. You must change these values directly in the database.

| Environment variable           | Description                                                                                                                                     | Default value |
| :----------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- | :------------ |
| `IDENTITY_INITIAL_CLAIM_NAME`  | The type of claim to use for the initial user. Examples can include `oid`, `name` or `email`.                                                   | `oid`         |
| `IDENTITY_INITIAL_CLAIM_VALUE` | The value of the claim to use for the initial user. For the default `oid`, the value usually corresponds to the unique ID of your user account. |               |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/configuration-variables
