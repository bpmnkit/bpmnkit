# Install Camunda 8 on an AKS cluster — Deploy Camunda 8 via Helm charts — elasticsearch

Before deploying Camunda, you need to deploy the infrastructure services it depends on. The core infrastructure (Elasticsearch) can be deployed using Kubernetes operators as described in [Deploy infrastructure with Kubernetes operators](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure).

- **Elasticsearch** (this guide): Deployed via [ECK (Elastic Cloud on Kubernetes)](https://www.elastic.co/guide/en/cloud-on-k8s/current/index.html)
- **RDBMS** (alternative): Use a managed Azure Database for PostgreSQL or another supported RDBMS engine — see the [RDBMS support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy)

All deploy scripts are located in `generic/kubernetes/operator-based/`. Review each script before executing to understand the deployment steps, and adapt the operator Custom Resource configurations for your specific requirements (resource limits, storage, replicas, etc.).

**Note: Working directory**
All commands in this guide assume you are at the **repository root** (the directory created by `get-your-copy.sh`). The deploy commands below use subshells `(cd ... && ./deploy.sh)` to preserve your working directory.

##### Deploy Elasticsearch {#deploy-elasticsearch}

If your organization does not want to use a managed Elasticsearch service, ECK Operator is an option. In this guide, we default to the ECK Operator deployment of Elasticsearch.

**Note: RDBMS alternative**
For those who prefer a relational database, RDBMS (for example, [Azure Database for PostgreSQL](https://azure.microsoft.com/products/postgresql)) is a supported alternative to Elasticsearch for the Orchestration Cluster's secondary storage. See the [RDBMS support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy) for supported engines. To use RDBMS instead, skip this section and see [configure RDBMS in Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms).

**Warning: Production Elasticsearch recommendation**
For production workloads, we recommend using an externally managed Elasticsearch service (for example, [Elastic Cloud on Azure](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/elastic.ec-azure-pp)). Terraform support for Elastic Cloud on Azure can be restrictive but remains a viable option.

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

#### Merge operator overlays into values

Once the operator-managed services are running, merge the corresponding Helm values overlays into your `values.yml` file. These overlays configure Camunda components to use the external operator-managed services instead of embedded subcharts.

Merge the **Elasticsearch** overlay:

```bash
yq '. *+ load("generic/kubernetes/operator-based/elasticsearch/camunda-elastic-values.yml")' values.yml > values-merged.yml && mv values-merged.yml values.yml
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/aks-helm
