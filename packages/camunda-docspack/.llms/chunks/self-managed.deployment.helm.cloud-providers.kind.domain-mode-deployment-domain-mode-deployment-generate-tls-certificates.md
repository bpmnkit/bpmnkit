# Deploy Camunda 8 to a local kind cluster — Domain mode deployment {#domain-mode-deployment} — Generate TLS certificates

Generate locally-trusted TLS certificates, using [mkcert](https://github.com/FiloSottile/mkcert):

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/local/kubernetes/kind-single-region/procedure/certs-generate.sh
```

Using certificates from real certificate authorities (CAs) for local development can be dangerous or impossible, for hosts like `localhost` or `127.0.0.1`, and self-signed certificates cause trust errors. mkcert solves this by automatically creating and installing a local CA in the system root store and generating locally-trusted certificates.

The certificate generation script:

1. Installs the mkcert CA in your system trust store (first run only).
2. Generates certificates for `camunda.example.com`, `zeebe-camunda.example.com` and `*.camunda.example.com`.
3. Stores certificates in `.certs/`.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind
