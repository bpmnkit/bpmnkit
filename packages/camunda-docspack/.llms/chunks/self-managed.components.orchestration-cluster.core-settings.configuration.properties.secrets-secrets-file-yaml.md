# Property reference — Secrets — secrets-file-yaml

| Property                                | Description                                                                                                                                                                                             | Default value          | Overridable per Physical Tenant |
| :-------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------- | :------------------------------ |
| `camunda.secrets.stores.file.<id>.path` | Path to the directory backing this file-based secret store, once the store is declared. Each file in the directory is one secret: the file name is the secret name and the file contents are the value. | `/etc/camunda/secrets` | Yes                             |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
