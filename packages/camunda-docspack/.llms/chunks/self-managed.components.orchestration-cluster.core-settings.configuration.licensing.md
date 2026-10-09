# Licensing

Installations of Camunda 8 Self-Managed which require a license can provide their license key to the components as an environment variable.

---
---

Camunda 8 Self-Managed only

Installations of Camunda 8 Self-Managed which require a license can provide their license key to the components as an environment variable:

| Environment variable  | Description                                                          | Default value |
| --------------------- | -------------------------------------------------------------------- | ------------- |
| `CAMUNDA_LICENSE_KEY` | Your Camunda 8 license key, if your installation requires a license. | None          |

For Helm installations, license keys can be configured globally in your `values.yaml` file. See the [License key](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/license-key) for more details.

**Note**
Camunda 8 components without a valid license may display **Non-Production License** in the navigation bar and issue warnings in the logs. These warnings have no impact on startup or functionality.

**Camunda Hub without a license:** Camunda Hub is limited to **five concurrent users** when running without a valid enterprise license. This applies to Self-Managed installations used for testing or development purposes. To support additional users or for production use, obtain a Camunda Self-Managed Enterprise Edition license by visiting the [Camunda Enterprise page](https://camunda.com/platform/camunda-platform-enterprise-contact/).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/licensing
