# Deploy an EKS cluster with Terraform — 1. Configure AWS and initialize Terraform — OpenSearch module setup

**Info: Optional module**

If you don't want to use this module, you can skip this section. However, you may need to adjust the remaining instructions to remove references to this module.

If you choose not to use this module, you can either:

- Provide a managed Elasticsearch or OpenSearch service, or deploy Elasticsearch in your cluster via ECK.
- Use RDBMS as the secondary storage backend for the Orchestration Cluster. See [configure RDBMS in Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms) for details and the [RDBMS support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy) for supported engines.

Additionally, you must delete the `opensearch.tf` file within the `terraform/cluster` directory of your chosen reference as it will otherwise create the resources.

The OpenSearch module creates an OpenSearch domain intended for Camunda. OpenSearch is a powerful alternative to Elasticsearch. For more information on using OpenSearch with Camunda, refer to the [Camunda documentation](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/using-external-opensearch).

**Note: Migration to OpenSearch is not supported**

Using Amazon OpenSearch Service requires [setting up a new Camunda installation](https://docs.camunda.io/docs/next/self-managed/setup/overview). Migration from previous Camunda versions using Elasticsearch environments is currently not supported. Switching between Elasticsearch and OpenSearch, in either direction, is also not supported.

#### Set up the OpenSearch domain module

1. Go to the [reference architecture directory of the cloned repository](#obtain-a-copy-of-the-reference-architecture).

   Verify the layout and switch into the cluster module. For simplicity, the OpenSearch file is located in the cluster module:

   ```bash
      cd ./aws/kubernetes/eks-single-region(-irsa)/terraform/

      ls
      # Example output:
      # cluster  vpn

      cd cluster
   ```

1. The `opensearch.tf` references the local Terraform module and contains a basic AWS OpenSearch setup that you can adjust to your needs. The file is available here:

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
