# Deploy required dependencies with Kubernetes operators — Infrastructure components

This approach uses three operator-managed infrastructure components, each maintained by their respective project teams:

| Component                                                   | Purpose                                                                                           | Official Documentation                                                            |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **[PostgreSQL with CloudNativePG](#postgresql-deployment)** | Production-grade PostgreSQL clusters for Keycloak, Management Identity, and Camunda Hub databases | [CloudNativePG Documentation](https://cloudnative-pg.io/docs/1.30/)               |
| **[Elasticsearch with ECK](#elasticsearch-deployment)**     | Official Elasticsearch deployment for Zeebe records, Operate, Tasklist, and Optimize data storage | [ECK Guide](https://www.elastic.co/guide/en/cloud-on-k8s/current/index.html)      |
| **[Keycloak with Keycloak Operator](#keycloak-deployment)** | Automated OIDC authentication provider for Management Identity                                    | [Keycloak Operator Documentation](https://www.keycloak.org/operator/installation) |

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
