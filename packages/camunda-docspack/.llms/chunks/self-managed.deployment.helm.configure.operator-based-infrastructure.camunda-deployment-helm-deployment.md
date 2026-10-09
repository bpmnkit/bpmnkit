# Deploy required dependencies with Kubernetes operators — Camunda deployment — Helm deployment

First, source the environment setup script to set `HELM_CHART_VERSION` and other required variables. See the [Helm chart version matrix](https://helm.camunda.io/camunda-platform/version-matrix/) to choose the appropriate chart version for your deployment:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/0-set-environment.sh
```

Then, deploy Camunda using the infrastructure configuration files you saved from previous sections.

For end-to-end configuration patterns (OIDC-enabled "Full Cluster" including Optimize, Web Modeler, Console, and Identity), see the Full Cluster section of our [Helm installation guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install#full-cluster).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
