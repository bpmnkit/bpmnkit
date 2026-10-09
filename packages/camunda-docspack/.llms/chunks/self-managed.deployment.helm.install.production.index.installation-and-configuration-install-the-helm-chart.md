# Install Camunda for production with Helm — Installation and configuration — Install the Helm chart

As there will be a Helm deployment in each namespace, create your own `hub-values.yaml` and `orchestration-values.yaml`, or modify an existing setup by applying the production recommendations in the next section. Example values files can be found at the [end of this guide](#create-a-production-valuesyaml).

Run the Hub installation command if you're creating a new Hub release. For an existing Hub, update its cluster inventory and install only the new orchestration release:

```bash
# This will add our chart repository so you can pull from it
helm repo add camunda https://helm.camunda.io
# This will update the chart repository. Please make sure to run this command before every install or upgrade
helm repo update
# This will install the latest Camunda Helm chart in the Hub namespace with the latest applications/dependencies.
helm install camunda camunda/camunda-platform --version $HELM_CHART_VERSION -n hub \
    --values hub-values.yaml
# This will install the latest Camunda Helm chart in the Orchestration namespace with the latest applications/dependencies.
helm install camunda camunda/camunda-platform --version $HELM_CHART_VERSION -n orchestration \
    --values orchestration-values.yaml
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index
