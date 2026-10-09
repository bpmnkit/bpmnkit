# Deploy to Amazon ECS — Considerations

If you want a simpler setup, consider using [Camunda 8 SaaS](https://accounts.camunda.io/signup).

**Note: Cost management**
This guide provisions resources that can incur costs in your cloud provider account. Review your provider's pricing before you begin.

- Unlike our other guides, which usually separate infrastructure setup from the deployment of Camunda 8, this is not the case with ECS. Since the infrastructure is largely managed by AWS, deploying Camunda 8 and provisioning the required AWS resources happens in a single step.
- This guide focuses on AWS ECS with Fargate but can work with managed instances for more predictable performance. You can find more information about how to migrate from Fargate to managed instances from the [AWS migration guide](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/migrate-fargate-to-managed-instances.html).
- This guide relies on a shared [multi-AZ replicated](https://docs.aws.amazon.com/efs/latest/ug/efs-replication.html) EFS network disk.
  - Cost and performance may differ from a related Kubernetes setup with block storage.
  - The EFS volume is shared among all brokers to support the native ECS Service capabilities.
- AWS does not support block storage options in combination with ECS Services and Fargate. For a detailed overview, have a look at the [AWS documentation](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_data_volumes.html).
- Scaling is a manual process as it requires invoking the [cluster scaling API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/cluster-scaling) for joining and removing a [Zeebe Broker](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/architecture#brokers). Autoscaling may not have effects as the brokers have to be explicitly joined into the [Zeebe cluster](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/clustering) or when removed result in partitions or data becoming inaccessible.
- A node-id provider is integrated into Zeebe that assigns an available node-id based on Zeebe cluster information, instead of relying on a statically-configured node-id.
- This guide focuses on Aurora PostgreSQL for the secondary datastorage as it is a newly supported offering by Camunda 8 and potentially more familiar for customers.
  - You may still use Elasticsearch or OpenSearch but need to adjust the required configuration. More information about the configuration can be found in [our documentation](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#data---secondary-storage).
  - Examples for how to deploy AWS OpenSearch can be found in other existing reference architectures for AWS.

**Warning**
Reference architectures and examples provided in this guide are not turnkey modules. Camunda recommends cloning the repository and modifying it locally.

You are responsible for operating and maintaining the infrastructure. Camunda updates the reference architecture over time, and changes may not be backward compatible. You can use these updates to upgrade your customized codebase as needed.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs
