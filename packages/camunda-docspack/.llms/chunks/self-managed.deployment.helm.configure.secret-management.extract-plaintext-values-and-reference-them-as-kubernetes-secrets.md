# Helm charts secret management — Extract plaintext values and reference them as Kubernetes Secrets

Use this guide if any sensitive values (client secrets, DB passwords, etc.) are written directly as plaintext in your values.yaml. The production best practice is to store these in Kubernetes Secrets and reference them from your values.

_Note: If your chart already references Kubernetes Secrets (and not plaintext), no change is needed—just ensure each existingSecret/existingSecretKey points to the correct secret and key._

**What you need to do**

1. Find any plaintext secrets in your `values.yaml`.
1. Create a Kubernetes secret that stores those values.
1. Reference that secret in your Helm values file (replace inline plaintext literals).

**Tip**
You can use a single consolidated secret (e.g., app-credentials) or one secret per component. Consolidated keeps things tidy; per-component can be clearer for ownership/rotation. Choose what fits your operations model.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/secret-management
