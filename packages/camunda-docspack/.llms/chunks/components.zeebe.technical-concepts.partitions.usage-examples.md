# Partitions — Usage examples

Whenever you deploy a process, you deploy it to the first partition. The process is then distributed to all partitions. On all partitions, this process receives the same key and version such that it can be consistently identified.

**Note**
To learn more about aligning partitions with the same version of deployment and why it is built this way, visit our [Zeebe Chaos blog](https://camunda.github.io/zeebe-chaos/2021/01/26/deployments/#deployments).

When you start an instance of a process, the client library then routes the request to one partition in which the process instance is published. All subsequent processing of the process instance happens in that partition.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/partitions
