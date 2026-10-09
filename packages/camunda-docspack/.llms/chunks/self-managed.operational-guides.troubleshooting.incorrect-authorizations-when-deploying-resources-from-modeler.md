# Camunda components troubleshooting — Incorrect authorizations when deploying resources from Modeler

If you encounter missing or invalid authorizations when deploying resources or starting process instances from Camunda Hub or Desktop Modeler, review which credentials are being used:

- **Camunda Hub** deploys as your logged-in user, so ensure that your [user](https://docs.camunda.io/docs/next/components/admin/user) has the required permissions.
- **Desktop Modeler** uses the client credentials you provide, so ensure that your [client](https://docs.camunda.io/docs/next/components/admin/client) has the required permissions.


## Zeebe data loss after PVC deletion

If all Zeebe data is lost after a PersistentVolumeClaim (PVC) was deleted, the likely cause is that your StorageClass uses the `Delete` reclaim policy instead of `Retain`.

### Symptoms

- All process definitions and instances are gone
- Zeebe brokers start fresh with no historical data
- Secondary storage still has data, but Zeebe does not

### Root cause

- Your StorageClass has `reclaimPolicy: Delete` (the default in most Kubernetes distributions)
- A PVC was deleted (manually, by automation, or during cluster maintenance)
- Kubernetes automatically deleted the underlying PersistentVolume and all its data

### How to check your current configuration

```bash
# Check your StorageClass reclaim policy
kubectl get storageclass

# Look for the RECLAIMPOLICY column - it should show "Retain" for production workloads
NAME            PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE
gp3             ebs.csi.aws.com         Delete          WaitForFirstConsumer   # ❌ Problem
ebs-sc          ebs.csi.aws.com         Retain          WaitForFirstConsumer   # ✅ Correct
```

### Solution

1. **Create a new StorageClass with `Retain` policy** before deploying Camunda:

   ```yaml
   apiVersion: storage.k8s.io/v1
   kind: StorageClass
   metadata:
     name: camunda-storage
   provisioner: <your-provisioner> # e.g., ebs.csi.aws.com, disk.csi.azure.com
   reclaimPolicy: Retain
   volumeBindingMode: WaitForFirstConsumer
   ```

2. **For existing PersistentVolumes**, you can patch them to use `Retain`:

   ```bash
   kubectl patch pv <pv-name> -p '{"spec":{"persistentVolumeReclaimPolicy":"Retain"}}'
   ```

### Why this matters

For stateful applications like Zeebe that store critical business data, the `Retain` policy is the industry-standard best practice. This ensures that even if a PVC is accidentally deleted, the underlying data remains intact and can be recovered.

For more information, see the official Kubernetes documentation on [changing the reclaim policy of a PersistentVolume](https://kubernetes.io/docs/tasks/administer-cluster/change-pv-reclaim-policy/#why-change-reclaim-policy-of-a-persistentvolume).

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/troubleshooting
