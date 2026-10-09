# RDBMS version support policy — JDBC driver policy

- Camunda supports the latest vendor-compatible JDBC driver for each supported RDBMS.
- You are responsible for providing JDBC drivers when required (for example, Oracle or MySQL).
- Driver versions are not pinned unless a specific version is required for compatibility or stability reasons.


## Component support matrix

This table shows RDBMS support status by component (including RDBMS as secondary storage where applicable):

| Component                 | Support status     | Notes                                                                                     |
| :------------------------ | :----------------- | :---------------------------------------------------------------------------------------- |
| Orchestration Cluster     | ✅ Fully supported | Supports RDBMS as secondary storage.                                                      |
| Tasklist UI               | ✅ Fully supported | All functionality available.                                                              |
| Operate UI                | ✅ Fully supported | All functionality available.                                                              |
| Optimize                  | ❌ Not supported   | Out of scope for RDBMS support.                                                           |
| Camunda Hub               | ✅ Fully supported | See [Hub database configuration](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/database). |
| Identity                  | ✅ Fully supported | All functionality available.                                                              |
| Management API (REST API) | ✅ Fully supported | All functionality available.                                                              |

**Note**
"Orchestration Cluster" refers to the secondary storage of the Orchestration Cluster. UI products are listed separately because their support status can differ by component.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy
