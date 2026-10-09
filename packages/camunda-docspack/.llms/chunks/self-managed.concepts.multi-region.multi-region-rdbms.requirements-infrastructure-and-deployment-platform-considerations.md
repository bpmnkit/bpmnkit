# Multi-Region RDBMS — Requirements — Infrastructure and deployment platform considerations

Multi-region setups require careful planning. You must manage the following areas independently, and Camunda does not control or document them:

- **Kubernetes cluster management**: managing three or more Kubernetes clusters and their deployments
- **Monitoring and alerting**: multi-region monitoring with cross-region correlation
- **Cost implications**: three or more clusters and cross-region traffic increase costs, and inter-region data transfer is billed per gigabyte
- **Network reliability**: increased latency affects Raft commit latency and export throughput. Even short latency bursts have an impact.
- **Traffic management**: DNS and incoming traffic routing across more than two regions
- **Database operations**: replication, failover, and backup of the secondary storage are the database's responsibility, and therefore yours
- **Security**: consistent security policies and network controls across every region

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms
