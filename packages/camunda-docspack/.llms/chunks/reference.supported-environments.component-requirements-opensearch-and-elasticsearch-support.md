# Supported environments — Component requirements — OpenSearch and Elasticsearch support

- Camunda 8 supports both [Amazon OpenSearch](https://aws.amazon.com/opensearch-service) and the open-source [OpenSearch](https://opensearch.org/) distribution.
- Due to a [limitation](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/or1.html#or1-considerations)
  for the index refresh interval, [OR1 instances](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/or1.html) are not supported with Amazon OpenSearch. See [use Amazon OpenSearch Service with the Helm chart](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/using-external-opensearch).
- When running Elasticsearch, you must have the [appropriate Elasticsearch privileges](https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/elasticsearch-privileges).
- Camunda 8 works with the Elasticsearch [default distribution](https://www.elastic.co/downloads/elasticsearch) available with the [Free or Gold+ Elastic license](https://www.elastic.co/pricing/faq/licensing#summary).

---
Source: https://docs.camunda.io/docs/next/reference/supported-environments
