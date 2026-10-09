# Deploy an EKS cluster with Terraform — 2. Preparation for Camunda 8 installation — Configure a high-performance StorageClass

Camunda 8 requires high IOPS for performance-critical components such as Zeebe. To achieve this, use AWS `gp3` volumes instead of the default `gp2`.

This step defines a custom `StorageClass` that:

- Uses `gp3` EBS volumes with optimized IOPS and throughput.
- Sets a `Retain` reclaim policy.
- Uses `WaitForFirstConsumer` volume binding.
- Becomes the default `StorageClass` for the cluster.

#### Apply the StorageClass

Run the following script to apply the new storage class and set it as default:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region/procedure/storageclass-configure.sh
```

To verify completion of the operation, run:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region/procedure/storageclass-verify.sh
```

You must apply the custom `StorageClass` before installing the Camunda Helm chart so that PersistentVolumeClaims (PVCs) are provisioned with the correct performance characteristics.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
