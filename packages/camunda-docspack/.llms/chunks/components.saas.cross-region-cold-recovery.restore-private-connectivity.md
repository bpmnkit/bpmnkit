# Cross-region cold recovery — Restore private connectivity

This section applies only to AWS clusters that use private connectivity. If you don't use private connectivity, or your cluster is on GCP, skip this section.

You are responsible for establishing private connectivity to the recovered cluster. The secondary cluster runs in a different region with different VPC infrastructure.

### Prepare connectivity

To minimize your recovery time objective (RTO), pre-provision VPC infrastructure in the secondary region:

- VPC and security groups
- Private DNS configuration, if you're using Amazon Route 53 failover
- Any firewall rules or network policies

### Reconnect after failover

After failover:

1. Create or configure the VPC endpoint to use the recovered cluster's new endpoint service name.
2. Update DNS records or Amazon Route 53 failover rules to point to the new endpoint.
3. Test client connectivity before resuming application traffic.

Camunda does not create, manage, or modify customer VPC infrastructure.

---
Source: https://docs.camunda.io/docs/next/components/saas/cross-region-cold-recovery
