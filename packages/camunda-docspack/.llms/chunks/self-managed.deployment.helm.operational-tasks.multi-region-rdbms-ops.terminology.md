# Multi-Region RDBMS operational procedure — Terminology

| Term          | Meaning                                                                                   |
| :------------ | :---------------------------------------------------------------------------------------- |
| Slot          | A position in the region list, numbered from `0`. Fixed when the cluster is bootstrapped. |
| Zone          | The Camunda-level name of a region, for example `london`. One zone per region.            |
| Active region | A slot that is actually deployed.                                                         |
| Writer        | The single database instance accepting writes from every region.                          |

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/multi-region-rdbms-ops
