# Troubleshoot Camunda 8 Run — External Elasticsearch issues

### Cannot connect to Elasticsearch

**Problem:** Camunda 8 Run starts with Elasticsearch configured as secondary storage, but search-backed features do not work or startup fails.

**Solution:**

1. Verify the Elasticsearch cluster is reachable:

   ```bash
   curl http://localhost:9200
   ```

2. Confirm `application.yaml` points Camunda 8 Run to that cluster:

   ```yaml
   camunda:
     data:
       secondary-storage:
         type: elasticsearch
         elasticsearch:
           url: http://localhost:9200/
   ```

3. If the cluster requires authentication or TLS, add the corresponding credentials and security settings to the same configuration block.
4. Start Camunda 8 Run with the configuration file:

   ```bash
   # macOS/Linux
   ./c8run start --config custom-application.yaml

   # Windows
   c8run.exe start --config custom-application.yaml
   ```

### Elasticsearch index or permission errors

**Problem:** Operate or Tasklist show errors related to Elasticsearch indices.

**Solution:**

1. Ensure the Elasticsearch user has permission to create, read, and write the required Camunda indices. For restricted setups, see [Configure Elasticsearch without cluster privileges](https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/elasticsearch-without-cluster-privileges).
2. Verify the Elasticsearch cluster is healthy and has sufficient free disk space.
3. For local development, if you need to recreate the secondary store, stop Camunda 8 Run, delete the Camunda indices from your external Elasticsearch instance using your Elasticsearch tooling, and start Camunda 8 Run again. This rebuilds the secondary store from scratch.

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run-troubleshooting
