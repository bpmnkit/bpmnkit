# Secure connectivity (AWS PrivateLink) — How it works

![AWS PrivateLink architecture](./img/aws-privatelink-diagram.jpg)

Secure connectivity uses AWS PrivateLink to establish a private network path between your AWS VPC and the Camunda-managed cluster infrastructure.

When you enable secure connectivity for a cluster:

- Camunda provisions a VPC endpoint service for that cluster in the cluster’s AWS region.
- You create one or more VPC interface endpoints in your AWS account that connect to the endpoint service.
- Traffic from resources in your VPC (for example, job workers or inbound connectors) is routed privately to the cluster.

Each cluster has its own VPC endpoint service and dedicated networking components. Access to the Orchestration Cluster is handled through dedicated load balancing and API gateway components.

Secure connectivity relies on standard AWS PrivateLink functionality. For an overview of AWS PrivateLink concepts and terminology, see [the AWS documentation](https://docs.aws.amazon.com/vpc/latest/privatelink/what-is-privatelink.html).

---
Source: https://docs.camunda.io/docs/next/components/saas/secure-connectivity/index
