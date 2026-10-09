# Prepare for upgrade — Verify infrastructure compatibility

Review your infrastructure to confirm compatibility with Camunda 8.10.

| Area                                         | 8.10 requirement                                                                                                                       | Action                                                                                                                                                                    |
| :------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Secondary storage (Elasticsearch/OpenSearch) | Elasticsearch 8.19+ or 9.4+, OpenSearch 2.19+ or 3.6+. Elasticsearch 9.2 and 9.3, and OpenSearch 3.4 and 3.5, are no longer supported. | Upgrade the cluster to a supported version. Check the [supported environments](https://docs.camunda.io/docs/next/reference/supported-environments) matrix to confirm compatibility.                     |
| Secondary storage (RDBMS)                    | Supported vendor and version required for your selected component set.                                                                 | Check the [RDBMS support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy) and confirm any component-specific limitations before upgrading. |
| CPU/Memory                                   | Same consolidated Orchestration StatefulSet as 8.9.                                                                                    | No new requirements compared to 8.9.                                                                                                                                      |
| Storage                                      | Same or higher IOPS as 8.9.                                                                                                            | No change from 8.9.                                                                                                                                                       |

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/prepare-for-upgrade
