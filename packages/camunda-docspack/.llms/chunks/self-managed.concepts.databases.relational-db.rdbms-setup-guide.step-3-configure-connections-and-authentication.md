# End-to-end RDBMS setup guide — Step 3: Configure connections and authentication

Configuration is component-specific but follows consistent principles across OC and Hub.

### Orchestration Cluster connection

### helm

In your `values.yaml`:

```yaml
orchestration:
  data:
    secondaryStorage:
      type: rdbms
      rdbms:
        url: jdbc:postgresql://postgres.example.com:5432/camunda_oc
        username: camunda_oc
        secret:
          existingSecret: rdbms-credentials
          existingSecretKey: password
```

For full Helm reference, see [RDBMS configuration in Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms).

### manual

Set environment variables before starting the Orchestration Cluster:

```bash
export CAMUNDA_DATA_SECONDARY_STORAGE_TYPE=rdbms
export CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_URL="jdbc:postgresql://postgres.example.com:5432/camunda_oc"
export CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_USERNAME="camunda_oc"
export CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_PASSWORD="your-secure-password"
```

For full manual setup, see [RDBMS configuration for manual installations](https://docs.camunda.io/docs/next/self-managed/deployment/manual/rdbms/configuration).

### Camunda Hub connection

Camunda Hub uses Spring Boot datasource configuration (separate from Orchestration Cluster).

### helm

In your `values.yaml`:

```yaml
webModeler:
  restapi:
    externalDatabase:
      enabled: true
      url: jdbc:postgresql://postgres.example.com:5432/camunda_wm
      username: camunda_wm
      secret:
        inlineSecret: your-secure-password
      # Or use existingSecret for production
```

For full Camunda Hub reference, see [Camunda Hub database configuration](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/database).

### manual

Set environment variables before starting Camunda Hub:

```bash
export SPRING_DATASOURCE_URL="jdbc:postgresql://postgres.example.com:5432/camunda_wm"
export SPRING_DATASOURCE_USERNAME="camunda_wm"
export SPRING_DATASOURCE_PASSWORD="your-secure-password"
```

### Secrets management

For production, use a secrets store (Kubernetes Secrets, Vault, AWS Secrets Manager) instead of inline passwords.

**Kubernetes Secrets example**:

```bash
kubectl create secret generic rdbms-credentials \
  --from-literal=user=camunda_oc \
  --from-literal=password=your-very-secure-password
```

Then reference it in `values.yaml`:

```yaml
orchestration:
  data:
    secondaryStorage:
      rdbms:
        secret:
          existingSecret: rdbms-credentials
          existingSecretKey: password
```

### Aurora IAM authentication

If using Amazon Aurora PostgreSQL, configure IAM database authentication for enhanced security (no stored passwords).

**Orchestration Cluster (Helm)**:

```yaml
orchestration:
  data:
    secondaryStorage:
      type: rdbms
      rdbms:
        url: "jdbc:postgresql://aurora-cluster.123456789012.us-east-1.rds.amazonaws.com:5432/camunda?sslmode=require"
        username: db_user # IAM database user
        # No password needed; IAM token generated at runtime
        # Requires IAM role attached to pod (IRSA or Karpenter)
```

**Camunda Hub (Helm)**:

```yaml
webModeler:
  restapi:
    externalDatabase:
      enabled: true
      url: "jdbc:aws-wrapper:postgresql://aurora-cluster.123456789012.us-east-1.rds.amazonaws.com:5432/camunda?wrapperPlugins=iam"
      username: db_user # IAM database user
      # No password needed; IAM token generated at runtime
```

For detailed Aurora setup, see [Orchestration Cluster RDBMS configuration](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration) and [Camunda Hub configuration](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/database).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-setup-guide
