# Dual-Region — Management platform and Orchestration Cluster {#management-platform-and-orchestration-cluster}

A dual-region deployment stretches the Orchestration Cluster across both regions and runs the management platform in a single region. The management platform groups the design and management components that sit outside the Orchestration Cluster. Whether a component belongs to the Orchestration Cluster or to the management platform determines what happens to it when a region is lost, and how you protect it.

| Layer               | Components                                                                        | Stretched across regions | On region loss                                          | Protection                     |
| :------------------ | :-------------------------------------------------------------------------------- | :----------------------- | :------------------------------------------------------ | :----------------------------- |
| Runtime             | Orchestration Cluster (Zeebe, Operate, Tasklist, Admin) and its secondary storage | Yes                      | Processing stops until failover completes, then resumes | Dual-region failover procedure |
| Management platform | Management Identity, Camunda Hub (Web Modeler and Console), and Optimize          | No                       | Unavailable until you restore it                        | Backup and restore             |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region
