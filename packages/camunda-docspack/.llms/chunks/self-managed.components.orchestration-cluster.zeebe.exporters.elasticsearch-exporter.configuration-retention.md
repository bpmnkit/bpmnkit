# Elasticsearch exporter — Configuration — retention

A retention policy can be set up to delete old data.
When enabled, this creates an Index Lifecycle Management (ILM) Policy that deletes the data after the specified `minimumAge`.
All index templates created by this exporter apply the created ILM Policy.

| Option        | Description                                                                                                                                                                                  | Default                         |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| enabled       | If `true` the ILM Policy is created and applied to the index templates                                                                                                                       | `false`                         |
| minimum-age   | Specifies how old the data must be, before the data is deleted as a duration                                                                                                                 | `30d`                           |
| policy-name   | The name of the created and applied ILM policy                                                                                                                                               | `zeebe-record-retention-policy` |
| manage-policy | If `true` the exporter creates, updates, and removes the ILM policy on its own. Set to `false` to leave an externally managed policy untouched (the exporter neither creates nor removes it) | `true`                          |

**Note**
The duration can be specified in days `d`, hours `h`, minutes `m`, seconds `s`, milliseconds `ms`, and/or nanoseconds `nanos`.

**Note: Externally managed policy**

When `manage-policy: false`, the exporter still attaches the policy named by `policy-name` (default `zeebe-record-retention-policy`) to the indices it creates. The policy must already exist in your Elasticsearch cluster under that name when the exporter starts.

If the policy does not exist, Elasticsearch silently accepts the dangling `index.lifecycle.name` setting. The exporter starts successfully, but ILM logs `policy_not_found` warnings on each cycle and skips retention actions until the policy is created. Once you create the policy under the configured name, ILM picks it up retroactively on its next cycle.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/elasticsearch-exporter
