# Property reference — System — `camunda.system.restore`

| Property                                        | Description                                                                                                                                                            | Default value                                  | Overridable per Physical Tenant |
| :---------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------- | :------------------------------ |
| `camunda.system.restore.validate-config`        | Controls whether the restore process validates its configuration (and restore setup) before running.                                                                   | `true`                                         | No                              |
| `camunda.system.restore.ignore-files-in-target` | Controls which files/folders are ignored when the restore app validates that the Zeebe data directory is “empty enough” before restoring. The property is a list type. | `[“lost+found”, “directory-initialized.json”]` | No                              |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
