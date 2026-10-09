# Production architecture for Camunda 8 with RDBMS — Network and security

- **Orchestration Cluster ↔ RDBMS**: Private network connectivity with TLS in production
- **Network isolation**: Restrict RDBMS access to Orchestration Cluster pods only (use NetworkPolicies)


## Supported scenarios

✅ **Single-node orchestration + external RDBMS** (non-HA, acceptable for non-critical workloads)

✅ **HA Zeebe cluster + external managed RDBMS** (recommended for production)

✅ **Managed database services** (AWS Aurora, Azure Database, GCP Cloud SQL)


## Next steps

- [Secondary storage architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#secondary-storage-architecture)
- [RDBMS configuration](https://docs.camunda.io/docs/next/self-managed/deployment/manual/rdbms/configuration)
- [RDBMS support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy)
- [RDBMS Helm configuration](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms)

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/rdbms/rdbms-production-architecture
