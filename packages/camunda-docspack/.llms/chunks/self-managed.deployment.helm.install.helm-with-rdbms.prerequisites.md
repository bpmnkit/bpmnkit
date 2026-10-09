# RDBMS example deployment for Camunda with Helm — Prerequisites

Before you begin:

1. **Kubernetes cluster**: 1.24+ with sufficient resources for Camunda pods.
2. **Helm CLI v4**: Install or upgrade [Helm](https://helm.sh/docs/intro/install/).
3. **External RDBMS**: A supported database reachable from your cluster. See the [RDBMS support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy) for the complete list of supported databases and versions.
4. **Database credentials**: Username and password for a database user with DDL permissions (if using auto-schema creation).
5. **Document-store backend (Elasticsearch/OpenSearch)** (for Optimize): Required if you deploy Optimize alongside Camunda.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/helm-with-rdbms
