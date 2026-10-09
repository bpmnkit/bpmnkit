# Helm chart dual-region operational procedure — Procedure — step1 (2)

2. Port-forward the Zeebe Gateway service to access the [Management REST API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway#managementserver):

   ```bash
   kubectl --context $CLUSTER_SURVIVING port-forward services/$CAMUNDA_RELEASE_NAME-zeebe-gateway 9600:9600 -n $CAMUNDA_NAMESPACE_SURVIVING
   ```

3. Based on the [Cluster Scaling APIs](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/cluster-scaling), send a request to the Zeebe Gateway to redistribute load to the remaining brokers and remove the lost ones.
   Depending on which region was lost, you must redistribute to either the even- or odd-numbered brokers. In this example, `region 1` was lost, along with the odd-numbered brokers. Therefore, the load is redistributed to the even-numbered brokers. Run the appropriate command for the surviving region to remove the lost brokers and trigger redistribution.
   Removing the lost (odd-numbered) brokers will automatically redistribute partitions to the remaining (even-numbered) brokers.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
