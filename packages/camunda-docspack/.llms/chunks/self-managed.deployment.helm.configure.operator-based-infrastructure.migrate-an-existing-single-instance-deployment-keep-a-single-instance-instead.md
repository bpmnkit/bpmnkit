# Deploy required dependencies with Kubernetes operators — Migrate an existing single-instance deployment — Keep a single instance instead

If a second instance is not affordable in your environment, do not leave the cluster at `instances: 1` with its PodDisruptionBudget enabled, because that is the combination that blocks node drains. Set `enablePDB: false` alongside it, as described in [Run a single instance on constrained environments](#run-a-single-instance-on-constrained-environments).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
