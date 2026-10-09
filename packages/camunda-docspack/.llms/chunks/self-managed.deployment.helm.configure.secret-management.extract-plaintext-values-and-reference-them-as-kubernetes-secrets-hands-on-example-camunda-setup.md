# Helm charts secret management — Extract plaintext values and reference them as Kubernetes Secrets — Hands-on example (Camunda setup)

Below is a ready-to-use example for Camunda deployments. Keep only those secrets that match your setup.

#### 1. Extract (only for enabled components)

```shell
# Change this according to your Helm chart release/deployment name and namespace.
RELEASE_NAME=camunda-dev
RELEASE_NAMESPACE=camunda-dev

# "global.identity.auth.enabled: true" is assumed for all "IDENTITY_*_CLIENT_SECRET" values.

# Only if "connectors.enabled: true".
export IDENTITY_CONNECTORS_CLIENT_SECRET=$(kubectl get secret "${RELEASE_NAME}-connectors-identity-secret" -o jsonpath="{.data.connectors-secret}" | base64 --decode)

# Only if "optimize.enabled: true".
export IDENTITY_OPTIMIZE_CLIENT_SECRET=$(kubectl get secret "${RELEASE_NAME}-optimize-identity-secret" -o jsonpath="{.data.optimize-secret}" | base64 --decode)

# Only if "zeebe.enabled: true".
export IDENTITY_ZEEBE_CLIENT_SECRET=$(kubectl get secret "${RELEASE_NAME}-zeebe-identity-secret" -o jsonpath="{.data.zeebe-secret}" | base64 --decode)
```

#### 2. Create the consolidated secret

```shell
cat << EOF >> existing-secrets-manifest.yaml
---
apiVersion: v1
kind: Secret
metadata:
  name: camunda-credentials
  namespace: "${RELEASE_NAMESPACE}"
type: Opaque
stringData:
  # Only if "connectors.enabled: true".
  identity-connectors-client-token: "${IDENTITY_CONNECTORS_CLIENT_SECRET}"

  # Only if "optimize.enabled: true".
  identity-optimize-client-token: "${IDENTITY_OPTIMIZE_CLIENT_SECRET}"

  # Only if "orchestration.enabled: true".
  identity-orchestration-client-token: "${IDENTITY_ZEEBE_CLIENT_SECRET}"

  # Only if connecting to Elasticsearch
  orchestration-elasticsearch-password: "${ORCHESTRATION_ELASTICSEARCH_SECRET}"
  optimize-elasticsearch-password: "${OPTIMIZE_ELASTICSEARCH_SECRET}"

  # Only if connecting to OpenSearch
  orchestration-opensearch-password: "${ORCHESTRATION_OPENSEARCH_SECRET}"
  optimize-opensearch-password: "${OPTIMIZE_OPENSEARCH_SECRET}"

  # Only if connecting to RDBMS
  orchestration-rdbms-password: "${ORCHESTRATION_RDBMS_SECRET}"
EOF
```

Review `existing-secrets-manifest.yaml` and ensure it contains exactly the secrets for the components enabled in your deployment.

```shell
kubectl apply -n "${RELEASE_NAMESPACE}" -f existing-secrets-manifest.yaml
```

#### 3. Reference the secret in your values file

If a component already uses its own existing secret, make sure to remove that section from the configuration to avoid overriding it:

```yaml
# existing-secrets-values.yaml

global:
  identity:
    auth:
      optimize:
        secret:
          existingSecret: "camunda-credentials"
          existingSecretKey: "identity-optimize-client-token"

connectors:
  security:
    authentication:
      oidc:
        secret:
          existingSecret: "camunda-credentials"
          existingSecretKey: "identity-connectors-client-token"

orchestration:
  data:
    secondaryStorage:
      rdbms:
        secret:
          existingSecret: "camunda-credentials"
          existingSecretKey: "orchestration-rdbms-password"
      elasticsearch:
        auth:
          secret:
            existingSecret: "camunda-credentials"
            existingSecretKey: "orchestration-elasticsearch-password"
      opensearch:
        auth:
          secret:
            existingSecret: "camunda-credentials"
            existingSecretKey: "orchestration-opensearch-password"
  security:
    authentication:
      oidc:
        secret:
          existingSecret: "camunda-credentials"
          existingSecretKey: "identity-orchestration-client-token"
optimize:
  database:
    elasticsearch:
      auth:
        secret:
          existingSecret: "camunda-credentials"
          existingSecretKey: "optimize-elasticsearch-password"
    opensearch:
      auth:
        secret:
          existingSecret: "camunda-credentials"
          existingSecretKey: "optimize-opensearch-password"
```

Then upgrade your deployment via:

```bash
helm upgrade --install "$RELEASE_NAME" camunda/camunda-platform \
  -n "$RELEASE_NAMESPACE" \
  -f existing-secrets-values.yaml
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/secret-management
