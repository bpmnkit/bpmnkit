# Amazon EC2 — 1. Configure AWS and initialize Terraform — OpenSearch module setup

**Info: Optional module**

If you do not want to use this module, you can skip this section. However, you will need to adjust the remaining steps to remove any references to it.

If you choose not to use this module, you must provide your own Elasticsearch or OpenSearch service.

Additionally, be sure to delete the `opensearch.tf` file in your reference copy—otherwise, the resources defined in it will still be created.

The OpenSearch module provisions an OpenSearch domain for use with Camunda. OpenSearch is a powerful alternative to Elasticsearch.

**Note: Migration to OpenSearch is not supported**

Using Amazon OpenSearch Service requires [setting up a new Camunda installation](https://docs.camunda.io/docs/next/self-managed/setup/overview). Migration from earlier Camunda versions using Elasticsearch is not currently supported. Switching between Elasticsearch and OpenSearch in either direction is also unsupported.

#### Set up the OpenSearch domain module

1. The `opensearch.tf` file in your reference contains a basic OpenSearch setup using a local Terraform module. The snippet below shows the structure of this file, which you can modify within your cloned setup to suit your needs.

**Caution: Network-based security**

   The default OpenSearch deployment relies primarily on network-level security. While this simplifies access, it can expose sensitive data within your VPC.

   To enhance security, consider enabling [fine-grained access control](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/fgac.html).

   ```hcl reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/compute/ec2-single-region/terraform/cluster/opensearch.tf#L1-L30
   ```

2. Customize the cluster setup using various input options. For a complete list of available parameters, refer to the [OpenSearch module documentation](https://github.com/camunda/camunda-deployment-references/blob/main/aws/modules/opensearch/README.md).

**Tip**
The instance type `m7i.large.search` used in the example is only a suggestion. You can change it based on your workload and requirements.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/cloud-providers/amazon/aws-ec2
