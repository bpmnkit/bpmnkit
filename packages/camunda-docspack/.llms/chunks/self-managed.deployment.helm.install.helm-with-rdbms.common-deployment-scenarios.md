# RDBMS example deployment for Camunda with Helm — Common deployment scenarios

### PostgreSQL with AWS Aurora

For AWS Aurora PostgreSQL, configure the JDBC URL with the Aurora endpoint:

```yaml
orchestration:
  data:
    secondaryStorage:
      rdbms:
        url: jdbc:postgresql://my-aurora-cluster.xxxxxxx.us-east-1.rds.amazonaws.com:5432/camunda
```

Aurora supports automatic failover. For advanced failover features, consider the [AWS JDBC wrapper driver](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration#usage-with-aws-aurora-postgresql).

### Oracle with Kubernetes init container

To load the Oracle JDBC driver:

```yaml
orchestration:
  extraVolumeMounts:
    - name: jdbcdrivers
      mountPath: /driver-lib
  extraVolumes:
    - name: jdbcdrivers
      emptyDir: {}
  initContainers:
    - name: fetch-jdbc-drivers
      image: alpine:3.19
      command:
        - sh
        - -c
        - >
          wget https://your-private-repo.com/ojdbc11.jar
          -O /driver-lib/ojdbc.jar
      volumeMounts:
        - name: jdbcdrivers
          mountPath: /driver-lib
```

Configure the JDBC URL:

```yaml
orchestration:
  data:
    secondaryStorage:
      rdbms:
        url: jdbc:oracle:thin:@//my-oracle-host:1521/FREEPDB1
```

### Multi-namespace deployment (Orchestration Cluster + management plane) {#multi-namespace-deployment-orchestration--management}

In production, separate the Orchestration Cluster from the management plane (Camunda Hub and Management Identity) and Optimize:

#### Namespace 1: Orchestration + Connectors

```yaml
orchestration:
  enabled: true
  # RDBMS configuration
  data:
    secondaryStorage:
      type: rdbms
      rdbms:
        url: jdbc:postgresql://postgres:5432/camunda

connectors:
  enabled: true

# Disable the management plane and Optimize
camundaHub:
  enabled: false
optimize:
  enabled: false
identity:
  enabled: false
```

#### Namespace 2: Management plane and Optimize (with document-store secondary storage) {#namespace-2-management-components-with-document-store-secondary-storage}

```yaml
orchestration:
  enabled: false

camundaHub:
  enabled: true
optimize:
  enabled: true
  database:
    elasticsearch:
      enabled: true
      external: true
      url:
        protocol: https
        host: elastic.example.com
        port: 443
identity:
  enabled: true
```

For the Optimize connection settings, see [use external Elasticsearch for Optimize with Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/optimize/using-external-elasticsearch).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/helm-with-rdbms
