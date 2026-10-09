# Bring your own groups — Prerequisites

- A Self-Managed Camunda 8 deployment running 8.8 or later.
- OIDC authentication configured for the Orchestration Cluster. See [connect to an external identity provider](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider).
- An IdP that can include a groups claim in the issued ID or access token. The claim value must be a JSON array of strings, where each string is a group ID.


## Configure the groups claim

Set `camunda.security.authentication.oidc.groups-claim` to the name of the claim that contains the user's groups. The claim value must be a JSON array of strings, where each entry is a group ID.

For nested claims, use a [JSONPath expression](https://www.rfc-editor.org/rfc/rfc9535.html) — the same mechanism used by `username-claim`. For example, `$['camundaorg']['groups']` resolves to the `groups` array inside a nested `camundaorg` object.

### yaml

```yaml
camunda.security.authentication.oidc.groups-claim: <YOUR_GROUPS_CLAIM>
```

### env

```
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_GROUPSCLAIM=<YOUR_GROUPS_CLAIM>
```

See the [`groupsClaim` configuration reference](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties) for the full property definition. For multi-IdP setups where each provider may use a different claim name, see [connect multiple identity providers](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-multiple-identity-providers).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/bring-your-groups
