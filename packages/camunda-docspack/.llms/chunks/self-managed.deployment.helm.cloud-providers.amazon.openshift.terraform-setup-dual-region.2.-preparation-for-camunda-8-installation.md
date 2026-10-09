# Dual-region ROSA HCP Cluster with Terraform — 2. Preparation for Camunda 8 installation

### Access the created OpenShift clusters

You can now access the created OpenShift clusters.

1.  Verify that you are in the [OpenShift clusters module](#openshift-clusters-module-setup) directory `clusters`:

    ```bash
    pwd

    # Example output:
    # ./camunda-deployment-references/aws/openshift/rosa-hcp-dual-region/terraform/clusters/
    ```

1.  Set up the required environment variables from the OpenShift terraform module:

    ```bash reference
    https://github.com/camunda/camunda-deployment-references/blob/main/aws/openshift/rosa-hcp-dual-region/procedure/gather-cluster-login-id.sh
    ```

1.  Give cluster administrator role to the created user for each cluster:

    ```bash
    # Cluster 1
    rosa grant user cluster-admin --cluster="$CLUSTER_0_NAME" --user="$CLUSTER_0_ADMIN_USERNAME"

    # Cluster 2
    rosa grant user cluster-admin --cluster="$CLUSTER_1_NAME" --user="$CLUSTER_1_ADMIN_USERNAME"
    ```

1.  Log in to the OpenShift clusters and configure the kubeconfig contexts:

    ```bash
    # Cluster 1
    oc config delete-context "$CLUSTER_0_NAME" || true

    oc login -u "$CLUSTER_0_ADMIN_USERNAME" "$CLUSTER_0_API_URL" -p "$CLUSTER_0_ADMIN_PASSWORD"
    oc config rename-context $(oc config current-context) "$CLUSTER_0_NAME"

    # Cluster 2
    oc config delete-context "$CLUSTER_1_NAME" || true

    oc login -u "$CLUSTER_1_ADMIN_USERNAME" "$CLUSTER_1_API_URL" -p "$CLUSTER_1_ADMIN_PASSWORD"
    oc config rename-context $(oc config current-context) "$CLUSTER_1_NAME"
    ```

1.  Verify your connection to the clusters with `oc`:

    ```bash reference
    https://github.com/camunda/camunda-deployment-references/blob/main/aws/openshift/rosa-hcp-dual-region/procedure/verify-cluster-nodes.sh
    ```

In the remainder of the guide, different namespaces will be created following the needs of the dual-region architecture.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/openshift/terraform-setup-dual-region
