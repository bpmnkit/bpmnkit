# Deploy an EKS cluster with eksctl — 4. OpenSearch domain

Creating an OpenSearch domain can be accomplished through various methods, such as using the AWS Management Console or the AWS CLI. This guide focuses on providing a reproducible setup using the CLI. For information on creating an OpenSearch domain using the UI, refer to the [AWS OpenSearch documentation](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/create-managed-domain.html).

The resulting OpenSearch domain is intended for use with Camunda, the following components utilize OpenSearch:

- Orchestration Cluster (Zeebe, Operate, Tasklist, Identity)
- Optimize

If you are deploying the **RDBMS** secondary storage variant, skip this section. That variant uses Amazon Aurora PostgreSQL as the secondary storage for the Orchestration Cluster and does not create an OpenSearch domain. For details, see [configure RDBMS in Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms).

**Info: Optional service**

If you don't want to use the Amazon OpenSearch managed service, you can skip this section.
However, note that you may need to adjust the following instructions to remove references to it.

If you choose not to use this service, you can either:

- Provide a managed OpenSearch or Elasticsearch service, or use the internal deployment by the Camunda Helm chart in Kubernetes.
- Use RDBMS as the secondary storage backend for the Orchestration Cluster. See [configure RDBMS in Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms) for details and the [RDBMS support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy) for supported engines.

**Note: Migration to OpenSearch is not supported**

Using Amazon OpenSearch Service requires [setting up a new Camunda installation](https://docs.camunda.io/docs/next/self-managed/setup/overview). Migration from previous Camunda versions or Elasticsearch environments is currently not supported. Switching between Elasticsearch and OpenSearch, in either direction, is also not supported.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl
