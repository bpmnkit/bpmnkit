# Configure the Helm chart with Ingress

Set up and configure Ingress for Camunda 8 Self-Managed Helm deployments.

**Caution**
Starting with Camunda 8.8, the separated Ingress configuration is no longer supported. Instead, follow the combined Ingress setup described in this guide. If you want to replicate the behavior of the previous separated Ingress approach, check separated Ingress migration.

Camunda 8 Self-Managed has multiple web applications and gRPC services. You can expose them externally with a combined Ingress setup.


## Prerequisites

- An Ingress controller deployed in advance. The examples below use the [Ingress-nginx controller](https://github.com/kubernetes/ingress-nginx), but you can use any Ingress controller by setting `global.ingress.className` (and `orchestration.ingress.grpc.className` for the Zeebe gRPC Ingress).
- The annotations your controller needs. Starting with Camunda 8.10 (chart 15.x), the chart's default Ingress-nginx annotation set comes from a compatibility shim that you can turn off with `global.compatibility.nginx.renderAnnotations: false`; see [Ingress-nginx annotation defaults deprecated in the Helm chart](https://docs.camunda.io/docs/next/reference/announcements-release-notes/8100/8100-announcements#ingress-annotation-defaults-deprecated).

**Note**
[Ingress-nginx reached end of life in March 2026](https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/). The Camunda 8 reference architectures deploy [Contour](https://projectcontour.io/) instead. The examples on this page still use Ingress-nginx annotations. With another controller, translate them to its equivalents. See [configure the gRPC upstream](#configure-the-grpc-upstream) for the gRPC annotation each controller expects.

- TLS configuration is not included in the examples because it varies between different workflows. Configure TLS in one of these ways:
  - Use `ingress.tls` options directly.
  - Use an external tool such as [Cert-Manager](https://github.com/cert-manager/cert-manager) with `ingress.annotations`.  
    For more information, see the available [configuration options](https://artifacthub.io/packages/helm/camunda/camunda-platform#configuration).

**Note**
Camunda 8 Helm chart only deploys Ingress resources. It does not manage or deploy Ingress controllers. You must have an Ingress controller running in your cluster.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/ingress-setup
