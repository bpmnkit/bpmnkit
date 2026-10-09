# Cluster scaling — Scale down — 4. Shut down the brokers when the scaling operation has completed

**Danger**
If you shut down brokers before Zeebe has scaled down and moved all partitions away from the brokers, scaling operation would never complete and may result in data loss.

```
kubectl scale statefulset <zeebe-statefulset> --replicas=3
```

When monitoring the pods via `kubectl get pods`, we can see that pods 3, 4, and 5 have been terminated.

```
camunda-zeebe-0                                        1/1     Running     0          9m55s
camunda-zeebe-1                                        1/1     Running     0          9m55s
camunda-zeebe-2                                        1/1     Running     0          9m50s

```

**Note**
After scaling down the statefulset, you may have to delete the PVCs manually.

#### Shut down brokers in a zone-aware cluster

On a zone-aware cluster, scale down the StatefulSet of the zone you scaled, once its scaling operation has completed:

```
kubectl scale statefulset <zone-a-statefulset> --replicas=3
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/cluster-scaling
