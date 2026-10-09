# Use external PostgreSQL

Learn how to use an external PostgresQL instance in Camunda 8 Self-Managed deployment.

The Camunda Helm chart requires externally managed PostgreSQL for Camunda Hub and Management Identity. This guide steps through connecting these components to an external PostgreSQL instance. Provide PostgreSQL through a managed service or a Kubernetes operator, such as the [CloudNativePG operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#postgresql-deployment).

This page applies to Management Identity and Camunda Hub. Configure the database for an external Keycloak deployment separately. It does not apply to the Orchestration Cluster or Optimize.


## Prerequisites

- **Running external PostgreSQL service**
- **Connection details:** following sample values are used in this guide (replace them with your own):

```yaml
host: db.example.com
port: 5432
username: postgres
password: examplePassword
```

- **Supported versions:**: Check the [supported environments](https://docs.camunda.io/docs/next/reference/supported-environments) and [RDBMS support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy) pages to confirm which PostgreSQL versions are supported.
- **Database setup:** Ensure the required databases exist in your PostgreSQL instance. For this guide, create the following databases:

```SQL
CREATE DATABASE "web-modeler";
CREATE DATABASE "management-identity";
```

- **Kubernetes secrets:** Store the database password in a Kubernetes secret so it is not referenced in plain text within your values.yaml (This secret exists outside the Helm chart and will not be overwritten by subsequent helm upgrade commands). For example:

```bash
kubectl create secret generic camunda-psql-db --from-literal=password=examplePassword -n camunda
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/using-existing-postgres
