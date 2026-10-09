# Kubernetes deployment overview — Architecture

The [reference architecture overview](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#deployment-topology) describes the deployment topology: one management plane serving one or more Orchestration Clusters, with one Optimize instance per Physical Tenant. It also explains the distinction between these components:

- **Management plane (Camunda Hub and Management Identity)**: Manage organizational resources, analyze operations and business value, and deliver agentic processes at scale.
- **Orchestration Cluster**: Core process execution engine (Zeebe, Operate, Tasklist, Admin), including Connectors.
- **Optimize**: Process analytics, deployed separately with one instance per Physical Tenant.

_Infrastructure diagram for a single-region setup (click the image to open the PDF version)_

[![Architecture Overview](./img/k8s-single.jpg)](./img/k8s-single.pdf)

This Kubernetes architecture illustrates a high-availability setup across multiple availability zones (A, B, and C), with key networking components to ensure scalability, security, and reliability. We recommend using multiple availability zones to improve fault tolerance and eliminate single points of failure.

To control access, deploy Camunda 8 in a private subnet and manage inbound traffic using an Ingress and Load Balancer.

**Note**
The database is not shown in the diagram. It should be hosted outside the Kubernetes cluster, ideally within the same private network or subnet. Many organizations use a dedicated external database setup with tightly controlled access.

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes
