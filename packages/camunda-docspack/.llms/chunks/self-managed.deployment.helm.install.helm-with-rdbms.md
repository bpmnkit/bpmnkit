# RDBMS example deployment for Camunda with Helm

Focused walkthrough for teams choosing an external RDBMS as secondary storage within the Helm production installation flow.

This guide is a focused walkthrough for teams using an external relational database (RDBMS) as secondary storage in the Helm production installation flow, instead of a document-store secondary backend (Elasticsearch or OpenSearch).

Use [production install](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index) as the primary installation guide. Use this page when you want additional RDBMS-specific examples for that flow.

If you deploy on AWS EKS, use [Install Camunda 8 on an EKS cluster](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm) for the cluster, Ingress, and AWS-managed service setup, then return to this page for the RDBMS-specific Helm configuration and installation steps.

Related guides:

- [Production install](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index)
- [Secondary storage architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#secondary-storage-architecture)
- [Secondary storage overview](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index)
- [Configure RDBMS in Helm charts](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms)
- [JDBC driver management](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-jdbc-drivers)

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/helm-with-rdbms
