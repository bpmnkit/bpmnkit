# Helm chart dual-region operational procedure — Procedure — step8

#### Start Operate and Tasklist

| **Details**          | **Current state**                                                                                                          | **Desired state**                                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Camunda 8**        | Remains unreachable by end-users while dual-region functionality is being restored.                                        | Enable Operate and Tasklist in both the surviving and recreated regions to restore user interaction with Camunda 8. |
| **User interaction** | Users can interact with Zeebe cluster again. Dual-region functionality is restored, improving reliability and performance. | Users can fully utilize the Camunda 8 environment again.                                                            |

#### Procedure

**Info**

This step is executed at this stage because the application must be redeployed — all components run within the same Kubernetes pod. Performing it earlier would block the automatic rollout, as readiness only complete once Zeebe brokers have joined the cluster. Executing it prematurely would therefore require manual intervention.

Reapply or upgrade the Helm release to enable and deploy Operate and Tasklist.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
