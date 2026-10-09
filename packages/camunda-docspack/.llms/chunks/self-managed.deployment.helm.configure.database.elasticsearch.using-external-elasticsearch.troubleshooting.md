# Use external Elasticsearch for Orchestration Cluster with Helm — Troubleshooting

If Zeebe pods fail, check for the following error:

- The host is unreachable or DNS is not properly resolving to an IP address listening on the specified port.

  ```text
  Caused by: java.net.UnknownHostException: elastic.example.com
  ```


## References

- [Camunda production installation guide with Kubernetes and Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index)
- [Use external Elasticsearch for Optimize with Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/optimize/using-external-elasticsearch)
- [Configure Elasticsearch and OpenSearch index prefixes](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/configure-elasticsearch-prefix-indices)


## Next steps

Use the custom values file to [deploy Camunda 8](https://docs.camunda.io/docs/next/self-managed/setup/overview):

```sh
helm install camunda camunda/camunda-platform --version $HELM_CHART_VERSION -f existing-elasticsearch-values.yaml
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/using-external-elasticsearch
