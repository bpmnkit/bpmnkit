# Deploy required dependencies with Kubernetes operators — Camunda deployment — Configuration files summary

Before deploying Camunda, ensure you have saved all required configuration files locally. The files are organized by deployment phase:

#### Infrastructure deployment files (Custom Resources)

| Component            | File Name                                | Purpose                          | Required for              |
| -------------------- | ---------------------------------------- | -------------------------------- | ------------------------- |
| PostgreSQL           | `postgresql-clusters.yml`                | PostgreSQL cluster definitions   | Infrastructure deployment |
| Elasticsearch        | `elasticsearch-cluster.yml`              | Elasticsearch cluster definition | Infrastructure deployment |
| Keycloak (Local)     | `keycloak-instance-no-domain.yml`        | Local Keycloak instance          | Infrastructure deployment |
| Keycloak (Contour)   | `keycloak-instance-domain-contour.yml`   | Production Keycloak with Contour | Infrastructure deployment |
| Keycloak (OpenShift) | `keycloak-instance-domain-openshift.yml` | OpenShift Keycloak instance      | Infrastructure deployment |

#### Camunda integration files (Helm values)

| Component                | File Name                               | Purpose                                    | Required for       |
| ------------------------ | --------------------------------------- | ------------------------------------------ | ------------------ |
| Elasticsearch            | `camunda-elastic-values.yml`            | Connects to ECK-managed Elasticsearch      | Camunda deployment |
| PostgreSQL (Identity)    | `camunda-identity-values.yml`           | Connects Identity to PostgreSQL cluster    | Camunda deployment |
| PostgreSQL (Camunda Hub) | `camunda-hub-values.yml`                | Connects Camunda Hub to PostgreSQL cluster | Camunda deployment |
| Keycloak (Local)         | `camunda-keycloak-no-domain-values.yml` | Local development OIDC configuration       | Camunda deployment |
| Keycloak (Production)    | `camunda-keycloak-domain-values.yml`    | Production OIDC configuration              | Camunda deployment |

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
