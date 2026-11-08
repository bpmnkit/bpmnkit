# Restore a backup with the Restore Application — 2. Restore the Zeebe cluster {#restore-zeebe-cluster} — Restore success or failure

If restore was successful, the app exits with the log message `Successfully restored broker from backup`.

However, the restore will fail if:

- There is no valid backup with the given backupId.
- The backup store is not configured correctly.
- The configured data directory is not empty.
- Due to any other unexpected errors.

If the restore fails, you can re-run the application after fixing the root cause.

#### Data directory is not empty

If the data directory is not empty, the restore will fail with an error message:

```
Broker's data directory /usr/local/camunda/data is not empty. Aborting restore to avoid overwriting data. Please restart with a clean directory
```

On some filesystems, the data directory may contain special files and folders that can't or shouldn't be deleted. In such cases, the restore application can be configured to ignore the presence of these files and folders. The configuration option `camunda.system.restore.ignore-files-in-target` (environment variable `CAMUNDA_SYSTEM_RESTORE_IGNOREFILESINTARGET`) takes a list of file and folder names to ignore. By default, it ignores the `lost+found` folder found on ext4 filesystems and the `directory-initialized.json` file. Setting the option replaces the default list, so keep the default entries you still need. To also ignore `.snapshot` folders, set `camunda.system.restore.ignore-files-in-target: [".snapshot", "lost+found", "directory-initialized.json"]` or the equivalent environment variable `CAMUNDA_SYSTEM_RESTORE_IGNOREFILESINTARGET=".snapshot,lost+found,directory-initialized.json"`.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-application
