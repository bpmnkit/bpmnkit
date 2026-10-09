# Multi-Region RDBMS — Architecture

Three infrastructure layers let one cluster span several regions.

One Orchestration Cluster spans every region. Each region runs its own brokers and connectors, and all of them are members of the same Zeebe cluster. Three infrastructure layers make that possible:

| Layer                           | Responsibility                                                                          |
| :------------------------------ | :-------------------------------------------------------------------------------------- |
| Inter-region network            | Carries broker-to-broker traffic, including Raft, between regions on private addresses. |
| Cross-cluster service discovery | Publishes each region's Zeebe service under a name every other region can resolve.      |
| Relational secondary storage    | Accepts writes from every region through a single endpoint, and replicates them itself. |

The Camunda layer sees one cluster and one database. Everything region-specific lives in the infrastructure layers, which keeps the architecture portable across deployment platforms.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms
