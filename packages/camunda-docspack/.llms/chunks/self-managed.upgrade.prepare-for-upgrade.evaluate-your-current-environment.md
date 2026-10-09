# Prepare for upgrade — Evaluate your current environment

Before upgrading, verify that your current installation meets the minimum requirements.

| Area                | What to check                                                                                                                                                                                                                                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Camunda version     | Direct upgrades to 8.10 are supported from 8.9.x. If you are running an earlier version, first upgrade to 8.9. Upgrading to the latest available 8.9.x patch first is strongly recommended for fix coverage. See [upgrading from an earlier version](https://docs.camunda.io/docs/next/self-managed/upgrade/index#upgrading-from-an-earlier-version). |
| Environment support | Ensure your platform and dependencies are supported in 8.10. See [supported environments](https://docs.camunda.io/docs/next/reference/supported-environments).                                                                                                                                                                                        |
| Customizations      | Identify non-default values in Helm values, application YAML files, Ingress configuration, exporters, and secondary storage setup (for example, Elasticsearch/OpenSearch or RDBMS).                                                                                                                                     |

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/prepare-for-upgrade
