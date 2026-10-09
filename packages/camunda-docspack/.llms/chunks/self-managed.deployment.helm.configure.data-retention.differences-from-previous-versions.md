# Configure data retention — Differences from previous versions

**Camunda 8.8:**

- **Policy creation and attachment**: Policies are created automatically by retention tooling and attached to archived indices as they are created
- **Unified history retention**: Historical data retention (Operate, Tasklist, Camunda indices) uses unified `orchestration.history.retention` configuration
- **Zeebe record retention**: Legacy zeebe-record indices remain under exporter-specific configuration (`orchestration.retention`)
- **OpenSearch policy updates**: Updating existing ISM policies requires `seq_no` and `primary_term` parameters; without them, updates may fail and require manual intervention
- **Bulk operations**: Applying settings to many indices may fail due to HTTP line length limits, requiring batching or manual workarounds

**Camunda 8.7 and earlier:**

- **Operate**: Creates ILM policy when enabled, but configuration updates (for example, changing `minimumAge`) are not applied automatically - manual policy updates required
- **Zeebe**: Creates policies on initial install and applies ILM configuration updates automatically
- **Tasklist**: Does not apply ILM configuration updates after deployment - manual policy updates required
- **Versions 8.5-8.6**: ILM policies sometimes missing after configuration; may require manual creation or new record export to trigger policy creation

**Info**
For Camunda 8.7 and earlier, if you change retention configuration after initial deployment, you must manually update the policies in Elasticsearch/OpenSearch for Operate and Tasklist. Zeebe automatically applies configuration updates. See [Manually creating or updating policies](#manually-creating-or-updating-policies-87-and-earlier).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/data-retention
