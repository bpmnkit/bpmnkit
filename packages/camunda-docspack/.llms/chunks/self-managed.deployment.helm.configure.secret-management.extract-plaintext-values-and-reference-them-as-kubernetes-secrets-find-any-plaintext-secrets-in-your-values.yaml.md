# Helm charts secret management — Extract plaintext values and reference them as Kubernetes Secrets — Find any plaintext secrets in your `values.yaml`

#### A - If the secrets already exist in Kubernetes

You can read the current (base64-encoded) data from existing secrets and reuse it in your new consolidated secret.

```bash
# Adjust to your release name / namespace
RELEASE_NAME=camunda
RELEASE_NAMESPACE=camunda

# Examples of extracting values from existing secrets (jsonpath reads base64 data)
export SOME_CLIENT_SECRET=$(
  kubectl -n "$RELEASE_NAMESPACE" get secret "${RELEASE_NAME}-some-app-secret" \
    -o jsonpath="{.data.client-secret}" | base64 --decode
)

export DB_ADMIN_PASSWORD=$(
  kubectl -n "$RELEASE_NAMESPACE" get secret "${RELEASE_NAME}-postgresql" \
    -o jsonpath="{.data.postgres-password}" | base64 --decode
)
```

Repeat for each value you want to consolidate.

#### B - If they only exist in values.yaml `values.yaml`

Copy those literal strings into environment variables (locally), then proceed to create a Kubernetes secret from them:

```bash
# Example: pulling from your own notes or from a secure password manager
export SOME_CLIENT_SECRET="paste-the-current-client-secret"
export DB_ADMIN_PASSWORD="paste-the-current-db-admin-password"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/secret-management
