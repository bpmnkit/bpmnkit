# Deploy a ROSA HCP Cluster with Terraform — 2. Preparation for Camunda 8 installation

### Access to the private network using the VPN

This section applies if you have previously created a private cluster and want to access it using the [VPN module configured earlier](#vpn-module-setup).

1. Navigate to the VPN module directory (`vpn`):

   ```bash
   pwd

   # Example output:
   # ./camunda-deployment-references/aws/openshift/rosa-hcp-single-region/terraform/vpn/
   ```

2. Generate your client’s VPN configuration file. This file is compatible with [OpenVPN (ovpn)](https://openvpn.net/) format:

   ```bash reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/common/procedure/vpn/gather-vpn-config.sh
   ```

3. Import the generated configuration file (`my-client.ovpn`) into an OpenVPN client:
   - _(preferred)_ [Official AWS VPN Client](https://docs.aws.amazon.com/vpn/latest/clientvpn-user/connect-aws-client-vpn-connect.html)
   - [Other OpenVPN Clients](https://docs.aws.amazon.com/vpn/latest/clientvpn-user/connect.html)

4. Once the VPN client is connected, you will have secure access to the VPC’s private network.

### Access the created OpenShift cluster

You can access the created OpenShift cluster using the following steps:

1. Verify that you are in the [OpenShift clusters module](#openshift-clusters-module-setup) directory `clusters`:

   ```bash
   pwd

   # Example output:
   # ./camunda-deployment-references/aws/openshift/rosa-hcp-single-region/terraform/cluster/
   ```

2. Set up the required environment variables from the OpenShift terraform module:

   ```bash reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/openshift/rosa-hcp-single-region/procedure/gather-cluster-login-id.sh
   ```

3. If you want to give cluster administrator access to the created user, this is not required for a standard installation but can be useful for debugging:

   ```shell
   rosa grant user cluster-admin --cluster="$CLUSTER_NAME" --user="$CLUSTER_ADMIN_USERNAME"
   ```

4. Log in to the OpenShift cluster:

   ```shell
   oc login -u "$CLUSTER_ADMIN_USERNAME" "$CLUSTER_API_URL" -p "$CLUSTER_ADMIN_PASSWORD"
   ```

   Clean up and configure the kubeconfig context:

   ```shell
   oc config rename-context $(oc config current-context) "$CLUSTER_NAME"
   oc config use-context "$CLUSTER_NAME"
   ```

5. Verify your connection to the cluster with `oc`:

   ```shell
   oc get nodes
   ```

6. Create a project for Camunda using `oc`:

   ```shell
   export CAMUNDA_NAMESPACE="camunda"
   oc new-project "$CAMUNDA_NAMESPACE"
   ```

   In the remainder of the guide, the `CAMUNDA_NAMESPACE` variable represents the namespace used to create required resources in the Kubernetes cluster, such as secrets and one-time setup jobs.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/openshift/terraform-setup
