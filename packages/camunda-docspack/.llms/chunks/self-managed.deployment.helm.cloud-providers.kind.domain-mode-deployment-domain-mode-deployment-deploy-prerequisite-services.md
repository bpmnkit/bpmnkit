# Deploy Camunda 8 to a local kind cluster — Domain mode deployment {#domain-mode-deployment} — Deploy prerequisite services

Before deploying Camunda, you need to deploy the external services it depends on. These dependencies are deployed using Kubernetes operators as described in [Deploy infrastructure with Kubernetes operators](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure):

- Elasticsearch via [ECK (Elastic Cloud on Kubernetes)](https://www.elastic.co/guide/en/cloud-on-k8s/current/index.html) — used as secondary storage in this guide.
- PostgreSQL via [CloudNativePG](https://cloudnative-pg.io/)
- Keycloak via the [Keycloak Operator](https://www.keycloak.org/operator/installation)

**Note: Secondary storage alternatives**
This guide uses Elasticsearch (via ECK) as the secondary storage backend. RDBMS is a supported alternative for the Orchestration Cluster (see the [RDBMS support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy) for supported engines). To use RDBMS instead, skip the Elasticsearch operator deployment and see [configure RDBMS in Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms).

Run the operator deployment script, specifying the domain deployment mode:

```bash
CAMUNDA_MODE=domain ./procedure/operators-deploy.sh
```

This script installs each operator and its custom resources, then waits for all instances to be ready. When `SECONDARY_STORAGE=postgres`, the ECK operator and Elasticsearch cluster are skipped, and an additional PostgreSQL cluster (`pg-camunda`) is deployed for RDBMS secondary storage.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind
