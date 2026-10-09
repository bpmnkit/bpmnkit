# OpenSearch exporter — Configuration — retention

A retention policy can be set up to delete old data.
When enabled, this creates an Index State Management (ISM) policy that deletes the data after the specified `minimumAge`. All index templates created by this exporter apply the created ISM policy.

| Option             | Description                                                                                                                                                                                   | Default                         |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| enabled            | If `true` the ISM policy is created and applied to the index templates.                                                                                                                       | `false`                         |
| minimum-age        | Specifies how old the data must be, before the data is deleted as a duration.                                                                                                                 | `30d`                           |
| policy-name        | The name of the created and applied ISM policy.                                                                                                                                               | `zeebe-record-retention-policy` |
| policy-description | The description of the created and applied ISM policy.                                                                                                                                        | `Zeebe record retention policy` |
| manage-policy      | If `true` the exporter creates, updates, and removes the ISM policy on its own. Set to `false` to leave an externally managed policy untouched (the exporter neither creates nor removes it). | `true`                          |

**Note**
The duration can be specified in days `d`, hours `h`, minutes `m`, seconds `s`, milliseconds `ms`, and/or
nanoseconds `nanos`.

**Note: Externally managed policy**

When `manage-policy: false`, the exporter still attaches the policy named by `policy-name` (default `zeebe-record-retention-policy`) to the indices it creates. The policy must already exist in your OpenSearch cluster under that name when the exporter starts.

If the policy does not exist, OpenSearch's ISM `add` API rejects the call and the exporter fails to start with `OpensearchExporterException: Failed to add policy to indices`. Provision the ISM policy before starting Camunda when using `manage-policy: false`.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/opensearch-exporter
