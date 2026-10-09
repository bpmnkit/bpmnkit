# Deploy required dependencies with Kubernetes operators — Migrate an existing single-instance deployment — Before you start

| Check                 | Why it matters                                                                                                                          |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Two schedulable nodes | The second instance is only useful on another node, and the drain you are enabling needs somewhere to move the primary.                 |
| Free storage          | The existing instance gains a WAL volume and a second instance is created with both. With the defaults, that is 25 Gi more per cluster. |
| A current backup      | The migration is in place and keeps your volume, so an unrelated failure during it has no second copy to fall back on.                  |
| Cluster is healthy    | Run `kubectl get cluster -n $CAMUNDA_NAMESPACE` and confirm the phase is `Cluster in healthy state` before changing anything.           |

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
