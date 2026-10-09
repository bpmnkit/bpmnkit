# Deploy an EKS cluster with eksctl — 2. EKS cluster — Check existing StorageClasses

We recommend using **gp3** volumes with Camunda 8 (see [volume performance](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/amazon-eks#volume-performance)). It may be necessary to create the `gp3` StorageClass, as the default configuration only includes **gp2**. For detailed information, refer to the [AWS documentation](https://aws.amazon.com/ebs/general-purpose/).

**Danger: Reclaim policy**
Using `reclaimPolicy: Delete` can cause **permanent data loss** if a PVC is deleted. Consider using `Retain` for production. See [troubleshooting](https://docs.camunda.io/docs/next/self-managed/operational-guides/troubleshooting#zeebe-data-loss-after-pvc-deletion) for details.

To see the available StorageClasses in your Kubernetes cluster, including which one is set as default, use the following command:

```bash
kubectl describe storageclass
```

To check if `gp3` is set as the default StorageClass, look for the annotation `storageclass.kubernetes.io/is-default-class: "true"` in the output of the previous command.

If `gp3` is not installed, or is not set as the default StorageClass, complete the following steps to install it and set it as default:

1. Create the `gp3` StorageClass:

   ```shell
   cat << EOF | kubectl apply -f -
   ---
   apiVersion: storage.k8s.io/v1
   kind: StorageClass
   metadata:
     name: ebs-sc
     annotations:
       storageclass.kubernetes.io/is-default-class: "true"
   provisioner: ebs.csi.aws.com
   parameters:
     type: gp3
   reclaimPolicy: Retain  # CRITICAL: Prevents data loss when PVCs are deleted
   volumeBindingMode: WaitForFirstConsumer
   EOF
   ```

   This manifest defines an `ebs-sc` StorageClass to be created. This StorageClass uses the `ebs.csi.aws.com` provisioner, which is supplied by the **aws-ebs-csi-driver** addon installed during cluster creation. For more information, refer to the [official AWS documentation](https://docs.aws.amazon.com/eks/latest/userguide/ebs-csi.html).

2. Modify the `gp2` StorageClass to mark it as a non-default StorageClass:

   ```shell
   kubectl patch storageclass gp2 -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}'
   ```

3. Verify the changes by running the `kubectl get storageclass` command.

After executing these commands, you will have a `gp3` StorageClass set as the default and the `gp2` StorageClass marked as non-default, provided that **gp2** was already present.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl
