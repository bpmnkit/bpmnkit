# Install Camunda for production with Helm — Installation and configuration — Ingress TLS setup

In order to access Camunda through HTTPS with Ingress, TLS must be enabled. Enabling TLS requires the following:

1. **Domain name**: A public registered domain that has configurable DNS records. This guide will use `camunda.example.com` as the domain.
2. **TLS certificate**: A TLS certificate created for your domain. The certificate must be an X.509 certificate, issued by a trusted Certificate Authority. The certificate must include the correct domain names (Common Name or Subject Alternative Names) to secure Ingress resources. Reach out to your DNS provider if you are unsure on how to create a TLS certificate. It is not recommended to use self-signed certificates.
3. **TLS secret**: A TLS secret created from your TLS certificate. This guide will use a secret called `camunda-platform`. For more information, see the Kubernetes documentation on how to create a [TLS secret](https://kubernetes.io/docs/concepts/configuration/secret/#tls-secrets).

**Note: Multiple ingress controller support**
Multiple ingress controllers are supported. Specify `ingress.className` or `ingress.grpc.className` to assign the ingress to the desired ingress controller.

The following is an example `values.yaml` configuration using the example Ingress domain and TLS secret:

```yaml
global:
  ingress:
    enabled: true
    className: nginx
    host: camunda.example.com
    tls:
      enabled: true
      secretName: camunda-platform
```

Optionally, you can configure Ingress for the Orchestration Cluster [gRPC API](https://docs.camunda.io/docs/next/apis-tools/zeebe-api/grpc):

```yaml
orchestration:
  ingress:
    grpc:
      enabled: true
      className: nginx
      host: zeebe-grpc.camunda.example.com
      tls:
        enabled: true
        secretName: camunda-platform-zeebe-grpc
```

More information can be found in the [Ingress setup](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/ingress-setup) guide.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index
