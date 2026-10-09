# Dual-Region

Dual-Region is Camunda's production-proven dual-region configuration with continuous replication.

<!-- Image source: https://docs.google.com/presentation/d/1mbEIc0KuumQCYeg1YMpvdVR8AEUcbTWqlesX-IxVIjY/edit?usp=sharing -->

Dual-Region is Camunda's certified, continuous-replication multi-region configuration. A Camunda Orchestration Cluster runs in both a primary and a secondary region at all times, with Zeebe replicating its log stream across both regions using the Raft protocol. Secondary storage (Elasticsearch) is populated independently in each region via the [Camunda Exporter](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/camunda-exporter). It includes published RTO/RPO targets, a reference architecture, and a documented failover runbook.

**Caution: Before you begin**
Before implementing a dual-region setup, review the [limitations](#limitations) and [infrastructure considerations](#infrastructure-and-deployment-platform-considerations) for this configuration.

| Consideration                       | Value                                                         |
| :---------------------------------- | :------------------------------------------------------------ |
| **Recovery time (RTO)**             | ~15 minutes (see [Recovery objectives](#recovery-objectives)) |
| **Data loss (RPO)**                 | 0                                                             |
| **Failover mode**                   | Manual, operator-initiated                                    |
| **Standing second region required** | Yes. Full Orchestration Cluster running in both regions       |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region
