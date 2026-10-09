# Configure Orchestration REST and gRPC TLS modes — Example: REST plaintext + gRPC TLS

This is the SUPPORT-33090 customer shape: an internal Zero-Trust network where the gRPC API must be TLS-protected but the REST API stays on plaintext behind the cluster Ingress.

```yaml
global:
  host: camunda.example.com
  ingress:
    enabled: true
    tls:
      enabled: true
      secretName: camunda-platform-tls
  tls:
    orchestration:
      grpc:
        enabled: true
        cert:
          secret:
            existingSecret: orchestration-grpc-cert
            existingSecretKey: tls.crt
        privateKey:
          secret:
            existingSecretKey: tls.key
    caBundle:
      secret:
        existingSecret: camunda-internal-ca
        existingSecretKey: ca.crt
```

The chart mounts `orchestration-grpc-cert` into the Orchestration pod and sets `CAMUNDA_API_GRPC_SSL_CERTIFICATE` / `CAMUNDA_API_GRPC_SSL_CERTIFICATEPRIVATEKEY` to the mounted paths automatically. Create the secret out-of-band, for example:

```shell
kubectl create secret generic orchestration-grpc-cert \
  --from-file=tls.crt=./tls.crt \
  --from-file=tls.key=./tls.key
```

With this configuration the chart:

- Sets `CAMUNDA_API_GRPC_SSL_ENABLED=true` on the Orchestration container.
- Annotates the public gRPC Ingress with `nginx.ingress.kubernetes.io/backend-protocol: GRPCS`.
- Renders the Web Modeler REST API ConfigMap with `grpc: grpcs://<orchestration-grpc-service>:26500`.
- Renders the Connectors ConfigMap with `grpc-address: https://<orchestration-grpc-service>:26500`.

Trust material for in-cluster Java components flows through [`global.tls.caBundle`](#recipe-cert-manager--lets-encrypt-or-internal-issuer). The CA bundle is mounted as a Java truststore into Orchestration, Web Modeler, Connectors, and any other Java components in the release.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/orchestration-tls-modes
