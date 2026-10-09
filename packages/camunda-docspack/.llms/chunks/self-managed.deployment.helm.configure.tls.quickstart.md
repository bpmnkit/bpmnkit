# Configure TLS — Quickstart

### Prerequisites

- Helm CLI 3.10+ or 4.x
- A PEM-encoded CA bundle file (`your-ca-bundle.pem`) containing the root and any intermediate certs that signed your datastore / IdP certs

### 1. Create the CA bundle Secret

```bash
NAMESPACE=camunda

kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

kubectl -n "$NAMESPACE" create secret generic camunda-ca-bundle \
  --from-file=ca.crt=./your-ca-bundle.pem
```

### 2. Apply the overlay

Download the overlay (ships in the chart repo, not in the `helm repo` cache):

```bash
curl -fsSLO https://raw.githubusercontent.com/camunda/camunda-platform-helm/main/charts/camunda-platform-8.10/values-tls.yaml
```

Install or upgrade with the overlay:

```bash
helm upgrade --install camunda camunda/camunda-platform \
  --version 15.x \
  --namespace "$NAMESPACE" \
  -f values-tls.yaml \
  -f your-values.yaml
```

`your-values.yaml` provides datastore URLs, credentials, and other scenario config. The TLS overlay is additive — it does not replace your existing values.

Download the overlay from the same chart version you install. The `main` branch tracks the latest chart, so if you pin a specific chart release, fetch `values-tls.yaml` from the matching release tag instead of `main`.

### 3. Verify

Confirm `SSL_CERT_FILE`, `JAVA_TOOL_OPTIONS` (with truststore path), and a `ca-bundle` volume appear in the pod spec:

```bash
kubectl -n "$NAMESPACE" get pod -l app.kubernetes.io/component=zeebe-broker -o yaml | \
  grep -A 1 'JAVA_TOOL_OPTIONS\|SSL_CERT_FILE\|ca-bundle'
```

See also [Verify no plaintext fallback](#verify-no-plaintext-fallback).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/tls
