# Manual deployment overview — Key features

- **Single application JAR**: Starting from Camunda 8.8, all core components (Zeebe, Tasklist, Operate, and Admin) are bundled into a single JAR file. This simplifies deployment by reducing the number of artifacts to manage. This bundled component is called Orchestration Cluster.
- **Full control**: Users are responsible for all aspects of deployment, including installation, configuration, scaling, and maintenance. This offers maximum flexibility for custom environments.

Other deployment options, such as containerized deployments or managed services, might offer more convenience and automation. However, VM based deployment gives you the flexibility to tailor the deployment to your exact needs, which can be beneficial for regulated or highly customized environments.

For documentation on the Orchestration Cluster and Camunda Hub separation, refer to the [reference architecture overview](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#camunda-hub-vs-orchestration-cluster).

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/manual
