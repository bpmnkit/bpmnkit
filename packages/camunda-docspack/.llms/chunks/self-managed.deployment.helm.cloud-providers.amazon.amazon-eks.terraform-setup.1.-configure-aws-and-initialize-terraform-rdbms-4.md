# Deploy an EKS cluster with Terraform — 1. Configure AWS and initialize Terraform — rdbms

The RDBMS variant uses Amazon Aurora PostgreSQL as the secondary storage for the Orchestration Cluster, so it does not provision an OpenSearch domain. The `eks-single-region-rdbms` reference does not include an `opensearch.tf` file, so skip this OpenSearch module setup and do not create the OpenSearch module. For details, see [configure RDBMS in Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms).

   
   

1. Customize the cluster setup using various input options. For a full list of available parameters, see the [OpenSearch module documentation](https://github.com/camunda/camunda-deployment-references/blob/main/aws/modules/opensearch/README.md).

**Tip**

The instance type `m7i.large.search` in the above example is a suggestion, and can be changed depending on your needs.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
