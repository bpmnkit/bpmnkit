# Install Camunda with Helm for development — Install a specific version

By default, the Camunda Helm chart installs the latest version of the [Camunda 8 applications](https://docs.camunda.io/docs/next/reference/supported-environments). Because Helm chart and application versions are released independently, their version numbers differ. For details, see the [Camunda 8 Helm Chart Version Matrix](https://helm.camunda.io/camunda-platform/version-matrix/).

To install the latest version of the chart and its application dependencies, run:

```shell
helm install camunda camunda/camunda-platform \
    --values https://helm.camunda.io/camunda-platform/values/values-latest.yaml
```

To install a specific chart version, use the `--version` flag with the chart version number. For example, the chart version for Camunda 8.8 is `13`:

```shell
helm install camunda camunda/camunda-platform --version 13 \
    --values https://helm.camunda.io/camunda-platform/values/values-v8.8.yaml
```

Specifying only the major chart version (for example, `13`) installs the latest available `13.x.y` release. You can also specify a minor version (for example, `12.6`) to install the latest `12.6.y` release.

If you are unsure which chart version corresponds to your Camunda application version, run:

```shell
helm search repo -l camunda/camunda-platform
```

This command lists all available chart versions and their corresponding application versions.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install
