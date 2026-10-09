# Helm chart dual-region operational procedure — Procedure

We use the same procedure to handle the loss of both active and passive regions. For clarity, this section focuses on the scenario where the passive region is lost while the active region remains operational. The same procedure will be valid in case of active region loss.

**Temporary Loss Scenario:** If a region loss is temporary — such as from transient network issues — Zeebe can handle this situation without initiating recovery procedures, provided there is sufficient free space on the persistent disk. However, processing may halt due to a loss of quorum during this time.

**Warning: Expect transient cross-region disruptions**
While cross-region connectivity and DNS converge, some failover and failback steps may take longer than expected or return transient errors, and Zeebe brokers may stay `Running` without becoming `Ready`. This is expected, not a failure. Follow the remediation steps below before treating a step as failed.

Failover and failback depend on cross-region network connectivity and DNS resolution between both regions. For example, Submariner `ServiceExport` resources and clusterset DNS on OpenShift, or VPC peering on Amazon EKS. While this connectivity converges, Zeebe brokers may stay `Running` without becoming `Ready` until they can resolve their peers in the other region.

If a step does not converge on the first attempt:

- Allow extra time for cross-region DNS and Zeebe quorum to stabilize before concluding the step has failed.
- Re-run the step. These procedures are idempotent.
- Restart any Zeebe broker that stays `Running` but never becomes `Ready`, so it can resolve its cross-region peers and rejoin the cluster.

#### Key steps to handle passive region loss

1. **Traffic rerouting:** Use DNS to reroute traffic to the surviving active region. (Details on managing DNS rerouting depend on your specific DNS setup and are not covered in this guide.)
2. **Failover phase:** Temporarily restores Camunda 8 functionality by removing the lost brokers and handling the export to the unreachable Elasticsearch instance.
3. **Failback phase:** Fully restores the failed region to its original functionality. This phase requires the region to be ready for the redeployment of Camunda 8.

**Caution**

For the failback procedure, the recreated region must not include any active Camunda 8 deployments or residual persistent volumes associated with Camunda 8 or its Elasticsearch instance. It is essential to initiate a clean deployment to prevent data replication and state conflicts.

**Info**

In the following examples, direct API calls are used because authentication methods may vary depending on your Admin configuration.

The **Management API** (default port `9600`) is not secured by default.

The **v2 REST API** (default port `8080`) **requires authentication**, described in the [API authentication guide](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-authentication).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
