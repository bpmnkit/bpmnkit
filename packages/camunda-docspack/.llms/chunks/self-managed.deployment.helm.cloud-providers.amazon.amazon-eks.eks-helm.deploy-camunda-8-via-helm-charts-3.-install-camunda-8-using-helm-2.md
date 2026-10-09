# Install Camunda 8 on an EKS cluster — Deploy Camunda 8 via Helm charts — 3. Install Camunda 8 using Helm (2)

- Replace `OPENSEARCH_MASTER_USERNAME` and `OPENSEARCH_MASTER_PASSWORD` with your OpenSearch domain admin credentials.
  - Replace `OPENSEARCH_HOST` with your OpenSearch endpoint URL.
  - Replace `OPENSEARCH_ROLE_ARN` with the IAM role name created by Terraform, which is output by the `opensearch_role` module.

**Note: Security of Basic authentication usage**

  **This example uses Basic authentication (username and password), which may not be the best practice for all scenarios, especially if fine-grained access control is enabled.** The endpoint used in this example is not exposed by default, so consult your OpenSearch documentation for specifics on enabling and securing this endpoint.

Ensure that the `iam_role_arn` of the previously created `opensearch_role` is assigned to an internal role within Amazon OpenSearch Service. For example, `all_access` on the Amazon OpenSearch Service side is a good candidate, or if required, extra roles can be created with more restrictive access.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm
