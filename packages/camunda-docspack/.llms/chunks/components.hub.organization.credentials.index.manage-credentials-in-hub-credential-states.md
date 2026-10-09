# Manage credentials — Manage credentials in Hub — Credential states

The **Managed in Hub** tab shows a state for each credential. Hub checks the state in the background after the list loads, so a state can take a moment to appear. Refresh the list to check again.

| State        | Meaning                                                                                                                                       |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Active       | The credential is deployed to every environment you selected, and every secret it references exists on the clusters that host them.           |
| Warning      | The credential is deployed to at least one environment, but it is missing from another environment, or a secret it references does not exist. |
| Not deployed | The credential is not present in any environment. Drafts always have this state.                                                              |

A credential in the **Warning** state is still deployed. Processes that use it can fail at runtime if the missing secret or environment is the one they rely on.

The secret check behind these states is cluster-wide, so a credential can read **Active** while a secret it references doesn't resolve in one of its environments. On a cluster with Physical Tenants, each Physical Tenant needs its own secret store. See [secret resolution](https://docs.camunda.io/docs/next/components/concepts/secret-resolution).

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/credentials/index
