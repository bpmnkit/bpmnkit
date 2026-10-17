# Supported environments — Component requirements — Component version matrix

The following matrix shows which component versions work together. The components in each cell must share the same `minor` and `patch` version except Desktop Modeler, which follows its own versioning and is not version-locked to other components.

For Helm-managed deployments, use the Helm chart [version matrix](https://helm.camunda.io/camunda-platform/version-matrix/) as the source of truth for the component versions bundled in a supported chart release. Do not manually override bundled component image tags unless a specific upgrade guide or release note instructs you to do so.

| [Orchestration Cluster](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#orchestration-cluster) | [Management and design](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#camunda-hub)    |
| --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Orchestration Cluster 8.10.XConnectors 8.10.XOptimize 8.10.X                                          | Management Identity 8.10.XCamunda Hub 8.10.XDesktop Modeler 5.52+                              |
| Orchestration Cluster 8.9.XConnectors 8.9.XOptimize 8.9.X                                             | Management Identity 8.10.XCamunda Hub 8.10.XDesktop Modeler 5.46+                              |
| Orchestration Cluster 8.9.XConnectors 8.9.XOptimize 8.9.X                                             | Management Identity 8.9.xSelf-Managed Console 8.9.xWeb Modeler 8.9.xDesktop Modeler 5.46+ |
| Orchestration Cluster 8.8.XConnectors 8.8.XOptimize 8.8.X                                             | Management Identity 8.10.XCamunda Hub 8.10.XDesktop Modeler 5.40+                              |
| Orchestration Cluster 8.8.XConnectors 8.8.XOptimize 8.8.X                                             | Management Identity 8.8.xSelf-Managed Console 8.8.xWeb Modeler 8.8.xDesktop Modeler 5.40+ |

---
Source: https://docs.camunda.io/docs/next/reference/supported-environments
