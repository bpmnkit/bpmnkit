# Amazon ECS — Amazon ECS vs. Amazon EKS

If you're already invested in Kubernetes tooling and patterns and you want to remain in that environment, Amazon EKS might be a better option for you. More reasons to consider deploying to Amazon EKS over Amazon ECS include:

- **Multi-region support:** When deploying to Amazon ECS, the only supported and tested pattern is a single AWS Region with multiple Availability Zones (multi‑AZ). All core pieces of the Orchestration Cluster are expected to live in one region.
- **Performance:** The Amazon ECS with Fargate deployment uses Amazon EFS as primary storage. This may result in higher costs and lower performance than a Kubernetes setup with block storage.
- **Scaling:** The autoscaling feature of ECS is not currently supported.

Check out our [Amazon EKS deployment guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/amazon-eks) if a Kubernetes environment better suits your needs.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/index
