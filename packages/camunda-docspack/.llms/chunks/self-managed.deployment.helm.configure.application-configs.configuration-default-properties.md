# Configure component configuration — Configuration — Default properties

The `helm template` command can show you the application's default configuration as rendered by the chart.

- Use this output as a **reference** to discover the right keys and defaults.
- Only copy the full content into `<componentName>.configuration` if you intentionally want to **replace** the default config (advanced).

Keep the original `values.yaml` unchanged and maintain a separate file with your custom settings. For details, see [Creating your own values files](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/self-managed/deployment/helm/chart-parameters#creating-your-own-values-files). To generate the default configuration, replace `<your-release-name>` with your release name and run:

```bash
helm template <your-release-name> \
    -f values.yaml \
    camunda/camunda-platform \
    --show-only templates/operate/configmap.yaml
```

The `--show-only` flag prints the `configmap`.

- If you are using `<componentName>.extraConfiguration`, use the rendered `application.yml` to identify the correct keys and then add only the overrides you need.
- If you are using `<componentName>.configuration`, copy the full `application.yml` content, modify it, and place it under the appropriate `<component>.configuration` key in `values.yaml`.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs
