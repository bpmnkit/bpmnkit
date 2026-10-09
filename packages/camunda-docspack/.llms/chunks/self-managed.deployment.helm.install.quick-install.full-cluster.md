# Install Camunda with Helm for development — Full Cluster

To deploy the full Camunda 8 platform with all components (Optimize, Web Modeler, Console, Management Identity, and Keycloak), follow our [kind tutorial](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind). The full deployment requires OIDC-based authentication and [deploying required dependencies with Kubernetes operators](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure) for PostgreSQL, Elasticsearch, and Keycloak.


## Troubleshoot installation issues

### A pod stays in `Pending` state

**Observed behavior:** `kubectl get pods` shows a pod stuck in `Pending` and it never starts.

**Why this happens:** The scheduler couldn't place the pod onto any node, most often because the cluster doesn't have enough CPU, memory, or persistent volume capacity to satisfy the pod's requests.

**How to fix:**

1. Check the scheduler's reason for the pending pod:
   ```shell
   kubectl describe pods <POD_NAME>
   ```
2. Look for `Events` entries such as `Insufficient cpu`, `Insufficient memory`, or an unbound `PersistentVolumeClaim`.
3. Add node capacity, or reduce resource requests in your values file, to match what's actually available.

### A pod is running but never becomes ready

**Observed behavior:** `kubectl get pods` shows a pod in `Running` state, but it doesn't reach `Ready`, or it restarts repeatedly.

**Why this happens:** The container starts but fails its readiness or liveness probe, commonly due to a misconfiguration (wrong database URL, missing secret) or a dependency (secondary storage, Keycloak) that isn't available yet.

**How to fix:**

1. Check the container's logs for the actual error:
   ```shell
   kubectl logs -f <POD_NAME>
   ```
2. If the pod is restarting, check the log from the previous crashed instance:
   ```shell
   kubectl logs <POD_NAME> --previous
   ```
3. Cross-reference the error against your values file for the affected component.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install
