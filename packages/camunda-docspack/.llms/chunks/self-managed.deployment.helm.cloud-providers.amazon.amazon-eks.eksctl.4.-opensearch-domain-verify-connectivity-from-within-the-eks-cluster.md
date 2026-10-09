# Deploy an EKS cluster with eksctl — 4. OpenSearch domain — Verify connectivity from within the EKS cluster

To verify that the OpenSearch domain is accessible from within your Amazon EKS cluster, follow these steps:

1. Deploy a temporary pod to test connectivity:

   Create a temporary pod using the `amazonlinux` image in the `camunda` namespace, install `curl`, and test the connection to OpenSearch—all in a single command:

   ```bash
   kubectl run amazonlinux-opensearch -n camunda --rm -i --tty --image amazonlinux -- sh -c "curl -XGET https://$OPENSEARCH_HOST/_cluster/health"
   ```

2. Verify the response:

   If everything is set up correctly, you should receive a response from the OpenSearch service indicating its health status.

You have successfully set up an OpenSearch domain that is accessible from within your Amazon EKS cluster. For further details, refer to the [OpenSearch documentation](https://opensearch.org/docs/latest/index/).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl
