# Move from a combined release to the split topology — Keep the cluster in place — Step 5: Move Optimize to its own release

If the combined release ran Optimize and you disabled it in step 2, install it as a separate release per Physical Tenant, and keep both of its existing prefixes:

- The reader prefix, `optimize.database.elasticsearch.prefix` or `optimize.database.opensearch.prefix`, must exactly equal the exporter writer prefix already in use, or Optimize starts against an empty record set.
- The application index prefix, `CAMUNDA_OPTIMIZE_ELASTICSEARCH_SETTINGS_INDEX_PREFIX` or `CAMUNDA_OPTIMIZE_OPENSEARCH_SETTINGS_INDEX_PREFIX`, must equal the value the combined release used. Optimize stores its reports, dashboards, and configuration there. A new value starts Optimize with none of them.

Route the Optimize host and path to the new release before users return. See [route traffic to Optimize](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/optimize-release#route-traffic-to-optimize).

See [install an Optimize release](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/optimize-release).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/combined-to-split-topology
