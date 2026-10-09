# Restore a backup with the Restore Application (RDBMS) — 3. Restore Zeebe from its primary storage backup {#restore-zeebe} — Restore success or failure

If restore was successful, the app exits with the log message `Successfully restored broker from backup`.

However, the restore will fail if:

- There is no valid backup matching the secondary storage (the exporter position exceeds all available backups).
- There is no valid backup within the specified time range.
- The backup store is not configured correctly.
- The configured data directory is not empty.
- There is a gap in the backup range needed for restore (missing backups between the range start and the required checkpoint).
- The exporter position in the RDBMS is missing for one or more partitions (when using RDBMS-aware restore).
- Due to any other unexpected errors.

If the restore fails, you can re-run the application after fixing the root cause.

#### Data directory is not empty

If the data directory is not empty, the restore will fail with an error message:

```
Broker's data directory /usr/local/camunda/data is not empty. Aborting restore to avoid overwriting data. Please restart with a clean directory
```

On some filesystems, the data directory may contain special files and folders that can't or shouldn't be deleted. In such cases, the restore application can be configured to ignore the presence of these files and folders. The configuration option `zeebe.restore.ignoreFilesInTarget` takes a list of file and folder names to ignore. By default, it ignores the `lost+found` folder found on ext4 filesystems. To also ignore `.snapshot` folders, set `zeebe.restore.ignoreFilesInTarget: [".snapshot", "lost+found"]` or the equivalent environment variable `ZEEBE_RESTORE_IGNOREFILESINTARGET=".snapshot,lost+found"`.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-application
