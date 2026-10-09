# Move from a combined release to the split topology

Plan and execute the move from a single combined Camunda 8.10 Helm release to separate Hub, Orchestration Cluster, and Optimize releases.

Move an existing single-release Camunda 8.10 deployment to the split topology: one Hub release, one release per Orchestration Cluster, and one Optimize release per Physical Tenant.

This is a topology change, not a version upgrade. It doesn't change any component version, and it isn't required. A `combined` release remains both supported and the chart default.

**Warning**
The hard part of this move is data, not values. Orchestration Cluster broker volumes hold active process state and don't move between releases. Read [what moves and what doesn't](#what-moves-and-what-doesnt) before you plan the move.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/combined-to-split-topology
