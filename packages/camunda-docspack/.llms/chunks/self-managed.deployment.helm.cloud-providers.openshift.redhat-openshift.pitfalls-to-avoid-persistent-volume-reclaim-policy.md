# Red Hat OpenShift — Pitfalls to avoid — Persistent volume reclaim policy

OpenShift StorageClasses often default to a `Delete` reclaim policy, which means persistent volume data is permanently deleted when a PVC is removed. This can lead to complete and unrecoverable data loss for Orchestration Cluster brokers.

Ensure your StorageClass uses a `Retain` reclaim policy for production deployments. Verify your configuration:

```bash
oc get storageclass
# RECLAIMPOLICY should show "Retain", not "Delete"
```

For more details, including accepted alternatives to a cluster-wide `Retain` policy, see the [production install guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index#persistent-volume-reclaim-policy).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
