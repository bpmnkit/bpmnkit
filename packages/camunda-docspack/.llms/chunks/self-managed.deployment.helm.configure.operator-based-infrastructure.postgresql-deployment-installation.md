# Deploy required dependencies with Kubernetes operators — PostgreSQL deployment — Installation

**Prerequisites**: Ensure environment variables are sourced (see [Environment setup](#step-2-environment-setup))

The PostgreSQL deployment follows these steps, automated via the `postgresql/deploy.sh` script:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/postgresql/deploy.sh
```

**Deployment steps performed by the script:**

- Auto-detect OpenShift and apply Security Context Constraints (SCC) patches if needed
- Install CloudNativePG operator to `cnpg-system` namespace
- Generate PostgreSQL authentication secrets using `./set-secrets.sh`
- Deploy PostgreSQL clusters from `postgresql-clusters.yml` (optionally filtered via `CLUSTER_FILTER` environment variable)
- Wait for readiness validation of all deployed clusters

#### Operator Custom Resources

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
