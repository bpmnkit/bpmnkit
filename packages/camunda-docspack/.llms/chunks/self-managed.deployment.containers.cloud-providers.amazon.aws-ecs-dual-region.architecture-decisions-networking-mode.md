# Dual-region setup (ECS Fargate) — Architecture decisions — Networking mode

| Option                | `networking_mode` value | When to use                                                                                                                                                                                                           |
| --------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| VPC peering (default) | `vpc_peering`           | Simpler to manage. Start here if you don't have a cross-region network in place.                                                                                                                                      |
| Transit Gateway       | `transit_gateway`       | Enterprise scenarios — existing Transit Gateway deployments or hub-and-spoke topologies that need to integrate this cluster. Choose this only when you actually need it and understand the hourly and per-GB charges. |

**Note**
Neither Transit Gateway nor VPC peering encrypts traffic at the network layer. Raft replication between Zeebe brokers crosses the AWS backbone in cleartext unless you add an encryption layer (for example, IPsec on the TGW attachment, or application-layer TLS on the Zeebe broker channel). Regulated workloads should evaluate this before choosing.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region
