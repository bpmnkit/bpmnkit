# Dual-region setup (EKS) — 1. Configure AWS and apply Terraform — Export environment variables

To streamline the execution of the subsequent commands, it is recommended to export multiple environment variables within your terminal.

There are two regions (`REGION_0` and `REGION_1`), each with its own Kubernetes cluster (`CLUSTER_0` and `CLUSTER_1`). It is recommended to save these changes for future interactions with the dual-region setup.

1. Navigate to the `procedure` folder within your cloned repository:

```bash
cd aws/kubernetes/eks-dual-region/procedure
```

2. The folder provides a helper script [export_environment_prerequisites.sh](https://github.com/camunda/camunda-deployment-references/tree/main/aws/kubernetes/eks-dual-region/procedure/export_environment_prerequisites.sh) to export various environment variables to ease the interaction with a dual-region setup. Consider permanently changing this file for future interactions.
3. Adjust the environment variable values within the script to your needs.

**Caution**

You have to choose unique namespaces for Camunda 8 installations. The namespace for Camunda 8 installation in the cluster of region 0 (`CAMUNDA_NAMESPACE_0`), needs to have a different name from the namespace for Camunda 8 installation in the cluster of region 1 (`CAMUNDA_NAMESPACE_1`). This is required for proper traffic routing between the clusters.

For example, you can install Camunda 8 into `CAMUNDA_NAMESPACE_0` in `CLUSTER_0`, and `CAMUNDA_NAMESPACE_1` on the `CLUSTER_1`, where `CAMUNDA_NAMESPACE_0` != `CAMUNDA_NAMESPACE_1`.
Using the same namespace names on both clusters won't work as CoreDNS won't be able to distinguish between traffic targeted at the local and remote cluster.

4. Execute the script via the following command:

```bash
. ./export_environment_prerequisites.sh
```

The dot is required to export those variables to your shell and not a spawned subshell.

```bash reference
https://github.com/camunda/camunda-deployment-references/tree/main/aws/kubernetes/eks-dual-region/procedure/export_environment_prerequisites.sh
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region
