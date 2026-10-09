# Install Helm chart in air-gapped environments — Configuration — Deploy Helm charts to a repository

You must deploy the [required Helm charts](#required-helm-charts) to your repository. For hosting options, see the [chart repository guide](https://helm.sh/docs/topics/chart_repository).

#### Add a Helm repository

To use the chart, add your Helm chart repository:

```shell
helm repo add camunda https://example.jfrog.io/artifactory/api/helm/camunda-platform
helm repo update
```

#### Override Helm chart values

You can override the image registry and tag in a custom `values.yaml` file:

```yaml
global:
  image:
    registry: example.jfrog.io
    pullSecrets:
      - name: registry-credentials
orchestration:
  image:
    repository: camunda/camunda
    tag: latest
identity:
  image:
    repository: camunda/identity
optimize:
  image:
    repository: camunda/optimize
connectors:
  image:
    repository: camunda/connectors-bundle
camundaHub:
  image:
    # registry and tag will be used for both Camunda Hub images
    tag: latest
  restapi:
    image:
      repository: camunda/hub
  websockets:
    image:
      repository: camunda/hub-websockets
```

The `pullSecrets` value references a Kubernetes Secret with your registry credentials. To create the Secret, see [pull images from a private registry](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/registry-and-images/index#pull-images-from-a-private-registry). If your registry doesn't require credentials, remove `pullSecrets`.

#### Deploy Camunda with custom values

Finally, deploy Camunda with Helm using the custom values file:

```shell
helm install camunda camunda/camunda-platform --version $HELM_CHART_VERSION -f values.yaml
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/registry-and-images/air-gapped-installation
