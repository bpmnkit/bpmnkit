# Red Hat OpenShift — Deploy Camunda 8 via Helm charts — Deploy prerequisite services

Before deploying Camunda, you need to deploy the infrastructure services it depends on. The core infrastructure (Elasticsearch and PostgreSQL) is deployed using Kubernetes operators as described in [Deploy infrastructure with Kubernetes operators](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure). Keycloak can optionally be deployed as your OIDC provider:

- **Elasticsearch**: Deployed via [ECK (Elastic Cloud on Kubernetes)](https://www.elastic.co/guide/en/cloud-on-k8s/current/index.html) — one option for secondary storage
- **PostgreSQL**: Deployed via [CloudNativePG](https://cloudnative-pg.io/)
- **Keycloak** _(optional)_: Deployed via the [Keycloak Operator](https://www.keycloak.org/operator/installation) — can be replaced with any OIDC-compatible IdP

**Note: Secondary storage alternatives**
This guide includes one example path for the Orchestration Cluster's secondary storage. Depending on the guide, that example may use Elasticsearch, OpenSearch, or RDBMS.

If you use a different secondary storage backend, skip the guide-specific storage setup steps and follow [using external OpenSearch in Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/using-external-opensearch) or [configure RDBMS in Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms).

All deploy scripts are located in `generic/kubernetes/operator-based/`. Review each script before executing to understand the deployment steps, and adapt the operator Custom Resource configurations for your specific requirements (resource limits, storage, replicas, etc.).

**Note: Working directory**
All commands in this guide assume you are at the **repository root** (the directory created by `get-your-copy.sh`). The deploy commands below use subshells `(cd ... && ./deploy.sh)` to preserve your working directory.

#### Deploy Elasticsearch {#deploy-elasticsearch}

To deploy Elasticsearch using the ECK operator:

```bash
(cd generic/kubernetes/operator-based/elasticsearch && ./deploy.sh)
```

The script installs the ECK operator, deploys an Elasticsearch cluster, and waits until it is ready.

Review the Elasticsearch cluster configuration

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/elasticsearch/elasticsearch-cluster.yml
```

For more details on the Elasticsearch deployment, see [Elasticsearch deployment in the operator-based infrastructure guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#elasticsearch-deployment).

#### Deploy PostgreSQL {#deploy-postgresql}

Deploy PostgreSQL clusters using the CloudNativePG operator:

```bash
(cd generic/kubernetes/operator-based/postgresql && CLUSTER_FILTER="pg-identity,pg-hub" ./deploy.sh)
```

This script installs the CNPG operator (auto-detecting OpenShift to apply SCC patches), creates secrets, deploys the specified PostgreSQL clusters, and waits for readiness.

The following PostgreSQL clusters are created:

- **pg-identity**: Database for Camunda Identity component
- **pg-hub**: Database for Camunda Hub (remove from configuration if not needed)

If you use **RDBMS as the secondary storage** for the Orchestration Cluster instead of Elasticsearch, add `pg-camunda` to the filter:

<!-- TODO: deploy.sh only learns to resolve pg-camunda from postgresql-orchestration-cluster.yml
     when camunda/camunda-deployment-references#2726 (stable/8.9) and #2724 (main) merge.
     Until then this command deploys the two application clusters only. -->

```bash
(cd generic/kubernetes/operator-based/postgresql && CLUSTER_FILTER="pg-identity,pg-hub,pg-camunda" ./deploy.sh)
```

- **pg-camunda**: Secondary storage for the Orchestration Cluster, defined in `postgresql-orchestration-cluster.yml`

Review the PostgreSQL cluster configuration

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/postgresql/postgresql-clusters.yml
```

For more details on the PostgreSQL deployment, see [PostgreSQL deployment in the operator-based infrastructure guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#postgresql-deployment).

#### Deploy Keycloak (optional) {#deploy-keycloak}

If you choose Keycloak as your identity provider (IdP), deploy it using the Keycloak Operator. First, deploy its PostgreSQL database, then deploy the Keycloak operator and instance. If you use an external OIDC provider instead, skip this section.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
