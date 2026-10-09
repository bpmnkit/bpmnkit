# Install Helm chart in air-gapped environments — Configuration — List required images

The Docker images required for your Helm release depend on your `values.yaml`. To list the required images, run the following command:

```shell
helm repo add camunda https://helm.camunda.io
helm repo update
helm template camunda/camunda-platform -f values.yaml | grep 'image:'
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/registry-and-images/air-gapped-installation
