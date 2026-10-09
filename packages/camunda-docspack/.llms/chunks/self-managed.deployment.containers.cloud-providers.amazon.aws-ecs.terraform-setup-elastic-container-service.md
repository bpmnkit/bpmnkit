# Deploy to Amazon ECS — Terraform setup — Elastic Container Service

`ecs.tf` contains the ECS cluster, which is just a logical component to group ECS resources.

`../../modules/ecs/fargate/orchestration-cluster` is the main component `Orchestration Cluster` of Camunda and contains the definitions for:

- ECS Service and task definition
  - Defines the base setup for the Orchestration Cluster, including the node ID provider, EFS configuration, and initial cluster endpoints.
  - Automatically sets the Zeebe cluster size based on the task count.
  - Resolves initial contact points using DNS with multiple A records instead of requiring explicit Zeebe Broker addresses.

- Task-specific IAM role
  - Grants access to AWS services required by this component, such as the S3 bucket and Aurora PostgreSQL.

- S3 bucket
  - Used by the ECS-specific node ID provider.

- CloudWatch log group
  - Used for Orchestration Cluster logs.
  - Can be shared with other Camunda components that have a one-to-one relationship with the Orchestration Cluster, such as Connectors.

- Networking configuration
  - Integrates with ECS Service Connect and Amazon Route 53 to enable access from within the VPC, including from resources outside the ECS cluster (for example, EC2 instances or Kubernetes clusters).

- Load balancer configuration
  - Adds listener rules to a shared load balancer for the Orchestration Cluster and Connectors.

- EFS file system

The base terraform documentation for this module can be found [alongside the repository](https://github.com/camunda/camunda-deployment-references/tree/main/aws/modules/ecs/fargate/orchestration-cluster).

`../../modules/ecs/fargate/connectors` is a secondary component `Connectors` and contains the definitions for:

- ECS Service and Task definition
- Task specific IAM role to allow access to AWS services isolated to this component
- Load Balancer related configurations to add listener rules to a shared Load Balancer between Orchestration Cluster and Connectors

The base terraform documentation for this module can be found [alongside the repository](https://github.com/camunda/camunda-deployment-references/tree/main/aws/modules/ecs/fargate/connectors).

`camunda.tf` contains the module invocations with an example base configuration for the Orchestration Cluster and Connectors:

- Aurora PostgreSQL configuration with the [AWS JDBC Wrapper](https://github.com/aws/aws-advanced-jdbc-wrapper) that comes as part of the Camunda distribution
- Basic authentication Admin setup
  - Admin user with random password
  - Connectors user with random password configured and pre-configured for Connectors to consume to connect to the Orchestration Cluster

In `camunda.tf` you can pass in any configuration adjustment required for the component or increase the resources. A few configuration options as mentioned above are kept as part of the modules to ensure the user can't interfere with the base setup. If you need to adjust those, then you have to adjust those in your copy of the modules.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs
