# Deploy required dependencies with Kubernetes operators — PostgreSQL deployment — clusters

This configuration creates three dedicated PostgreSQL clusters, each optimized for its specific use case.

**Save as** `postgresql-clusters.yml`:

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/postgresql/postgresql-clusters.yml
```

**Use cases:**

- `pg-keycloak`: Database for Keycloak authentication
- `pg-identity`: Database for Management Identity component
- `pg-hub`: Database for Camunda Hub

#### Execution

1. **Navigate to PostgreSQL directory**: `cd postgresql/`
2. **Review deployment script**: `cat deploy.sh` to understand the deployment steps
3. **Review cluster configuration**: `cat postgresql-clusters.yml` to verify PostgreSQL cluster settings
4. **Adapt configuration if needed**: Modify `postgresql-clusters.yml` for your specific requirements (resource limits, storage, etc.)
5. **Execute deployment**: `./deploy.sh`

**Note: OpenShift compatibility**
The `deploy.sh` script automatically detects OpenShift environments and applies the necessary Security Context Constraints (SCC) patches for CloudNativePG compatibility. No separate script is required.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
