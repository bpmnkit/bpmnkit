# Move from a combined release to the split topology — What moves and what doesn't

| Component             | Moves cleanly? | Why                                                                                                                       |
| :-------------------- | :------------- | :------------------------------------------------------------------------------------------------------------------------ |
| Camunda Hub           | Yes            | Stateless at the workload layer; its state is in an external relational database                                          |
| Management Identity   | Yes            | Same. Its state is in an external relational database                                                                     |
| Connectors            | Yes            | Stateless                                                                                                                 |
| Optimize              | Yes            | Its state is in Elasticsearch or OpenSearch, reached by index prefix                                                      |
| Orchestration Cluster | **No**         | Broker PVCs are StatefulSet volume claim templates holding partition logs and snapshots, which are the live process state |

Secondary storage doesn't substitute for broker storage. Installing a fresh orchestration release creates a new, empty Orchestration Cluster: the Operate and Tasklist data in Elasticsearch describes process instances whose authoritative state lives in the broker volumes you left behind.

**Warning**
Switching an existing release to `global.topology.mode: hub` suppresses its Orchestration Cluster StatefulSet. The PVCs remain, but the cluster stops. Never flip a release running your only Orchestration Cluster to `hub` mode.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/combined-to-split-topology
