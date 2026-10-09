# Upgrade Helm chart — Upgrade notes — Web Modeler restapi ephemeral volume

Patched 8.10 charts replace the chart-managed shared persistent volume claim (PVC) for the Web Modeler `restapi` component with a per-pod ephemeral volume. The shared PVC (`<release>-webmodeler-data`) is removed from the chart. Kubernetes creates a dedicated PVC for each `restapi` pod when it starts and removes it when the pod terminates.

The `/tmp` directory backed by this ephemeral volume holds only scratch and cache data — Web Modeler content is stored in PostgreSQL, the document store, and Elasticsearch. **This is a safe change with no data loss risk.**

For most deployments, no action is required on upgrade. The following table shows what to expect based on your `webModeler.persistence` configuration:

| Setting                              | Upgrade behavior                                                                                                                                                                                                                                                                                                                                                                                                   |
| :----------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled: false` (default)           | No change. Your pod continues using `emptyDir`. No action required.                                                                                                                                                                                                                                                                                                                                                |
| `enabled: true`, no `existingClaim`  | `helm upgrade` succeeds unless `deploymentStrategy` is `Recreate`, which [requires `existingClaim`](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100#camunda-hub-recreate-strategy-requires-existingclaim). Each pod now uses a per-pod ephemeral PVC. The old `<release>-webmodeler-data` PVC is no longer managed by Helm and becomes orphaned. [Clean it up after upgrading](#clean-up-the-orphaned-pvc) if it exists. |
| `enabled: true`, `existingClaim` set | No change. Your pod continues mounting your existing PVC. No action required.                                                                                                                                                                                                                                                                                                                                      |

#### Clean up the orphaned PVC

If you previously set `webModeler.persistence.enabled: true` without `existingClaim`, an orphaned `<release>-webmodeler-data` PVC may exist in your namespace after upgrading. This PVC is no longer referenced by the chart and will not be deleted automatically.

**On cloud providers (GKE, EKS, AKS):** The old PVC was most likely in `Pending` state because the default `WaitForFirstConsumer` storage class defers disk provisioning until a pod is scheduled. If the `restapi` pod never reached a `Running` state, no disk was ever provisioned. The PVC can be safely deleted with no data loss.

**On on-premises clusters with `Immediate` binding:** A physical disk may have been provisioned when the PVC was created. Deleting the PVC releases the underlying disk. Since the volume only backed `/tmp` scratch content, no data is lost.

1. Confirm the `restapi` pod is running and ready before proceeding:

   ```bash
   kubectl get pods -n <namespace> | grep restapi
   ```

2. Check whether the orphaned PVC exists:

   ```bash
   kubectl get pvc -n <namespace> | grep webmodeler-data
   ```

3. If the PVC exists, delete it:

   ```bash
   kubectl delete pvc <release>-webmodeler-data -n <namespace>
   ```

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/index
