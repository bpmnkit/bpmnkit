# Deploy an AKS cluster with Terraform (advanced) — 2. Preparation for Camunda 8 installation — Configure a high-performance StorageClass

Camunda 8 requires high IOPS for performance-critical components like **Zeebe**, so it is important to use Azure **PremiumV2** disks rather than the default `Standard_LRS`.

**Danger: Reclaim policy**
Using `reclaimPolicy: Delete` can cause **permanent data loss** if a PVC is deleted. Consider using `Retain` for production. See [troubleshooting](https://docs.camunda.io/docs/next/self-managed/operational-guides/troubleshooting#zeebe-data-loss-after-pvc-deletion) for details.

This step defines a custom `StorageClass` that:

- Uses **PremiumV2_LRS** Azure Managed Disks
- Sets a **`Retain`** reclaim policy to prevent data loss
- Uses `WaitForFirstConsumer` volume binding
- Becomes the default StorageClass for the cluster

#### Apply the StorageClass

Run the following script to apply the new storage class and set it as default:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/azure/kubernetes/aks-single-region/procedure/storageclass-configure.sh
```

To verify completion of the operation, run:

```bash
./procedure/storageclass-verify.sh
```

Show script procedure/storageclass-verify.sh

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/azure/kubernetes/aks-single-region/procedure/storageclass-verify.sh
```

This must be applied **before installing the Camunda Helm chart** so that PersistentVolumeClaims (PVCs) are provisioned with the correct performance characteristics.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/terraform-setup
