# Configure Orchestration REST and gRPC TLS modes — First-class values — Recipe: cert-manager + Let's Encrypt or internal Issuer

cert-manager produces `kubernetes.io/tls` Secrets with `tls.crt` + `tls.key`. The chart consumes those directly — PEM for REST (via `type: pem`) and PEM for gRPC.

This recipe assumes cert-manager v1.x is already installed in the cluster. If it is not, install it first per the [cert-manager installation guide](https://cert-manager.io/docs/installation/) (typically `helm install cert-manager jetstack/cert-manager --set crds.enabled=true`).

The four-step example below creates and uses an internal CA. For a public ACME provider such as Let's Encrypt, don't apply steps one through three. In the server `Certificate` from step four, replace `issuerRef.name` and `issuerRef.kind` with the name and kind of your existing ACME `Issuer` or `ClusterIssuer`. Public CA certificates already present in the JVM default truststore don't need `global.tls.caBundle`.

```yaml
# 1. Bootstrap Issuer. A bare selfSigned Issuer cannot issue a CA bundle on
#    its own — it only signs each Certificate with that Certificate's own
#    private key. It exists solely to sign step 2 (the actual CA Certificate).
apiVersion: cert-manager.io/v1
kind: Issuer
metadata:
  name: camunda-selfsigned-bootstrap
  namespace: camunda
spec:
  selfSigned: {}
---
# 2. The actual CA Certificate. isCA: true makes this a CA cert whose
#    private key signs subsequent leaf certs. The resulting Secret
#    (camunda-ca-bundle) is what global.tls.caBundle.secret.existingSecret
#    points at — Web Modeler and Connectors load it into the JVM truststore.
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: camunda-ca
  namespace: camunda
spec:
  isCA: true
  commonName: camunda-ca
  secretName: camunda-ca-bundle
  duration: 87600h # 10 years — pick a CA lifetime longer than any leaf
  privateKey:
    algorithm: ECDSA
    size: 256
  issuerRef:
    name: camunda-selfsigned-bootstrap
    kind: Issuer
---
# 3. The CA Issuer. Uses the CA cert+key from step 2 to sign leaf
#    Certificates. This is the Issuer your server Certificates reference.
apiVersion: cert-manager.io/v1
kind: Issuer
metadata:
  name: camunda-ca-issuer
  namespace: camunda
spec:
  ca:
    secretName: camunda-ca-bundle
---
# 4. Server Certificate (gRPC shown; REST is identical with its own
#    secretName + dnsNames matching the REST service).
#
# IMPORTANT: dnsNames must match the actual Kubernetes Service name
# that fronts the Orchestration gRPC port (26500). Confirm with:
#   kubectl -n camunda get svc -l app.kubernetes.io/component=zeebe-gateway
# The Service name derives from orchestration.serviceName; in the chart 8.10
# default layout it is typically `<release>-zeebe-gateway` (the
# zeebe-gateway component label is kept for backward compatibility through
# the Orchestration rebrand). Always confirm the actual name with the
# command above rather than assuming it.
# Substitute your actual release name for `my-release` below.
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: orchestration-grpc-cert
  namespace: camunda
spec:
  secretName: orchestration-grpc-cert # → matches existingSecret in values
  duration: 8760h
  renewBefore: 720h
  issuerRef:
    name: camunda-ca-issuer # step 3, NOT the bootstrap
    kind: Issuer
  dnsNames:
    - my-release-zeebe-gateway
    - my-release-zeebe-gateway.camunda.svc
    - my-release-zeebe-gateway.camunda.svc.cluster.local
```

Then in the chart values:

```yaml
global:
  tls:
    orchestration:
      autoRollout: true # cert-manager renews on schedule; this rolls Orchestration on renewal
      rest:
        enabled: true
        type: pem
        cert:
          secret:
            existingSecret: orchestration-rest-cert # a step-4 Certificate for the REST service
            # existingSecretKey defaults to tls.crt when type=pem (auto-substituted)
        # privateKey.secret.existingSecretKey defaults to tls.key
      grpc:
        enabled: true
        cert:
          secret:
            existingSecret: orchestration-grpc-cert
            # existingSecretKey defaults to tls.crt
        # privateKey.secret.existingSecretKey defaults to tls.key
    caBundle:
      secret:
        # The CA cert Secret from step 2 above. Web Modeler and Connectors
        # load this into the JVM truststore so their handshakes to the
        # Orchestration REST and gRPC servers succeed. Skip this whole
        # block if your server certs are from a public CA already in the
        # JVM default truststore (Let's Encrypt, DigiCert, etc.).
        existingSecret: camunda-ca-bundle
        existingSecretKey: ca.crt
      autoRollout: true
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/orchestration-tls-modes
