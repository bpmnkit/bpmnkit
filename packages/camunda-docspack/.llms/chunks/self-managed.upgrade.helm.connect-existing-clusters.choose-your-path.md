# Connect existing Orchestration Clusters to a Camunda 8.10 Hub — Choose your path

| Existing release         | Path                                                                                                                                                                                                             |
| :----------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 8.10 combined release    | [Move from a combined release to the split topology](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/combined-to-split-topology). That procedure also creates the Hub release                                                                               |
| 8.7, 8.8, or 8.9 release | [Install the Hub release](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/hub-release) with its own databases if you don't have one yet. Then [convert the release](#convert-an-existing-release) on this page |
| 8.6 or earlier           | Upgrade the release to 8.7 or later first. An 8.10 Hub manages Orchestration Clusters from 8.7                                                                                                                   |

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/connect-existing-clusters
