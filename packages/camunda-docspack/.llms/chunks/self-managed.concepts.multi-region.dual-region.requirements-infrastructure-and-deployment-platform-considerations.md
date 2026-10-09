# Dual-Region — Requirements — Infrastructure and deployment platform considerations

Multi-region setups require careful planning. You must manage the following areas independently. Camunda doesn't control or document them:

- **Kubernetes cluster management**: Managing multiple Kubernetes clusters and deployments across regions
- **Monitoring and alerting**: Dual-region monitoring with cross-region correlation
- **Cost implications**: Multiple clusters and cross-region traffic increase costs
- **Network reliability**: Increased latency can affect data consistency and synchronization. Even short latency bursts can have an impact.
- **Traffic management**: DNS and incoming traffic routing
- **Security**: Consistent security policies and network controls across regions

**Tip: Operational readiness**
Before implementing dual-region, ensure your organization has:

- Experience managing multi-cluster Kubernetes environments
- Established procedures for cross-region networking and security
- Monitoring and alerting systems with cross-region correlation capability
- Defined RTO/RPO requirements and tested recovery procedures

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region
