# Amazon ECS

Run the Camunda 8 Orchestration Cluster, Connectors, Management Identity, and Camunda Hub in Amazon Elastic Container Service.

Deploy the Camunda 8 Orchestration Cluster and Connectors to Amazon Elastic Container Service (ECS) to benefit from containerization without having to manage Kubernetes infrastructure.


## Get started

Get started with Amazon ECS and Fargate:

Deploy the Orchestration Cluster to Amazon ECS


## Learn the fundamentals

This deployment targets a single AWS Region with multiple Availability Zones, running the Orchestration Cluster and Connectors on Amazon ECS with Fargate. You can additionally deploy Management Identity and Camunda Hub by switching the deployment to OIDC authentication.

Other dependencies include:

- [Amazon EFS](https://aws.amazon.com/efs/) as primary storage
- [Aurora PostgreSQL](https://aws.amazon.com/rds/aurora/) as secondary storage
- [Amazon S3](https://aws.amazon.com/s3/) for node ID metadata and backups

For more implementation details, read the [Architecture](https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/index/aws-ecs#architecture) section of our deployment guide.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/index
