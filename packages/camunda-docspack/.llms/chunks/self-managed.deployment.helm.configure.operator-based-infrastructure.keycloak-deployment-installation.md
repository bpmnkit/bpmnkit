# Deploy required dependencies with Kubernetes operators — Keycloak deployment — Installation

**Prerequisites**:

- Ensure environment variables are sourced (see [Environment setup](#step-2-environment-setup))
- PostgreSQL must be deployed first (Keycloak requires database)

The Keycloak deployment follows these steps, automated via the `keycloak/deploy.sh` script:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/keycloak/deploy.sh
```

**Deployment steps performed by the script:**

- Install Keycloak Custom Resource Definitions
- Deploy Keycloak operator to the target namespace
- Create Keycloak instance from the selected configuration file
- Wait for Keycloak readiness validation

#### Operator Custom Resources

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
