# Deploy required dependencies with Kubernetes operators — Elasticsearch deployment

### Overview

[Elastic Cloud on Kubernetes (ECK)](https://www.elastic.co/docs/deploy-manage/deploy/cloud-on-k8s) is the official Kubernetes deployment method for Elasticsearch, maintained by Elastic. ECK provides the vendor-recommended approach for deploying Elasticsearch in Kubernetes environments, automatically handling cluster deployment, scaling, upgrades, and security configuration.

Use the latest Elasticsearch version listed in our [supported environments matrix](https://docs.camunda.io/docs/next/reference/supported-environments) and verify compatibility there before deploying.

**Official documentation**: [ECK Guide](https://www.elastic.co/guide/en/cloud-on-k8s/current/index.html)

### Architecture

The ECK deployment creates an Elasticsearch cluster with:

- **Three multi-role nodes**: Each node is master-eligible and also serves data, ingest, and coordinating roles (no separate master-only tier)
- **Security configuration**: TLS disabled for internal communication (can be enabled for production)
- **Anti-affinity rules**: Ensures nodes are distributed across different Kubernetes nodes
- **Resource optimization**: Configured for Camunda's specific requirements

**Note: Baseline**
This topology is an opinionated minimal baseline. Adjust node count/roles (e.g., add dedicated ingest, coordinating, or hot/warm tiers), JVM heap, storage class/size, security (TLS & auth), and other settings to match your workload characteristics, retention, and compliance requirements.

**Elasticsearch as the secondary storage for Camunda 8:**

Elasticsearch serves as the secondary storage for Camunda 8 orchestration cluster components, providing persistent storage and search capabilities.

[Learn more about the secondary storage](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index) and how it supports advanced features like web applications, search APIs, process monitoring, task management, and analytics.

### Installation

**Prerequisites**: Ensure environment variables are sourced (see [Environment setup](#step-2-environment-setup))

The Elasticsearch deployment follows these steps, automated via the `elasticsearch/deploy.sh` script:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/elasticsearch/deploy.sh
```

**Deployment steps performed by the script:**

- Install ECK Custom Resource Definition
- Deploy ECK operator to `elastic-system` namespace
- Create Elasticsearch cluster from `elasticsearch-cluster.yml`
- Wait for cluster health validation

#### Operator Custom Resources

  
### cluster

This configuration creates a production-ready Elasticsearch cluster with security enabled.

**Save as** `elasticsearch-cluster.yml`:

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/elasticsearch/elasticsearch-cluster.yml
```

#### Execution

1. **Navigate to Elasticsearch directory**: `cd ../elasticsearch/`
2. **Review deployment script**: `cat deploy.sh` to understand the deployment steps
3. **Review cluster configuration**: `cat elasticsearch-cluster.yml` to verify Elasticsearch cluster settings
4. **Adapt configuration if needed**: Modify `elasticsearch-cluster.yml` for your specific requirements (node count, resources, security settings, etc.)
5. **Execute deployment**: `./deploy.sh`

### Camunda Helm configuration

The following configuration integrates ECK-managed Elasticsearch with Camunda components.

**Save this file locally** and include it in your Helm installation command.

  
### camunda-values

Configure Camunda components to use the ECK-managed Elasticsearch.

**Save as** `camunda-elastic-values.yml`:

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/elasticsearch/camunda-elastic-values.yml
```

**Use case**: External Elasticsearch connection for all orchestration cluster components (Zeebe, Operate, Tasklist, Optimize).

**Installation**: Add `-f camunda-elastic-values.yml` to your Helm install command.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
