# Cold Recovery

Cold recovery uses scheduled cross-region backups and a manual restore procedure to recover from complete primary-region loss.

<!-- Image source: https://miro.com/app/board/uXjVL-6SrPc=/ -->

Cold Recovery is Camunda's lowest-cost multi-region resilience configuration. It provides a documented, repeatable recovery path from complete primary-region loss using scheduled backups exported to cross-region object storage and a manual restore procedure into a secondary region.

Cold Recovery is suited for production workloads in which recovery measured in hours is operationally acceptable.

| Consideration                        | Value                                            |
| :----------------------------------- | :----------------------------------------------- |
| **Recovery time (RTO)**              | ~1–4 hours (operator and environment dependent)  |
| **Data loss (RPO)**                  | 15 minutes – 4 hours (backup-interval dependent) |
| **Failover mode**                    | Manual, operator-initiated                       |
| **Standing second region required?** | No. Restore into a newly provisioned region      |

**Important**
Cold Recovery [RTO](https://docs.camunda.io/docs/next/reference/glossary#recovery-time-objective-rto) and [RPO](https://docs.camunda.io/docs/next/reference/glossary#recovery-point-objective-rpo) depends on data volume, backup frequency, operator familiarity with the restore procedure, and the speed at which a secondary region can be provisioned. The ranges above are planning targets, not contractual commitments.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/cold-recovery
