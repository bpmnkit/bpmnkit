# Property reference — System — `CAMUNDA_SYSTEM_RESTORE`

| Property                                     | Description                                                                                                                                                            | Default value                                  | Overridable per Physical Tenant |
| :------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------- | :------------------------------ |
| `CAMUNDA_SYSTEM_RESTORE_VALIDATECONFIG`      | Controls whether the restore process validates its configuration (and restore setup) before running.                                                                   | `true`                                         | No                              |
| `CAMUNDA_SYSTEM_RESTORE_IGNOREFILESINTARGET` | Controls which files/folders are ignored when the restore app validates that the Zeebe data directory is “empty enough” before restoring. The property is a list type. | `[“lost+found”, “directory-initialized.json”]` | No                              |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
