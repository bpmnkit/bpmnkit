# Security instructions — Disable HTTP

For security reasons, we recommend using Optimize over HTTPS and disabling HTTP. You can disable HTTP by setting the HTTP property in the container settings to an empty/null value. Consult the respective section in the [configuration guide](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration#container) for the more details.


## Fine tune Optimize security headers

Over time, various client-side security mechanisms have been developed to protect web applications from various attacks. Some of these security mechanisms are only activated if the web application sends the corresponding HTTP headers in its server responses.

Optimize adds several of these headers which can be fine-tuned in the [configuration](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration#security) to ensure appropriate security.

Optimize stores its data in Elasticsearch or OpenSearch, which are search engines that act as document-store backends. To protect access to this data, the database should be configured carefully as well. Refer to the official security guidelines for [ElasticSearch](https://www.elastic.co/guide/en/elasticsearch/reference/master/secure-cluster.html#secure-cluster) or [OpenSearch](https://opensearch.org/docs/latest/getting-started/security).

Within the Optimize configuration, you can then enable SSL and/or the credentials to be used when Camunda Optimize connects to the database. See [Elasticsearch Security](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration#elasticsearch-security) or [OpenSearch Security](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration#opensearch-security) for details.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/security-instructions
