# Deploy required dependencies with Kubernetes operators — Keycloak deployment — Overview

The [Keycloak Operator](https://www.keycloak.org/operator/installation) provides the official operator-based way to deploy and manage Keycloak instances on Kubernetes. Maintained by the Keycloak team, it provides the recommended approach for automated deployment, configuration, and lifecycle management.

Use the latest Keycloak version listed in our [supported environments matrix](https://docs.camunda.io/docs/next/reference/supported-environments).

We use the Camunda-maintained quay-optimized Keycloak image [camunda/keycloak:quay-optimized-version](https://github.com/camunda/keycloak) as it bundles the Camunda Identity login theme, the `/auth` base path, the AWS JDBC wrapper, and pre-baked configuration.

**Official documentation**: [Keycloak Operator Documentation](https://www.keycloak.org/operator/installation)

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
