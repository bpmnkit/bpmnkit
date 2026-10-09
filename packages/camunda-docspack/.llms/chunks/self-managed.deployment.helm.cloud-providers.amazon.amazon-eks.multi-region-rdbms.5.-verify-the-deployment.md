# Multi-region setup with RDBMS (EKS) — 5. Verify the deployment

Verify that every broker joined and that the partition distribution matches the zone list:

```bash
./check-cluster-topology.sh
```

See the check-cluster-topology.sh script
```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-multi-region-rdbms/procedure/check-cluster-topology.sh
```

Expect roughly 10 minutes for the Zeebe cluster to converge across regions. At this point, a healthy two-zone cluster reports four brokers, six partitions, and a replication factor of four.

Measure the cost of the write path from each region to the database writer. Regions that are not co-located with the writer pay the inter-region round trip on every export flush. That number tells you whether the exporter queue is sized correctly:

```bash
./measure-rdbms-latency.sh
```

See the measure-rdbms-latency.sh script
```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-multi-region-rdbms/procedure/measure-rdbms-latency.sh
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms
