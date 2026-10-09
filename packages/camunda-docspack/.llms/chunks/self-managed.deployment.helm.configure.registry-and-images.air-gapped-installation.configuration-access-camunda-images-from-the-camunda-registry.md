# Install Helm chart in air-gapped environments — Configuration — Access Camunda images from the Camunda registry

All required Camunda images published on Docker Hub are also available in the Camunda registry:

- `registry.camunda.cloud/camunda/<image>`

For example, you can pull the Camunda image from Docker Hub or the Camunda registry:

```shell
docker pull camunda/camunda:latest
docker pull registry.camunda.cloud/camunda/camunda:latest
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/registry-and-images/air-gapped-installation
