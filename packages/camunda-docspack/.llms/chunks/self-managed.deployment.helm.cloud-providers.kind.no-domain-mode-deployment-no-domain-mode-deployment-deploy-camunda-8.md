# Deploy Camunda 8 to a local kind cluster — No-domain mode deployment {#no-domain-mode-deployment} — Deploy Camunda 8

Deploy Camunda 8 with the no-domain mode Helm values. The deployment script layers the [operator-based Helm values](https://github.com/camunda/camunda-deployment-references/tree/main/generic/kubernetes/operator-based) to connect Camunda to the external PostgreSQL and Keycloak instances, and to the secondary storage backend you selected:

```bash
./procedure/camunda-deploy-no-domain.sh
```

The script selects the appropriate Helm values based on your [exported `SECONDARY_STORAGE`](#secondary-storage-options) value. With `elasticsearch`, it includes the Elasticsearch values overlay. With `postgres`, it includes the RDBMS values overlay and disables Elasticsearch and Optimize.

Deploy script source

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/local/kubernetes/kind-single-region/procedure/camunda-deploy-no-domain.sh
```

**Note: Using RDBMS instead of Elasticsearch**
If you chose RDBMS as your secondary storage backend, skip the Elasticsearch overlay merge below and follow the [configure RDBMS in Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms) guide to configure the Orchestration Cluster components.

This uses the following Helm values:

No-domain mode Helm values (kind-specific)

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/local/kubernetes/kind-single-region/helm-values/values-no-domain.yml
```

Operator-based Helm values (external Elasticsearch, PostgreSQL, Keycloak)

The deployment script layers the following shared operator values before the kind-specific values:

- [`camunda-elastic-values.yml`](https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/elasticsearch/camunda-elastic-values.yml): Connects Camunda to the ECK-managed Elasticsearch (Elasticsearch secondary storage only).
- [`camunda-rdbms-values.yml`](https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/postgresql/camunda-rdbms-values.yml): Configures PostgreSQL RDBMS as secondary storage and disables Elasticsearch and Optimize (PostgreSQL secondary storage only).
- [`camunda-keycloak-no-domain-values.yml`](https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/keycloak/camunda-keycloak-no-domain-values.yml): Connects Camunda to the operator-managed Keycloak (no-domain mode).
- [`camunda-identity-values.yml`](https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/postgresql/camunda-identity-values.yml): Configures Identity to use the CloudNativePG PostgreSQL.
- [`camunda-hub-values.yml`](https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/postgresql/camunda-hub-values.yml): Configures Camunda Hub to use the CloudNativePG PostgreSQL.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind
