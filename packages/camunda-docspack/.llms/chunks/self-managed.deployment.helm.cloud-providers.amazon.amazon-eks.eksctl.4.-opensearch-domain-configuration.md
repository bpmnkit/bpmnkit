# Deploy an EKS cluster with eksctl — 4. OpenSearch domain — Configuration

```shell
##### OpenSearch parameters

# Name for the OpenSearch domain
export OPENSEARCH_NAME=camunda-opensearch
```

**Caution: Network based security**

The standard deployment for OpenSearch relies on the first layer of security, which is the Network.
While this setup allows easy access, it may expose sensitive data. To enhance security, consider implementing IAM Roles for Service Accounts (IRSA) to restrict access to the OpenSearch cluster, providing a more secure environment.
For more information, see the [Amazon OpenSearch Service fine-grained access control documentation](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/fgac.html#fgac-access-policies).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl
