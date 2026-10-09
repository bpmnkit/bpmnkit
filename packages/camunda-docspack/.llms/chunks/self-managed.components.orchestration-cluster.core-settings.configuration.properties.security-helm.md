# Property reference — Security — helm

**Note**
The `orchestration.*` Helm values marked **Deprecated in chart 15.x** in the tables below are deprecated as of chart 15.x (8.10). They continue to work, and each one logs a `[camunda][warning] DEPRECATION` message on `helm install` or `helm upgrade`. Set them through `orchestration.extraConfiguration` instead, using the application property names from the **Application properties** tab. This is a chart packaging change: the `camunda.security.*` application properties are unchanged in 8.10.

For the full list and the migration targets, see [deprecated application configuration Helm keys](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100#deprecated-application-configuration-helm-keys).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
