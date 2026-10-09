# RDBMS example deployment for Camunda with Helm — Known limitations and unsupported scenarios

### Multi-region deployments

Cross-region RDBMS deployments are **not tested or supported in Camunda 8.9**. Latency and consistency requirements are not yet validated. Deploy your RDBMS in the same region as your Kubernetes cluster.

### Optimize storage

Optimize **cannot use RDBMS** and requires Elasticsearch or OpenSearch. If deploying Optimize alongside an RDBMS-based Orchestration Cluster, you must provision Elasticsearch/OpenSearch for Optimize only.

### Self-Managed database HA

Camunda does not manage database HA. Use cloud-managed databases (AWS Aurora, Azure Database, GCP Cloud SQL) or vendor-supplied HA solutions. Camunda assumes the database handles its own replication and failover.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/helm-with-rdbms
