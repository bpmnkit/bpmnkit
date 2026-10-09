# Kubernetes deployment overview — Requirements — Infrastructure (2)

| API                                                                             | Support                                        | Setup guide                                                                                                       |
| ------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)     | Supported, used by the reference architectures | [Configure the Helm chart with Ingress](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/ingress-setup)         |
| [Gateway API](https://kubernetes.io/docs/concepts/services-networking/gateway/) | Supported                                      | [Configure the Helm chart with Gateway API](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/gateway-api-setup) |

The reference architectures use the Ingress API with [Contour](https://projectcontour.io/), a CNCF Ingress controller backed by the [Envoy proxy](https://www.envoyproxy.io/), which supports gRPC and HTTP/2. This solution is applicable independent of the cloud provider.

Contour is exposed through a `LoadBalancer` Service, so the load balancer your cloud provider creates for it operates at layer 4 (on AWS, a Network Load Balancer).

Contour is a choice, not a requirement. Camunda tests the reference architectures with Contour, so that is what the procedures install, but any Ingress controller supporting gRPC and HTTP/2 works, for example [Traefik](https://traefik.io/traefik/), [HAProxy](https://haproxy-ingress.github.io/), or [Envoy Gateway](https://gateway.envoyproxy.io/). Select your own controller through `global.ingress.className`.

Each controller declares the gRPC upstream differently, and not on the same object. For the annotation each controller needs, see [configure the gRPC upstream](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/ingress-setup#configure-the-grpc-upstream).

**Note**
[Ingress-nginx reached end of life in March 2026](https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/). The Camunda 8 reference architectures moved to Contour in 8.9.

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes
