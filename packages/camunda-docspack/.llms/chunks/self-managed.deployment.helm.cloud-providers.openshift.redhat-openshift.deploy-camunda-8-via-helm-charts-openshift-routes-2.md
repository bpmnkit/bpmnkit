# Red Hat OpenShift — Deploy Camunda 8 via Helm charts — openshift-routes (2)

2. After you have merged the OpenShift overlay into your local `values.yml` (see the _Configure Route TLS_ section below), override `orchestration.ingress.grpc.tls.secretName` in that `values.yml`. The default value `'-'` lets the Ingress Operator manage the certificate automatically; on ROSA HCP, replace it with the Secret you just created:

   ```bash
   yq -i ".orchestration.ingress.grpc.tls.secretName = \"$CAMUNDA_PLATFORM_ROUTER_TLS_SECRET\"" \
       values.yml
   ```

   This keeps the upstream `orchestration-route.yml` overlay file untouched so future updates can be pulled cleanly.

After applying both steps, the auto-generated Route for the Zeebe gRPC Ingress will carry an inlined `spec.tls.certificate`, HAProxy will emit a per-SNI `[alpn h2,http/1.1]` `crt-list` entry, and gRPC clients will negotiate `h2` successfully.

**Warning**
`copy-router-tls-secret.sh` copies the certificate as it exists at that moment. It does not track later changes. When the router wildcard certificate is rotated or replaced, the copy in the Camunda namespace goes stale. The Route keeps serving the old certificate, and gRPC clients fail once that certificate expires or is revoked.

Re-run the script after any router certificate change, then confirm the Route picked the new certificate up:

```bash
oc -n "$CAMUNDA_NAMESPACE" get route -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.tls.certificate}{"\n"}{end}'
```

Restarting the Camunda pods does not refresh this certificate and only causes downtime: the pods use the separate internal service certificate described below, not the Route one. To avoid the manual step entirely, manage the copy with a controller that keeps the two Secrets in sync.

#### Configure Route TLS

Configure the Zeebe Gateway to use an encrypted TLS connection. In OpenShift, the connection from HAProxy to the Zeebe Gateway service can use HTTP/2 only for re-encrypt or pass-through routes, not for edge-terminated or insecure routes.

1. **Zeebe cluster:** at least one [TLS secret](https://kubernetes.io/docs/concepts/configuration/secret/#tls-secrets) is required for the Zeebe Gateway **service**; a second TLS secret for the **route** is optional and depends on your OpenShift flavor:

- The first TLS secret is issued to the Zeebe Gateway Service Name. This must use the [PKCS #8 syntax](https://en.wikipedia.org/wiki/PKCS_8) or [PKCS #1 syntax](https://en.wikipedia.org/wiki/PKCS_1) as Zeebe only supports these, referenced as `camunda-platform-internal-service-certificate`. This certificate is also used in the other components such as Operate, Tasklist.

  In the example below, a TLS certificate is generated for the Zeebe Gateway service with an [annotation](https://docs.openshift.com/container-platform/latest/security/certificates/service-serving-certificate.html). The generated certificate will be in the form of a secret.

  Another option is [Cert Manager](https://docs.openshift.com/container-platform/latest/security/cert_manager_operator/index.html). For more details, review the [OpenShift documentation](https://docs.openshift.com/container-platform/latest/networking/routes/secured-routes.html#nw-ingress-creating-a-reencrypt-route-with-a-custom-certificate_secured-routes).

  PKCS #8, PKCS #1 syntax

PKCS #1 private key encoding. PKCS #1 produces a PEM block that contains the private key algorithm in the header and the private key in the body. A key that uses this can be recognised by its BEGIN RSA PRIVATE KEY or BEGIN EC PRIVATE KEY header. NOTE: This encoding is not supported for Ed25519 keys. Attempting to use this encoding with an Ed25519 key will be ignored and default to PKCS #8.

PKCS #8 private key encoding. PKCS #8 produces a PEM block with a static header and both the private key algorithm and the private key in the body. A key that uses this encoding can be recognised by its BEGIN PRIVATE KEY header.

[PKCS #1, PKCS #8 syntax definition from cert-manager](https://cert-manager.io/docs/reference/api-docs/#cert-manager.io/v1.PrivateKeyEncoding)

- The second TLS secret is optional and applies only to the exposed Route. By default, `orchestration-route.yml` ships with `orchestration.ingress.grpc.tls.secretName: '-'`, which lets the OpenShift Ingress Operator manage the Route TLS certificate automatically by using the cluster's default wildcard. This is the recommended setup on self-managed OpenShift. If you want to terminate the Route with your own custom certificate, for example, the same TLS secret used for Ingress, set `orchestration.ingress.grpc.tls.secretName` to the name of a TLS secret in the Camunda namespace. The Zeebe Gateway Ingress is configured as a [Re-encrypt Route](https://docs.openshift.com/container-platform/latest/networking/routes/route-configuration.html#nw-ingress-creating-a-route-via-an-ingress_route-configuration) in either case. On ROSA HCP, an explicit per-Route certificate is required for ALPN `h2` to work. See [Enable ALPN h2 on ROSA HCP](#enable-alpn-h2-on-rosa-hcp).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
