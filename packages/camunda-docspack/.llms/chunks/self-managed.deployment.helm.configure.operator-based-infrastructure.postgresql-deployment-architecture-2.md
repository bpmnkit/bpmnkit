# Deploy required dependencies with Kubernetes operators — PostgreSQL deployment — Architecture (2)

```bash
PG_INSTANCES=1 ./deploy.sh
```

This applies `instances: 1` and `enablePDB: false` to every cluster it deploys. Disabling the PodDisruptionBudget keeps the node drainable with a single instance, and CloudNativePG documents this configuration for development clusters. The database is unavailable while its pod is rescheduled.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
