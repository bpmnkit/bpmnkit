# Configure Orchestration REST and gRPC TLS modes

Enable REST TLS and gRPC TLS independently on the Orchestration component with first-class Helm values.

Orchestration exposes a REST API (`SERVER_SSL_ENABLED`) and a gRPC API (`CAMUNDA_API_GRPC_SSL_ENABLED`) as independent server settings. The Camunda 8 Helm chart provides a first-class values surface that configures both server flags, the public NGINX Ingress backend protocol, and the in-cluster client schemes used by Web Modeler and Connectors. Customers no longer need to duplicate `webModeler.restapi.clusters` or `connectors.configuration` blocks just to enable Orchestration TLS.

**Caution: Trust bundle is required for self-signed and private-PKI certificates**

The settings on this page configure the Orchestration **server** and the **NGINX Ingress** legs. They do **not** by themselves teach in-cluster Java clients (Web Modeler, Connectors) to trust the cert. If the Orchestration server certificate is self-signed or issued by a private/internal CA, you **must also** set `global.tls.caBundle.secret.existingSecret` to a Secret holding the CA bundle that signed it. Without it, the JVM default truststore is used and gRPC/REST handshakes from Web Modeler and Connectors will fail with `PKIX path building failed`. The minimal caBundle configuration is shown in the [cert-manager recipe](#recipe-cert-manager--lets-encrypt-or-internal-issuer) below.

Certificates issued by a public CA already present in the JVM truststore (Let's Encrypt, DigiCert, etc.) do not require this.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/orchestration-tls-modes
