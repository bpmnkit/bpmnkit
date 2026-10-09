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

### Multi-namespace deployment (Orchestration + Management)

In production, separate the Orchestration Cluster from management components (WebModeler, Console, Identity, Optimize):

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

# Disable management components
console:
  enabled: false
optimize:
  enabled: false
webModeler:
  enabled: false
identity:
  enabled: false
```

#### Namespace 2: Management components (with document-store secondary storage)

```yaml
orchestration:
  enabled: false

console:
  enabled: true
optimize:
  enabled: true
webModeler:
  enabled: true
identity:
  enabled: true

# Optimize requires Elasticsearch/OpenSearch
opensearch:
  enabled: true
  # or
  # elasticsearch:
  #   enabled: true
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/helm-with-rdbms
