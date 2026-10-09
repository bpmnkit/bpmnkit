# Configure TLS — cert-manager integration

Issue the CA bundle Secret via a `Certificate` resource and reference it as `global.tls.caBundle.secret.existingSecret`:

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: camunda-ca-bundle
  namespace: camunda
spec:
  secretName: camunda-ca-bundle
  issuerRef:
    name: your-internal-ca-issuer
    kind: ClusterIssuer
  commonName: camunda-ca
  isCA: true
  duration: 8760h
  renewBefore: 720h
```

Set `existingSecretKey` to match cert-manager's output key (`ca.crt` by default in `values-tls.yaml`).

**Caution: Include the full trust chain**

If your `ClusterIssuer` is signed by an offline root CA, cert-manager outputs only the issuing intermediate. Concatenate the offline root into the bundle before creating the Secret. PKIX validation needs a chain that ends at a root present in the bundle.

Server certs for Elasticsearch, OpenSearch, and PostgreSQL must be issued separately via additional `Certificate` resources signed by the same `ClusterIssuer`.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/tls
