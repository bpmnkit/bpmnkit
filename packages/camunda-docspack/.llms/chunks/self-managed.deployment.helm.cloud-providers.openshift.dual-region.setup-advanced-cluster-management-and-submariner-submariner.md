# Red Hat OpenShift Dual-Region — Setup Advanced Cluster Management and Submariner — Submariner

The [architecture of Submariner](https://submariner.io/getting-started/architecture/) comprises several components working together to enable direct networking between Pods and Services across different Kubernetes clusters.

The following diagram illustrates the interaction between the two clusters:

_Infrastructure diagram of Submariner setup_
![Infrastructure diagram of Submariner setup](./assets/submariner-hld.jpg)

- Traffic sent from one broker to another cluster can be encrypted by the [Gateway Engine](https://submariner.io/getting-started/architecture/gateway-engine/). In OpenShift, the IPSec protocol is used on port `4500/UDP`, utilizing the [Libreswan](https://libreswan.org/) implementation.
- A dedicated node in each cluster assumes the [Broker Role](https://submariner.io/getting-started/architecture/broker/), facilitating the exchange of metadata between Gateway Engines in participating clusters. This component is **not responsible for transmitting data**, unlike the Gateway Engine, which handles data transmission between internal networks of different clusters. High availability can be achieved by adding a second dedicated node.
- Service discovery is managed internally by the [Lighthouse project](https://submariner.io/getting-started/architecture/service-discovery/).
- The [Route Agent component](https://submariner.io/getting-started/architecture/route-agent/) runs on every node in each participating cluster. It sets up the necessary host network elements on top of the existing Kubernetes CNI plugin.

**Note: Handling overlapping CIDRs**

This guide does not cover handling overlapping CIDRs. However, this can be achieved using the [Globalnet Controller](https://submariner.io/getting-started/architecture/globalnet/).

Installing Submariner in OpenShift **requires** [Advanced Cluster Management](#advanced-cluster-management) to be configured, with each cluster added to the management cluster.

0. This part of the guide uses a generic reference architecture, you can find all the [submariner files here](https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/submariner/).

1. Ensure cluster context names match:
   _(Skip this step if already completed as part of [Advanced Cluster Management](#advanced-cluster-management).)_
   Verify that each cluster's context name matches its corresponding cluster name. If the context name does not match, rename it to align with this guide.

   ```bash reference
    https://github.com/camunda/camunda-deployment-references/blob/main//generic/openshift/dual-region/procedure/set-cluster-names.sh
   ```

2. Verify dedicated broker nodes:
   Confirm that each cluster has nodes labeled for Submariner gateway functionality:

   ```bash reference
    https://github.com/camunda/camunda-deployment-references/blob/main//generic/openshift/dual-region/procedure/submariner/list-nodes-brokers.sh
   ```

   If no nodes are labeled, you need to label at least one node in each cluster. For better reliability, consider dedicating a node as the broker.

   **Assigning broker node labels:**
   Select the first node and apply the required label:

   ```bash reference
    https://github.com/camunda/camunda-deployment-references/blob/main//generic/openshift/dual-region/procedure/submariner/label-nodes-brokers.sh
   ```

3. Deployment of Submariner on the clusters:
   - Save the following file as `submariner.yml.tpl`:

     ```yaml reference
     https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/submariner/submariner.yml.tpl
     ```

**Note: Cluster naming**

     In this example, the first cluster is referenced as `local-cluster`. This is because the first cluster is used as the management cluster in this minimal setup.

     If your cluster is named differently, you may need to adapt this file to match your actual cluster name.

   - Then apply it on the management cluster:

     ```bash reference
       https://github.com/camunda/camunda-deployment-references/blob/main//generic/openshift/dual-region/procedure/submariner/install-submariner.sh
     ```

   - Wait for the brokers to become ready. This may take up to 10 minutes. You can check the broker status using the following command:

     ```bash reference
       https://github.com/camunda/camunda-deployment-references/blob/main//generic/openshift/dual-region/procedure/submariner/verify-submariner.sh
     ```

4. After deploying Submariner, check that the clusters can communicate with each other by using the `subctl` utility. Keep in mind that it might take several minutes before all status indicators turn green.

   If you don’t have the `subctl` CLI installed, you can follow the [installation instructions here](https://submariner.io/operations/deployment/) or execute the following commands:

   ```bash reference
     https://github.com/camunda/camunda-deployment-references/blob/main//generic/openshift/dual-region/procedure/submariner/install-subctl.sh
   ```

   Now, verify communication between the clusters with the following script:

   ```bash reference
     https://github.com/camunda/camunda-deployment-references/blob/main//generic/openshift/dual-region/procedure/submariner/verify-subctl.sh
   ```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region
