# Zeebe on Self-Managed

About Zeebe

<!--
**Danger**
Zeebe does not support network file systems (NFS) other types of network storage volumes at this time. Usage of NFS may cause data corruption.
-->

[Zeebe](https://docs.camunda.io/docs/next/components/zeebe/zeebe-overview) is the process automation engine component within the Orchestration Cluster.

Within this section you will find detailed information about:

- [Zeebe Gateway](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/zeebe-gateway-overview) - The Zeebe Gateway is a component of the Zeebe cluster; it can be considered the contact point for the Zeebe cluster which allows Zeebe clients to communicate with Zeebe brokers inside a Zeebe cluster.
- [Configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/configuration) - Explains the configuration options. These configuration options apply to both environments, but not to Camunda 8. In Camunda 8, the configuration is provided for you.
- [Security](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/security/security) - Discusses the security aspects of running Zeebe and how to use them.
- [Operation](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/zeebe-in-production) - Outlines topics that become relevant when you want to operate Zeebe in production.
- [Exporters](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/exporters) - The Orchestration Cluster includes built-in exporters for [Elasticsearch](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/elasticsearch-exporter), [OpenSearch](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/opensearch-exporter), [Camunda Exporter](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/camunda-exporter), and RDBMS (see [RDBMS configuration](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration)). This section explains how exporters can be configured. For a general overview, refer to our [exporters concept](https://docs.camunda.io/docs/next/self-managed/concepts/exporters) page. For broader guidance on secondary storage options, see [secondary storage](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index).

**Note**
New to BPMN and want to learn more before moving forward? [Visit our getting started guide](https://docs.camunda.io/docs/next/components/modeler/bpmn/automating-a-process-using-bpmn) to learn about automating a process using BPMN.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/overview
