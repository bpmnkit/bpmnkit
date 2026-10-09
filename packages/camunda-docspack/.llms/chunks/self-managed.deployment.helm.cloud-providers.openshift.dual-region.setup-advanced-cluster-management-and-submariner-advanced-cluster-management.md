# Red Hat OpenShift Dual-Region — Setup Advanced Cluster Management and Submariner — Advanced Cluster Management

If Red Hat Advanced Cluster Management is not enabled on your cluster, you need to enable it. The following steps are an extract from the [official instructions](https://docs.redhat.com/en/documentation/red_hat_advanced_cluster_management_for_kubernetes/2.12/html/install/installing), which you may want to refer for details of the implementation and associated customizations.

**Caution: Non-production use only**

The following installation instructions for Advanced Cluster Management are intended for non-production environments.
For a production setup, please consult the [official Red Hat Advanced Cluster Management guide](https://docs.redhat.com/en/documentation/red_hat_advanced_cluster_management_for_kubernetes/2.12/html/install/installing).

**Note: Designation of the clusters in ACM**

The cluster of region 0 is referred to as `local-cluster` in **ACM**. This designation cannot be changed, as it is a constant name used to reference the [managed hub cluster](https://open-cluster-management.io/docs/concepts/cluster-inventory/managedcluster/).

Later in this guide, we will refer to it as **first cluster**.

0. This part of the guide uses a generic reference architecture, you can find all the [acm files here](https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/acm/).

1. Reference each cluster context name and ensure that each cluster's context name matches the corresponding cluster name. If the context name does not match, you will need to rename it to follow this guide.

   ```bash reference
    https://github.com/camunda/camunda-deployment-references/blob/main//generic/openshift/dual-region/procedure/set-cluster-names.sh
   ```

2. The following manifest will create a namespace for the management cluster, enable the [open-cluster-management operator](https://open-cluster-management.io/) and the [associated subscription](https://docs.openshift.com/container-platform/4.17/operators/admin/olm-adding-operators-to-cluster.html#olm-installing-operator-from-operatorhub-using-cli_olm-adding-operators-to-a-cluster).

   ```yaml reference
   https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/acm/install-manifest.yml
   ```

   Save this manifest as `install-manifest.yml` then apply it to enable ACM:

   ```bash reference
   https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/acm/install-acm.sh
   ```

   Verify that the installation succeeded:

   ```bash reference
   https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/acm/verify-acm.sh
   ```

3. With the ACM operator now enabled on the first cluster, the next step is to create the [Multicluster Global Hub](https://docs.redhat.com/en/documentation/red_hat_advanced_cluster_management_for_kubernetes/2.12/html-single/install/index#installing-from-the-cli). This feature allows you to import and manage one or more hub clusters from a single central hub cluster.
   In this setup, the first cluster will act as the central hub, managing the second cluster. This capability enables the deployment and management of components on the second cluster directly from the first cluster.

   ```yaml reference
   https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/acm/multi-cluster-hub.yml
   ```

**Caution: Known issue: may not work correctly with the manifest**

   The creation of the MultiClusterHub using the manifest can sometimes remain stuck in the installation phase when created this way.

   To avoid this issue, you can follow the [official instructions in the OpenShift UI Console](https://docs.redhat.com/en/documentation/red_hat_advanced_cluster_management_for_kubernetes/2.12/html/install/installing#installing-from-the-operatorhub).

   Save this manifest as `multi-cluster-hub.yml` then apply it to enable ACM:

   ```bash reference
   https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/acm/install-multi-cluster-hub.sh
   ```

   Wait until the status shows as "Running." This process can take up to 10 minutes:

   ```bash reference
   https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/acm/verify-multi-cluster-hub.sh
   ```

**Caution: Security consideration**
   - A ServiceAccount with a ClusterRoleBinding automatically gives cluster administrator privileges to Red Hat Advanced Cluster Management and to any user credentials with access to the namespace where you install Red Hat Advanced Cluster Management (`open-cluster-management` here), [learn more about this on the official documentation](https://docs.redhat.com/en/documentation/red_hat_advanced_cluster_management_for_kubernetes/2.12/html/install/installing#installing-from-the-operatorhub).

   - A namespace called `local-cluster` is reserved for the Red Hat Advanced Cluster Management hub cluster when it is self-managed.
     This is the only local-cluster namespace that can exist.

   - :warning: For security reasons, do not give access to the `local-cluster` namespace to any user that is not a cluster-administrator.

4. With the MultiClusterHub created, the last step is to create a `ManagedClusterSet` which is a group of managed clusters. With a `ManagedClusterSet`, you can manage access to all of the managed clusters in the group together

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region
