# Multi-region setup with RDBMS (EKS) — High-level design

Each layer of the design has one job, and the layers are independent:

| Layer                    | Component                  | What it provides                                                                                |
| :----------------------- | :------------------------- | :---------------------------------------------------------------------------------------------- |
| Compute                  | One EKS cluster per region | Zeebe brokers, gateway, and connectors for one Camunda zone.                                    |
| L3, inter-region routing | AWS Transit Gateway        | Carries all cross-region traffic, including Raft and the database writes, on private addresses. |
| L7, service discovery    | Submariner                 | Publishes each region's Zeebe service under a name every other region can resolve.              |
| Secondary storage        | Aurora Global Database     | One writer and its readers, replicated by the database, reached through a single JDBC URL.      |

The database regions are **decoupled** from the compute regions. The Aurora members live in London and Paris, while compute spans all three regions. That keeps the database cheaper, and the two topologies stay independent.

**Tip**
New to Terraform or to running Camunda on EKS? Start with the [single-region EKS Terraform setup](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup), which covers AWS authentication, Terraform state management, and the essentials of an EKS cluster. This guide assumes you have completed a single-region deployment at least once.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms
