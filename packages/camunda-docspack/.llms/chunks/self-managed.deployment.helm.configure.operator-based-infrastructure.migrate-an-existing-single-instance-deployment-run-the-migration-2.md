# Deploy required dependencies with Kubernetes operators — Migrate an existing single-instance deployment — Run the migration (2)

```bash
   kubectl drain <node> --ignore-daemonsets --delete-emptydir-data
   ```

   The first eviction attempt is still refused while the pod is the primary. CloudNativePG then switches over and the retry succeeds:

   ```text
   evicting pod camunda/pg-identity-1
   error when evicting pods/"pg-identity-1" -n "camunda" (will retry after 5s): Cannot evict pod as it would violate the pod's disruption budget.
   evicting pod camunda/pg-identity-1
   pod/pg-identity-1 evicted
   node/<node> drained
   ```

   Run `kubectl uncordon <node>` afterward, and the cluster returns to two ready instances.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
