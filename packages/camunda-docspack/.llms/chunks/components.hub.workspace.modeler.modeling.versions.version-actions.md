# Manage file versions — Version actions

To act on an entry in the version history, open the entry's vertical ellipsis:

| Action              | Description                                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Restore**         | [Revert the file](#restore-a-version) to the content of this entry. Disabled when the entry already matches the current file. |
| **Edit**            | Update the name and description of the entry.                                                                                 |
| **Copy to project** | Create a new file from this entry in a project and folder you choose.                                                         |
| **Delete**          | [Permanently delete](#delete-a-version) the entry. Disabled for an entry with the **In a snapshot** badge.                    |

### Restore a version

The file content changes to the content of the restored version, and the version history is refreshed with up to two new entries:

- A safety autosave that captures the state of the file before the restore. This entry is only added if that state differs from the most recent saved entry.
- The restored entry, with `(restored)` appended to its name. This entry is selected in the viewer after the restore completes.

**Restore** is disabled when the content of the entry already matches the current file.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/versions
