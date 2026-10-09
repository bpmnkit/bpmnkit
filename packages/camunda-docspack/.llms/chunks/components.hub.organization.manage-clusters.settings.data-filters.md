# Manage cluster settings — Data filters

<!-- TODO: Confirm with Console team (camunda-cloud-management-apps#8885) which exact docs anchor the Console UI tooltip links to. Update the #data-filters anchor below if different. -->

You can configure data filters on a per-cluster basis to control which process definitions and variables the Optimize exporter processes.

**Note**
This setting applies to Camunda 8 SaaS. On Self-Managed, configure export filters using [Helm values or configuration properties](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/optimize-export-filtering).

Enable the **Enable data filters** toggle to activate filtering. When enabled, the Optimize exporter only processes data matching the configured filters.

Enter one pattern per line, or separate values with spaces, in any of the four fields:

- **Include process definitions**: process definitions to include, matched by exact `bpmnProcessId`. Leave empty to include all process definitions.
- **Exclude process definitions**: process definitions to exclude, matched by exact `bpmnProcessId`. Exclusion takes precedence over inclusion.
- **Include variable names**: variable names to include, matched by prefix. For example, entering `business_` includes all variables whose names start with `business_`. Leave empty to include all variables.
- **Exclude variable names**: variable names to exclude, matched by prefix. Exclusion takes precedence over inclusion.

New SaaS clusters include a default `business_` variable include filter, which limits Optimize to variables whose names start with `business_`. For existing clusters, data filters are disabled by default and can be enabled with one click. No automatic migration occurs. On Self-Managed, no default filter is applied; configure filters manually using [Helm values or configuration properties](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/optimize-export-filtering).

**Warning**
Filtered records are permanently excluded from Optimize. Optimize cannot import data that was never exported, and dropped records cannot be recovered even if you change the filters later. For details, see [Optimize export filtering](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/optimize-export-filtering).

Clicking **Save filters** restarts the cluster. Your cluster is briefly unavailable while it restarts.

For sizing guidance on variable filtering and its impact on Optimize, see [impact of Optimize](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-your-environment#impact-of-optimize).

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/settings
