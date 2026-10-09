# Configure Orchestration REST and gRPC TLS modes — Verification

After deploying, confirm the in-cluster endpoints match the chosen mode:

```shell
kubectl -n <namespace> get ingress <release>-grpc \
  -o jsonpath='{.metadata.annotations.nginx\.ingress\.kubernetes\.io/backend-protocol}{"\n"}'

kubectl -n <namespace> get configmap <release>-connectors-configuration \
  -o jsonpath='{.data.application\.yaml}' | grep -E 'grpc-address|rest-address'

kubectl -n <namespace> get configmap <release>-web-modeler-restapi-configuration \
  -o jsonpath='{.data.application\.yaml}' | grep -E '^\s+(grpc|rest):'
```


## Connectors TLS

Connectors in 8.10 runs its own Spring Boot HTTP server. The chart can expose it through an NGINX Ingress or a Gateway API `HTTPRoute`. `global.tls.connectors` mirrors the Orchestration REST configuration and enables TLS at the Connectors pod.

### Modes

- **PKCS12 (default)** — `type: pkcs12`. The chart sets `SERVER_SSL_KEY_STORE`, `SERVER_SSL_KEY_STORE_TYPE=PKCS12`, and `SERVER_SSL_KEY_STORE_PASSWORD` (from a `secretKeyRef`) on the Connectors container. Use when you manage keystores out-of-band (Java PKI, internal CA).
- **PEM (cert-manager compatible)** — `type: pem`. The chart sets `SERVER_SSL_CERTIFICATE` and `SERVER_SSL_CERTIFICATE_PRIVATE_KEY` on the Connectors container. Compatible with cert-manager `kubernetes.io/tls` Secrets out of the box.

In both modes the chart:

- Sets `SERVER_SSL_ENABLED=true` on the Connectors container.
- Mounts the referenced Secret at `/usr/local/camunda/certificates/connectors/`.
- Switches the container probes (`startupProbe` / `readinessProbe` / `livenessProbe`) to `HTTPS`.
- Stamps a `checksum/connectors-tls` pod annotation when `global.tls.connectors.autoRollout: true`, so the next `helm upgrade` rolls Connectors on cert rotation.

### PKCS12 example

```yaml
global:
  tls:
    connectors:
      enabled: true
      type: pkcs12
      keyAlias: connectors-rest
      cert:
        secret:
          existingSecret: connectors-tls-keystore
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
  -name connectors-rest

kubectl create secret generic connectors-tls-keystore \
  --from-file=keystore.p12=./keystore.p12 \
  --from-literal=keystore-password=changeit
```

### PEM example (cert-manager)

```yaml
global:
  tls:
    connectors:
      enabled: true
      type: pem
      cert:
        secret:
          existingSecret: connectors-cert
          # existingSecretKey defaults to tls.crt when type=pem (auto-substituted)
    caBundle:
      secret:
        existingSecret: camunda-internal-ca
        existingSecretKey: ca.crt
```

With a cert-manager `Certificate` that issues into the same namespace, the resulting `kubernetes.io/tls` Secret already carries `tls.crt` and `tls.key` — the chart picks them up automatically (when `cert.secret.existingSecretKey` is left empty in PEM mode, `tls.crt` is substituted automatically).

### Configure inbound routing

The dedicated NGINX Ingress template sets its backend protocol to HTTPS when Connectors TLS is enabled. The Gateway API `HTTPRoute` still forwards plaintext unless a `BackendTLSPolicy` targets the Connectors Service. Create that policy according to your Gateway implementation and configure its certificate validation before enabling pod TLS. Without the policy, inbound Connectors traffic through the generated `HTTPRoute` fails.

### Verification

```shell
kubectl -n <namespace> get deployment <release>-connectors \
  -o jsonpath='{.spec.template.spec.containers[0].env}' | jq '.[] | select(.name|startswith("SERVER_SSL_"))'

kubectl -n <namespace> get deployment <release>-connectors \
  -o jsonpath='{.spec.template.spec.containers[0].readinessProbe.httpGet.scheme}{"\n"}'
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/orchestration-tls-modes
