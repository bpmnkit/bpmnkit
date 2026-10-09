# Helm chart parameters — Where to find all chart parameters

For a full list of supported Helm chart parameters, including default values and descriptions, see [Helm chart parameters on Artifact Hub](https://artifacthub.io/packages/helm/camunda/camunda-platform/#parameters).

Check this page when installing or upgrading to ensure you use the latest options for your chart version.

### Provided values files

In addition to the default `values.yaml`, the Helm chart repository includes several additional values files for special use cases.  
You can use these files individually or combine them with your own overrides.

| File                 | Purpose                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `values.yaml`        | The default configuration. Includes all chart parameters with baseline values.                                                  |
| `values-local.yaml`  | Optimized for local development (for example, kind or Minikube). Adjusts resource requests and limits for smaller environments. |
| `values-tls.yaml`    | An overlay that enables TLS for the connections the chart can configure. Requires a CA bundle secret in the namespace.          |
| `values-latest.yaml` | Tracks the latest versions of the applications. This may include breaking changes and is intended for early testing.            |
| `values-digest.yaml` | Uses the latest snapshot images referenced by digest (for internal development only).                                           |

### Creating your own values files

To customize parameters, create an override file (for example, `my-overrides.yaml`) with custom settings.  
This approach is recommended over editing `values.yaml` directly.

You can [validate the keys in your overrides with the Camunda Helm Toolkit](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/camunda-helm-toolkit#validate-override-files). This checks the supplied configuration, not the completeness or deployment readiness of all merged Helm values.

### Combining multiple values files

Helm lets you specify multiple values files. You can layer them to build the configuration you need:

```bash
helm install camunda camunda/camunda-platform \
  -f values.yaml \
  -f values-local.yaml \
  -f my-overrides.yaml
```

If the same parameter is defined in more than one file, the value in the last file listed takes precedence. In the example above, settings from `my-overrides.yaml` override values from both `values-local.yaml` and `values.yaml`.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/chart-parameters
