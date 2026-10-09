# Amazon EC2

Learn how to install Camunda 8 on AWS EC2 instances.

This guide provides a detailed walkthrough for installing the Camunda 8 single JAR on AWS EC2 instances. It focuses on managed services provided by AWS and their cloud offering. Finally, you will verify that the connection to your Self-Managed Camunda 8 environment is functioning correctly.

This guide focuses on setting up the [Orchestration Cluster](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#camunda-hub-vs-orchestration-cluster) for Camunda 8. Camunda Hub is not covered in this manual deployment approach, as this component is not supported on virtual machines. To deploy Camunda Hub, explore the available options for [Kubernetes-based deployments](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install).

**Note: Cost management**
This guide provisions resources that can incur costs in your cloud provider account. Review your provider's pricing before you begin.

For a starting point, see this [example calculation](https://calculator.aws/#/estimate?id=ca54a43f3b3b7eb42fe8836854775e60d8c7e04d) for a comparable three-node deployment, which you can adapt to your use case.

**Note: Using other cloud providers**
This guide is based on tools and services provided by AWS but is not limited to them. The scripts and concepts included can be adapted for other cloud providers and use cases.

When using a different cloud provider, you are responsible for configuring and maintaining the resulting infrastructure. Support is limited to questions related to this guide—not to the specific tools or services of your chosen cloud provider.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/cloud-providers/amazon/aws-ec2
