# Red Hat OpenShift — Deploy Camunda 8 via Helm charts — no-scc

To use permissive SCCs, simply install the charts as they are. Follow the [general Helm deployment guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install).

```bash
yq '. *+ load("generic/openshift/single-region/helm-values/no-scc.yml")' values.yml > values-merged.yml && mv values-merged.yml values.yml
```

Review the permissive SCC configuration

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/single-region/helm-values/no-scc.yml
```

#### Enable Enterprise components

Some components are not enabled by default in this deployment. For more information on how to configure and enable these components, refer to [configuring Enterprise components and connectors](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install#configuring-enterprise-components-and-connectors).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
