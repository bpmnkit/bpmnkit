# Storage isolation — Operational considerations — Migration scenarios

| Scenario         | Steps                                                                         |
| ---------------- | ----------------------------------------------------------------------------- |
| **Add tenant**   | Create storage backend → Validate connectivity → Add config → Rolling restart |
| **Consolidate**  | Backup source → Create new backend → Update config → Restore → Verify         |
| **Split tenant** | Plan data distribution → Backup → Create stores → Restore to each → Restart   |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation
