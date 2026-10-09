# Data retention

Overview of how the Orchestration Cluster stores and archives data in secondary storage.

The Orchestration Cluster centrally manages data retention for all data using unified storage and policy configuration.

All cluster data, including deployed process definitions, process instance state, user operations, and technical metadata, is written to secondary storage. Depending on your configuration, this secondary storage uses a document-store backend ([Elasticsearch/OpenSearch](https://docs.camunda.io/docs/next/reference/glossary#elasticsearchopensearch)) or an [RDBMS](https://docs.camunda.io/docs/next/reference/glossary#rdbms). The data representing process instance state becomes immutable after the process instance is finished, and it becomes eligible for archiving.

**Note**
Secondary storage is configurable. Choose the backend that best fits your requirements for indexing, querying, retention, and operations. See [configuring secondary storage](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/configuring-secondary-storage) for setup guidance, and refer to [secondary storage](https://docs.camunda.io/docs/next/reference/glossary#secondary-storage) for terminology and conceptual context.

When using Elasticsearch/OpenSearch, finished data is moved to a dated index (for example, `operate-variable_2020-01-01`), with the suffix representing the completion date of the associated process or operation. Data from both main and dated indices remains searchable and visible in the UI. For RDBMS backends, the exporter does not create dated indices. Data remains in the same tables and stays visible until retention policies delete it.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/concepts/data-retention
