# Configure Orchestration REST and gRPC TLS modes — Optimize TLS — PKCS12 example

```yaml
global:
  tls:
    optimize:
      enabled: true
      type: pkcs12
      keyAlias: optimize-rest
      cert:
        secret:
          existingSecret: optimize-tls-keystore
          existingSecretKey: keystore.p12
      keystorePassword:
        secret:
          existingSecretKey: keystore-password
    caBundle:
      secret:
        existingSecret: camunda-internal-ca
        existingSecretKey: ca.crt
```

Create the Secret out-of-band:

```shell
openssl pkcs12 -export \
  -in ./tls.crt -inkey ./tls.key \
  -out ./keystore.p12 \
  -password pass:changeit \
  -name optimize-rest

kubectl create secret generic optimize-tls-keystore \
  --from-file=keystore.p12=./keystore.p12 \
  --from-literal=keystore-password=changeit
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/orchestration-tls-modes
