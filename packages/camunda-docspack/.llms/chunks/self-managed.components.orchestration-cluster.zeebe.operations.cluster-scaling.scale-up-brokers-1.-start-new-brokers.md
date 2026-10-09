# Cluster scaling — Scale up brokers — 1. Start new brokers

If you have deployed Zeebe using [Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install), you can start new brokers by using the `kubectl scale` command. Otherwise, refer to the corresponding installation methods on how to start a new broker.

```
kubectl scale statefulset camunda --replicas=6
```

You can see new pods being created when running `kubectl get pods`. The new brokers will be assigned ids `3`, `4`, and `5` respectively.

```
camunda-zeebe-0                                        1/1     Running    0          3m24s
camunda-zeebe-1                                        1/1     Running    0          3m24s
camunda-zeebe-2                                        1/1     Running    0          3m24s
camunda-zeebe-3                                        0/1     Init:0/1   0          11s
camunda-zeebe-4                                        0/1     Init:0/1   0          11s
camunda-zeebe-5                                        0/1     Init:0/1   0          11s
```

**Info: Starting brokers in a zone-aware cluster**
On a [zone-aware cluster](#broker-id-naming-scheme), each zone is a separate StatefulSet, so you need to scale brokers in each zone.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/cluster-scaling
