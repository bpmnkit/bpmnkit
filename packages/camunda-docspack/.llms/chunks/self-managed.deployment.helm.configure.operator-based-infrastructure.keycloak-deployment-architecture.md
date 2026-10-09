# Deploy required dependencies with Kubernetes operators — Keycloak deployment — Architecture

The Keycloak deployment provides:

- **Database integration**: Connects to CloudNativePG-managed PostgreSQL cluster
- **Authentication path**: Configured to serve under `/auth` path prefix
- **Flexible domain support**: Options for local development, [Contour](https://projectcontour.io/), or [OpenShift routes](https://docs.redhat.com/en/documentation/openshift_container_platform/4.11/html/networking/configuring-routes)
- **Resource optimization**: Sized appropriately for typical Camunda authentication loads
- **Custom Ingress management**: Uses dedicated Ingress manifests integrated within the operator configuration for subpath management constraints

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
