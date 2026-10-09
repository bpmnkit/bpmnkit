# Install the Camunda 8.10 deployment topology — Release roles

`global.topology.mode` selects what a release deploys:

| Role                                          | Chart versions                                                                                 | Deploys                                                                                                                                                                                          |
| :-------------------------------------------- | :--------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`hub`](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/hub-release)                     | 15.0.0+ (Camunda 8.10)                                                                         | Camunda Hub and Management Identity. The only release that declares `global.topology.clusters`                                                                                                   |
| [`orchestration`](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/orchestration-release) | 15.0.0+ (Camunda 8.10), 14.11.0+ (Camunda 8.9), 13.14.0+ (Camunda 8.8), 12.14.0+ (Camunda 8.7) | 8.10 and 8.9: one Orchestration Cluster and Connectors. 8.8: the same, plus bundled Elasticsearch. 8.7: Zeebe, Zeebe Gateway, Operate, Tasklist, Optimize, Connectors, and bundled Elasticsearch |
| [`optimize`](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/optimize-release)           | 15.0.0+ (Camunda 8.10)                                                                         | Optimize only, for one Physical Tenant                                                                                                                                                           |
| `combined`                                    | All; the implicit behavior of charts without `global.topology`                                 | Every enabled component in one release. This is the default                                                                                                                                      |

**Warning: Older charts ignore the role**
8.7, 8.8, and 8.9 charts older than the minimum versions above have no `global.topology` key. They silently ignore `global.topology.mode` and deploy a combined release, so check the chart version before you set the role.

The chart validates each role's requirements at render time and fails with a `[camunda][error]` message naming the missing value, so a misconfigured topology doesn't reach the cluster. For the per-role requirements, see the installation pages linked in the Role column of the table above.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/index
