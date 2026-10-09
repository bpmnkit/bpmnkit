# Manual deployment overview — Reference implementations

This section includes deployment reference architectures for manual setups:

- [Amazon EC2 deployment](https://docs.camunda.io/docs/next/self-managed/deployment/manual/cloud-providers/amazon/aws-ec2) - a standard production setup with support for high availability.


## Considerations

- This overview page focuses on deploying the [Orchestration Cluster](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#orchestration-cluster), the single JAR composed of Admin, Operate, Tasklist, and Zeebe, as well as the connectors runtime. Camunda Hub, Optimize, and Management Identity deployments are not included.
- General guidance and examples focuses on **unix** users, but can be adapted by Windows users with options like [WSL](https://learn.microsoft.com/en-us/windows/wsl/install) or included `batch` files.

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/manual
