# Manage and review project snapshots — Restore a snapshot

Restoring a snapshot reverts the entire project to its state at the time the snapshot was created. This includes:

- Moving and renaming files and folders to their snapshot state.
- Soft-deleting files that were created after the snapshot.
- Restoring file instances that were deleted after the snapshot was created.
- Updating all file content to match the snapshot.

To restore a snapshot:

1. In your workspace, open a project.
2. On the right side of the project view, under **Project snapshots**, next to a snapshot, open the vertical ellipsis menu.
3. Select **Restore as latest**.

The project state changes to match the snapshot, and the snapshots timeline is refreshed.

### What happens during a project snapshot restore

A project snapshot restore is a single bulk operation, not a series of individual [file restores](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/versions#restore-a-version). It affects the project, its files, and any element templates differently:

- **The project snapshot itself**: if the project's live state has drifted from its most recent snapshot, a safety snapshot is created first to capture that state before restoring. If nothing has changed since the last snapshot, no safety snapshot is created.
- **Files that still exist in the project**: for each file that is still present (in its original location or elsewhere in the project), Camunda Hub moves and renames it back into place, then restores its content the same way as an individual file restore. A safety autosave entry captures the file's state just before the restore (only if it differs from the file's last saved entry), followed by a new "(restored)" entry with the snapshot's content.
- **Files that were moved out of the project or permanently deleted**: since there's no existing file to restore into, Camunda Hub creates a new file from the snapshot's content directly. This new file has no autosave step and no prior version history, since none of its own history exists yet.
- **Files that exist now but weren't part of the snapshot**: these are soft-deleted so the project matches the snapshot's file set.
- **Element templates**: element templates are handled differently depending on their state at the time of restore:
  - If a template is still in the project, its content is reset in place, and it's moved back to its recorded location. This does **not** publish a new numbered template version the way [restoring an element template directly](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/manage-element-templates#versioning-element-templates) does.
  - If a template was soft- or permanently deleted since the snapshot was created, the entire restore fails rather than recreating the template.
  - If a template is still live but was moved out of the project, it's skipped. Restoring it in place would conflict with whoever now manages it in its new location. Any BPMN element still referencing the template keeps a broken reference; this is an accepted trade-off.
  - If a template was added to the project after the snapshot was created, it's left in place rather than removed. Unlike other new files, it can't be safely reverted or removed, since it has its own independent versioning.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/project-versioning
