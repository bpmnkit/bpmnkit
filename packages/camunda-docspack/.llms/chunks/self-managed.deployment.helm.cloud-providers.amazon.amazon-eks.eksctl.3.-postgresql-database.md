# Deploy an EKS cluster with eksctl — 3. PostgreSQL database

Creating a PostgreSQL database can be accomplished through various methods, such as using the AWS Management Console or the AWS CLI. This guide focuses on providing a reproducible setup using the CLI. For information on creating PostgreSQL using the UI, refer to the [AWS documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_GettingStarted.CreatingConnecting.PostgreSQL.html).

**Info: Optional service**

If you don't want to use the Amazon RDS Aurora managed service for PostgreSQL, you can skip this section.
However, note that you may need to adjust the following instructions to remove references to it.

If you choose not to use this service, you'll need to either provide a managed PostgreSQL service or use the internal deployment by the Camunda Helm chart in Kubernetes.

The following components use the PostgreSQL database:

- Keycloak
- Identity
- Web Modeler

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl
