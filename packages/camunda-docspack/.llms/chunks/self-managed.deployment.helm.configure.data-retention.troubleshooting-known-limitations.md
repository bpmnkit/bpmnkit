# Configure data retention — Troubleshooting — Known limitations

**OpenSearch policy updates:**

When using OpenSearch, updating an existing ISM policy's `minimumAge` may not take effect automatically. OpenSearch requires the `seq_no` and `primary_term` parameters during policy updates to ensure proper version control. Without these parameters, policy updates may fail or be skipped.

**To update an OpenSearch policy:**

1. Get the current policy with its version information
1. Update the policy using the `seq_no` and `primary_term` from the current version
1. Verify the updated policy reflects the new `minimumAge`

See the [OpenSearch ISM API documentation](https://opensearch.org/docs/latest/im-plugin/ism/api/) for details on policy version parameters.

**Elasticsearch bulk operations:**

When applying retention policies to a large number of existing indices, the operation may fail due to HTTP line length limits in Elasticsearch. This typically occurs when using wildcard patterns to apply settings to many indices at once (for example, `operate-*`, `tasklist-*`).

**Workarounds:**

- Apply settings to smaller batches of indices using more specific patterns
- Apply settings to individual indices when the number of indices is very large
- Use index templates for future indices instead of retroactively applying to all indices

**Policy timing considerations:**

The `camunda-history-retention-policy` is created by Camunda's retention tooling as part of the archiving workflow. If you query for this policy immediately after deployment and before any archiving occurs, you may receive a 404 response. The policy is created when the first archived index is created by the archiver.

**Note: Index naming**
Operate and Tasklist indices use schema-specific versioning in their names (for example, `operate-process-8.3.0_`, `tasklist-task-8.8.0_`). The version numbers represent schema versions, which may differ from the Camunda platform version. When archived, these indices receive a date suffix (for example, `operate-process-8.3.0_2024-01-15`).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/data-retention
