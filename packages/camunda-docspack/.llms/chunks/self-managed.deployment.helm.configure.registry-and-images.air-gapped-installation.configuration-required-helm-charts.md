# Install Helm chart in air-gapped environments — Configuration — Required Helm charts

The [Camunda Helm chart](https://artifacthub.io/packages/helm/camunda/camunda-platform) must be available in your air-gapped environment.
Download it from [GitHub](https://github.com/camunda/camunda-platform-helm/releases) or run:

```shell
helm repo add camunda https://helm.camunda.io
helm repo update
helm pull camunda/camunda-platform
```

If you deploy infrastructure (PostgreSQL, Elasticsearch, Keycloak) with Kubernetes operators, also make the operator Helm charts and images available in your air-gapped environment, following their documentation. Managed services run outside the cluster, so they need nothing mirrored.

Install the Helm chart by either making it available in a [private repository](https://helm.sh/docs/topics/chart_repository/) that can be accessed from the air-gapped environment or providing the downloaded chart archive locally, for example:

```shell
helm install camunda --version $HELM_CHART_VERSION ./camunda-platform-11.1.0.tgz
```

For supported versions, see [supported environments](https://docs.camunda.io/docs/next/reference/supported-environments#camunda-8-self-managed) and the [RDBMS support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/registry-and-images/air-gapped-installation
