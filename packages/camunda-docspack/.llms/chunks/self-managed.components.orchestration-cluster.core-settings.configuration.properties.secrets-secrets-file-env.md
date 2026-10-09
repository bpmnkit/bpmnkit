# Property reference — Secrets — secrets-file-env

| Property                                | Description                                                                                                                                                                                             | Default value          | Overridable per Physical Tenant |
| :-------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------- | :------------------------------ |
| `CAMUNDA_SECRETS_STORES_FILE_<id>_PATH` | Path to the directory backing this file-based secret store, once the store is declared. Each file in the directory is one secret: the file name is the secret name and the file contents are the value. | `/etc/camunda/secrets` | Yes                             |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
