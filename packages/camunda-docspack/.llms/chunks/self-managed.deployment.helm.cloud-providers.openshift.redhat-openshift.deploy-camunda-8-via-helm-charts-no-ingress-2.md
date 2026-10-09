# Red Hat OpenShift — Deploy Camunda 8 via Helm charts — no-ingress

Deploy Keycloak without external access:

```bash
# Deploy the PostgreSQL database for Keycloak
CLUSTER_FILTER=pg-keycloak (cd generic/kubernetes/operator-based/postgresql && ./deploy.sh)

# Deploy Keycloak
export KEYCLOAK_CONFIG_FILE="keycloak-instance-no-domain.yml"
(cd generic/kubernetes/operator-based/keycloak && ./deploy.sh)
```

Review the no-domain Keycloak instance configuration

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/keycloak/keycloak-instance-no-domain.yml
```

For more details on the Keycloak deployment, see [Keycloak deployment in the operator-based infrastructure guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#keycloak-deployment).

#### Merge operator overlays into values

Once the operator-managed services are running, merge the corresponding Helm values overlays into your `values.yml` file. These overlays configure Camunda components to use the external operator-managed services instead of embedded subcharts.

Merge the **Elasticsearch** overlay:

```bash
yq '. *+ load("generic/kubernetes/operator-based/elasticsearch/camunda-elastic-values.yml")' values.yml > values-merged.yml && mv values-merged.yml values.yml
```

Review the Elasticsearch Helm overlay

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/elasticsearch/camunda-elastic-values.yml
```

If you use **RDBMS as the secondary storage**, skip the [Elasticsearch deployment](#deploy-elasticsearch) and the overlay above, and merge the **RDBMS** overlay instead:

```bash
yq '. *+ load("generic/kubernetes/operator-based/postgresql/camunda-rdbms-values.yml")' values.yml > values-merged.yml && mv values-merged.yml values.yml
```

Review the RDBMS Helm overlay

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/postgresql/camunda-rdbms-values.yml
```

This overlay points the Orchestration Cluster at the `pg-camunda` cluster and disables Elasticsearch. Optimize requires Elasticsearch or OpenSearch, so it is disabled as well.

Merge the **Identity PostgreSQL** overlay:

```bash
yq '. *+ load("generic/kubernetes/operator-based/postgresql/camunda-identity-values.yml")' values.yml > values-merged.yml && mv values-merged.yml values.yml
```

Review the Identity PostgreSQL Helm overlay

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/postgresql/camunda-identity-values.yml
```

If **Camunda Hub** is enabled, also merge the **Camunda Hub PostgreSQL** overlay:

```bash
yq '. *+ load("generic/kubernetes/operator-based/postgresql/camunda-hub-values.yml")' values.yml > values-merged.yml && mv values-merged.yml values.yml
```

Review the Camunda Hub PostgreSQL Helm overlay

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/postgresql/camunda-hub-values.yml
```

Merge the **Keycloak** overlay _(optional — only if Keycloak was deployed as your IdP; choose the appropriate variant for your setup)_:

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
