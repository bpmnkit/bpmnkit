# Deploy multiple Optimize instances with Helm — Check the prerequisites

Before you install the releases, prepare the following:

- A production-ready Kubernetes cluster and a Helm CLI version supported by the Camunda 8.10 chart.
- A single-region Camunda deployment. This pattern relies on Management Identity, which [dual-region deployments don't support](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region#limitations) — Optimize itself isn't supported there either.
- A namespace with enough capacity for the platform and a second Optimize Deployment.
- An external Elasticsearch or OpenSearch cluster configured for the platform release. Follow the [Elasticsearch](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/using-external-elasticsearch) or [OpenSearch](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/using-external-opensearch) guide.
- An external Keycloak or supported OIDC provider and a Management Identity configuration. The reference files use the [external Keycloak setup](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-keycloak).
- An `ingress-nginx` controller, one DNS host, and a TLS Secret for the host. The example relies on `ingress-nginx` merging paths from two Ingress objects with the same host and Ingress class.
- A production values file for the full platform, including external PostgreSQL, datastore authentication and TLS, image pull credentials, and component resources. Follow the [production installation guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index).
- Existing Kubernetes Secrets for every credential referenced by the values files. Follow the [secret management guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/secret-management#method-2-external-kubernetes-secrets-recommended).

The examples use Elasticsearch service `elasticsearch-master` and Keycloak service `keycloak` in the Camunda namespace. Use fully qualified service names when a dependency runs in another namespace.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/deploy-multiple-optimize-instances
