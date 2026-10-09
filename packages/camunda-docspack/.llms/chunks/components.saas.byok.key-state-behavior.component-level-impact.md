# Key state behavior — Component-level impact

| Component/feature      | Requires key for                | Behavior when key unavailable             |
| ---------------------- | ------------------------------- | ----------------------------------------- |
| **Zeebe brokers**      | State storage (encrypted disks) | Execution freezes; no read/write activity |
| **Elasticsearch**      | Persistent disk encryption      | Indexing and queries freeze               |
| **Backups**            | Encrypting/decrypting snapshots | Backup requests hang forever              |
| **Restore operations** | Decrypting snapshots            | Restore cannot proceed                    |
| **Document storage**   | Encrypting stored files         | Document reads/writes freeze              |
| **Suspend / resume**   | Changing cluster state          | Request is logged but not executed        |

---
Source: https://docs.camunda.io/docs/next/components/saas/byok/key-state-behavior
