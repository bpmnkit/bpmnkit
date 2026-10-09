# Helm chart dual-region operational procedure — Procedure — step1

#### Deploy Camunda 8 in the newly created region

| **Details**              | **Current state**                                                                                                                                             | **Desired state**                                                                                                                                                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Camunda 8**            | A standalone region with a fully functional Camunda 8 setup, including the Orchestration Cluster (Zeebe, Operate, Tasklist, Zeebe Gateway) and Elasticsearch. | Restore dual-region functionality by deploying Camunda 8 isolated to the Orchestration Cluster (Zeebe and Zeebe Gateway) and Elasticsearch in the newly restored region. Disable the standalone Schema Manager to prevent seeding Elasticsearch. |
| **Operate and Tasklist** | Operate and Tasklist are operational in the standalone region.                                                                                                | Keep Operate and Tasklist disabled in the restored region to avoid interference during the database backup and restore process. They will also be disabled in the following steps for the surviving region.                                      |

#### Procedure

This step involves redeploying the recreated region using the same values files from the initial deployment.

The Helm command also disables Operate and Tasklist. These components will be re-enabled only after region recovery is complete. Disabling them prevents user confusion, since no visible updates will appear for their actions while the exporters remain disabled in the following steps.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
