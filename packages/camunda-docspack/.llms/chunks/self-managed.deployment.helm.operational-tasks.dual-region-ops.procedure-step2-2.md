# Helm chart dual-region operational procedure — Procedure — step2

#### Deactivate Operate and Tasklist in the active region

| **Details**   | **Current State**                                                                                                                                    | **Desired State**                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Camunda 8** | The recovered region has been deployed with Operate and Tasklist disabled. Users can still access Operate and Tasklist through the surviving region. | Operate and Tasklist are turned off in the surviving region to avoid data loss during the backup procedure. |

#### How to get there

With the Orchestration Cluster, Operate and Tasklist are consolidated with the Zeebe Broker and Gateway into a single application.

Similar to `Step 1`, this step redeploys the active region using the same value files from the initial deployment.

Additionally, the Helm command disables Operate and Tasklist. These components will only be enabled at the end of the full region recovery again.

This step reduces the deployed application to the Zeebe Cluster and Elasticsearch only.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
