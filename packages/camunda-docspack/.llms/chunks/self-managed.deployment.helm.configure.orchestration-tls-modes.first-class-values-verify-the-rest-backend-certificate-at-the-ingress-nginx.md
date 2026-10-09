# Configure Orchestration REST and gRPC TLS modes — First-class values — Verify the REST backend certificate at the Ingress (NGINX)

By default, NGINX Ingress uses TLS for the REST upstream when `backend-protocol: HTTPS` is set, but it doesn't verify the upstream certificate. Enable `proxyVerify` under `global.tls.orchestration.rest` to verify the REST certificate. The chart doesn't support `proxyVerify` for gRPC because the Ingress-NGINX controller applies its `proxy-ssl-*` annotations to `proxy_pass`, not the `grpc_pass` used by a GRPCS backend.

```yaml
global:
  tls:
    orchestration:
      rest:
        enabled: true
        type: pem
        cert:
          secret:
            existingSecret: orchestration-rest-cert
            existingSecretKey: tls.crt
        privateKey:
          secret:
            existingSecretKey: tls.key
        proxyVerify:
          enabled: true
          caSecret:
            secret:
              existingSecret: orchestration-upstream-ca # PEM CA bundle
              existingSecretKey: ca.crt
          sniHost: "" # set when the cert SAN does not match the in-cluster service name
```

This adds the following annotations to the `/orchestration` Ingress:

- `nginx.ingress.kubernetes.io/proxy-ssl-verify: on`
- `nginx.ingress.kubernetes.io/proxy-ssl-secret: <namespace>/<caSecret.secret.existingSecret>`
- `nginx.ingress.kubernetes.io/proxy-ssl-name: <sniHost-or-orchestration-service-name>`
- `nginx.ingress.kubernetes.io/proxy-ssl-server-name: on`

The chart defaults `proxy-ssl-name` to the Orchestration Service name. Set `sniHost` only when the certificate subject alternative name requires a different hostname.

The CA Secret must contain the CA bundle under the fixed `ca.crt` key. By default, the chart expects the Secret in the same namespace as the Ingress resource. To reference a Secret in a different namespace, set `caSecret.namespace` and configure the Ingress-NGINX controller with `allow-cross-namespace-resources=true`. The chart fails template rendering if `proxyVerify.enabled: true` and `caSecret.secret.existingSecret` is empty.

Note that `proxyVerify` covers only the NGINX → Orchestration leg. In-cluster Java clients (Web Modeler, Connectors) trust upstream certs through `global.tls.caBundle`, which is independent.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/orchestration-tls-modes
