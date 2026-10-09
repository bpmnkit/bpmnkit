# Install Helm chart in air-gapped environments — Configuration — Required Docker images

The following images must be available in your air-gapped environment:

**Camunda images:**

- [camunda/camunda](https://hub.docker.com/r/camunda/camunda)
- [camunda/optimize](https://hub.docker.com/r/camunda/optimize)
- [camunda/connectors-bundle](https://hub.docker.com/r/camunda/connectors-bundle)
- [camunda/identity](https://hub.docker.com/r/camunda/identity)

**Optional components:**

- [Camunda Hub images](https://docs.camunda.io/docs/next/self-managed/deployment/docker/docker#docker-images-and-configuration-references):
  - [camunda/hub](https://hub.docker.com/r/camunda/hub)
  - [camunda/hub-websockets](https://hub.docker.com/r/camunda/hub-websockets)

**Infrastructure images:**

In Camunda 8.10, the Helm chart no longer bundles infrastructure: the Bitnami subcharts for PostgreSQL, Elasticsearch, and Keycloak are removed. Provide these through managed services or Kubernetes operators, and mirror the images each one requires into your private registry, following the operator or managed-service documentation. See [operator-based infrastructure](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure).

Skip this step if your managed infrastructure services don't require images in your private registry.

**Note**
For the air-gapped procedure based on the bundled Bitnami subcharts (Camunda 8.9 and earlier), see the [8.9 air-gapped guide](https://docs.camunda.io/docs/8.9/self-managed/deployment/helm/configure/registry-and-images/air-gapped-installation/).

A helper script is available in the [camunda-helm-repository](https://github.com/camunda/camunda-platform-helm/blob/c6a6e0c327f2acb8746802fbe03b3774b8284de3/scripts/download-chart-docker-images.sh) to pull and save the Camunda Docker images.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/registry-and-images/air-gapped-installation
