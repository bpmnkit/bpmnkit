# Camunda 8 system configuration — Licensing

Camunda 8 Self-Managed only

Installations of Camunda 8 Self-Managed which require a license can provide their license key to the components as an environment variable:

| Environment variable  | Description                                                          | Default value |
| --------------------- | -------------------------------------------------------------------- | ------------- |
| `CAMUNDA_LICENSE_KEY` | Your Camunda 8 license key, if your installation requires a license. | None          |

For Helm installations, license keys can be configured globally in your `values.yaml` file. See [License key](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/license-key) for more details.

**Note**
Camunda 8 components without a valid license may display **Non-Production License** in the navigation bar and issue warnings in the logs. These warnings have no impact on Optimize startup or functionality. To obtain a license, visit the [Camunda Enterprise page](https://camunda.com/platform/camunda-platform-enterprise-contact/).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration-platform-8
